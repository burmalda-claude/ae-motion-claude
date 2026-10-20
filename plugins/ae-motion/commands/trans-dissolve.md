---
description: "Dissolve — cross / blur / 3% scale dissolve, 6–12 frames."
argument-hint: "<which cut / shots, optional>"
---

Use `transition("blurDissolve")` by default (blur peaks mid-transition, hides the digital crossfade). For a softer emotional step use `"dissolve"`; for an impulse use `"scaleDissolve"` (100% → 103%). Keep 6–12 frames unless the moment is dramatic.

Use the transition engine of the `motion-design` skill (`kit/cuts.tsx`, rules in `references/transitions.md`). Request: $ARGUMENTS

Rules that always apply:
- Offer the **clean cut first**. Add an effect only when it is motivated (time passes, energy changes, shapes match, beat hit).
- Duration 6–16 frames for invisible transitions; longer only for dramatic moments.
- Easing is mandatory: `ease`, `sCurve`, `out`, `in` or `bezier(...)`. Linear is refused by `transition()` unless explicitly asked.
- Motion blur on moving transitions (whip, zoom, split, depth, matte, speed ramp).
- Overlap is automatic: put shots in `<TransitionSeries>` and insert `transition(kind)`; a `null` result means a clean cut (no transition element).
- Audio: put a whoosh/hit SFX cue on the transition frame in `script.json` (or use the beats from `tools/beats.py`).
