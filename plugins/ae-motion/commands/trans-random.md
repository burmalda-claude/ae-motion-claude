---
description: "Smart random — chooses the transition type from shot energy and BPM, not at random."
argument-hint: "<which cut / shots, optional>"
---

For each cut compute energy (music section: stop/break/intro=low, ui/build=mid, drop=high; or `beats.json` energy) and call `pickTransition()`. Calm videos: never repeat the same kind more than twice in a row. Edits: repeat one kind in bursts of 2–5 on consecutive hits and change it on a downbeat; never more than 3 accents (invert, glitch, black) in a row. Print `cut i: <kind> (<frames> f) — <why>` for each, then apply.

Use the transition engine of the `motion-design` skill (`kit/cuts.tsx`, rules in `references/transitions.md`). For edits, start from `python tools/transplan.py src/beats.json --start <s> --end <s> --drop <s>` (measured grammar: cuts on onsets, bursts of 2–5 of one kind, black + flash on the drop) and wrap each shot in `<EditCam kind={shot.cam}>`.

Request: $ARGUMENTS

Rules that always apply:
- Offer the **clean cut first**. Add an effect only when it is motivated (time passes, energy changes, shapes match, beat hit).
- Duration 6–16 frames for invisible transitions; longer only for dramatic moments.
- Easing is mandatory: `ease`, `sCurve`, `out`, `in` or `bezier(...)`. Linear is refused by `transition()` unless explicitly asked.
- Motion blur on moving transitions (whip, zoom, split, depth, matte, speed ramp).
- Overlap is automatic: put shots in `<TransitionSeries>` and insert `transition(kind)`; a `null` result means a clean cut (no transition element).
- Audio: put a whoosh/hit SFX cue on the transition frame in `script.json` (or use the beats from `tools/beats.py`).
