---
description: "Analyze the beat/hits of the music and place SFX hits on the timecodes."
argument-hint: "<description / genre / file>"
---

1) `python tools/beats.py <music> .` → `src/beats.json`. 2) `python tools/sfxgen.py sync . --style <edit|phonk|cinematic|meme|tech> [--max 12]` → fills `sfxTrack` in script.json (impacts on the strongest hits ≥ 1 beat apart, whooshes ending on downbeats, a riser every 4 bars). 3) `python tools/build.py script.json .`, then `/ae-motion:sfx-audit` and fix any 'beat clash' (move hits onto the beat or into gaps).

Sound engine of the `motion-design` skill: `tools/sfxgen.py` (generators, layers, packs, sync, AI), `tools/audit.py`, rules in `references/sfx.md`. Request: $ARGUMENTS

Always: every visual accent gets a *motivated* sound layer; place it ON the frame (whooshes/risers END on the cut, impacts START on it); never mask speech (build.py ducks SFX, `sfxPresenceDuck` carves 1–4 kHz); either reinforce the beat or live in the gap — no flams; finish with `python tools/audit.py .`.
