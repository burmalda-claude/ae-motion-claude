"""Procedural sound design: SFX library + music bed. No samples, no licenses — everything is synthesized.

Usage:
  python sfx.py sfx  <project_dir>                       -> public/sfx/*.wav
  python sfx.py beat <project_dir> --bpm 120 --seconds 60 [--key A] [--intro-bars 2] -> public/music/beat.wav
  python sfx.py test                                     -> self-check (asserts)

SFX names: whoosh, whoosh_fast, swish_in, hit, boom, riser, riser_short, slash, glitch, click, key, pop,
           shimmer, ding, tick, shutter, sub_drop, stutter
Needs numpy only.
"""
import argparse
import os
import sys
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(7)


# ---------- primitives ----------
def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def env(n, a=0.005, d=None, curve=4.0):
    """attack (s) then exponential-ish decay to the end."""
    a_n = max(1, int(a * SR))
    e = np.ones(n)
    e[:a_n] = np.linspace(0, 1, a_n)
    rest = n - a_n
    if rest > 0:
        e[a_n:] = np.exp(-curve * np.linspace(0, 1, rest)) if d is None else np.clip(1 - np.linspace(0, 1, rest) / d, 0, 1)
    return e


def fade(x, fin=0.003, fout=0.01):
    x = x.copy()
    i, o = int(fin * SR), int(fout * SR)
    shape = (-1, 1) if x.ndim == 2 else (-1,)
    if i:
        x[:i] *= np.linspace(0, 1, i).reshape(shape)
    if o:
        x[-o:] *= np.linspace(1, 0, o).reshape(shape)
    return x


def sweep_tone(f0, f1, sec, kind="sine", curve="exp"):
    t = t_axis(sec)
    f = f0 * (f1 / f0) ** (t / sec) if curve == "exp" else np.linspace(f0, f1, len(t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    if kind == "saw":
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if kind == "square":
        return np.sign(np.sin(ph))
    return np.sin(ph)


def svf(x, cutoff, q=0.7, mode="bp"):
    """State-variable filter with per-sample cutoff (array or scalar)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    low = band = 0.0
    out = np.empty_like(x)
    damp = 1.0 / q
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(cutoff[i], SR / 6) / SR)
        high = x[i] - low - damp * band
        band += f * high
        low += f * band
        out[i] = band if mode == "bp" else low if mode == "lp" else high
    return out


def noise(sec):
    return rng.uniform(-1, 1, int(sec * SR))


def reverb(x, sec=1.2, mix=0.25):
    n = int(sec * SR)
    ir = rng.uniform(-1, 1, n) * np.exp(-6 * np.linspace(0, 1, n))
    ir[0] = 0
    L = len(x) + n
    wet = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)
    wet /= np.max(np.abs(wet)) + 1e-9
    y = np.zeros(len(x) + n)
    y[: len(x)] += x * (1 - mix)
    return y + wet * mix * np.max(np.abs(x))


def sat(x, drive=2.0):
    return np.tanh(x * drive) / np.tanh(drive)


def stereo(x, pan=None, width=0.0):
    """pan: scalar or array in -1..1. width: small decorrelation delay (ms)."""
    if pan is None:
        pan = 0.0
    pan = np.broadcast_to(np.asarray(pan, dtype=float), x.shape)
    l = x * np.sqrt(0.5 * (1 - pan))
    r = x * np.sqrt(0.5 * (1 + pan))
    if width:
        d = int(width / 1000 * SR)
        r = np.concatenate([np.zeros(d), r])[: len(r)]
    return np.stack([l, r], axis=1)


def norm(x, peak=0.89):
    m = np.max(np.abs(x))
    return x * (peak / m) if m > 0 else x


def write(path, x):
    x = norm(x) if np.max(np.abs(x)) > 0.89 else x
    if x.ndim == 1:
        x = stereo(x)
    data = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


# ---------- sfx ----------
def whoosh(sec=0.55, lo=300, hi=4000):
    n = int(sec * SR)
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    cut = lo + (hi - lo) * shape
    x = svf(noise(sec), cut, q=1.2) * shape
    return fade(stereo(norm(x), pan=np.linspace(-0.7, 0.7, n), width=6))


def swish_in(sec=0.7):
    n = int(sec * SR)
    shape = np.linspace(0, 1, n) ** 3
    x = svf(noise(sec), 200 + 6000 * shape, q=1.5) * shape
    return fade(stereo(norm(x), pan=np.linspace(0.6, -0.2, n), width=5), fout=0.004)


def kick(sec=0.45, f0=160, f1=42):
    body = sweep_tone(f0, f1, sec) * env(int(sec * SR), 0.001, curve=5)
    click = svf(noise(0.012), 3000, q=0.8) * env(int(0.012 * SR), 0.0005, curve=8)
    body[: len(click)] += click * 0.6
    return sat(body, 2.5)


def hit():
    k = kick(0.6, 180, 40)
    crack = svf(noise(0.35), 1800, q=0.6) * env(int(0.35 * SR), 0.001, curve=9)
    x = k.copy()
    x[: len(crack)] += crack * 0.7
    return stereo(reverb(norm(x), 0.9, 0.22), width=8)


def boom():
    sub = sweep_tone(70, 28, 2.2) * env(int(2.2 * SR), 0.002, curve=2.5)
    rumble = svf(noise(2.2), 120, q=0.6, mode="lp") * env(int(2.2 * SR), 0.01, curve=3)
    x = sat(sub + rumble * 0.8, 1.8)
    x[: int(0.6 * SR)] += kick(0.6, 200, 45) * 0.8
    return stereo(reverb(norm(x), 1.8, 0.3), width=10)


def sub_drop():
    x = sweep_tone(110, 30, 1.6) * env(int(1.6 * SR), 0.005, curve=2)
    return stereo(sat(x, 1.5))


def riser(sec=2.4):
    n = int(sec * SR)
    shape = np.linspace(0, 1, n) ** 2
    nz = svf(noise(sec), 300 + 9000 * shape, q=2.0) * shape
    tone = sweep_tone(110, 880, sec, "saw") * shape * 0.25
    tone = svf(tone, 400 + 5000 * shape, q=0.9, mode="lp")
    x = nz + tone
    return fade(stereo(norm(x), pan=0.3 * np.sin(np.linspace(0, 6 * np.pi, n)), width=12), fout=0.005)


def slash():
    sec = 0.45
    n = int(sec * SR)
    e = env(n, 0.004, curve=6)
    hiss = svf(noise(sec), np.linspace(6000, 1500, n), q=2.5) * e
    hum = sweep_tone(420, 140, sec, "saw") * e * 0.35
    return fade(stereo(norm(hiss + hum), pan=np.linspace(-0.9, 0.9, n), width=4))


def glitch(sec=0.35):
    n = int(sec * SR)
    x = np.zeros(n)
    pos = 0
    while pos < n:
        seg = int(rng.uniform(0.008, 0.04) * SR)
        f = rng.choice([180, 360, 720, 1440, 2880])
        tt = np.arange(seg) / SR
        s = np.sign(np.sin(2 * np.pi * f * tt)) * (rng.random() > 0.25)
        s = np.round(s * 4) / 4  # bitcrush
        x[pos : pos + seg] = s[: n - pos] * rng.uniform(0.3, 1)
        pos += seg
    return fade(stereo(x * 0.6, pan=rng.uniform(-0.5, 0.5)))


def click():
    x = svf(noise(0.03), 4500, q=3) * env(int(0.03 * SR), 0.0005, curve=12)
    return stereo(norm(x, 0.7))


def key():
    sec = 0.06
    x = svf(noise(sec), rng.uniform(2500, 3500), q=2) * env(int(sec * SR), 0.0005, curve=14)
    x += kick(sec, 400, 200) * 0.15
    return stereo(norm(x, 0.5), pan=rng.uniform(-0.2, 0.2))


def pop():
    sec = 0.14
    x = sweep_tone(300, 900, sec) * env(int(sec * SR), 0.002, curve=7)
    return stereo(norm(x, 0.7))


def shimmer():
    sec = 1.4
    x = np.zeros(int(sec * SR))
    for i, f in enumerate([2093, 2637, 3136, 4186, 5274]):
        start = int(i * 0.05 * SR)
        n = len(x) - start
        x[start:] += np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.002, curve=5) * 0.3
    return stereo(reverb(x, 1.2, 0.35), width=14)


def ding():
    sec = 1.2
    t = t_axis(sec)
    x = (np.sin(2 * np.pi * 1320 * t) + 0.4 * np.sin(2 * np.pi * 2640 * t) + 0.2 * np.sin(2 * np.pi * 3960 * t)) * env(len(t), 0.002, curve=5)
    return stereo(reverb(norm(x, 0.6), 0.8, 0.2), width=6)


def tick():
    x = np.sin(2 * np.pi * 2200 * t_axis(0.02)) * env(int(0.02 * SR), 0.0005, curve=10)
    return stereo(norm(x, 0.5))


def shutter():
    a = svf(noise(0.05), 3000, q=1.5) * env(int(0.05 * SR), 0.001, curve=10)
    b = svf(noise(0.07), 2000, q=1.5) * env(int(0.07 * SR), 0.001, curve=9)
    x = np.concatenate([a, np.zeros(int(0.06 * SR)), b])
    return stereo(norm(x, 0.7))


def stutter():
    seg = whoosh(0.08, 800, 5000)[:, 0]
    x = np.concatenate([seg * (1 - i * 0.12) for i in range(6)])
    return stereo(x)


SFX = {
    "whoosh": lambda: whoosh(),
    "whoosh_fast": lambda: whoosh(0.25, 600, 6000),
    "swish_in": swish_in,
    "hit": hit,
    "boom": boom,
    "sub_drop": sub_drop,
    "riser": lambda: riser(2.4),
    "riser_short": lambda: riser(1.0),
    "slash": slash,
    "glitch": glitch,
    "click": click,
    "key": key,
    "pop": pop,
    "shimmer": shimmer,
    "ding": ding,
    "tick": tick,
    "shutter": shutter,
    "stutter": stutter,
}


# ---------- music bed ----------
NOTES = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def beat(bpm=120, seconds=60, key="A", intro_bars=2):
    beat_s = 60 / bpm
    n = int(seconds * SR)
    mix = np.zeros((n, 2))
    root = 33 + NOTES[key]  # low A1-ish
    prog = [0, 0, 8, 7]  # i  i  VI  v  (minor feel)
    k = stereo(kick(0.5, 150, 40) * 0.9)
    clap_m = svf(noise(0.25), 1500, q=0.8) * env(int(0.25 * SR), 0.001, curve=10)
    clap = stereo(reverb(clap_m, 0.5, 0.25) * 0.5, width=8)
    hat = svf(noise(0.05), 9000, q=0.7, mode="hp") * env(int(0.05 * SR), 0.0005, curve=14)

    def add(sig, at, gain=1.0, pan=0.0):
        i = int(at * SR)
        if i >= n:
            return
        if sig.ndim == 1:
            sig = stereo(sig, pan=pan)
        j = min(n, i + len(sig))
        mix[i:j] += sig[: j - i] * gain

    bars = int(seconds / (4 * beat_s)) + 1
    for b in range(bars):
        t0 = b * 4 * beat_s
        chord = root + prog[b % 4]
        # pad (always): detuned saws, low-passed
        pad_len = 4 * beat_s
        pad = sum(sweep_tone(midi_hz(chord + 24 + iv) * d, midi_hz(chord + 24 + iv) * d, pad_len, "saw") for iv in (0, 3, 7) for d in (0.997, 1.003))
        pad = svf(pad, 900 if b >= intro_bars else 500, q=0.7, mode="lp") * 0.05
        pad *= np.minimum(1, np.minimum(np.linspace(0, 8, len(pad)), np.linspace(8, 0, len(pad))))
        add(stereo(pad, width=12), t0)
        if b < intro_bars:
            continue
        for q in range(4):
            tb = t0 + q * beat_s
            if q in (0, 2) or (q == 3 and b % 2):
                add(k, tb, 0.9)
            if q in (1, 3):
                add(clap, tb, 0.55)
            for e in range(2 if b % 4 != 3 or q < 3 else 6):  # hat roll at end of every 4th bar
                step = beat_s / (2 if b % 4 != 3 or q < 3 else 6)
                add(hat, tb + e * step, 0.18, pan=0.3 if e % 2 else -0.3)
            # 808 bass on kicks
            if q in (0, 2):
                bl = beat_s * 1.6
                bass = sat(np.sin(2 * np.pi * np.cumsum(np.full(int(bl * SR), midi_hz(chord + 12))) / SR), 2.2) * env(int(bl * SR), 0.003, curve=2.5)
                add(bass * 0.35, tb)
    mix = fade(mix, 0.01, 1.5)
    return norm(mix, 0.8)


# ---------- self-check ----------
def selftest():
    for name, fn in SFX.items():
        x = fn()
        assert x.ndim == 2 and x.shape[1] == 2, name
        assert np.isfinite(x).all(), name
        assert 0 < np.max(np.abs(norm(x))) <= 0.9, name
        assert len(x) > SR * 0.01, name
    b = beat(120, 6)
    assert b.shape == (6 * SR, 2) and np.isfinite(b).all() and np.max(np.abs(b)) <= 0.81
    print("ok:", len(SFX), "sfx + beat")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["sfx", "beat", "test"])
    ap.add_argument("project", nargs="?")
    ap.add_argument("--bpm", type=float, default=120)
    ap.add_argument("--seconds", type=float, default=60)
    ap.add_argument("--key", default="A")
    ap.add_argument("--intro-bars", type=int, default=2)
    a = ap.parse_args()
    if a.cmd == "test":
        return selftest()
    if not a.project:
        sys.exit("project dir required")
    if a.cmd == "sfx":
        d = os.path.join(a.project, "public", "sfx")
        os.makedirs(d, exist_ok=True)
        for name, fn in SFX.items():
            write(os.path.join(d, f"{name}.wav"), fn())
            print("sfx/" + name + ".wav")
    else:
        d = os.path.join(a.project, "public", "music")
        os.makedirs(d, exist_ok=True)
        write(os.path.join(d, "beat.wav"), beat(a.bpm, a.seconds, a.key, a.intro_bars))
        print(f"music/beat.wav  {a.seconds}s @ {a.bpm} BPM")


if __name__ == "__main__":
    main()
