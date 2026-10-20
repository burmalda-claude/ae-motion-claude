---
description: "Check SFX against speech/music: masking, clipping, phase, true peak, loudness, beat clashes, AI artifacts."
argument-hint: "<description / genre / file>"
---

Run `python tools/audit.py .` (mix + stems) or `--file <wav>` (single sound; adds the metallic/robotic AI check). Explain every FAIL/WARN in one line and fix: masking → lower that cue or move it off the word / raise `sfxPresenceDuck`; beat clash → snap to the hit (`snapToBeat`) or into the gap; true peak/clipping → lower `sfxGain`; phase → mono the layer; loudness → `lufs` -14 social / -23 TV. Rebuild and re-audit until no FAIL.

Sound engine of the `motion-design` skill: `tools/sfxgen.py` (generators, layers, packs, sync, AI), `tools/audit.py`, rules in `references/sfx.md`. Request: $ARGUMENTS

Always: every visual accent gets a *motivated* sound layer; place it ON the frame (whooshes/risers END on the cut, impacts START on it); never mask speech (build.py ducks SFX, `sfxPresenceDuck` carves 1–4 kHz); either reinforce the beat or live in the gap — no flams; finish with `python tools/audit.py .`.
