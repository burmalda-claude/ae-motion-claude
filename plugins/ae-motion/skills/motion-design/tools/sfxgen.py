"""Sound design engine: parametric SFX generators, layer stacks for transitions, genre packs, AI generation.

Spec strings (usable as SFX cues in script.json and on the CLI):
  "whoosh:len=12f,dir=LR,tone=dark,weight=heavy,seed=3"
  "impact:kind=boom,weight=heavy,tail=long,sub=1"
  "riser:len=2s,kind=noise,end=hit,curve=exp"
  "ambience:kind=rain,len=10s,loop=1"
  "ui:kind=toggle,dry=1,tone=soft"
  "trans:kind=glitch_burst"            "trend:kind=vine_boom"            "asmr:kind=rustle"
Common params: seed (variation), pitch (semitones), gain. Lengths: "12f" (frames @30), "0.4s", or seconds.

CLI:
  python sfxgen.py list                                  # categories + kinds + params
  python sfxgen.py render "<spec>" out.wav
  python sfxgen.py variations whoosh 60 <dir>            # 60 whoosh variations (len/dir/tone/weight/seed sweep)
  python sfxgen.py pack <gym|phonk|anime|meme|horror|tech|edit|cinematic> <dir>
  python sfxgen.py layer <transition-kind> [--frames 10]  # prints the layer stack for a transition
  python sfxgen.py ai "<prompt>" out.wav [--dur 2] [--loop]   # ElevenLabs if ELEVENLABS_API_KEY is set, else procedural fallback
  python sfxgen.py test
"""
import json
import os
import re
import sys
import urllib.request

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sound as S  # noqa: E402

SR = S.SR
FPS = 30


# ---------------------------------------------------------------- spec parsing
def _secs(v, default):
    if v is None:
        return default
    v = str(v)
    if v.endswith("f"):
        return float(v[:-1]) / FPS
    if v.endswith("s"):
        return float(v[:-1])
    return float(v)


def export(x, tp_db=-1.5):
    """Normalize so the 4x-oversampled (true) peak sits at tp_db — square-ish UI sounds overshoot between samples."""
    from scipy import signal as sg

    tp = np.abs(sg.resample_poly(x, 4, 1, axis=0)).max()
    return x * (10 ** (tp_db / 20) / tp) if tp > 0 else x


def parse(spec):
    """'cat:k=v,k=v' -> (cat, params dict). Bare legacy names ('impact') -> ('legacy', {'name': ...})."""
    if ":" not in spec:
        return "legacy", {"name": spec}
    cat, rest = spec.split(":", 1)
    params = {}
    for kv in filter(None, rest.split(",")):
        k, _, v = kv.partition("=")
        params[k.strip()] = v.strip()
    return cat.strip(), params


def _rng(p):
    return np.random.default_rng(int(p.get("seed", 0)) + 101)


def _pitch(x, semis):
    """Resample-based pitch/time shift (short SFX: changing both is fine and artifact-free)."""
    if not semis:
        return x
    r = 2 ** (float(semis) / 12)
    n = int(len(x) / r)
    idx = np.linspace(0, len(x) - 1, n)
    if x.ndim == 1:
        return np.interp(idx, np.arange(len(x)), x)
    return np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(x.shape[1])], axis=1)


# ---------------------------------------------------------------- a) whooshes
def whoosh(p):
    rng = _rng(p)
    sec = _secs(p.get("len"), 0.4)
    d = p.get("dir", "LR").upper()
    tone = p.get("tone", "bright")
    weight = p.get("weight", "medium")
    rev = p.get("reverse", "0") == "1"
    n = int(sec * SR)
    lo, hi = (180, 3200) if tone == "dark" else (500, 9000)
    if weight == "heavy":
        lo *= 0.6
    elif weight == "light":
        lo *= 1.6
    peak = 0.55 + (rng.random() - 0.5) * 0.2
    t = np.linspace(0, 1, n)
    shape = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.5)
    nz = S.noise(sec, rng)
    x = S.sweep_filter(nz, lo, hi, "band", q=1.2 + rng.random()) * shape
    if weight == "heavy":
        x += S.butter(nz, 220, "low") * shape * 0.8
    if tone == "dark":
        x = S.butter(x, 4000, "low")
    pan = {"LR": np.linspace(-0.9, 0.9, n), "RL": np.linspace(0.9, -0.9, n), "UP": np.zeros(n), "DOWN": np.zeros(n)}.get(d, np.zeros(n))
    if d == "UP":
        x = S.sweep_filter(x, 600, 9000, "high")
    if d == "DOWN":
        x = S.sweep_filter(x, 9000, 300, "low")
    x = S.norm(x)
    y = S.to_stereo(x, pan, 6)
    return S.fades(y[::-1] if rev else y, 0.002, 0.01)


# ---------------------------------------------------------------- b) impacts
def impact(p):
    rng = _rng(p)
    kind = p.get("kind", "boom")
    w = {"light": 0.6, "medium": 1.0, "heavy": 1.5}[p.get("weight", "medium")]
    tail = {"short": 0.4, "long": 1.0}[p.get("tail", "long")]
    sub = p.get("sub", "1") == "1"
    if kind == "snare":
        body = S.bandpass(S.noise(0.3, rng), 900, 7000) * S.env_ar(int(0.3 * SR), 0.0005, 0.06 * tail * w)
        body[: int(0.05 * SR)] += S.tone(260, 180, 0.05) * S.env_ar(int(0.05 * SR), 0.0005, 0.02) * 0.7
        x = S.reverb(S.norm(body), 0.6 * tail, 0.18)
    elif kind == "glass":
        sec = 1.2 * tail
        x = np.zeros(int(sec * SR))
        for _ in range(int(40 * w)):
            f0 = rng.uniform(2500, 9000)
            st = int(rng.uniform(0, 0.15) * SR)
            L = int(rng.uniform(0.05, 0.4) * SR)
            seg = np.sin(2 * np.pi * f0 * np.arange(L) / SR) * S.env_ar(L, 0.0002, rng.uniform(0.02, 0.12))
            x[st : st + L] += seg[: len(x) - st] * rng.uniform(0.2, 0.6)
        x[: int(0.02 * SR)] += S.bandpass(S.noise(0.02, rng), 2000, 10000) * 2
        x = S.reverb(S.norm(x), 0.8, 0.2)
    elif kind == "metal":
        sec = 1.6 * tail
        t = S.T(sec)
        x = sum(np.sin(2 * np.pi * f * t) * a for f, a in ((310, 1), (742, 0.6), (1251, 0.4), (2117, 0.25))) * S.env_ar(len(t), 0.0005, 0.35 * tail)
        x[: int(0.03 * SR)] += S.noise(0.03, rng) * 0.8
        x = S.reverb(S.norm(x), 1.0, 0.2)
    elif kind == "sub":
        x = S.to_stereo(S.sub_boom(1.8 * tail * w, 70, 28) * 1.0)
    else:  # boom / cinematic hit
        x = S.sfx_impact() if w >= 1 else S.sfx_hit()
        x = x[: int(len(x) * min(1, tail + 0.2))]
    x = S.to_stereo(x)
    if sub and kind != "sub":
        s = S.to_stereo(S.sub_boom(0.9 * tail * w, 60, 32))
        L = max(len(x), len(s))
        y = np.zeros((L, 2))
        y[: len(x)] += x
        y[: len(s)] += s * 0.7
        x = y
    return S.fades(S.norm(x * w), 0.0005, 0.05)


# ---------------------------------------------------------------- c) risers
def riser(p):
    rng = _rng(p)
    sec = _secs(p.get("len"), 2.0)
    kind = p.get("kind", "noise")
    curve = p.get("curve", "exp")
    end = p.get("end", "hit")
    n = int(sec * SR)
    t = np.linspace(0, 1, n)
    shape = {"exp": t ** 2.4, "lin": t, "log": np.sqrt(t), "s": 0.5 - 0.5 * np.cos(np.pi * t)}.get(curve, t ** 2.4)
    if kind == "tonal":
        x = (S.tone(110, 880, sec, "saw") + S.tone(111, 886, sec, "saw")) * 0.5
        x = S.sweep_filter(x, 300, 7000, "low") * shape
    elif kind in ("uplifter", "downlifter"):
        up = kind == "uplifter"
        x = S.sweep_filter(S.noise(sec, rng), 200 if up else 9000, 9000 if up else 200, "band", q=2.0)
        x = x * (shape if up else shape[::-1])
    elif kind == "reverse":
        x = S.sfx_reverse_swell(sec)[:, 0]
        x = np.pad(x, (max(0, n - len(x)), 0))[-n:]
    else:
        x = S.sweep_filter(S.noise(sec, rng), 300, 10000, "band", q=2.2) * shape
        x += S.butter(S.tone(55, 110, sec), 200, "low") * shape * 0.3
    trem = 1 + 0.2 * np.sin(2 * np.pi * np.cumsum(np.linspace(3, 18, n)) / SR)
    y = S.to_stereo(S.norm(x * trem), 0.3 * np.sin(np.linspace(0, 5 * np.pi, n)), 10)
    if end == "hit":
        h = impact({"kind": "boom", "weight": "medium", "tail": "short"})
        y = np.concatenate([y, h * 0.8])
    elif end == "drop":
        y = np.concatenate([y, S.to_stereo(S.sub_boom(1.2, 80, 30))])
    return S.fades(S.norm(y), 0.01, 0.003 if end == "silence" else 0.05)


# ---------------------------------------------------------------- d) ambience (seamless loops)
def ambience(p):
    rng = _rng(p)
    sec = _secs(p.get("len"), 8.0)
    kind = p.get("kind", "room")
    n = int(sec * SR)
    if kind == "rain":
        x = S.butter(S.noise(sec, rng), 6000, "low") * 0.4
        drops = (rng.random(n) > 0.9993) * rng.uniform(0.3, 1, n)
        x += S.bandpass(drops, 2000, 8000) * 3
    elif kind == "wind":
        mod = S.butter(rng.standard_normal(n), 0.4, "low")
        mod = (mod - mod.min()) / (np.ptp(mod) + 1e-9)
        x = S.sweep_filter(S.noise(sec, rng), 250, 900, "band", q=1.5) * (0.3 + mod)
    elif kind == "street":
        x = S.butter(S.noise(sec, rng), 500, "low") * 0.8
        for _ in range(int(sec / 3)):
            st = int(rng.uniform(0, sec - 2) * SR)
            car = S.butter(S.noise(2.0, rng), 900, "low") * np.sin(np.linspace(0, np.pi, int(2 * SR))) ** 2
            x[st : st + len(car)] += car[: n - st] * 1.2
    elif kind == "forest":
        x = S.butter(S.noise(sec, rng), 3000, "low") * 0.15
        for _ in range(int(sec * 1.5)):
            st = int(rng.uniform(0, sec - 0.3) * SR)
            f0 = rng.uniform(2500, 5000)
            L = int(0.12 * SR)
            chirp = S.tone(f0, f0 * rng.uniform(1.2, 1.6), 0.12) * S.env_ar(L, 0.005, 0.04)
            x[st : st + L] += chirp[: n - st] * 0.3
    elif kind == "office":
        t = np.arange(n) / SR
        x = 0.25 * np.sin(2 * np.pi * 60 * t) + 0.1 * np.sin(2 * np.pi * 120 * t) + S.butter(S.noise(sec, rng), 1500, "low") * 0.3
        for _ in range(int(sec / 2)):
            st = int(rng.uniform(0, sec - 0.1) * SR)
            k = S.bandpass(S.noise(0.04, rng), 1500, 6000) * S.env_ar(int(0.04 * SR), 0.0005, 0.01)
            x[st : st + len(k)] += k[: n - st] * 0.4
    elif kind == "coffee":
        x = S.bandpass(S.noise(sec, rng), 200, 2500) * 0.5  # crowd murmur
        x *= 0.8 + 0.2 * S.butter(rng.standard_normal(n), 3, "low")
        for _ in range(int(sec / 1.5)):
            st = int(rng.uniform(0, sec - 0.5) * SR)
            f0 = rng.uniform(2000, 4500)
            clink = np.sin(2 * np.pi * f0 * np.arange(int(0.4 * SR)) / SR) * S.env_ar(int(0.4 * SR), 0.0005, 0.08)
            x[st : st + len(clink)] += clink[: n - st] * 0.25
    else:  # room tone
        x = S.butter(S.noise(sec, rng), 400, "low") * 0.5 + S.butter(S.noise(sec, rng), 4000, "low") * 0.05
    # seamless loop: crossfade the last second into the start
    if p.get("loop", "1") == "1" and n > 2 * SR:
        xf = SR
        w = np.linspace(0, 1, xf)
        x[:xf] = x[:xf] * w + x[-xf:] * (1 - w)
        x = x[:-xf]
    return S.to_stereo(S.norm(x, 0.5), 0, 15)


# ---------------------------------------------------------------- e) UI & tech
def ui(p):
    rng = _rng(p)
    kind = p.get("kind", "click")
    soft = p.get("tone", "sharp") == "soft"
    dry = p.get("dry", "1") == "1"
    if kind == "click":
        x = S.sfx_click()[:, 0]
    elif kind == "tap":
        x = S.tone(900, 500, 0.04) * S.env_ar(int(0.04 * SR), 0.0005, 0.01)
    elif kind == "toggle":
        a = S.tone(1200, 1200, 0.03) * S.env_ar(int(0.03 * SR), 0.0005, 0.008)
        b = S.tone(1800, 1800, 0.03) * S.env_ar(int(0.03 * SR), 0.0005, 0.008)
        x = np.concatenate([a, np.zeros(int(0.04 * SR)), b])
    elif kind == "notification":
        x = np.concatenate([S.tone(f, f, 0.12) * S.env_ar(int(0.12 * SR), 0.002, 0.06) for f in (1318.5, 1760)])
    elif kind == "hover":
        x = S.sweep_filter(S.noise(0.12, rng), 2000, 5000, "band", q=3) * np.sin(np.linspace(0, np.pi, int(0.12 * SR)))
    elif kind == "typing":
        x = np.concatenate([np.concatenate([S.sfx_key(int(rng.integers(0, 99)))[:, 0], np.zeros(int(rng.uniform(0.04, 0.12) * SR))]) for _ in range(8)])
    elif kind == "digital":
        x = np.concatenate([S.tone(rng.uniform(600, 3000), rng.uniform(600, 3000), 0.015, "square") * 0.4 for _ in range(12)])
    else:
        x = S.sfx_tick()[:, 0]
    if soft:
        x = S.butter(x, 3000, "low")
    y = S.to_stereo(S.norm(x, 0.6))
    return y if dry else S.reverb(y, 0.5, 0.25)


# ---------------------------------------------------------------- f) transition-specific
def trans(p):
    kind = p.get("kind", "glitch_burst")
    if kind == "glitch_burst":
        return S.sfx_glitch(_secs(p.get("len"), 0.25), int(p.get("seed", 0)))
    if kind == "reverse_impact":
        h = impact({"kind": "boom", "tail": "long"})
        return S.fades(h[::-1], 0.01, 0.002)
    if kind == "tape_stop":
        return S.sfx_tape_stop(_secs(p.get("len"), 0.6))
    if kind == "sub_drop":
        return S.to_stereo(S.sub_boom(1.2, 100, 28))
    if kind == "whiteout":
        sw = S.sfx_reverse_swell(_secs(p.get("len"), 0.5))
        return sw
    raise KeyError(kind)


# ---------------------------------------------------------------- trends 2026
def trend(p):
    rng = _rng(p)
    kind = p.get("kind", "vine_boom")
    if kind == "vine_boom":
        return S.SFX["vine_boom"]()
    if kind == "boing":
        x = np.sin(2 * np.pi * np.cumsum(220 + 120 * np.sin(np.linspace(0, 30, int(0.6 * SR))) * np.linspace(1, 0.2, int(0.6 * SR))) / SR) * S.env_ar(int(0.6 * SR), 0.002, 0.25)
        return S.to_stereo(export(x))
    if kind == "record_scratch":
        n = int(0.45 * SR)
        rate = np.abs(np.sin(np.linspace(0, 3 * np.pi, n))) * 2 + 0.2
        x = S.bandpass(S.noise(0.45, rng), 300, 5000) * np.interp(np.cumsum(rate) % n, np.arange(n), S.env_ar(n, 0.001, 0.2))
        return S.to_stereo(export(x))
    if kind == "wasted":
        t = S.T(2.0)
        x = sum(np.sin(2 * np.pi * f * t) for f in (220, 261.6, 311.1)) * S.env_ar(len(t), 0.01, 0.8)
        x = S.butter(x, 1800, "low")
        return S.reverb(S.norm(S.to_stereo(x), 0.7), 1.5, 0.35)
    if kind == "get_out":  # stinger, not the voice clip (search the real clip with /sfx-find)
        return S.to_stereo(S.norm(S.tone(300, 80, 0.8, "saw") * S.env_ar(int(0.8 * SR), 0.002, 0.3), 0.8))
    if kind == "phonk_808":
        L = 0.9
        x = S.sat(S.tone(55, 45, L) + 0.4 * S.tone(110, 90, L), 4.0) * S.env_ar(int(L * SR), 0.003, 0.45)
        return S.to_stereo(S.norm(x))
    if kind == "distorted_hit":
        return S.to_stereo(S.norm(S.sat(S.sfx_hit()[:, 0] * 3, 5.0)))
    if kind == "cowbell":
        x = S.butter(S.tone(800, 800, 0.25, "square") + S.tone(540, 540, 0.25, "square"), 2500, "low") * S.env_ar(int(0.25 * SR), 0.001, 0.08)
        return S.to_stereo(S.norm(x, 0.7))
    if kind in ("electric_burst", "tesla_arc"):
        sec = 0.6 if kind == "electric_burst" else 1.4
        n = int(sec * SR)
        crackle = (rng.random(n) > (0.97 if kind == "tesla_arc" else 0.985)) * rng.uniform(-1, 1, n)
        buzz = np.sign(np.sin(2 * np.pi * 120 * np.arange(n) / SR)) * 0.15
        x = S.bandpass(crackle, 1500, 12000) * 2 + buzz * (rng.random(n) > 0.5)
        x *= S.env_ar(n, 0.002, sec * 0.5)
        return S.to_stereo(export(x), rng.uniform(-0.4, 0.4))
    if kind == "corrupted":
        x = S.sfx_glitch(0.5, int(rng.integers(0, 99)))[:, 0]
        x = np.round(x * 4) / 4
        return S.to_stereo(S.norm(_pitch(x, -7), 0.8))
    if kind == "scifi_whoosh":
        w = whoosh({"len": "0.5s", "tone": "bright", "dir": "LR"})
        g = S.sfx_glitch(0.2)
        s = S.to_stereo(S.tone(2000, 200, 0.3, "saw") * S.env_ar(int(0.3 * SR), 0.001, 0.1) * 0.4)
        out = np.zeros((max(len(w), len(g) + int(0.3 * SR), len(s) + int(0.45 * SR)), 2))
        out[: len(w)] += w
        out[int(0.3 * SR) : int(0.3 * SR) + len(g)] += g
        out[int(0.45 * SR) : int(0.45 * SR) + len(s)] += s
        return S.norm(out)
    if kind in ("hook_click", "hook_ding", "hook_pop", "hook_whoosh"):
        return {"hook_click": S.sfx_click, "hook_ding": S.sfx_ding, "hook_pop": S.sfx_pop, "hook_whoosh": lambda: whoosh({"len": "0.3s"})}[kind]()
    raise KeyError(kind)


# ---------------------------------------------------------------- ASMR
def asmr(p):
    rng = _rng(p)
    kind = p.get("kind", "soft_click")
    if kind == "soft_click":
        x = S.butter(S.sfx_click()[:, 0], 2500, "low") * 0.6
    elif kind == "rustle":
        sec = 1.0
        x = S.bandpass(S.noise(sec, rng), 1500, 8000) * np.abs(S.butter(rng.standard_normal(int(sec * SR)), 12, "low")) * 3
    else:  # wet
        x = np.concatenate([S.tone(rng.uniform(300, 700), rng.uniform(900, 1500), 0.03) * S.env_ar(int(0.03 * SR), 0.0005, 0.008) for _ in range(5)])
    return S.to_stereo(S.norm(x, 0.4))


GEN = {"whoosh": whoosh, "impact": impact, "riser": riser, "ambience": ambience, "ui": ui, "trans": trans, "trend": trend, "asmr": asmr}
KINDS = {
    "whoosh": "params: len(4–24f), dir LR|RL|UP|DOWN, tone bright|dark, weight light|medium|heavy, reverse 0|1, seed",
    "impact": "kind snare|boom|sub|glass|metal, weight light|medium|heavy, tail short|long, sub 0|1",
    "riser": "len(0.5–8s), kind tonal|noise|reverse|uplifter|downlifter, end hit|drop|silence, curve exp|lin|log|s",
    "ambience": "kind room|office|street|forest|coffee|rain|wind, len, loop 0|1",
    "ui": "kind click|tap|toggle|notification|hover|typing|digital, dry 0|1, tone soft|sharp",
    "trans": "kind glitch_burst|reverse_impact|tape_stop|sub_drop|whiteout",
    "trend": "kind vine_boom|boing|record_scratch|wasted|get_out|phonk_808|distorted_hit|cowbell|electric_burst|tesla_arc|corrupted|scifi_whoosh|hook_click|hook_ding|hook_pop|hook_whoosh",
    "asmr": "kind soft_click|rustle|wet",
}


def render(spec, max_frames=None):
    """Spec -> stereo float array. `max_frames` trims to a transition/animation length (with a short fade)."""
    cat, p = parse(spec)
    if cat == "legacy":
        x = S.to_stereo(S.SFX[p["name"]]())
    else:
        x = S.to_stereo(GEN[cat](p))
    x = _pitch(x, p.get("pitch", 0))
    x = x * float(p.get("gain", 1.0))
    if max_frames:
        n = int(max_frames / FPS * SR)
        if len(x) > n:
            x = S.fades(x[:n], 0, min(0.02, n / SR / 4))
    return x


# ---------------------------------------------------------------- layer stacks (/sfx-layer)
LAYERS = {
    "cut": ["trans:kind=sub_drop"],
    "dissolve": ["whoosh:len=14f,tone=dark,weight=light"],
    "blurDissolve": ["whoosh:len=14f,tone=dark,weight=light", "ambience:kind=room,len=1s,loop=0,gain=0.3"],
    "scaleDissolve": ["whoosh:len=10f,tone=dark,weight=light", "impact:kind=sub,tail=short,weight=light,gain=0.5"],
    "shapeWipe": ["whoosh:len=12f,dir=LR,tone=bright", "ui:kind=tap,gain=0.5"],
    "matchReveal": ["riser:len=0.5s,kind=reverse,end=silence", "impact:kind=boom,weight=light,tail=short"],
    "matteWipe": ["whoosh:len=12f,dir=LR,weight=heavy", "impact:kind=snare,weight=light,tail=short"],
    "lightLeak": ["riser:len=0.6s,kind=uplifter,end=silence,gain=0.6", "trend:kind=hook_ding,gain=0.3"],
    "filmBurn": ["riser:len=0.6s,kind=uplifter,end=silence", "impact:kind=sub,tail=short,weight=light"],
    "glitch": ["trans:kind=glitch_burst", "impact:kind=snare,weight=medium,tail=short", "trend:kind=electric_burst,gain=0.5"],
    "phonk": ["trans:kind=glitch_burst", "trend:kind=distorted_hit", "trend:kind=phonk_808,gain=0.7"],
    "particle": ["riser:len=0.5s,kind=noise,end=silence,gain=0.5", "trend:kind=hook_ding,gain=0.4"],
    "liquid": ["whoosh:len=16f,dir=UP,tone=dark", "asmr:kind=wet,gain=0.6"],
    "split": ["whoosh:len=8f,dir=LR,tone=bright,weight=heavy", "impact:kind=glass,weight=light,tail=short"],
    "depth": ["whoosh:len=12f,dir=DOWN,tone=dark,weight=heavy", "impact:kind=sub,tail=long"],
    "whip": ["whoosh:len=8f,dir=LR,tone=bright,weight=heavy", "impact:kind=snare,weight=light,tail=short", "impact:kind=sub,tail=short,weight=light,gain=0.5"],
    "zoom": ["whoosh:len=10f,dir=UP,tone=bright", "impact:kind=boom,weight=medium,tail=short"],
    "whiteout": ["trans:kind=whiteout,len=0.3s", "impact:kind=boom,weight=medium,tail=long"],
    "blackDip": ["trans:kind=tape_stop,len=0.25s,gain=0.6", "impact:kind=sub,tail=long,weight=heavy"],
    "speedRamp": ["trans:kind=tape_stop", "whoosh:len=12f,tone=dark", "riser:len=0.4s,kind=uplifter,end=silence"],
}
# where each layer sits relative to the transition: whooshes/risers END on the cut, impacts START on it
ENDS_ON_CUT = {"whoosh", "riser"}


def layer(kind, frames=10):
    """Returns [(spec, offset_frames)] for a transition centered on its cut frame."""
    out = []
    for spec in LAYERS.get(kind, LAYERS["cut"]):
        cat, p = parse(spec)
        if cat in ENDS_ON_CUT or (cat == "trans" and p.get("kind") in ("whiteout", "reverse_impact")):
            out.append((spec, "end"))
        else:
            out.append((spec, 0))
    return out


# ---------------------------------------------------------------- packs (/sfx-pack)
PACKS = {
    "gym": ["trend:kind=phonk_808", "trend:kind=distorted_hit", "impact:kind=boom,weight=heavy", "impact:kind=metal,weight=heavy", "whoosh:len=8f,weight=heavy", "riser:len=2s,kind=noise,end=hit", "trans:kind=sub_drop"],
    "phonk": ["trend:kind=cowbell", "trend:kind=phonk_808", "trend:kind=distorted_hit", "trans:kind=glitch_burst", "whoosh:len=10f,tone=dark,weight=heavy", "impact:kind=sub,tail=long", "trans:kind=tape_stop"],
    "anime": ["impact:kind=snare,weight=heavy", "impact:kind=glass", "whoosh:len=6f,weight=heavy", "trend:kind=electric_burst", "riser:len=1s,kind=tonal,end=hit", "trans:kind=whiteout"],
    "meme": ["trend:kind=vine_boom", "trend:kind=boing", "trend:kind=record_scratch", "trend:kind=wasted", "trend:kind=hook_pop", "trend:kind=get_out"],
    "horror": ["trans:kind=reverse_impact", "impact:kind=metal,tail=long", "riser:len=3s,kind=tonal,end=silence", "ambience:kind=wind,len=6s", "trend:kind=corrupted", "screech"],
    "tech": ["trend:kind=scifi_whoosh", "trend:kind=tesla_arc", "ui:kind=digital", "ui:kind=notification", "ui:kind=typing", "trend:kind=corrupted"],
    "edit": ["trans:kind=whiteout", "impact:kind=boom", "whoosh:len=8f,weight=heavy", "trans:kind=glitch_burst", "riser:len=1s,kind=reverse,end=silence", "trend:kind=hook_click"],
    "cinematic": ["impact:kind=boom,weight=heavy,tail=long", "riser:len=4s,kind=tonal,end=hit", "riser:len=2s,kind=reverse,end=silence", "ambience:kind=room,len=6s", "whoosh:len=20f,tone=dark"],
}


def write_pack(genre, d):
    os.makedirs(d, exist_ok=True)
    files = []
    for i, spec in enumerate(PACKS[genre]):
        for v in range(3):  # 3 variations each
            sp = f"{spec},seed={v},pitch={(v - 1) * 1.5}" if ":" in spec else spec
            x = render(sp)
            name = f"{genre}_{i:02d}_{re.sub(r'[^a-z0-9]+', '_', spec.split(',')[0].lower())}_v{v}.wav"
            S.write_wav(os.path.join(d, name), export(x))
            files.append(name)
    json.dump({"genre": genre, "specs": PACKS[genre], "files": files, "source": "procedural (ae-motion sound engine)", "license": "generated — free to use"}, open(os.path.join(d, "pack.json"), "w"), indent=1)
    return files


# ---------------------------------------------------------------- AI generation (/sfx-generate)
def ai_generate(prompt, out, dur=2.0, loop=False):
    """ElevenLabs Sound Effects if ELEVENLABS_API_KEY is set; otherwise maps the prompt to a procedural spec."""
    key = os.environ.get("ELEVENLABS_API_KEY")
    if key:
        body = json.dumps({"text": prompt, "duration_seconds": max(0.5, min(30, dur)), "prompt_influence": 0.5, "loop": bool(loop)}).encode()
        req = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation", data=body, headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"})
        with urllib.request.urlopen(req, timeout=120) as r:
            mp3 = out.rsplit(".", 1)[0] + ".mp3"
            open(mp3, "wb").write(r.read())
        return mp3, "elevenlabs"
    spec = prompt_to_spec(prompt, dur, loop)
    S.write_wav(out, export(render(spec)))
    return out, f"procedural ({spec})"


def prompt_to_spec(prompt, dur=2.0, loop=False):
    q = prompt.lower()
    tone = "dark" if any(w in q for w in ("dark", "тём", "темн", "deep", "низк", "heavy", "тяж")) else "bright"
    weight = "heavy" if any(w in q for w in ("heavy", "тяж", "big", "мощ", "epic")) else "light" if any(w in q for w in ("light", "лёгк", "легк", "soft", "мягк")) else "medium"
    table = [
        (("rain", "дожд"), f"ambience:kind=rain,len={dur}s,loop={int(loop)}"),
        (("wind", "ветер", "ветр"), f"ambience:kind=wind,len={dur}s,loop={int(loop)}"),
        (("forest", "лес"), f"ambience:kind=forest,len={dur}s,loop={int(loop)}"),
        (("street", "улиц", "city", "город"), f"ambience:kind=street,len={dur}s,loop={int(loop)}"),
        (("cafe", "coffee", "кафе", "кофе"), f"ambience:kind=coffee,len={dur}s,loop={int(loop)}"),
        (("office", "офис"), f"ambience:kind=office,len={dur}s,loop={int(loop)}"),
        (("room", "комнат", "room tone"), f"ambience:kind=room,len={dur}s,loop={int(loop)}"),
        (("riser", "rise", "нараст", "build", "подъём", "uplift"), f"riser:len={dur}s,kind=noise,end=hit"),
        (("glass", "стекл"), f"impact:kind=glass,weight={weight}"),
        (("metal", "метал"), f"impact:kind=metal,weight={weight}"),
        (("sub", "808", "бас"), "trend:kind=phonk_808"),
        (("electric", "tesla", "ток", "электр", "молни"), "trend:kind=tesla_arc"),
        (("glitch", "глитч", "corrupt"), "trend:kind=corrupted"),
        (("vine", "boom мем", "мем"), "trend:kind=vine_boom"),
        (("click", "клик"), "ui:kind=click"),
        (("notif", "уведомл"), "ui:kind=notification"),
        (("typing", "печат", "клавиат"), "ui:kind=typing"),
        (("impact", "hit", "удар", "boom", "бум"), f"impact:kind=boom,weight={weight},tail=long"),
        (("whoosh", "swoosh", "вжух", "свист", "переход"), f"whoosh:len={max(4, min(24, int(dur * FPS)))}f,tone={tone},weight={weight}"),
    ]
    for keys, spec in table:
        if any(k in q for k in keys):
            return spec
    return f"whoosh:len=12f,tone={tone},weight={weight}"


# ---------------------------------------------------------------- beat sync (/sfx-sync)
SYNC_STYLE = {
    # strongest hits get the impact, downbeats get a whoosh that ENDS on them, every 4th downbeat a riser
    "edit": ("impact:kind=boom,weight=medium,tail=short", "whoosh:len=8f,weight=heavy", "riser:len=1s,kind=reverse,end=silence"),
    "phonk": ("trend:kind=distorted_hit", "whoosh:len=8f,tone=dark,weight=heavy", "trans:kind=glitch_burst"),
    "cinematic": ("impact:kind=boom,weight=heavy,tail=long", "whoosh:len=20f,tone=dark", "riser:len=2s,kind=tonal,end=silence"),
    "meme": ("trend:kind=vine_boom", "trend:kind=hook_whoosh", "trend:kind=record_scratch"),
    "tech": ("trend:kind=electric_burst", "trend:kind=scifi_whoosh", "ui:kind=digital"),
}


def sync(beats, style="edit", max_hits=12, total=None):
    """beats.json -> sfxTrack list. Hits are spaced >= 1 beat apart and capped (restraint)."""
    hit, wsh, rise = SYNC_STYLE[style]
    bf = np.diff(beats["beats"]).mean() if len(beats["beats"]) > 1 else 15
    track, last = [], -1e9
    ranked = sorted(beats["hits"], key=lambda f: -beats["energy"][int(np.argmin(np.abs(np.array(beats["beats"]) - f)))] if beats["beats"] else 0)
    for f in sorted(ranked[:max_hits]):
        if total and f >= total:
            continue
        if f - last >= bf:
            track.append([hit, int(f), 0.7])
            last = f
    for i, f in enumerate(beats["downbeats"]):
        if total and f >= total:
            continue
        track.append([wsh, int(f), 0.35])
        if i % 4 == 3:
            track.append([rise, int(f), 0.45])
    return sorted(track, key=lambda t: t[1])


# ---------------------------------------------------------------- self-check
def selftest():
    for cat, desc in KINDS.items():
        kinds = re.findall(r"kind ([a-z0-9_|]+)", desc)
        variants = kinds[0].split("|") if kinds else [""]
        for k in variants:
            spec = f"{cat}:kind={k}" if k else f"{cat}:len=10f"
            x = render(spec)
            assert x.ndim == 2 and x.shape[1] == 2 and np.isfinite(x).all() and np.abs(x).max() > 0.01 and len(x) > 100, spec
    ws = [render(f"whoosh:len={L}f,dir={d},tone={t},weight={w},seed={s}") for L in (4, 12, 24) for d in ("LR", "RL") for t in ("bright", "dark") for w in ("light", "heavy") for s in (0, 1)]
    assert len(ws) == 48 and all(abs(len(w) / SR - L / FPS) < 0.02 for w, L in zip(ws, [L for L in (4, 12, 24) for _ in range(16)]))
    lr = render("whoosh:len=12f,dir=LR")
    assert np.abs(lr[: len(lr) // 4, 0]).mean() > np.abs(lr[: len(lr) // 4, 1]).mean(), "LR starts left"
    t = render("riser:len=1s,end=silence")
    assert abs(len(t) / SR - 1.0) < 0.02
    assert len(render("whoosh:len=24f", max_frames=10)) <= int(10 / FPS * SR)
    for k in LAYERS:
        assert 1 <= len(layer(k)) <= 3
        for spec, _ in layer(k):
            render(spec)
    loop = render("ambience:kind=rain,len=4s,loop=1")
    assert np.abs(loop[:200] - loop[-200:]).mean() < 0.2, "loop seam"
    assert prompt_to_spec("тёмный whoosh для перехода в подвал").startswith("whoosh:") and "tone=dark" in prompt_to_spec("тёмный whoosh")
    assert render("impact").shape[1] == 2  # legacy names still work
    bj = {"beats": list(range(0, 300, 15)), "downbeats": list(range(0, 300, 60)), "hits": [15, 20, 45, 46, 90, 150, 290], "energy": [0.5] * 20}
    tr = sync(bj, "edit", 12, total=280)
    hits = [f for s_, f, _ in tr if s_.startswith("impact")]
    assert all(b - a_ >= 15 for a_, b in zip(hits, hits[1:])) and 290 not in hits and len(hits) <= 12, hits
    print("ok: all categories x kinds, 48 whoosh variations, layers, loops, trims, prompt map")


def main():
    a = sys.argv[1:]
    if not a or a[0] == "list":
        for k, v in KINDS.items():
            print(f"{k:9s} {v}")
        print("packs:", ", ".join(PACKS))
        return
    cmd = a[0]
    if cmd == "test":
        return selftest()
    if cmd == "render":
        S.write_wav(a[2], export(render(a[1])))
    elif cmd == "variations":
        cat, n, d = a[1], int(a[2]), a[3]
        os.makedirs(d, exist_ok=True)
        rng = np.random.default_rng(7)
        for i in range(n):
            spec = f"{cat}:len={int(rng.integers(4, 25))}f,dir={rng.choice(['LR', 'RL', 'UP', 'DOWN'])},tone={rng.choice(['bright', 'dark'])},weight={rng.choice(['light', 'medium', 'heavy'])},reverse={int(rng.random() < 0.2)},seed={i}"
            S.write_wav(os.path.join(d, f"{cat}_{i:03d}.wav"), export(render(spec)))
        print(n, "files")
    elif cmd == "pack":
        print(len(write_pack(a[1], a[2])), "files ->", a[2])
    elif cmd == "layer":
        fr = int(a[a.index("--frames") + 1]) if "--frames" in a else 10
        for spec, off in layer(a[1], fr):
            print(f"{spec:60s} {'ends on the cut' if off == 'end' else 'starts on the cut'}")
    elif cmd == "sync":  # sync <project> [--style edit|phonk|cinematic|meme|tech] [--max 12]
        proj = a[1]
        style = a[a.index("--style") + 1] if "--style" in a else "edit"
        mx = int(a[a.index("--max") + 1]) if "--max" in a else 12
        bj = json.load(open(os.path.join(proj, "src", "beats.json")))
        sp = os.path.join(proj, "script.json")
        cfg = json.load(open(sp, encoding="utf-8"))
        tl = os.path.join(proj, "src", "timeline.json")
        total = json.load(open(tl, encoding="utf-8"))["total"] if os.path.exists(tl) else None
        cfg["sfxTrack"] = sync(bj, style, mx, total)
        json.dump(cfg, open(sp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(len(cfg["sfxTrack"]), "SFX placed on beats/hits -> script.json sfxTrack; rebuild with tools/build.py")
    elif cmd == "ai":
        dur = float(a[a.index("--dur") + 1]) if "--dur" in a else 2.0
        out, how = ai_generate(a[1], a[2], dur, "--loop" in a)
        print(out, "via", how)
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
