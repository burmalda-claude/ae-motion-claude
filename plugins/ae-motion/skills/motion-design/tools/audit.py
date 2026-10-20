"""SFX / mix audit (/sfx-audit).

  python audit.py <project>                 # checks public/audio/master.wav + stems (voice/sfx/music)
  python audit.py --file some_sfx.wav       # checks a single (e.g. AI-generated) sound

Checks:
  clipping      samples at |x| >= 0.999
  true peak     4x-oversampled peak (dBTP), must be <= -1.0
  loudness      integrated LUFS (ffmpeg ebur128) vs target (-14 social / -23 TV)
  phase         L/R correlation per 100 ms window; < 0 means out-of-phase content that collapses in mono
  dc offset     |mean| > 0.01
  masking       SFX within 6 dB of the voice in 1–4 kHz while speaking (hides words)
  beat clash    SFX transients that land 1–3 frames off a music onset (flams) instead of on it or in a gap
  robotic       for single sounds: very high spectral peakiness + low spectral flux variance (metallic/vocoder AI artifacts)
Exit code 1 if any check FAILs.
"""
import argparse
import os
import re
import subprocess
import sys

import numpy as np
from scipy import signal

SR = 44100


def load(path):
    import librosa

    y, _ = librosa.load(path, sr=SR, mono=False)
    return y.T if y.ndim == 2 else np.stack([y, y], axis=1)


def lufs(path):
    import imageio_ffmpeg

    r = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-nostats", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    return float(m[-1]) if m else None


def true_peak_db(x):
    up = signal.resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.abs(up).max() + 1e-12)


def phase_issues(x):
    w = int(0.1 * SR)
    bad = 0
    tot = 0
    for s in range(0, len(x) - w, w):
        l, r = x[s : s + w, 0], x[s : s + w, 1]
        if np.sqrt(np.mean(l ** 2)) < 1e-3:
            continue
        tot += 1
        c = np.corrcoef(l, r)[0, 1]
        bad += c < 0
    return bad, tot


def band_env(x, lo, hi, hop=1024):
    b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], "band")
    y = signal.lfilter(b, a, x.mean(axis=1))
    n = len(y) // hop
    return np.sqrt((y[: n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12)


def onsets(x, fps=30):
    import librosa

    y = x.mean(axis=1).astype(np.float32)
    env = librosa.onset.onset_strength(y=y, sr=SR)
    # only sharp transients: swells (whoosh/riser attacks) are intentionally early and must not count as flams
    o = librosa.onset.onset_detect(onset_envelope=env, sr=SR, units="time", delta=0.3)  # env is normalized to 0..1 by librosa
    return o * fps


def robotic(x):
    import librosa

    m = x.mean(axis=1).astype(np.float32)
    S = np.abs(librosa.stft(m, n_fft=2048))
    e = S.sum(axis=0)
    S = S[:, e > e.max() * 0.05]  # ignore silence / tails
    if S.shape[1] < 3:
        return 0.0, 1.0
    peak = float((S.max(axis=0) / (S.mean(axis=0) + 1e-9)).mean())
    Sn = S / (S.sum(axis=0, keepdims=True) + 1e-9)
    fv = float(np.std(np.abs(np.diff(Sn, axis=1)).sum(axis=0)))
    return peak, fv


def report(rows):
    bad = False
    for name, status, msg in rows:
        bad |= status == "FAIL"
        print(f"  [{status:4s}] {name:12s} {msg}")
    return bad


def audit_file(path, target=None, single=True):
    x = load(path)
    rows = []
    clip = int((np.abs(x) >= 0.999).sum())
    rows.append(("clipping", "FAIL" if clip > 10 else "ok", f"{clip} samples at full scale"))
    tp = true_peak_db(x)
    rows.append(("true peak", "FAIL" if tp > -1.0 else "ok", f"{tp:.2f} dBTP (max -1.0)"))
    dc = float(np.abs(x.mean(axis=0)).max())
    rows.append(("dc offset", "WARN" if dc > 0.01 else "ok", f"{dc:.4f}"))
    b, t = phase_issues(x)
    rows.append(("phase", "WARN" if t and b / t > 0.1 else "ok", f"{b}/{t} windows with negative L/R correlation"))
    if target is not None:
        L = lufs(path)
        rows.append(("loudness", "WARN" if L is None or abs(L - target) > 1.5 else "ok", f"{L} LUFS (target {target})"))
    if not single:  # mixes contain tonal music: the AI-artifact heuristic only makes sense for single sounds
        return rows
    pk, fv = robotic(x)
    rows.append(("robotic", "WARN" if pk > 60 and fv < 0.05 else "ok", f"peakiness {pk:.1f}, flux var {fv:.3f} (metallic if >60 and <0.05)"))
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project", nargs="?")
    ap.add_argument("--file")
    ap.add_argument("--lufs", type=float, default=-14)
    a = ap.parse_args()
    if a.file:
        print(a.file)
        sys.exit(1 if report(audit_file(a.file)) else 0)
    au = os.path.join(a.project, "public", "audio")
    master = os.path.join(au, "master.wav")
    print(master)
    rows = audit_file(master, a.lufs, single=False)
    st = {k: os.path.join(au, "stems", f"{k}.wav") for k in ("voice", "sfx", "music")}
    if all(os.path.exists(p) for p in st.values()):
        v, s, m = (load(st[k]) for k in ("voice", "sfx", "music"))
        n = min(len(v), len(s), len(m))
        if np.abs(v).max() > 1e-3:  # no voice stem content -> nothing to mask
            ve, se = band_env(v[:n], 1000, 4000), band_env(s[:n], 1000, 4000)
            speaking = ve > ve.max() * 0.1
            masked = speaking & (20 * np.log10(se / ve) > -6)
            pct = 100 * masked.sum() / max(1, speaking.sum())
            rows.append(("masking", "FAIL" if pct > 10 else "WARN" if pct > 3 else "ok", f"SFX within 6 dB of the voice in {pct:.1f}% of speech (1–4 kHz)"))
        else:
            rows.append(("masking", "ok", "no voice in the mix"))
        if np.abs(m).max() > 1e-3 and np.abs(s).max() > 1e-3:
            so, mo = onsets(s[:n]), onsets(m[:n])
            flams = [f for f in so if len(mo) and 1 <= np.min(np.abs(mo - f)) <= 3]
            pct = 100 * len(flams) / max(1, len(so))
            rows.append(("beat clash", "WARN" if pct > 25 else "ok", f"{len(flams)}/{len(so)} SFX hits land 1–3 frames off a music onset (flam) — move onto the beat or into a gap"))
    sys.exit(1 if report(rows) else 0)


if __name__ == "__main__":
    main()
