"""Transition planner (/trans-plan): cut + transition plan for an edit, following the grammar measured in real edits.

  python transplan.py src/beats.json --start 54.7 --end 75.2 [--style phonk|anime|cinematic] [--drop 59.23] [--out src/trans-plan.json]
  python transplan.py --selftest

beats.json comes from tools/beats.py (frames at 30 fps: beats, downbeats, hits, energy per beat).
Output: {"fps", "total", "shots": [{"from", "dur", "in", "cam", "fx", "sfx"}], "stats"} — frames relative to --start.

Measured grammar (references/transitions.md, 840 events in 27 edits):
- cuts sit ON audio onsets (histogram peak at 0 f, half within +-2 f): snap every cut to a hit / beat, never 1–3 f off
- quiet parts: hard cuts on beats, shots >= 12 f, rare 4 f dissolve / blur
- loud parts: an event every 4–8 f, in BURSTS — the same kind on 2–5 consecutive hits (4 f apart), the kind changes at a
  phrase boundary (downbeat, ~14 f gap). "Never repeat a transition" is wrong for edits; never repeat an ACCENT
  (invert, rgb, black) more than 3 times
- the drop: 2–4 black frames before it, measured flash on it
- every hit cut carries camera life: creep-in (+5 % over 7 f) or settle (-4 %), shake 1.5–3.5 % of width decaying
"""
import argparse, json, random, statistics as st, sys

FPS = 30
# kind -> (cut kind for kit/cuts.tsx, camera, fx overlay, sfx cue)
KIND = {
    "flash": ("exposure", "settle", "flash", "whoosh_cinematic_fast"),
    "punch": ("punchIn", "settle", "shake", "bass_hit_futuristic"),
    "creep": ("cut", "creep", "shake", "impact_whoosh_deep"),
    "whip": ("whip", "creep", None, "whoosh_fast_transition"),
    "blur": ("blurDissolve", "creep", None, "whoosh_air_zoom"),
    "glitch": ("glitch", "settle", "rgb", "glitch_small_electric"),
    "invert": ("invertCut", "punch", "shake", "bass_sub_knock"),
    "cut": ("cut", "none", None, None),
    "dissolve": ("dissolve", "none", None, None),
    "black": ("blackDip", "none", None, "reverse_impact_swell"),
}
STYLE = {  # weights of the burst kinds in loud parts (measured mix: flash 30 %, zoom 35 %, blur 18 %, whip 10 %, rgb/invert rare)
    "phonk": {"flash": 4, "punch": 3, "creep": 2, "whip": 1, "blur": 1, "glitch": 1, "invert": 0.5},
    "anime": {"flash": 3, "punch": 3, "creep": 3, "whip": 2, "blur": 2, "glitch": 0.5, "invert": 0.3},
    "cinematic": {"flash": 1, "punch": 1, "creep": 3, "whip": 1, "blur": 3, "glitch": 0, "invert": 0},
}
ACCENT = {"invert", "glitch"}
BURST_FRAMES = {"flash": 1, "punch": 0, "creep": 0, "whip": 8, "blur": 4, "glitch": 6, "invert": 4}


def plan(B, start, end, style="phonk", drop=None, seed=7):
    rnd = random.Random(seed)
    S, E = round(start * FPS), round(end * FPS)
    total = E - S
    rel = lambda xs: sorted({f - S for f in xs if S <= f < E})
    beats, downs, hits = rel(B["beats"]), set(rel(B["downbeats"])), rel(B.get("hits", []))
    en = {f - S: e for f, e in zip(B["beats"], B["energy"]) if S <= f < E}
    med = st.median(B["energy"])
    loud = lambda f: en.get(max([b for b in en if b <= f], default=min(en)), med) > med * 1.05
    D = round((drop - start) * FPS) if drop is not None else None
    # candidate cut points: hits everywhere, beats in loud parts, downbeats in quiet parts (all are audio onsets)
    eighths = {(a + b) // 2 for a, b in zip(beats, beats[1:]) if loud(a)}  # loud parts cut on 8th notes (hi-hats): events every 4–8 f
    cand = set(hits) | {b for b in beats if loud(b)} | eighths | set(downs)
    if D is not None:
        cand.add(D)
    cuts, last = [0], 0
    for f in sorted(cand):
        min_gap = 4 if loud(f) else 12
        if f - last >= min_gap and total - f >= 6:
            cuts.append(f)
            last = f
    shots, kind, run, accents = [], None, 0, 0
    weights = STYLE[style]
    for i, f in enumerate(cuts):
        nxt = cuts[i + 1] if i + 1 < len(cuts) else total
        if f == 0:
            k = "cut"
        elif D is not None and f == D:
            k, run = "flash", 0  # the drop always flashes
        elif not loud(f):
            k = "dissolve" if rnd.random() < 0.08 else "cut"
            kind, run = None, 0
        else:
            phrase_start = f in downs or kind is None or f - cuts[i - 1] >= 16
            if phrase_start or run >= rnd.choice((2, 3, 4, 5)) or (kind in ACCENT and run >= 3):
                pool = {k_: w for k_, w in weights.items() if k_ != kind and w > 0}
                kind = rnd.choices(list(pool), weights=list(pool.values()))[0]
                run = 0
            k = kind
            run += 1
        cut_kind, cam, fx, sfx = KIND[k]
        shots.append({"from": f, "dur": nxt - f, "kind": k, "in": cut_kind, "cam": cam, "fx": fx, "sfx": sfx and f"sfx/online/{sfx}.mp3"})
    if D is not None:  # black frames right before the drop: shorten the shot before it, insert a black shot
        j = next(i for i, s in enumerate(shots) if s["from"] == D)
        if j > 0 and shots[j - 1]["dur"] > 6:
            shots[j - 1]["dur"] -= 3
            shots.insert(j, {"from": D - 3, "dur": 3, "kind": "black", "in": "cut", "cam": "none", "fx": "black", "sfx": "sfx/online/reverse_impact_swell.mp3"})
    return {"fps": FPS, "total": total, "drop": D, "shots": shots, "stats": stats(shots, hits + beats + sorted(eighths))}


def stats(shots, onsets):
    ev = [s for s in shots if s["kind"] not in ("cut", "black") and s["from"] > 0]
    runs, cur, n = [], None, 0
    for s in ev:
        if s["kind"] == cur:
            n += 1
        else:
            if cur:
                runs.append(n)
            cur, n = s["kind"], 1
    if cur:
        runs.append(n)
    on = sorted(set(onsets))
    off = [min(abs(s["from"] - o) for o in on) for s in shots if s["from"] > 0 and s["kind"] != "black"] if on else [0]
    return {"shots": len(shots), "median_shot": st.median(s["dur"] for s in shots), "events": len(ev), "median_run": st.median(runs) if runs else 0,
            "max_run": max(runs) if runs else 0, "on_grid_pct": round(100 * sum(o <= 1 for o in off) / len(off)), "mix": {k: sum(s["kind"] == k for s in shots) for k in KIND}}


def selftest():
    rnd = random.Random(1)
    beats = list(range(12, 1200, 12))
    B = {"beats": beats, "downbeats": beats[::4], "hits": [b + rnd.choice((0, 6)) for b in beats if rnd.random() < 0.5], "energy": [0.3 if b < 300 else 0.8 for b in beats]}
    P = plan(B, 0, 30, drop=300 / FPS)
    sh = P["shots"]
    assert sh[0]["from"] == 0 and all(a["from"] + a["dur"] == b["from"] for a, b in zip(sh, sh[1:])) and sh[-1]["from"] + sh[-1]["dur"] == P["total"]
    assert any(s["kind"] == "black" and s["from"] == 297 for s in sh) and next(s for s in sh if s["from"] == 300)["kind"] == "flash"
    assert all(s["dur"] >= 12 for s in sh if s["from"] < 297 and s["from"] + s["dur"] < 297)  # quiet part: long shots
    assert P["stats"]["on_grid_pct"] == 100 and 2 <= P["stats"]["median_run"] <= 5, P["stats"]
    print("selftest ok", P["stats"])


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        selftest()
        sys.exit()
    ap = argparse.ArgumentParser()
    ap.add_argument("beats")
    ap.add_argument("--start", type=float, required=True)
    ap.add_argument("--end", type=float, required=True)
    ap.add_argument("--style", default="phonk", choices=list(STYLE))
    ap.add_argument("--drop", type=float)
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--out", default="src/trans-plan.json")
    a = ap.parse_args()
    P = plan(json.load(open(a.beats)), a.start, a.end, a.style, a.drop, a.seed)
    json.dump(P, open(a.out, "w"), indent=1)
    print(a.out, P["stats"])
