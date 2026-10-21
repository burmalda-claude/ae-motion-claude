"""Transition scanner (/trans-learn): find every cut/flash in reference edits, measure what happens around it, classify, save review strips.

  python transscan.py <dir_with_videos> <out_dir>      # videos: <dir>/*.mp4 or <dir>/*/*.mp4

Per event (cut or bright flash) it measures luma, sharpness, directional gradients, R/B channel offset and optical flow
over -6..+8 frames and tags: flash (up/down frames), black, invert, blur / whipH / whipV, rgb, zoomIn / zoomOut, shake,
slide, dissolve (in-between frames are a mix of the two shots), strobe, hardcut.
Writes <out>/transitions.json, <out>/strips/<edit>_<frame>.jpg (frames c-4..c+7) and prints a summary.
Tags are heuristics — always look at the strips before deciding (see references/edits-breakdown.md).
"""
import glob, json, os, sys
import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
os.makedirs(f"{out}/strips", exist_ok=True)
W = 192


def feats(fr):
    g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    gx = np.abs(cv2.Sobel(g, cv2.CV_32F, 1, 0)).mean()
    gy = np.abs(cv2.Sobel(g, cv2.CV_32F, 0, 1)).mean()
    b, _, r = [c.astype(np.float32) for c in cv2.split(fr)]
    (sx, sy), resp = cv2.phaseCorrelate(r, b)  # R vs B offset = chromatic split
    hsv = cv2.cvtColor(fr, cv2.COLOR_BGR2HSV)
    return dict(l=float(g.mean()), lap=float(cv2.Laplacian(g, cv2.CV_32F).var()), gx=float(gx), gy=float(gy), ch=float(np.hypot(sx, sy)) if resp > 0.1 else 0.0, sat=float(hsv[..., 1].mean() / 255)), g


def hist(fr):
    h = cv2.calcHist([cv2.cvtColor(fr, cv2.COLOR_BGR2HSV)], [0, 1], None, [16, 8], [0, 180, 0, 256])
    return cv2.normalize(h, h).flatten()


results = []
for vid in sorted(glob.glob(f"{src}/*.mp4") + glob.glob(f"{src}/*/*.mp4")):
    flat = os.path.normpath(os.path.dirname(vid)) == os.path.normpath(src)
    d = os.path.splitext(os.path.basename(vid))[0] if flat else os.path.basename(os.path.dirname(vid))
    name = "ss" + d[-5:] if d.startswith("ssstik") else d.split("_")[0][:12]
    cap = cv2.VideoCapture(vid)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frames, F, G, H = [], [], [], []
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        fr = cv2.resize(fr, (W, int(fr.shape[0] * W / fr.shape[1])), interpolation=cv2.INTER_AREA)
        f, g = feats(fr)
        frames.append(fr); F.append(f); G.append(g); H.append(hist(fr))
    n = len(frames)
    if n < 10:
        continue
    L = np.array([f["l"] for f in F]); LAP = np.array([f["lap"] for f in F]); CH = np.array([f["ch"] for f in F])
    hd = np.array([0] + [cv2.compareHist(H[i - 1], H[i], cv2.HISTCMP_BHATTACHARYYA) for i in range(1, n)])
    pd = np.array([0] + [float(np.abs(G[i] - G[i - 1]).mean()) for i in range(1, n)])
    # flow between consecutive frames: translation (shake/whip) and divergence (zoom)
    tx, ty, dv = np.zeros(n), np.zeros(n), np.zeros(n)
    yy, xx = np.mgrid[0 : G[0].shape[0], 0:W]
    cx, cy = W / 2, G[0].shape[0] / 2
    rx, ry = xx - cx, yy - cy
    rn = np.hypot(rx, ry) + 1e-3
    for i in range(1, n):
        fl = cv2.calcOpticalFlowFarneback((G[i - 1] * 255).astype(np.uint8), (G[i] * 255).astype(np.uint8), None, 0.5, 3, 15, 3, 5, 1.2, 0)
        tx[i], ty[i] = fl[..., 0].mean(), fl[..., 1].mean()
        dv[i] = float(((fl[..., 0] * rx + fl[..., 1] * ry) / rn).mean())  # + = zooming in

    # cuts: histogram jump or pixel jump well above local level
    score = hd / (np.median(hd) + 1e-3) + pd / (np.median(pd) + 1e-3)
    cand = [i for i in range(2, n - 1) if (hd[i] > 0.35 or pd[i] > 0.12) and score[i] >= score[i - 1] and score[i] >= score[i + 1]]
    cuts = []
    for i in cand:
        if not cuts or i - cuts[-1] >= 2:
            cuts.append(i)
    # flashes not tied to a cut (bright spikes)
    base = np.convolve(L, np.ones(15) / 15, "same")
    for i in range(2, n - 2):
        if L[i] > max(0.82, base[i] + 0.25) and L[i] >= L[i - 1] and L[i] >= L[i + 1] and all(abs(i - c) > 4 for c in cuts):
            cuts.append(i)
    cuts.sort()

    def win(a, b):
        return range(max(0, a), min(n, b))

    for k, c in enumerate(cuts):
        w = list(win(c - 6, c + 9))
        outside = [j for j in win(c - 14, c + 16) if abs(j - c) > 8]
        bl = float(np.median(L[outside])) if outside else float(np.median(L))
        lap0 = float(np.median(LAP[outside])) if outside else float(np.median(LAP))
        tags, info = [], {}
        lw = L[w]
        if lw.max() > max(0.8, bl + 0.28):
            p = w[int(lw.argmax())]
            thr = bl + 0.5 * (L[p] - bl)
            up = next((p - j for j in range(p, max(0, p - 10), -1) if L[j] < thr), 0)
            down = next((j - p for j in range(p, min(n, p + 15)) if L[j] < thr), 0)
            tags.append("flash"); info["flash"] = dict(peak=round(float(L[p]), 2), up=up, down=down, at=p - c)
        if lw.min() < 0.06 and bl > 0.12:
            dark = [j for j in w if L[j] < 0.06]
            tags.append("black"); info["black"] = dict(frames=len(dark), at=dark[0] - c)
        for j in w[1:]:
            a, b = G[j].ravel() - G[j].mean(), G[j - 1].ravel() - G[j - 1].mean()
            corr = float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-6))
            if corr < -0.45:
                tags.append("invert"); info["invert"] = dict(at=j - c, corr=round(corr, 2)); break
        blur = LAP[w] / (lap0 + 1e-6)
        if blur.min() < 0.3 and "flash" not in tags and "black" not in tags:
            bj = [j for j in w if LAP[j] / (lap0 + 1e-6) < 0.45]
            hx = np.mean([F[j]["gy"] / (F[j]["gx"] + 1e-6) for j in bj])  # horizontal smear kills x-gradients
            kind = "whipH" if hx > 1.6 else "whipV" if hx < 0.6 else "blur"
            tags.append(kind); info[kind] = dict(frames=len(bj), min=round(float(blur.min()), 2))
        if CH[w].max() > 1.5:
            tags.append("rgb"); info["rgb"] = dict(px=round(float(CH[w].max()), 1), frames=int((CH[w] > 1.0).sum()))
        cutset = set(cuts)
        inshot = [j for j in w if all(j != q for q in cuts)]
        dvw = dv[inshot] if inshot else np.zeros(1)
        if (np.abs(dvw) > 1.2).sum() >= 2:
            tags.append("zoomIn" if dvw[np.abs(dvw).argmax()] > 0 else "zoomOut"); info["zoom"] = dict(max=round(float(dvw[np.abs(dvw).argmax()]), 2), frames=int((np.abs(dvw) > 0.6).sum()))
        after = [j for j in win(c + 1, c + 9) if j not in cutset]
        if len(after) > 3:
            jit = np.abs(np.diff(tx[after])).mean() + np.abs(np.diff(ty[after])).mean()
            if jit > 2.5:
                tags.append("shake"); info["shake"] = dict(jitter=round(float(jit), 1))
        if inshot and max(abs(tx[j]) for j in inshot) > 8 and "whipH" not in tags:
            tags.append("slide")
        # dissolve: change spread over several frames, no single dominant jump, no flash/black
        # dissolve: in-between frames are a mix a*pre + (1-a)*post of the shots around the cut
        if c - 5 >= 0 and c + 5 < n and not {"flash", "black"} & set(tags):
            pre, post = G[c - 5], G[c + 5]
            mixed = 0
            for j in range(c - 3, c + 4):
                d = (pre - post).ravel()
                if np.abs(d).mean() < 0.05:
                    break
                a = float(np.clip(((G[j] - post).ravel() @ d) / (d @ d), 0, 1))
                res = np.abs(G[j] - (a * pre + (1 - a) * post)).mean()
                near = min(np.abs(G[j] - pre).mean(), np.abs(G[j] - post).mean())
                if 0.15 < a < 0.85 and res < 0.6 * near:
                    mixed += 1
            if mixed >= 2:
                tags.append("dissolve"); info["dissolve"] = dict(frames=mixed)
        sl = np.sign(np.diff(L[w]))
        if (np.abs(np.diff(L[w])) > 0.2).sum() >= 4 and (np.diff(sl) != 0).sum() >= 4:
            tags.append("strobe")
        if not tags:
            tags.append("hardcut")
        gap = c - cuts[k - 1] if k else c
        r = dict(edit=name, frame=c, t=round(c / fps, 2), gap=gap, tags=tags, info=info, fps=round(fps, 2))
        results.append(r)
        # review strip: frames c-4 .. c+7
        th = [cv2.resize(frames[j], (96, int(96 * frames[0].shape[0] / W))) for j in win(c - 4, c + 8)]
        strip = cv2.hconcat(th)
        cv2.putText(strip, f"{name} f{c} {'+'.join(tags)}", (2, 12), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 255, 255), 1)
        cv2.imwrite(f"{out}/strips/{name}_{c:05d}.jpg", strip)
    print(name, n, "frames", len(cuts), "events", flush=True)

json.dump(results, open(f"{out}/transitions.json", "w"), indent=0)

# summary: how many edits use each tag + median timings
import collections, statistics as st
ed = collections.defaultdict(list)
for r in results:
    ed[r["edit"]].append(r)
print()
print(f"{len(results)} events in {len(ed)} edits")
for t in sorted({t for r in results for t in r["tags"]}):
    shares = [sum(t in r["tags"] for r in v) / len(v) for v in ed.values()]
    print(f"  {t:9s} used in {sum(s > 0 for s in shares):3d}/{len(ed)} edits, median share {st.median(shares):.2f}")
med = lambda xs: st.median(xs) if xs else None
print("  flash up/down frames:", med([r["info"]["flash"]["up"] for r in results if "flash" in r["info"]]), med([r["info"]["flash"]["down"] for r in results if "flash" in r["info"]]))
print("  black frames:", med([r["info"]["black"]["frames"] for r in results if "black" in r["info"]]), " blur frames:", med([r["info"][k]["frames"] for r in results for k in ("blur", "whipH", "whipV") if k in r["info"]]))
print("  dissolve frames:", med([r["info"]["dissolve"]["frames"] for r in results if "dissolve" in r["info"]]), " rgb px/frames:", med([r["info"]["rgb"]["px"] for r in results if "rgb" in r["info"]]), med([r["info"]["rgb"]["frames"] for r in results if "rgb" in r["info"]]))
print("  frames between events:", med([r["gap"] for r in results]))
