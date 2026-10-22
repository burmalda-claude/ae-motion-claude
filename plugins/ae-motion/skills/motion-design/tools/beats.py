"""Beat analysis for beat-synced transitions (/transition beat, /transition random).

  python beats.py <audio> <project> [--fps 30]   -> <project>/src/beats.json

beats.json: {bpm, beats: [frame...], downbeats: [frame...], hits: [frame...], energy: [0..1 per beat]}
  beats      — every beat (librosa beat tracker on the percussive part)
  downbeats  — every 4th beat, phase chosen where the low end is strongest (bar starts: place big transitions here)
  hits       — strongest onsets (kicks/impacts): place glitch/phonk/flash transitions here
  energy     — normalized loudness per beat: feeds pickTransition({from, to}) (<0.33 low, <0.66 mid, else high)
Needs: pip install librosa numpy.
"""
import argparse
import json
import os

import librosa
import numpy as np


def analyze(path, fps):
    y, sr = librosa.load(path, sr=22050, mono=True)
    _, perc = librosa.effects.hpss(y)
    tempo, beat_fr = librosa.beat.beat_track(y=perc, sr=sr)
    bt = librosa.frames_to_time(beat_fr, sr=sr)
    assert len(bt) >= 4, "too few beats detected"
    # downbeat phase: the beat phase (0..3) with the most low-end energy
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=512))
    low = S[librosa.fft_frequencies(sr=sr, n_fft=2048) < 150].sum(0)
    low_at = low[np.clip(librosa.time_to_frames(bt, sr=sr, hop_length=512), 0, len(low) - 1)]
    phase = int(np.argmax([low_at[k::4].mean() for k in range(4)]))
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    peaks = librosa.util.peak_pick(onset, pre_max=8, post_max=8, pre_avg=20, post_avg=20, delta=onset.std(), wait=10)
    strong = peaks[onset[peaks] > np.percentile(onset[peaks], 75)] if len(peaks) else peaks
    rms = librosa.feature.rms(y=y, hop_length=512)[0]
    e = np.array([rms[max(0, a):max(a + 1, b)].mean() for a, b in zip(librosa.time_to_frames(bt, sr=sr, hop_length=512), librosa.time_to_frames(np.r_[bt[1:], bt[-1] + 0.5], sr=sr, hop_length=512))])
    e = (e - e.min()) / (np.ptp(e) + 1e-9)
    to_f = lambda ts: [int(round(t * fps)) for t in ts]
    return {
        "bpm": round(float(np.atleast_1d(tempo)[0]), 2),
        "beats": to_f(bt),
        "downbeats": to_f(bt[phase::4]),
        "hits": to_f(librosa.frames_to_time(strong, sr=sr)),
        "energy": [round(float(v), 3) for v in e],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("project")
    ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args()
    d = analyze(a.audio, a.fps)
    assert d["beats"] == sorted(d["beats"]) and set(d["downbeats"]) <= set(d["beats"]) and len(d["energy"]) == len(d["beats"])
    os.makedirs(os.path.join(a.project, "src"), exist_ok=True)
    json.dump(d, open(os.path.join(a.project, "src", "beats.json"), "w"), indent=0)
    print(f"bpm {d['bpm']}, {len(d['beats'])} beats, {len(d['downbeats'])} downbeats, {len(d['hits'])} hits -> src/beats.json")


if __name__ == "__main__":
    main()
