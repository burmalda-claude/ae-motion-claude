"""Use YOUR audio/video instead of TTS: song (lyric mode), podcast (clip mode), screen recording (tutorial), reaction.

  python transcribe.py <media> <project> [--lang ru] [--from 0] [--to 0] [--max-words 6] [--gap 0.35] [--model small]

1. Transcribes with faster-whisper (word timestamps) -> <project>/transcript.json  (full media, cached; read it to pick hooks/clips)
2. Cuts [--from, --to] seconds (0/0 = all), loudness-normalizes -> <project>/public/audio/master.wav
3. Splits words into lines (pause > --gap s, sentence end, or --max-words) -> <project>/src/timeline.json
   shot ids: line0, line1, ...  (same format as build.py, so <TimelineShots> plays it unchanged)

Needs: pip install faster-whisper librosa imageio-ffmpeg. Lyrics over loud music transcribe worse than speech —
check transcript.json and fix words by hand before rendering if needed.
"""
import argparse
import json
import os
import subprocess

import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def transcribe(media, cache, lang, model):
    if os.path.exists(cache):
        d = json.load(open(cache, encoding="utf-8"))
        if d.get("media") == os.path.abspath(media):
            return d["words"]
    import librosa
    from faster_whisper import WhisperModel

    audio, _ = librosa.load(media, sr=16000, mono=True)
    segs, info = WhisperModel(model, device="cpu", compute_type="int8").transcribe(audio, language=lang, word_timestamps=True, vad_filter=True)
    words = [{"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segs for w in s.words if w.word.strip()]
    json.dump({"media": os.path.abspath(media), "lang": info.language, "words": words}, open(cache, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    return words


def split_lines(words, gap, max_words):
    lines, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        end = nxt is None or nxt["start"] - w["end"] > gap or w["w"][-1:] in ".!?…" or len(cur) >= max_words
        if end:
            lines.append(cur)
            cur = []
    return lines


def build_timeline(lines, t0, t1, fps):
    shots, prev_end = [], 0
    for i, ln in enumerate(lines):
        start = int(round((ln[0]["start"] - t0) * fps))
        nxt = lines[i + 1][0]["start"] - t0 if i + 1 < len(lines) else t1 - t0
        end = int(round(nxt * fps))
        start = min(start, prev_end) if i else 0  # shots tile the timeline with no holes
        shots.append({"id": f"line{i}", "from": start, "dur": max(1, end - start), "lead": 0, "text": " ".join(w["w"] for w in ln),
                      "words": [{"w": w["w"], "f": int(round((w["start"] - t0) * fps)) - start, "fe": int(round((w["end"] - t0) * fps)) - start} for w in ln]})
        prev_end = end
    return {"fps": fps, "total": int(round((t1 - t0) * fps)), "shots": shots}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("media")
    ap.add_argument("project")
    ap.add_argument("--lang", default=None)
    ap.add_argument("--from", dest="t0", type=float, default=0.0)
    ap.add_argument("--to", dest="t1", type=float, default=0.0)
    ap.add_argument("--max-words", type=int, default=6)
    ap.add_argument("--gap", type=float, default=0.35)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--model", default="small")
    a = ap.parse_args()

    words = transcribe(a.media, os.path.join(a.project, "transcript.json"), a.lang, a.model)
    assert words, "no speech found"
    t1 = a.t1 or (words[-1]["end"] + 0.5)
    assert t1 > a.t0, "--to must be after --from"
    sel = [w for w in words if w["start"] >= a.t0 and w["end"] <= t1]
    assert sel, "no words in the selected range"

    out = os.path.join(a.project, "public", "audio", "master.wav")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    subprocess.run([FFMPEG, "-v", "error", "-y", "-ss", str(a.t0), "-to", str(t1), "-i", a.media, "-vn", "-af", "loudnorm=I=-14:TP=-1.0", "-ar", "44100", "-ac", "2", out], check=True)

    tl = build_timeline(split_lines(sel, a.gap, a.max_words), a.t0, t1, a.fps)
    assert all(s["dur"] > 0 for s in tl["shots"]) and tl["shots"][0]["from"] == 0
    os.makedirs(os.path.join(a.project, "src"), exist_ok=True)
    json.dump(tl, open(os.path.join(a.project, "src", "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(sel)} words, {len(tl['shots'])} lines, {tl['total']} frames -> src/timeline.json + public/audio/master.wav")


if __name__ == "__main__":
    main()
