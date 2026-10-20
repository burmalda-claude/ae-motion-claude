---
description: "Auto-build a 2–3 layer SFX stack for a transition (whoosh + impact + tail)."
argument-hint: "<description / genre / file>"
---

`python tools/sfxgen.py layer <transition-kind>` prints the stack (e.g. whip → bright heavy whoosh ending on the cut + light snare hit + short sub). In script.json use the cue `["layer:<kind>", <frame of the cut>]` (or in `sfxTrack`). Layers are trimmed to the transition and pitch-varied with `sfxVary`.

**Default source is the internet** (references/sfx.md → Source order): search Mixkit / Pixabay / Freesound / YouTube for real recordings matching the mood, ask before downloading, use files by path as cues. Procedural generation only as fallback.

Sound engine of the `motion-design` skill: `tools/sfxgen.py` (generators, layers, packs, sync, AI), `tools/audit.py`, rules in `references/sfx.md`. Request: $ARGUMENTS

Always: every visual accent gets a *motivated* sound layer; place it ON the frame (whooshes/risers END on the cut, impacts START on it); never mask speech (build.py ducks SFX, `sfxPresenceDuck` carves 1–4 kHz); either reinforce the beat or live in the gap — no flams; finish with `python tools/audit.py .`.
