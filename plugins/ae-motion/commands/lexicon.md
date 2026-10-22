---
description: "Motion lexicon — find the name of a move (144 names: motion, camera, UI, web, photo looks) and how the kit builds it; open the visual gallery."
argument-hint: "<describe the move, a name in any language, or #043 — empty opens the gallery>"
---

Use the lexicon of the `motion-design` skill. Request: $ARGUMENTS

- **Empty request:** give the gallery link https://burmalda-claude.github.io/ae-motion-claude/ (every name animated; pick moves there, add a note and paste the generated prompt back here). Offline: `python -m http.server -d docs` in the repo, then http://localhost:8000.
- **A description or a name** ("камера рывком вбок", "dolly zoom", "#120"): run `python tools/lexicon.py find <words>` from the skill folder and answer with the 1–3 best names: number, name (en / ru), one-line meaning, how the kit builds it, and a ready request the user can copy. If nothing matches, rephrase in English or by tag and search again before saying there is no name for it.
- **Details for one name:** `python tools/lexicon.py show <id>` (spec with timings and easing, related names).
- `≈` in the kit column means the kit gives a close look, not the same move — say so. "spec" means no kit piece: build it from the spec and keep its timings and easing.
- When the user then asks to use the move, follow the SKILL.md workflow (brief first, `references/brief.md`).
