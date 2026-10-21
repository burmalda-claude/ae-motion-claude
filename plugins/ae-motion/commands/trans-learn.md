---
description: "Learn transitions from reference edits: scan videos, measure every cut, review strips, map to transition kinds."
argument-hint: "<folder with reference videos>"
---

1) Run `python tools/transscan.py "<folder>" <out>` (from `skills/motion-design/`; videos as `<folder>/*.mp4` or `<folder>/*/*.mp4`). It writes `<out>/transitions.json`, one review strip per cut (`<out>/strips/*.jpg`, frames −4…+7) and prints usage per tag and median timings.
2) The tags are heuristics. **Look at the strips** (group them by tag into contact sheets) before concluding anything.
3) Map what you see to `kit/cuts.tsx` kinds and `kit/editfx.tsx` components (table "Edit staples" in `references/transitions.md`). Report: the 5–10 transitions the references actually use, their frame counts, how often per 10 s, and on which beats.
4) If a pattern repeats in several edits and no kind covers it, propose adding it to `kit/cuts.tsx` (component + `CutKind` + `CUT_FRAMES` + docs) and render a strip test before using it.

Request: $ARGUMENTS
