---
description: "Build a ready mini-pack for a genre: gym, phonk, anime, meme, horror, tech, edit, cinematic."
argument-hint: "<description / genre / file>"
---

`python tools/sfxgen.py pack <genre> public/sfx/<genre>` → ~18–21 wavs (3 variations of each) + `pack.json`. Tell the user what's inside; for genre staples that must be real recordings (meme voice clips), offer `/ae-motion:sfx-find`.

**Default source is the internet** (references/sfx.md → Source order): search Mixkit / Pixabay / Freesound / YouTube for real recordings matching the mood, ask before downloading, use files by path as cues. Procedural generation only as fallback.

Sound engine of the `motion-design` skill: `tools/sfxgen.py` (generators, layers, packs, sync, AI), `tools/audit.py`, rules in `references/sfx.md`. Request: $ARGUMENTS

Always: every visual accent gets a *motivated* sound layer; place it ON the frame (whooshes/risers END on the cut, impacts START on it); never mask speech (build.py ducks SFX, `sfxPresenceDuck` carves 1–4 kHz); either reinforce the beat or live in the gap — no flams; finish with `python tools/audit.py .`.
