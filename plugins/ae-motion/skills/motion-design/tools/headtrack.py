"""Head tracking (/head-lock): per-frame head centre of a video, for <HeadLock> (kit/headlock.tsx) to keep the head in the centre.

  python headtrack.py video.mp4 --sheet head_sheet.jpg            # 1) first frame of every shot with a 0..1 grid -> read the head box
  python headtrack.py video.mp4 --box 0:0.42,0.18,0.16,0.28 --box 140:0.50,0.20,0.15,0.26 --out src/head.json
                                                                  # 2) track from those boxes (frame:x,y,w,h, all 0..1 of the frame)
  python headtrack.py --selftest

Works on live action, cartoons and anime alike: nothing is detected automatically, Claude looks at the sheet and gives one box per
shot; OpenCV's TrackerMIL follows it frame to frame. Cuts are found by colour histogram; tracking never crosses a cut, a shot
without a box holds the frame centre and is listed in "missing". The path is smoothed per shot (--smooth seconds).
Output: {"fps", "width", "height", "frames", "center": [[x, y], ...] 0..1, "size": [h, ...] 0..1, "cuts", "missing"}.
"""
import argparse, json, sys
import cv2
import numpy as np


def read(path, max_side=640):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        s = max_side / max(f.shape[:2])
        frames.append(cv2.resize(f, None, fx=s, fy=s, interpolation=cv2.INTER_AREA) if s < 1 else f)
    if not frames:
        sys.exit(f"cannot read {path}")
    return frames, fps


def find_cuts(frames):
    """Colour jump OR picture jump (two shots with the same palette still differ pixel-wise), as a local peak."""
    hd, pd, prev = [0.0], [0.0], None
    for f in frames:
        h = cv2.normalize(cv2.calcHist([cv2.cvtColor(f, cv2.COLOR_BGR2HSV)], [0, 1], None, [16, 8], [0, 180, 0, 256]), None).flatten()
        g = cv2.cvtColor(cv2.resize(f, (64, 36), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY).astype(np.float32)
        if prev is not None:
            hd.append(cv2.compareHist(prev[0], h, cv2.HISTCMP_BHATTACHARYYA))
            pd.append(float(np.abs(g - prev[1]).mean()) / 255)
        prev = (h, g)
    score = [max(a / 0.35, b / 0.12) for a, b in zip(hd, pd)]
    # every jump is a cut: a 1-frame impact insert gives two cuts in a row, and it is a shot of its own
    return [0] + [i for i in range(1, len(frames)) if score[i] > 1]


def mids(cuts, n):
    """The frame shown on the sheet for each shot (its middle): give the --box for this frame."""
    return [(a + b - 1) // 2 for a, b in zip(cuts, cuts[1:] + [n])]


def sheet(frames, cuts, out):
    tiles = []
    for c in mids(cuts, len(frames)):
        t = cv2.resize(frames[c], (480, int(480 * frames[c].shape[0] / frames[c].shape[1])))
        H, W = t.shape[:2]
        for k in range(1, 10):
            cv2.line(t, (W * k // 10, 0), (W * k // 10, H), (0, 255, 255), 1)
            cv2.line(t, (0, H * k // 10), (W, H * k // 10), (0, 255, 255), 1)
            cv2.putText(t, f".{k}", (W * k // 10 + 2, 12), 0, 0.35, (0, 255, 255), 1)
            cv2.putText(t, f".{k}", (2, H * k // 10 - 2), 0, 0.35, (0, 255, 255), 1)
        cv2.putText(t, f"frame {c}", (4, H - 6), 0, 0.6, (0, 0, 255), 2)
        tiles.append(t)
    while len(tiles) % 3:
        tiles.append(np.zeros_like(tiles[0]))
    cv2.imwrite(out, np.vstack([np.hstack(tiles[i : i + 3]) for i in range(0, len(tiles), 3)]))


def track(frames, fps, boxes, smooth=0.25):
    n = len(frames)
    H, W = frames[0].shape[:2]
    cuts = find_cuts(frames)
    ends = cuts[1:] + [n]
    center = np.full((n, 2), 0.5)
    size = np.full(n, 0.0)
    missing = []
    for a, b in zip(cuts, ends):
        starts = sorted(f for f in boxes if a <= f < b)
        if not starts:
            missing.append(a)
            continue
        for i, s in enumerate(starts):
            x, y, w, h = boxes[s]
            box = (int(x * W), int(y * H), max(4, int(w * W)), max(4, int(h * H)))
            # forward to the next box (or the cut); the first box of a shot also tracks backward to the cut
            spans = [range(s, starts[i + 1] if i + 1 < len(starts) else b)] + ([range(s, a - 1, -1)] if i == 0 else [])
            for span in spans:
                tr = cv2.TrackerMIL_create()
                tr.init(frames[s], box)
                last = box
                for f in span:
                    if f != s:
                        ok, bx = tr.update(frames[f])
                        if ok:
                            last = bx
                    bx, by, bw, bh = last
                    center[f] = ((bx + bw / 2) / W, (by + bh / 2) / H)
                    size[f] = bh / H
        k = max(1, int(smooth * fps))
        if b - a > 2 and k > 1:  # smooth inside the shot only: a cut must stay a jump
            ker = np.exp(-0.5 * (np.arange(-2 * k, 2 * k + 1) / k) ** 2)
            ker /= ker.sum()
            for d in (0, 1):
                seg = np.pad(center[a:b, d], 2 * k, mode="edge")
                center[a:b, d] = np.convolve(seg, ker, mode="valid")
    return {"fps": fps, "width": W, "height": H, "frames": n, "center": [[round(float(x), 4), round(float(y), 4)] for x, y in center],
            "size": [round(float(s), 4) for s in size], "cuts": cuts, "missing": missing}


def selftest():
    # synthetic clip: a textured "head" moving right, then a cut to a new shot with the head moving down
    rng = np.random.default_rng(0)
    bg1, bg2 = rng.integers(0, 90, (360, 640, 3), np.uint8), rng.integers(150, 255, (360, 640, 3), np.uint8)
    head = rng.integers(0, 255, (60, 50, 3), np.uint8)
    frames = []
    for i in range(60):
        f = bg1.copy() if i < 30 else bg2.copy()
        x, y = (100 + i * 6, 120) if i < 30 else (300, 40 + (i - 30) * 5)
        f[y : y + 60, x : x + 50] = head
        frames.append(f)
    r = track(frames, 30, {15: ((100 + 90) / 640, 120 / 360, 50 / 640, 60 / 360), 45: (300 / 640, (40 + 75) / 360, 50 / 640, 60 / 360)}, smooth=0.05)
    assert r["cuts"] == [0, 30] and not r["missing"], r["cuts"]
    for i in (2, 25, 31, 55):
        x, y = (100 + i * 6 + 25, 150) if i < 30 else (325, 70 + (i - 30) * 5)
        cx, cy = r["center"][i]
        assert abs(cx * 640 - x) < 12 and abs(cy * 360 - y) < 12, (i, cx * 640, cy * 360, x, y)
    print("selftest ok")


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        selftest()
        sys.exit()
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--sheet")
    ap.add_argument("--box", action="append", default=[], help="frame:x,y,w,h (0..1 of the frame), one per shot")
    ap.add_argument("--smooth", type=float, default=0.25)
    ap.add_argument("--out", default="src/head.json")
    a = ap.parse_args()
    frames, fps = read(a.video)
    if a.sheet:
        cuts = find_cuts(frames)
        sheet(frames, cuts, a.sheet)
        print(a.sheet, "shots start at", cuts, "| give --box for frames", mids(cuts, len(frames)))
        sys.exit()
    boxes = {}
    for b in a.box:
        f, v = b.split(":")
        boxes[int(f)] = tuple(float(x) for x in v.split(","))
    r = track(frames, fps, boxes, a.smooth)
    json.dump(r, open(a.out, "w"))
    print(a.out, "frames", r["frames"], "shots", len(r["cuts"]), "missing boxes for shots at", r["missing"])
