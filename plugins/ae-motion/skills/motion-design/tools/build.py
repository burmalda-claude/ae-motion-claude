"""One-shot audio + timeline builder: script.json -> voice, timing, SFX, music, mastered mix.

Usage:
  python build.py script.json <project_dir> [--no-voice] [--no-music]

Outputs:
  <project>/public/vo/<id>.mp3 (+ .json word timings, cached by text/voice/rate)
  <project>/public/audio/master.wav    final mix (voice + SFX + ducked music), -14 LUFS, -1 dBTP
  <project>/public/audio/stems/*.wav   voice / sfx / music stems for checking
  <project>/src/timeline.json          {fps, total, shots: [{id, from, dur, lead, words: [{w, f, fe}]}]}

script.json:
{
  "fps": 30, "voice": "en-US-BrianMultilingualNeural", "rate": "+12%", "pitch": "+0Hz",
  "bpm": 123, "key": "A", "musicStyle": "edm", "musicGain": 0.5, "sfxGain": 0.8, "autoCut": true,
  "beats": [
    {"id": "hook", "text": "Не может быть.", "lead": 18, "tail": 4, "min": 0, "music": "intro",
     "sfx": [["riser_short", "w0"], ["impact", "w0"], ["slash", "w1+2"]]},
    {"id": "logo", "min": 45, "music": "drop", "sfx": [["impact", 6]]}
  ]
}
Cue positions (frames, relative to the shot): 12 | "w3" (word 3 starts) | "w3+2" | "e2" (word 2 ends) | "end-6".
SFX that swell into a moment (riser, riser_short, swish_in, reverse_swell) END on their cue.
Music modes per beat (persist until changed): intro | drop | build | break | ui | stop.
musicStyle: edm | phonk | lofi | ambient | cinematic | corporate | jcore. Top-level "music": false = no bed (ASMR, your own track).
Real music (preferred for edits, references/music.md): "musicFile": "public/music/x.mp3", "musicStart": 12.3 (seconds).
"sfxTrack": [[spec, absolute_frame, vol], ...] — global SFX lane (tools/sfxgen.py sync fills it from beats.json).
SFX cues accept built-in names, generator specs ("whoosh:len=12f,dir=LR,tone=dark") and layer stacks ("layer:whip").
Mix: "sfxDuck": dB SFX are lowered under speech (6), "sfxPresenceDuck": extra dB cut of SFX at 1–4 kHz under speech (9), "sfxVary": ± semitones random per placement (0), "lufs": -14 (social) | -23 (TV).
A beat without "text" is a silent visual beat (needs "min").
Voices: en-US-BrianMultilingualNeural (default, most expressive, speaks Russian well), en-US-AndrewMultilingualNeural,
ru-RU-DmitryNeural, ru-RU-SvetlanaNeural, en-US-AvaMultilingualNeural (female). Edge TTS needs internet.
"""
import argparse
import asyncio
import hashlib
import json
import math
import os
import re
import subprocess
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sound as S  # noqa: E402
import sfxgen as G  # noqa: E402

SR = S.SR


# ---------------------------------------------------------------- TTS
async def _tts(text, voice, rate, pitch, mp3):
    import edge_tts

    words = []
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    with open(mp3, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                st = ch["offset"] / 1e7
                words.append({"w": ch["text"], "start": round(st, 3), "end": round(st + ch["duration"] / 1e7, 3)})
    return words


def tts_cached(text, voice, rate, pitch, vo_dir, bid):
    key = hashlib.sha1(f"{text}|{voice}|{rate}|{pitch}".encode()).hexdigest()[:10]
    mp3 = os.path.join(vo_dir, f"{bid}.mp3")
    meta = os.path.join(vo_dir, f"{bid}.json")
    if os.path.exists(meta) and os.path.exists(mp3):
        m = json.load(open(meta, encoding="utf-8"))
        if m.get("key") == key:
            return mp3, m["words"]
    last = None
    for _ in range(5):  # the free endpoint sometimes returns nothing; retry
        try:
            words = asyncio.run(_tts(text, voice, rate, pitch, mp3))
            if words and os.path.getsize(mp3) > 1000:
                json.dump({"key": key, "words": words}, open(meta, "w", encoding="utf-8"), ensure_ascii=False)
                return mp3, words
        except Exception as e:  # network hiccup
            last = e
    raise RuntimeError(f"TTS failed for '{bid}': {last}")


def load_audio(path):
    import librosa

    y, _ = librosa.load(path, sr=SR, mono=True)
    return y.astype(np.float64)


# ---------------------------------------------------------------- cues
CUE = re.compile(r"^(w|e)(\d+)([+-]\d+)?$|^end([+-]\d+)?$")


def resolve(cue, shot):
    if isinstance(cue, (int, float)):
        return float(cue)
    m = CUE.match(str(cue).strip())
    if not m:
        raise ValueError(f"bad cue {cue!r} in beat {shot['id']}")
    if m.group(4) is not None or str(cue).startswith("end"):
        return shot["dur"] + int(m.group(4) or 0)
    i = int(m.group(2))
    ws = shot["words"]
    if not ws:
        return i * 8
    w = ws[min(i, len(ws) - 1)]
    return (w["f"] if m.group(1) == "w" else w["fe"]) + int(m.group(3) or 0)


# ---------------------------------------------------------------- build
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("project")
    ap.add_argument("--no-voice", action="store_true")
    ap.add_argument("--no-music", action="store_true")
    a = ap.parse_args()

    cfg = json.load(open(a.script, encoding="utf-8"))
    beats = cfg["beats"]
    assert isinstance(beats, list) and beats, "script.json needs a non-empty 'beats' list"
    fps = cfg.get("fps", 30)
    voice = cfg.get("voice", "en-US-BrianMultilingualNeural")
    vo_dir = os.path.join(a.project, "public", "vo")
    os.makedirs(vo_dir, exist_ok=True)

    # 1) voice lines: generate, trim to spoken part, process
    lines = {}
    for b in beats:
        if not b.get("text") or a.no_voice:
            continue
        mp3, words = tts_cached(b["text"], b.get("voice", voice), b.get("rate", cfg.get("rate", "+12%")), b.get("pitch", cfg.get("pitch", "+0Hz")), vo_dir, b["id"])
        y = load_audio(mp3)
        t0 = max(0.0, words[0]["start"] - 0.04)
        t1 = min(len(y) / SR, words[-1]["end"] + 0.16)
        seg = y[int(t0 * SR) : int(t1 * SR)]
        seg = seg * (10 ** ((-20 - S.rms_db(seg)) / 20))  # equal loudness per line before the chain
        seg = S.fades(S.process_voice(seg), 0.004, 0.03)
        lines[b["id"]] = {"audio": seg, "words": [{**w, "start": w["start"] - t0, "end": w["end"] - t0} for w in words], "len": len(seg) / SR}
        print(f"  vo {b['id']:<12} {len(seg) / SR:5.2f}s  {len(words)} words")

    # 2) layout
    shots, frm = [], 0
    for b in beats:
        lead = b.get("lead", 2)
        ln = lines.get(b["id"])
        if ln:
            dur = lead + math.ceil(ln["len"] * fps) + b.get("tail", 4)
            words = [{"w": w["w"], "f": lead + int(round(w["start"] * fps)), "fe": lead + int(round(w["end"] * fps))} for w in ln["words"]]
        else:
            dur, words = 0, []
        dur = max(dur, b.get("min", 0))
        assert dur > 0, f"beat {b['id']} has no text and no 'min'"
        shots.append({"id": b["id"], "from": frm, "dur": dur, "lead": lead, "words": words})
        frm += dur
    total = frm
    total_s = total / fps + 0.5
    tl_path = os.path.join(a.project, "src", "timeline.json")
    os.makedirs(os.path.dirname(tl_path), exist_ok=True)
    json.dump({"fps": fps, "total": total, "shots": shots}, open(tl_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"  timeline: {len(shots)} shots, {total} frames ({total / fps:.1f}s)")

    n = int(total_s * SR)
    vbus = np.zeros((n, 2))
    fx = np.zeros((n, 2))
    cache = {}

    vary = float(cfg.get("sfxVary", 0.0))  # random ± semitones per placement so repeats don't sound copy-pasted
    vrng = np.random.default_rng(5)

    def sfx(name):
        if name not in cache:
            if ":" not in name and name not in S.SFX:
                raise KeyError(f"unknown sfx '{name}'. Use a built-in name ({', '.join(S.SFX)}) or a generator spec (python tools/sfxgen.py list)")
            cache[name] = S.norm(G.render(name), 0.89)
        x = cache[name]
        return G._pitch(x, vrng.uniform(-vary, vary)) if vary else x

    def ends_on_cue(name):
        cat, p = G.parse(name)
        return name in S.ENDS_ON_CUE or cat in G.ENDS_ON_CUT or (cat == "trans" and p.get("kind") in ("whiteout", "reverse_impact"))

    # 3) place voice + sfx
    for b, sh in zip(beats, shots):
        base = sh["from"] / fps
        if b["id"] in lines:
            S.place(vbus, S.to_stereo(lines[b["id"]]["audio"]) * 0.75, base + sh["lead"] / fps)
        explicit_at_cut = False
        for item in b.get("sfx", []):
            name, cue = item[0], item[1]
            vol = item[2] if len(item) > 2 else 0.8
            f = resolve(cue, sh)
            explicit_at_cut |= f <= 2
            # "layer:<transition>" expands into the 2–3 layer stack for that transition (sfxgen.LAYERS)
            stack = [(spec, None) for spec, _ in G.layer(name.split(":", 1)[1])] if name.startswith("layer:") else [(name, None)]
            for spec, _ in stack:
                x = sfx(spec)
                t = base + f / fps - (len(x) / SR if ends_on_cue(spec) else 0)
                S.place(fx, x, t, vol)
        if cfg.get("autoCut", True) and b.get("auto", True) and sh["from"] > 0 and not explicit_at_cut:
            S.place(fx, sfx("thump"), base, 0.45)
            S.place(fx, sfx("whoosh_fast"), base - 0.08, 0.22)

    # global SFX track at absolute frames (written by `sfxgen.py sync` from beats.json): [[spec, frame, vol], ...]
    for spec, frame, vol in cfg.get("sfxTrack", []):
        for sp, _ in (G.layer(spec.split(":", 1)[1]) if spec.startswith("layer:") else [(spec, None)]):
            x = sfx(sp)
            S.place(fx, x, frame / fps - (len(x) / SR if ends_on_cue(sp) else 0), vol)

    # 4) music with sections from beats
    if a.no_music or cfg.get("music") is False:
        mus = np.zeros((n, 2))
    elif cfg.get("musicFile"):  # a real track found online (references/music.md)
        y = load_audio(os.path.join(a.project, cfg["musicFile"]) if not os.path.isabs(cfg["musicFile"]) else cfg["musicFile"])
        y = y[int(float(cfg.get("musicStart", 0)) * SR) :][:n]
        mus = S.to_stereo(np.pad(y, (0, n - len(y))))
        fo = int(1.0 * SR)
        mus[-fo:] *= np.linspace(1, 0, fo)[:, None]
        mus = S.norm(mus, 0.8)
    else:
        sections, cur = [], None
        for b, sh in zip(beats, shots):
            m = b.get("music")
            if m and m != cur:
                sections.append((sh["from"] / fps, m))
                cur = m
        if not sections or sections[0][0] > 0:
            sections.insert(0, (0.0, "intro"))
        mus = S.music(sections, total_s, cfg.get("bpm", 123), cfg.get("key", "A"), cfg.get("musicStyle", "edm"))[:n]
        mus = S.norm(mus, 0.8)
    # duck music (and, less, SFX) under the voice (sidechain from the voice envelope)
    from scipy import signal as sg

    venv = np.abs(vbus).max(axis=1)
    a_ = np.exp(-1 / (0.25 * SR))
    venv = sg.lfilter([1 - a_], [1, -a_], venv)
    venv = np.minimum(1, venv / (venv.max() * 0.25 + 1e-9)) if venv.max() > 0 else venv
    mus *= (1 - 0.55 * venv)[:, None]
    fx *= (1 - (1 - 10 ** (-float(cfg.get("sfxDuck", 6)) / 20)) * venv)[:, None]
    # carve the speech-intelligibility band (1–4 kHz) out of the SFX while the voice talks, keep the body/sub of hits
    pres = S.bandpass(fx, 1000, 4000)
    fx -= pres * ((1 - 10 ** (-float(cfg.get("sfxPresenceDuck", 9)) / 20)) * venv)[:, None]

    # 5) mix + master
    mix = vbus + fx * cfg.get("sfxGain", 0.8) + mus * cfg.get("musicGain", 0.5)
    mix = S.compressor(mix, thresh_db=-14, ratio=2.0, attack=0.01, release=0.15, makeup_db=0)
    mix = S.limiter(mix, -1.5)
    out_dir = os.path.join(a.project, "public", "audio")
    S.write_wav(os.path.join(out_dir, "stems", "voice.wav"), S.limiter(vbus, -1))
    S.write_wav(os.path.join(out_dir, "stems", "sfx.wav"), S.limiter(fx, -1))
    S.write_wav(os.path.join(out_dir, "stems", "music.wav"), S.limiter(mus, -1))
    raw = os.path.join(out_dir, "master_raw.wav")
    S.write_wav(raw, mix)
    final = os.path.join(out_dir, "master.wav")
    # loudness: measure integrated LUFS (ebur128), apply the gain, then a true-peak guard (4x oversampled) at -1 dBTP
    target = float(cfg.get("lufs", -14))
    try:
        import audit as A

        L = A.lufs(raw)
        if L is not None:
            mix = mix * 10 ** ((target - L) / 20)
        from scipy import signal as sg2

        for _ in range(3):
            tp_db = 20 * np.log10(np.abs(sg2.resample_poly(mix, 4, 1, axis=0)).max() + 1e-12)
            if tp_db <= -1.05:
                break
            # saturated/distorted hits overshoot between samples: limit, and if that is not enough, trade a little loudness
            mix = S.limiter(mix, -1.6) if _ == 0 else mix * 10 ** ((-1.1 - tp_db) / 20)
        S.write_wav(final, mix)
        os.remove(raw)
    except Exception as e:  # no ffmpeg: keep the limited mix
        print("  loudness step skipped:", e)
        os.replace(raw, final)
    print(f"  master: {final}")


if __name__ == "__main__":
    main()
