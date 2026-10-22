---
description: "Start here — what ae-motion can do and which command to use for your video."
argument-hint: "<what you want to make, optional>"
---

Request: $ARGUMENTS

If the request describes a video, recommend **one** mode and say why in one line, then offer to start (the brief comes first, `references/brief.md`). Otherwise print this map, in the user's language, compactly:

- **Make a video from one line** — just describe it, or pick a mode: `edit` (hard short-form), `cinematic` (trailer), `ad` (product/promo), `lyric`, `clip` (podcast → shorts), `tutorial`, `gym`, `gaming`, `amv`, `travel`, `meme`, `news`, `fashion`, `horror`, `wedding`, `realestate`, `asmr`, `reaction`. Each is `/ae-motion:<mode> <what about>`.
- **Find the name of a move** — `/ae-motion:lexicon <description>` or the gallery https://burmalda-claude.github.io/ae-motion-claude/ (144 animated names → kit components → ready prompt).
- **Transitions** — `/ae-motion:transition [kind]` (auto or clean/dissolve/wipe/glitch/morph/speedramp/beat/edit/random), `/ae-motion:trans-plan` (cut plan from music), `/ae-motion:trans-learn` (learn from reference edits).
- **Sound** — `/ae-motion:music-find`, `/ae-motion:sfx-find | sfx-generate | sfx-sync | sfx-layer | sfx-pack | sfx-audit`.
- **Presets** — say "разобрать" after a mode to edit its stack; "save as preset <name>".
- Preview: `npx remotion studio`. Render: Claude does it and tells you where the file is.
