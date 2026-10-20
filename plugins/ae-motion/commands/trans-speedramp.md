---
description: "Speed-ramp transition — S-curve ramp to 40–50% into the cut, ramp back to 100% after it; no visual effect."
argument-hint: "<which cut / shots, optional>"
---

Use `<SpeedRampCut A={...} B={...} aDur bDur ramp={12} low={0.45} />` (or `rampFrame()` for custom layouts / `<OffthreadVideo playbackRate>` for footage). Auto-pick `low` 0.4–0.5 (0.4 for fast motion in the shot, 0.5 for slow). Easing is the S-curve, never linear. Add a soft whoosh on the cut frame.

Use the transition engine of the `motion-design` skill (`kit/cuts.tsx`, rules in `references/transitions.md`). Request: $ARGUMENTS

Rules that always apply:
- Offer the **clean cut first**. Add an effect only when it is motivated (time passes, energy changes, shapes match, beat hit).
- Duration 6–16 frames for invisible transitions; longer only for dramatic moments.
- Easing is mandatory: `ease`, `sCurve`, `out`, `in` or `bezier(...)`. Linear is refused by `transition()` unless explicitly asked.
- Motion blur on moving transitions (whip, zoom, split, depth, matte, speed ramp).
- Overlap is automatic: put shots in `<TransitionSeries>` and insert `transition(kind)`; a `null` result means a clean cut (no transition element).
- Audio: put a whoosh/hit SFX cue on the transition frame in `script.json` (or use the beats from `tools/beats.py`).
