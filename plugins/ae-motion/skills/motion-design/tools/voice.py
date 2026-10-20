"""Voice-over generator with per-word timings.

Usage:
  python voice.py script.json <project_dir> [--voice ru-RU-DmitryNeural] [--rate +8%] [--pitch -2Hz]

script.json: [{"id": "hook", "text": "Не может быть."}, ...]
Writes:
  <project>/public/vo/<id>.mp3
  <project>/src/voice.json  {"voice": ..., "lines": {id: {"file", "duration", "words": [{"w", "start", "end"}]}}}  (seconds)

Engine: edge-tts (free Microsoft neural voices, needs internet; `pip install edge-tts`).
Fallback: Windows SAPI (offline, robotic) with estimated word timings.
Popular voices: ru-RU-DmitryNeural, ru-RU-SvetlanaNeural, en-US-AndrewNeural, en-US-AvaNeural, en-GB-RyanNeural.
"""
import argparse
import asyncio
import json
import os
import re
import subprocess
import sys


def probe_duration(path):
    try:
        import imageio_ffmpeg  # optional; bundled ffmpeg

        out = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-i", path], capture_output=True, text=True).stderr
        m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out)
        if m:
            h, mi, s = m.groups()
            return int(h) * 3600 + int(mi) * 60 + float(s)
    except Exception:
        pass
    return None


def loudnorm(path, target="-14"):
    """Normalize a clip to social-media loudness (needs imageio-ffmpeg; silently skipped otherwise)."""
    try:
        import imageio_ffmpeg

        tmp = path + ".norm" + os.path.splitext(path)[1]
        r = subprocess.run(
            [imageio_ffmpeg.get_ffmpeg_exe(), "-v", "error", "-y", "-i", path, "-af", f"loudnorm=I={target}:TP=-1.5:LRA=11", "-ar", "44100", tmp],
            capture_output=True,
        )
        if r.returncode == 0:
            os.replace(tmp, path)
            return True
    except Exception:
        pass
    return False


async def edge_line(text, path, voice, rate, pitch):
    import edge_tts

    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    words = []
    with open(path, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 1e7  # 100-ns ticks
                words.append({"w": chunk["text"], "start": round(start, 3), "end": round(start + chunk["duration"] / 1e7, 3)})
    return words


def sapi_line(text, path_wav):
    # shortcut: SAPI gives no word timings, so they are spread by character count; use edge-tts when online.
    ps = (
        "Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
        f"$s.SetOutputToWaveFile('{path_wav}'); $s.Speak([Console]::In.ReadToEnd()); $s.Dispose()"
    )
    subprocess.run(["powershell", "-NoProfile", "-Command", ps], input=text, text=True, check=True)
    dur = probe_duration(path_wav) or max(0.6, len(text) * 0.07)
    tokens = text.split()
    total = sum(len(t) for t in tokens) or 1
    t, words = 0.05, []
    for tok in tokens:
        d = (dur - 0.1) * len(tok) / total
        words.append({"w": tok, "start": round(t, 3), "end": round(t + d, 3)})
        t += d
    return words, dur


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("project")
    ap.add_argument("--voice", default="ru-RU-DmitryNeural")
    ap.add_argument("--rate", default="+8%")
    ap.add_argument("--pitch", default="+0Hz")
    a = ap.parse_args()

    lines = json.load(open(a.script, encoding="utf-8"))
    assert isinstance(lines, list) and all("id" in l and "text" in l for l in lines), "script.json must be [{id, text}]"
    vo_dir = os.path.join(a.project, "public", "vo")
    os.makedirs(vo_dir, exist_ok=True)
    out = {"voice": a.voice, "lines": {}}
    for l in lines:
        mp3 = os.path.join(vo_dir, f"{l['id']}.mp3")
        try:
            for attempt in range(4):  # the free endpoint sometimes returns no audio; retry before giving up
                try:
                    words = asyncio.run(edge_line(l["text"], mp3, a.voice, a.rate, a.pitch))
                    break
                except Exception:
                    if attempt == 3:
                        raise
            dur = probe_duration(mp3) or ((words[-1]["end"] + 0.15) if words else 1.0)
            rel = f"vo/{l['id']}.mp3"
        except Exception as e:
            print(f"edge-tts failed for {l['id']} ({e}); falling back to SAPI", file=sys.stderr)
            wav = os.path.join(vo_dir, f"{l['id']}.wav")
            words, dur = sapi_line(l["text"], wav)
            rel = f"vo/{l['id']}.wav"
        loudnorm(os.path.join(a.project, "public", rel))
        out["lines"][l["id"]] = {"file": rel, "text": l["text"], "duration": round(dur, 3), "words": words}
        print(f"{l['id']:>12}  {dur:5.2f}s  {len(words)} words")
    os.makedirs(os.path.join(a.project, "src"), exist_ok=True)
    with open(os.path.join(a.project, "src", "voice.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
