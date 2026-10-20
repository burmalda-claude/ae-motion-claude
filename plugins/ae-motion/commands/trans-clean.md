---
description: "Clean cut first — place a straight cut, suggest a dissolve only if the cut does not read."
argument-hint: "<which cut / shots, optional>"
---

Place a clean cut (no transition). Then check the two shots: if rhythm and visual logic match, keep the cut. If the cut jumps (same framing, different content, or a time jump), suggest `transition("scaleDissolve")` (10 f) and apply only if the user agrees or explicitly asked for auto.

Use the transition engine of the `motion-design` skill (`kit/cuts.tsx`, rules in `references/transitions.md`). Request: $ARGUMENTS

Rules that always apply:
- Offer the **clean cut first**. Add an effect only when it is motivated (time passes, energy changes, shapes match, beat hit).
- Duration 6–16 frames for invisible transitions; longer only for dramatic moments.
- Easing is mandatory: `ease`, `sCurve`, `out`, `in` or `bezier(...)`. Linear is refused by `transition()` unless explicitly asked.
- Motion blur on moving transitions (whip, zoom, split, depth, matte, speed ramp).
- Overlap is automatic: put shots in `<TransitionSeries>` and insert `transition(kind)`; a `null` result means a clean cut (no transition element).
- Audio: put a whoosh/hit SFX cue on the transition frame in `script.json` (or use the beats from `tools/beats.py`).
