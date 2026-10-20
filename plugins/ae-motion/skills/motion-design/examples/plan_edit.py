"""Builds src/edit-plan.json (cuts on the track's beats/hits) and script-edit.json (music + online SFX lane) from src/beats.json."""
import json
from collections import Counter

fps = 30
b = json.load(open("src/beats.json"))
start, end = 14.83, 31.43  # 2 bars before the drop (18.50 s) .. downbeat after the re-drop section
S, E = round(start * fps), round(end * fps)
total = E - S
rel = lambda fr: fr - S
beats = [rel(f) for f in b["beats"] if S <= f < E]
downs = [rel(f) for f in b["downbeats"] if S <= f < E]
hits = [rel(f) for f in b["hits"] if S <= f < E]
drop, dip, redrop = round((18.50 - start) * fps), round((24.52 - start) * fps), round((25.90 - start) * fps)

cuts = set()
for i, f in enumerate(beats):
    if f >= drop:  # build section stays one shot (the intro), high sections cut on every beat
        cuts.add(f)
for h in hits:
    if h >= drop and all(abs(h - c) > 7 for c in cuts):
        cuts.add(h)  # extra cuts on transients between beats
cuts.update([drop, redrop])
cuts = [0] + sorted(c for c in cuts if 0 < c < total - 6)

looks_hi = ["aura", "strobe", "close", "word:ФИКУС", "mirror", "streak", "aura", "invert", "word:КОРОЛЬ", "strobe", "close", "word:ПОДОКОННИКА", "mirror", "aura", "streak", "invert"]
shots, hi_i = [], 0
for k, f in enumerate(cuts):
    nxt = cuts[k + 1] if k + 1 < len(cuts) else total
    if f < drop:
        look = "intro"
    elif dip <= f < redrop:
        look = "dip"
    elif f >= total - 45:
        look = "final"
    else:
        look = looks_hi[hi_i % len(looks_hi)]
        hi_i += 1
    if f in (drop, redrop):
        tr = "whiteout"
    elif f in downs and f > drop and downs.index(f) % 2 == 0:
        tr = "whiteout"
    elif f > drop and (f not in beats or k % 5 == 0):
        tr = "glitch"
    elif f > drop and k % 4 == 1:
        tr = "zoom"
    elif f > drop and k % 4 == 3:
        tr = "whip"
    else:
        tr = "cut"
    shots.append({"from": f, "dur": nxt - f, "look": look, "in": tr})

merged = []
for s in shots:  # consecutive intro / dip / final pieces are one shot
    if merged and s["look"] in ("intro", "final", "dip") and merged[-1]["look"] == s["look"]:
        merged[-1]["dur"] += s["dur"]
    else:
        merged.append(s)
assert sum(s["dur"] for s in merged) == total and merged[0]["from"] == 0

sfx = [
    ["sfx/online/reverse_impact_swell.mp3", drop, 0.8],
    ["sfx/online/impact_big_cinematic.mp3", drop, 0.9],
    ["sfx/online/bass_sub_knock.mp3", drop, 0.7],
    ["sfx/online/glitch_rewind.mp3", dip, 0.6],
    ["sfx/online/reverse_impact_swell.mp3", redrop, 0.6],
    ["sfx/online/impact_whoosh_deep.mp3", redrop, 0.8],
    ["sfx/online/impact_big_cinematic.mp3", total - 45, 0.7],
]
for s in merged:
    if s["from"] in (0, drop, redrop):
        continue
    f = {"whiteout": "whoosh_cinematic_fast", "glitch": "glitch_small_electric", "zoom": "whoosh_air_zoom", "whip": "whoosh_fast_transition"}.get(s["in"])
    if f:
        sfx.append([f"sfx/online/{f}.mp3", s["from"], 0.5])
    if s["look"].startswith("word:"):
        sfx.append(["sfx/online/bass_hit_futuristic.mp3", s["from"], 0.55])

json.dump({"fps": fps, "total": total, "drop": drop, "dip": dip, "redrop": redrop, "beats": beats, "hits": hits, "shots": merged}, open("src/edit-plan.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(
    {"fps": fps, "musicFile": "public/music/brazilian_phonk_alex_morgan.mp3", "musicStart": start, "musicGain": 1.0, "sfxGain": 0.85, "beats": [{"id": "edit", "min": total, "auto": False}], "sfxTrack": sfx},
    open("script-edit.json", "w", encoding="utf-8"),
    ensure_ascii=False,
    indent=1,
)
print("total", total, "drop", drop, "dip", dip, "redrop", redrop, "shots", len(merged), dict(Counter(s["in"] for s in merged)), "sfx", len(sfx))
print("median shot", sorted(s["dur"] for s in merged)[len(merged) // 2])
