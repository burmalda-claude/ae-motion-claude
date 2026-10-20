---
description: "Transition engine — pick and place professional transitions between the shots of the current video."
argument-hint: "<which cut / shots, optional>"
---

Go through every cut of the current composition. For each cut call `pickTransition({from, to, bpm, timePasses, textToText, matchShape, onBeat})` using shot energy (music section or `beats.json` energy) and intent, explain the choice in one line per cut, then apply. Show the list of choices first if the video has more than 10 cuts.

Use the transition engine of the `motion-design` skill (`kit/cuts.tsx`, rules in `references/transitions.md`). Request: $ARGUMENTS

Rules that always apply:
- Offer the **clean cut first**. Add an effect only when it is motivated (time passes, energy changes, shapes match, beat hit).
- Duration 6–16 frames for invisible transitions; longer only for dramatic moments.
- Easing is mandatory: `ease`, `sCurve`, `out`, `in` or `bezier(...)`. Linear is refused by `transition()` unless explicitly asked.
- Motion blur on moving transitions (whip, zoom, split, depth, matte, speed ramp).
- Overlap is automatic: put shots in `<TransitionSeries>` and insert `transition(kind)`; a `null` result means a clean cut (no transition element).
- Audio: put a whoosh/hit SFX cue on the transition frame in `script.json` (or use the beats from `tools/beats.py`).
