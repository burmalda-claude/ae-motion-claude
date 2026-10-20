---
description: "Find SFX by mood/scene (not by file name) — library, generated, or online."
argument-hint: "<description / genre / file>"
---

1) Translate the description into category + params (e.g. 'тёмный whoosh для перехода в подвал' → `whoosh:tone=dark,weight=heavy,dir=DOWN,len=14f`) — `python tools/sfxgen.py ai "<description>" out.wav` shows the mapping. 2) If a generated sound fits, use the spec directly as a cue. 3) If it must be a real recording (voice memes like 'get out', 'wasted' voice, real glass/foley), WebSearch Pixabay / Mixkit / Freesound / YouTube for it, list 3 options (name, link, license, length) and **ask before downloading** (file, source, size). Save to `public/sfx/`, log in `CREDITS.md` (author, source, license, commercial use).

**Default source is the internet** (references/sfx.md → Source order): search Mixkit / Pixabay / Freesound / YouTube for real recordings matching the mood, ask before downloading, use files by path as cues. Procedural generation only as fallback.

Sound engine of the `motion-design` skill: `tools/sfxgen.py` (generators, layers, packs, sync, AI), `tools/audit.py`, rules in `references/sfx.md`. Request: $ARGUMENTS

Always: every visual accent gets a *motivated* sound layer; place it ON the frame (whooshes/risers END on the cut, impacts START on it); never mask speech (build.py ducks SFX, `sfxPresenceDuck` carves 1–4 kHz); either reinforce the beat or live in the gap — no flams; finish with `python tools/audit.py .`.
