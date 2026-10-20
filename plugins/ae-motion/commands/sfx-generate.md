---
description: "Generate a custom SFX from a prompt (length, tone, loop, sub-bass)."
argument-hint: "<description / genre / file>"
---

Run `python tools/sfxgen.py ai "<prompt>" public/sfx/<name>.wav --dur <s> [--loop]`. With `ELEVENLABS_API_KEY` set it uses ElevenLabs Sound Effects (≤30 s, loopable); otherwise the procedural engine. Tweak with a spec instead (`python tools/sfxgen.py render "impact:kind=metal,weight=heavy,tail=long,sub=1" out.wav`). Then audit it: `python tools/audit.py --file <wav>` (clipping, true peak, phase, metallic AI artifacts). Re-generate if it fails.

Sound engine of the `motion-design` skill: `tools/sfxgen.py` (generators, layers, packs, sync, AI), `tools/audit.py`, rules in `references/sfx.md`. Request: $ARGUMENTS

Always: every visual accent gets a *motivated* sound layer; place it ON the frame (whooshes/risers END on the cut, impacts START on it); never mask speech (build.py ducks SFX, `sfxPresenceDuck` carves 1–4 kHz); either reinforce the beat or live in the gap — no flams; finish with `python tools/audit.py .`.
