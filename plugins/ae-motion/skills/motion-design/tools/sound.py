"""Sound engine: DSP helpers, synthesized SFX, arranged music, voice processing, mix/master.

Everything is synthesized with numpy/scipy — no samples, no licenses.
Used by build.py. Self-check: `python sound.py test`. Preview all SFX: `python sound.py sfx <dir>`.
"""
import os
import sys
import wave

import numpy as np
from scipy import signal

SR = 44100
_rng = np.random.default_rng(11)


# ---------------------------------------------------------------- DSP helpers
def T(sec):
    return np.arange(int(sec * SR)) / SR


def noise(sec, rng=_rng):
    return rng.uniform(-1, 1, int(sec * SR))


def butter(x, f, kind="low", order=2):
    f = np.clip(np.asarray(f, float), 20, SR / 2 - 100)
    b, a = signal.butter(order, f / (SR / 2), btype=kind)
    return signal.lfilter(b, a, x, axis=0)


def bandpass(x, lo, hi, order=2):
    b, a = signal.butter(order, [max(20, lo) / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], btype="band")
    return signal.lfilter(b, a, x, axis=0)


def sweep_filter(x, f0, f1, kind="band", q=1.2, chunk=256):
    """Time-varying filter (exponential cutoff sweep) processed in chunks with state carry-over."""
    n = len(x)
    out = np.zeros_like(x)
    zi = None
    for s in range(0, n, chunk):
        t = s / max(1, n - 1)
        fc = f0 * (f1 / f0) ** t
        if kind == "band":
            bw = fc / q
            lo, hi = max(30, fc - bw / 2), min(SR / 2 - 200, fc + bw / 2)
            b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
        else:
            b, a = signal.butter(2, min(fc, SR / 2 - 200) / (SR / 2), btype=kind)
        if zi is None or len(zi) != max(len(a), len(b)) - 1:
            zi = signal.lfilter_zi(b, a) * 0
        out[s : s + chunk], zi = signal.lfilter(b, a, x[s : s + chunk], zi=zi)
    return out


def peaking(x, f, gain_db, q=1.0):
    A = 10 ** (gain_db / 40)
    w = 2 * np.pi * f / SR
    al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]
    a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return signal.lfilter(b, a, x, axis=0)


def shelf(x, f, gain_db, high=True):
    A = 10 ** (gain_db / 40)
    w = 2 * np.pi * f / SR
    al = np.sin(w) / 2 * np.sqrt(2)
    c = np.cos(w)
    s = 1 if high else -1
    b0 = A * ((A + 1) + s * (A - 1) * c + 2 * np.sqrt(A) * al)
    b1 = -2 * s * A * ((A - 1) + s * (A + 1) * c)
    b2 = A * ((A + 1) + s * (A - 1) * c - 2 * np.sqrt(A) * al)
    a0 = (A + 1) - s * (A - 1) * c + 2 * np.sqrt(A) * al
    a1 = 2 * s * ((A - 1) - s * (A + 1) * c)
    a2 = (A + 1) - s * (A - 1) * c - 2 * np.sqrt(A) * al
    return signal.lfilter([b0, b1, b2], [a0, a1, a2], x, axis=0)


def env_ar(n, attack=0.003, decay=0.3, curve=1.0):
    """Attack then exponential decay with time constant `decay` seconds."""
    t = np.arange(n) / SR
    e = np.exp(-t / max(decay, 1e-4)) ** curve
    a = int(attack * SR)
    if a > 0:
        e[:a] *= np.linspace(0, 1, a)
    return e


def fades(x, fin=0.002, fout=0.01):
    x = x.copy()
    i, o = int(fin * SR), int(fout * SR)
    sh = (-1, 1) if x.ndim == 2 else (-1,)
    if i:
        x[:i] *= np.linspace(0, 1, i).reshape(sh)
    if o:
        x[-o:] *= np.linspace(1, 0, o).reshape(sh)
    return x


def tone(f0, f1, sec, kind="sine", phase=0.0):
    t = T(sec)
    f = f0 * (f1 / f0) ** (t / max(sec, 1e-6)) if f0 != f1 else np.full(len(t), float(f0))
    ph = phase + 2 * np.pi * np.cumsum(f) / SR
    if kind == "saw":
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if kind == "square":
        return np.sign(np.sin(ph))
    if kind == "tri":
        return 2 * np.abs(2 * ((ph / (2 * np.pi)) % 1) - 1) - 1
    return np.sin(ph)


def sat(x, drive=2.0):
    return np.tanh(x * drive) / np.tanh(drive)


def to_stereo(x, pan=0.0, width_ms=0.0):
    if x.ndim == 2:
        return x
    pan = np.broadcast_to(np.asarray(pan, float), x.shape)
    l = x * np.cos((pan + 1) * np.pi / 4)
    r = x * np.sin((pan + 1) * np.pi / 4)
    if width_ms:
        d = int(width_ms / 1000 * SR)
        r = np.concatenate([np.zeros(d), r])[: len(r)]
    return np.stack([l, r], axis=1) * np.sqrt(2)


def reverb(x, sec=1.4, mix=0.25, pre_ms=12, seed=3):
    """Stereo convolution reverb with decorrelated noise IR."""
    st = to_stereo(x)
    n = int(sec * SR)
    rng = np.random.default_rng(seed)
    pre = int(pre_ms / 1000 * SR)
    L = len(st) + n + pre
    out = np.zeros((L, 2))
    for ch in range(2):
        ir = rng.uniform(-1, 1, n) * np.exp(-6.5 * np.linspace(0, 1, n))
        ir = butter(ir, 7000, "low")
        ir = np.concatenate([np.zeros(pre), ir])
        wet = signal.fftconvolve(st[:, ch], ir)[:L]
        out[: len(wet), ch] = wet
    wet_peak = np.abs(out).max() + 1e-9
    out *= (np.abs(st).max() / wet_peak) * mix
    out[: len(st)] += st * (1 - mix * 0.5)
    return out


def norm(x, peak=0.9):
    m = np.abs(x).max()
    return x * (peak / m) if m > 0 else x


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(np.square(x))) + 1e-12)


def compressor(x, thresh_db=-18, ratio=4.0, attack=0.004, release=0.08, makeup_db=0.0, key=None):
    """Feed-forward RMS compressor (stereo-linked). `key` = optional sidechain signal."""
    st = x if x.ndim == 2 else x[:, None]
    k = (key if key is not None else st)
    k = k if k.ndim == 1 else np.max(np.abs(k), axis=1)
    k = np.abs(k)
    # envelope follower
    a_att = np.exp(-1 / (attack * SR))
    a_rel = np.exp(-1 / (release * SR))
    env = signal.lfilter([1 - a_rel], [1, -a_rel], k)  # smooth; asymmetric approx below
    env = np.maximum(env, signal.lfilter([1 - a_att], [1, -a_att], k) * 0.9)
    lvl = 20 * np.log10(env + 1e-9)
    over = np.maximum(0, lvl - thresh_db)
    gr = -over * (1 - 1 / ratio)
    g = 10 ** ((gr + makeup_db) / 20)
    y = st * g[:, None]
    return y if x.ndim == 2 else y[:, 0]


def limiter(x, ceiling_db=-1.0, lookahead_ms=3, release=0.06):
    """Brickwall-ish lookahead peak limiter."""
    c = 10 ** (ceiling_db / 20)
    peak = np.max(np.abs(x), axis=1) if x.ndim == 2 else np.abs(x)
    la = int(lookahead_ms / 1000 * SR)
    # gain needed per sample, then min over lookahead window, then smooth release
    need = np.minimum(1, c / (peak + 1e-12))
    need = np.concatenate([need[la:], np.ones(la)])
    need = signal.lfilter([1], [1], need)
    win = np.lib.stride_tricks.sliding_window_view(np.concatenate([need, np.ones(la)]), la + 1).min(axis=1)[: len(need)]
    a = np.exp(-1 / (release * SR))
    g = np.empty_like(win)
    cur = 1.0
    for i in range(len(win)):  # fast enough: one pass, scalar math
        w = win[i]
        cur = w if w < cur else a * cur + (1 - a) * w
        g[i] = cur
    y = (x * g[:, None]) if x.ndim == 2 else x * g
    return np.clip(y, -c, c)


def place(buf, sig, at_s, gain=1.0):
    """Add `sig` (mono or stereo) into stereo `buf` at time `at_s` seconds."""
    sig = to_stereo(sig)
    i = int(round(at_s * SR))
    if i >= len(buf) or i + len(sig) <= 0:
        return
    s0 = max(0, -i)
    j = min(len(buf), i + len(sig))
    buf[max(0, i) : j] += sig[s0 : s0 + j - max(0, i)] * gain


def write_wav(path, x):
    x = to_stereo(x)
    d = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(d.tobytes())


# ---------------------------------------------------------------- SFX (stereo out)
def kick(sec=0.45, f0=150, f1=45, click=0.6, drive=2.2):
    n = int(sec * SR)
    body = tone(f0, f1, sec) * env_ar(n, 0.001, sec * 0.35)
    c = butter(noise(0.01), 2500, "high") * env_ar(int(0.01 * SR), 0.0002, 0.003)
    body[: len(c)] += c * click
    return sat(body, drive)


def sub_boom(sec=2.2, f0=62, f1=36):
    n = int(sec * SR)
    x = tone(f0, f1, sec) * env_ar(n, 0.002, sec * 0.38)
    return sat(x, 1.6)


def sfx_whoosh(sec=0.5, lo=250, hi=5000, pan=(-0.8, 0.8)):
    n = int(sec * SR)
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    up = sweep_filter(noise(sec), lo, hi, "band", q=1.4)
    x = norm(up * shape)
    return fades(to_stereo(x, np.linspace(*pan, n), 7))


def sfx_swish_in(sec=0.6):
    """Reverse whoosh that peaks at the end — place it so it ENDS on the cut."""
    n = int(sec * SR)
    shape = np.linspace(0, 1, n) ** 3
    x = sweep_filter(noise(sec), 300, 8000, "band", q=1.6) * shape
    return fades(to_stereo(norm(x), np.linspace(0.6, -0.3, n), 6), fout=0.002)


def sfx_impact():
    """Layered trailer impact: punchy kick + sub boom tail + noise crack + reverb."""
    k = kick(0.6, 170, 42, 0.8, 2.6)
    b = sub_boom(2.4, 58, 34) * 0.9
    crack = bandpass(noise(0.5), 900, 6000) * env_ar(int(0.5 * SR), 0.0005, 0.06)
    x = b.copy()
    x[: len(k)] += k
    x[: len(crack)] += crack * 0.7
    return reverb(norm(x, 0.95), 1.6, 0.18)


def sfx_hit():
    k = kick(0.5, 190, 48, 0.9, 2.4)
    crack = bandpass(noise(0.25), 1200, 7000) * env_ar(int(0.25 * SR), 0.0005, 0.035)
    k[: len(crack)] += crack * 0.6
    return reverb(norm(k, 0.95), 0.8, 0.14)


def sfx_thump():
    """Short sub punch for every cut (felt more than heard)."""
    return to_stereo(kick(0.35, 120, 40, 0.15, 1.8) * 0.9)


def sfx_riser(sec=2.4):
    n = int(sec * SR)
    shape = np.linspace(0, 1, n) ** 2.2
    nz = sweep_filter(noise(sec), 300, 9000, "band", q=2.2) * shape
    tn = (tone(110, 880, sec, "saw") + tone(111, 885, sec, "saw")) * 0.5
    tn = sweep_filter(tn, 300, 6000, "low") * shape * 0.35
    trem = 1 + 0.25 * np.sin(2 * np.pi * np.cumsum(np.linspace(4, 16, n)) / SR)
    x = (nz + tn) * trem
    return fades(to_stereo(norm(x), 0.35 * np.sin(np.linspace(0, 5 * np.pi, n)), 11), fout=0.003)


def sfx_reverse_swell(sec=1.2):
    """Reversed reverb tail of a crash — classic 'suck-in' before a reveal."""
    crash = bandpass(noise(0.05), 3000, 12000) * env_ar(int(0.05 * SR), 0.0005, 0.02)
    tail = reverb(crash, sec, 0.95, seed=8)
    x = tail[::-1][-int(sec * SR) :]
    x = x * np.linspace(0.2, 1, len(x))[:, None] ** 2
    return fades(norm(x), 0.01, 0.002)


def sfx_slash():
    sec = 0.42
    n = int(sec * SR)
    e = env_ar(n, 0.002, 0.11)
    hiss = sweep_filter(noise(sec), 7000, 1600, "band", q=3.0) * e
    hum = (tone(520, 140, sec, "saw") * 0.4 + tone(260, 70, sec, "square") * 0.15) * e
    zap = tone(2400, 300, 0.08) * env_ar(int(0.08 * SR), 0.0005, 0.02)
    x = hiss + hum
    x[: len(zap)] += zap * 0.5
    return reverb(fades(to_stereo(norm(x), np.linspace(-0.9, 0.9, n), 4)), 0.7, 0.2)


def sfx_glitch(sec=0.3, seed=0):
    rng = np.random.default_rng(seed + 5)
    n = int(sec * SR)
    x = np.zeros(n)
    p = 0
    while p < n:
        seg = int(rng.uniform(0.006, 0.035) * SR)
        f = rng.choice([110, 220, 440, 880, 1760, 3520])
        s = np.sign(np.sin(2 * np.pi * f * np.arange(seg) / SR)) * (rng.random() > 0.3)
        s = np.round(s * 3) / 3
        x[p : p + seg] = s[: n - p] * rng.uniform(0.3, 1)
        p += seg
    return fades(to_stereo(x * 0.55, rng.uniform(-0.6, 0.6)))


def sfx_typeon(chars=8, every=0.035, seed=1):
    """Glitchy type-on ticks for text that 'types' itself."""
    rng = np.random.default_rng(seed)
    out = np.zeros(int((chars * every + 0.1) * SR))
    for i in range(chars):
        f = rng.uniform(1800, 4200)
        b = tone(f, f * 0.6, 0.025, "square") * env_ar(int(0.025 * SR), 0.0003, 0.006) * 0.35
        place_m = int(i * every * SR)
        out[place_m : place_m + len(b)] += b
    return to_stereo(out)


def sfx_click():
    x = bandpass(noise(0.03), 2500, 7000) * env_ar(int(0.03 * SR), 0.0003, 0.005)
    x[: int(0.004 * SR)] += tone(1400, 900, 0.004) * 0.5
    return to_stereo(norm(x, 0.7))


def sfx_key(seed=0):
    rng = np.random.default_rng(seed)
    sec = 0.05
    x = bandpass(noise(sec, rng), rng.uniform(1800, 3200), 8000) * env_ar(int(sec * SR), 0.0003, 0.008)
    x += tone(380, 180, sec) * env_ar(int(sec * SR), 0.0003, 0.01) * 0.25
    return to_stereo(norm(x, 0.5), rng.uniform(-0.25, 0.25))


def sfx_pop():
    sec = 0.16
    x = tone(260, 1100, sec) * env_ar(int(sec * SR), 0.001, 0.04)
    return reverb(norm(x, 0.7), 0.4, 0.15)


def sfx_shimmer():
    sec = 1.6
    x = np.zeros(int(sec * SR))
    for i, f in enumerate([1568, 2093, 2637, 3136, 4186, 5274]):
        s = int(i * 0.04 * SR)
        n = len(x) - s
        x[s:] += np.sin(2 * np.pi * f * np.arange(n) / SR) * env_ar(n, 0.002, 0.35) * 0.25
    return reverb(x, 1.8, 0.4)


def sfx_ding():
    sec = 1.4
    t = T(sec)
    x = sum(a * np.sin(2 * np.pi * 1318.5 * m * t) for m, a in [(1, 1), (2.76, 0.4), (5.4, 0.15)]) * env_ar(len(t), 0.001, 0.4)
    return reverb(norm(x, 0.6), 1.0, 0.22)


def sfx_tick():
    x = tone(2600, 2000, 0.018) * env_ar(int(0.018 * SR), 0.0003, 0.004)
    return to_stereo(norm(x, 0.5))


def sfx_shutter():
    a = bandpass(noise(0.045), 1500, 7000) * env_ar(int(0.045 * SR), 0.0005, 0.01)
    b = bandpass(noise(0.06), 1200, 6000) * env_ar(int(0.06 * SR), 0.0005, 0.012)
    return to_stereo(norm(np.concatenate([a, np.zeros(int(0.05 * SR)), b]), 0.7))


def sfx_stutter():
    seg = sfx_whoosh(0.07, 900, 6000)
    return np.concatenate([seg * (1 - i * 0.13) for i in range(6)])


def sfx_tape_stop(sec=0.6):
    """Synth 'power-down' (pitch dive)."""
    x = (tone(220, 25, sec, "saw") + tone(110, 12, sec, "square") * 0.4) * np.linspace(1, 0, int(sec * SR)) ** 0.5
    return to_stereo(norm(butter(x, 2500, "low"), 0.7))


def sfx_zoom():
    """Fast rising whoosh for zoom-through transitions."""
    return sfx_whoosh(0.35, 400, 9000, (-0.2, 0.2))


SFX = {
    "impact": sfx_impact,
    "hit": sfx_hit,
    "thump": sfx_thump,
    "boom": lambda: reverb(to_stereo(sub_boom(3.0)), 2.0, 0.2),
    "whoosh": sfx_whoosh,
    "whoosh_fast": lambda: sfx_whoosh(0.24, 600, 7000),
    "swish_in": sfx_swish_in,
    "zoom": sfx_zoom,
    "riser": sfx_riser,
    "riser_short": lambda: sfx_riser(1.0),
    "reverse_swell": sfx_reverse_swell,
    "slash": sfx_slash,
    "glitch": sfx_glitch,
    "typeon": sfx_typeon,
    "click": sfx_click,
    "key": sfx_key,
    "pop": sfx_pop,
    "shimmer": sfx_shimmer,
    "ding": sfx_ding,
    "tick": sfx_tick,
    "shutter": sfx_shutter,
    "stutter": sfx_stutter,
    "tape_stop": sfx_tape_stop,
    "vine_boom": lambda: reverb(to_stereo(sat(tone(90, 45, 1.2) * env_ar(int(1.2 * SR), 0.001, 0.35), 3.0)), 0.9, 0.35),
    "screech": lambda: fades(to_stereo(norm(sweep_filter(noise(0.9), 1500, 6000, "band", q=6) + tone(1900, 2300, 0.9, "saw") * 0.3) * env_ar(int(0.9 * SR), 0.002, 0.5), 0, 4), 0.001, 0.1),
    "cash": lambda: reverb(to_stereo(norm(sum(np.sin(2 * np.pi * f * T(0.5)) * env_ar(int(0.5 * SR), 0.001, 0.12) for f in (2093, 2637, 3136)), 0.7)), 0.6, 0.2),
}
# sfx whose loudest moment is at the END (place so they end on the cue)
ENDS_ON_CUE = {"swish_in", "riser", "riser_short", "reverse_swell"}


# ---------------------------------------------------------------- music
NOTE = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# per-style stem gains + flags. One synth engine; genres are approximated by groove, gains and timbre.
STYLES = {
    "edm":       dict(kick=1.0, clap=1.0, hat=1.0, bass=1.0, pad=1.0, arp=1.0, pump=0.6),
    "phonk":     dict(kick=1.1, clap=0.9, hat=1.2, bass=1.4, pad=0.4, arp=0.0, pump=0.4, cowbell=1.0),
    "lofi":      dict(kick=0.6, clap=0.4, hat=0.7, bass=0.6, pad=1.2, arp=0.0, pump=0.2, swing=0.6, crackle=1.0, padcut=0.6),
    "ambient":   dict(kick=0.0, clap=0.0, hat=0.0, bass=0.3, pad=1.6, arp=0.0, pump=0.0, padcut=0.8),
    "cinematic": dict(kick=0.0, clap=0.0, hat=0.0, bass=0.8, pad=1.4, arp=0.0, pump=0.0, taiko=1.0, padcut=0.7),
    "corporate": dict(kick=0.7, clap=0.6, hat=0.8, bass=0.7, pad=1.0, arp=1.3, pump=0.35, padcut=1.4),
    "jcore":     dict(kick=1.0, clap=1.0, hat=1.6, bass=1.0, pad=0.8, arp=1.6, pump=0.5, hat16=1.0),
}


def music(sections, total_s, bpm=123, key="A", style="edm"):
    """Arranged bed with stems and sidechain pumping. style: one of STYLES.

    sections: list of (start_s, mode) with mode in
      'intro' (pad + filtered bass), 'drop' (everything), 'break' (pad only, bright),
      'build' (drums + 16th snare roll + filter rise), 'stop' (silence), 'ui' (soft drums + arp, darker).
    Returns stereo array of length total_s.
    """
    n = int(total_s * SR)
    beat = 60 / bpm
    root = 33 + NOTE[key]  # A1
    prog = [0, 0, 8, 7, 0, 0, 5, 7]  # i i VI v i i iv v
    st = STYLES[style]
    stems = {k: np.zeros((n, 2)) for k in ["kick", "clap", "hat", "bass", "pad", "arp", "roll", "extra"]}
    swing = st.get("swing", 0.5)  # 0.5 = straight 8ths
    cowbell = butter(tone(800, 800, 0.18, "square") + tone(540, 540, 0.18, "square"), 2500, "low") * env_ar(int(0.18 * SR), 0.001, 0.06)
    taiko = sat(tone(120, 60, 0.9) * env_ar(int(0.9 * SR), 0.002, 0.25), 2.0)

    def mode_at(t):
        m = sections[0][1]
        for s, md in sections:
            if t >= s:
                m = md
        return m

    kick_s = to_stereo(kick(0.45, 150, 44, 0.5, 2.2))
    clap = bandpass(noise(0.22), 900, 5000) * env_ar(int(0.22 * SR), 0.001, 0.05)
    clap = reverb(clap, 0.6, 0.25)
    hat = butter(noise(0.05), 8000, "high") * env_ar(int(0.05 * SR), 0.0005, 0.012)
    snare_roll = bandpass(noise(0.08), 1500, 8000) * env_ar(int(0.08 * SR), 0.0005, 0.02)

    bars = int(total_s / (4 * beat)) + 2
    for b in range(bars):
        t0 = b * 4 * beat
        if t0 >= total_s:
            break
        chord = root + prog[b % len(prog)]
        md = mode_at(t0)
        # PAD: detuned saw chord, one per bar, filtered by mode
        bar_len = 4 * beat
        if md != "stop":
            pad = sum(tone(hz(chord + 24 + iv) * d, hz(chord + 24 + iv) * d, bar_len + 0.3, "saw") for iv in (0, 3, 7, 10) for d in (0.996, 1.004))
            cut = {"intro": 700, "drop": 1800, "break": 2600, "build": 1200, "ui": 900}.get(md, 1200)
            pad = butter(pad, cut * 1.3 * st.get("padcut", 1.0), "low") * 0.1
            pad *= np.minimum(1, np.minimum(np.linspace(0, 6, len(pad)), np.linspace(6, 0, len(pad))))
            place(stems["pad"], to_stereo(pad, 0, 14), t0)
        for q in range(4):
            tb = t0 + q * beat
            if tb >= total_s:
                break
            mq = mode_at(tb)
            if mq == "stop":
                continue
            if mq in ("drop", "build", "ui"):
                if q in (0, 2) or mq == "drop" or mq == "build":
                    place(stems["kick"], kick_s, tb, 0.9 if mq != "ui" else 0.55)
            if mq in ("drop", "build") and q in (1, 3):
                place(stems["clap"], clap, tb, 0.5)
            if mq in ("drop", "ui", "build"):
                for e in range(4 if st.get("hat16") else 2):
                    off = (e * beat / 4) if st.get("hat16") else (beat * swing if e else 0)
                    place(stems["hat"], to_stereo(hat, 0.35 if e % 2 else -0.35), tb + off, 0.08 if e % 2 else 0.04)
            if st.get("cowbell") and mq == "drop":
                for s16 in (0, 3, 6) if q % 2 == 0 else (2, 4):
                    place(stems["extra"], to_stereo(cowbell, 0.2), tb + s16 * beat / 4, 0.09)
            if st.get("taiko") and mq in ("drop", "build") and (q == 0 or (q == 3 and b % 2)):
                place(stems["extra"], reverb(taiko, 1.2, 0.3), tb, 0.5)
            if mq == "build":
                steps = 4 if b % 2 == 0 else 8
                for s in range(steps):
                    place(stems["roll"], to_stereo(snare_roll), tb + s * beat / steps, 0.12 + 0.25 * (q / 4))
            # BASS: 808-ish on 1 and the "and" of 2
            if mq in ("drop", "build", "intro", "ui"):
                for off, ln in ((0, 1.4), (1.5, 0.45)) if q in (0, 2) else ():
                    L = beat * ln
                    f = hz(chord if chord - root < 5 else chord - 12)  # keep bass in 40–60 Hz: real sub weight, harmonics give it presence on phones
                    bs = sat(tone(f, f, L) + 0.25 * tone(2 * f, 2 * f, L), 1.6) * env_ar(int(L * SR), 0.004, L * 0.7)
                    if mq == "intro":
                        bs = butter(bs, 300, "low")
                    place(stems["bass"], to_stereo(bs), tb + off * beat, 0.34)
            # ARP: 16th plucks in drop/ui
            if mq in ("drop", "ui"):
                notes = [0, 7, 12, 15, 12, 7, 3, 7]
                for s in range(4):
                    nn = chord + 48 + notes[(q * 4 + s) % len(notes)]
                    L = beat / 4
                    pl = tone(hz(nn), hz(nn), L, "saw") * env_ar(int(L * SR), 0.001, 0.05)
                    pl = butter(pl, 3500 if mq == "drop" else 1800, "low")
                    place(stems["arp"], to_stereo(pl, 0.4 * np.sin(b + s)), tb + s * L, 0.07)

    # sidechain: pump pad/bass/arp from kick envelope
    kenv = np.abs(stems["kick"][:, 0])
    kenv = signal.lfilter([1 - np.exp(-1 / (0.09 * SR))], [1, -np.exp(-1 / (0.09 * SR))], kenv)
    kenv /= kenv.max() + 1e-9
    pump = 1 - 0.6 * np.clip(kenv * 1.6, 0, 1)
    pump = 1 - (1 - pump) * (st["pump"] / 0.6)
    for k in ("pad", "bass", "arp"):
        stems[k] *= pump[:, None]
    for k in ("kick", "clap", "hat", "bass", "pad", "arp"):
        stems[k] *= st[k]
    if st.get("crackle"):
        cr = (_rng.random(n) > 0.9995) * _rng.uniform(-0.3, 0.3, n) + butter(noise(n / SR), 1200, "low") * 0.01
        stems["extra"] += to_stereo(cr) * 0.5
    mix = sum(stems.values())
    # fade out at the end
    f = int(1.5 * SR)
    mix[-f:] *= np.linspace(1, 0, f)[:, None]
    return mix


# ---------------------------------------------------------------- voice
def process_voice(y):
    """Broadcast-style voice chain: HPF, de-mud, presence, air, compression, saturation."""
    y = butter(y, 85, "high", 2)
    y = shelf(y, 200, -6.0, high=False)  # TTS voices are boomy at 100-250 Hz
    y = peaking(y, 900, 2.5, 0.8)  # body/warmth
    y = peaking(y, 3000, 2.0, 1.0)  # intelligibility
    y = peaking(y, 7200, -5.0, 1.4)  # tame synthetic sibilance
    y = butter(y, 11500, "low", 2)
    y = compressor(y, thresh_db=-22, ratio=3.5, attack=0.003, release=0.09, makeup_db=6)
    y = compressor(y, thresh_db=-10, ratio=8, attack=0.001, release=0.05)
    y = sat(y * 1.1, 1.3) / 1.1
    return y


# ---------------------------------------------------------------- self-check
def selftest():
    for k, fn in SFX.items():
        x = to_stereo(fn())
        assert x.ndim == 2 and x.shape[1] == 2 and len(x) > 100, k
        assert np.isfinite(x).all(), k
        assert np.abs(x).max() > 0.05, k
    m = music([(0, "intro"), (4, "drop"), (8, "stop"), (9, "build"), (11, "ui")], 13, 123)
    assert m.shape == (13 * SR, 2) and np.isfinite(m).all()
    for stl in STYLES:
        x = music([(0, "drop")], 3, 120, "A", stl)
        assert x.shape == (3 * SR, 2) and np.isfinite(x).all() and np.abs(x).max() > 0.01, stl
    stop = m[int(8.3 * SR) : int(8.8 * SR)]
    assert np.abs(stop).max() < np.abs(m).max() * 0.6, "stop section should be quieter"
    v = process_voice(np.sin(2 * np.pi * 200 * T(1.0)) * 0.3)
    assert np.isfinite(v).all()
    L = limiter(np.random.default_rng(0).uniform(-2, 2, (SR, 2)), -1.0)
    assert np.abs(L).max() <= 10 ** (-1 / 20) + 1e-6
    print("ok:", len(SFX), "sfx, music, voice chain, limiter")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        selftest()
    elif len(sys.argv) > 2 and sys.argv[1] == "sfx":
        for k, fn in SFX.items():
            write_wav(os.path.join(sys.argv[2], f"{k}.wav"), norm(to_stereo(fn()), 0.89))
            print(k)
    else:
        print(__doc__)
