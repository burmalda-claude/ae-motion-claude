---
description: "Edit-style cuts measured in real TikTok edits: punch-in, exposure flash, invert/1-bit frames, shrink-pop, push, pixelate, TV-off, hue sweep, stutter, card."
argument-hint: "<which cuts / style, optional>"
---

Cut like the reference edits (`references/transitions.md` → "Edit staples"): most cuts are **hard cuts on a hit** plus one short event on the new shot. Default `punchIn` (6 f) on hits, `exposure` (8 f, 1 f up / 4 f down) on big hits and section changes, `blackDip` (3 black frames) before the drop. Accents, never twice in a row: `invertCut` / `threshold` (phonk, horror), `stutter` (build-ups), `shrinkPop` / `hueShift` (character edits), `push` (vertical feeds), `pixelate` / `card` (meme edits), `tvOff` (endings). Place cuts on `beats.json` `hits`, add `HitShake` on the same frames, put the SFX cue on the cut frame.

Use the transition engine of the `motion-design` skill (`kit/cuts.tsx`, rules in `references/transitions.md`). Request: $ARGUMENTS

Rules that always apply:
- Offer the **clean cut first**. Add an effect only when it is motivated (time passes, energy changes, shapes match, beat hit).
- Edit staples are short: 3–10 frames. Dissolves in edits are 3–5 frames, not 12.
- Easing is mandatory: `ease`, `sCurve`, `out`, `in` or `bezier(...)`. Linear is refused by `transition()` unless explicitly asked.
- Overlap is automatic: put shots in `<TransitionSeries>` and insert `transition(kind)`; `punchIn` cuts at the start of the overlap and settles after it.
- Audio: impact/whoosh on the cut frame (`sfxTrack`), whooshes END on the cut.
