---
description: "Wipe & reveal — shape wipe, match-cut reveal or track-matte wipe, always with an edge stroke."
argument-hint: "<which cut / shots, optional>"
---

Pick: `shapeWipe` (props shape circle/diagonal/panel, x, y, edge color, edgeWidth), `matchReveal` (props x, y in % where a repeating shape sits in both shots — eye → moon, wheel → sun), or `matteWipe` (a moving foreground object carries the next shot). Never without the edge (stroke/colored edge) — it makes the wipe look intentional.

Use the transition engine of the `motion-design` skill (`kit/cuts.tsx`, rules in `references/transitions.md`). Request: $ARGUMENTS

Rules that always apply:
- Offer the **clean cut first**. Add an effect only when it is motivated (time passes, energy changes, shapes match, beat hit).
- Duration 6–16 frames for invisible transitions; longer only for dramatic moments.
- Easing is mandatory: `ease`, `sCurve`, `out`, `in` or `bezier(...)`. Linear is refused by `transition()` unless explicitly asked.
- Motion blur on moving transitions (whip, zoom, split, depth, matte, speed ramp).
- Overlap is automatic: put shots in `<TransitionSeries>` and insert `transition(kind)`; a `null` result means a clean cut (no transition element).
- Audio: put a whoosh/hit SFX cue on the transition frame in `script.json` (or use the beats from `tools/beats.py`).
