---
description: "Beat-synced transitions — analyze the audio first, then put transitions on beats."
argument-hint: "<which cut / shots, optional>"
---

1) Run `python tools/beats.py <audio> .` (or use the music bpm from script.json) → `src/beats.json`. 2) Put scene changes on `downbeats` (bar starts), hard hits (phonk/glitch/flash) on `hits`, and center each transition on the beat (start = beat − frames/2). 3) Choose kinds with `pickTransition({..., onBeat: true})`. 4) Add SFX cues on the same frames.

Use the transition engine of the `motion-design` skill (`kit/cuts.tsx`, rules in `references/transitions.md`). Request: $ARGUMENTS

Rules that always apply:
- Offer the **clean cut first**. Add an effect only when it is motivated (time passes, energy changes, shapes match, beat hit).
- Duration 6–16 frames for invisible transitions; longer only for dramatic moments.
- Easing is mandatory: `ease`, `sCurve`, `out`, `in` or `bezier(...)`. Linear is refused by `transition()` unless explicitly asked.
- Motion blur on moving transitions (whip, zoom, split, depth, matte, speed ramp).
- Overlap is automatic: put shots in `<TransitionSeries>` and insert `transition(kind)`; a `null` result means a clean cut (no transition element).
- Audio: put a whoosh/hit SFX cue on the transition frame in `script.json` (or use the beats from `tools/beats.py`).
