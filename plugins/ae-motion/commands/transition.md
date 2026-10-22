---
description: "Transitions — pick and place transitions between shots: auto (smart pick per cut) or one kind: clean, dissolve, wipe, glitch, morph, speedramp, beat, edit, random."
argument-hint: "[clean|dissolve|wipe|glitch|morph|speedramp|beat|edit|random] <which cut / shots, optional>"
---

Use the transition engine of the `motion-design` skill (`kit/cuts.tsx`, rules in `references/transitions.md`). Request: $ARGUMENTS

If the request starts with one of the kinds below, follow that section. A transition named any other way ("вип-пан", "шторка", "#043") → look it up with `python tools/lexicon.py find <words>` and use its kit mapping.

**No kind given (auto):** go through every cut of the current composition. For each cut call `pickTransition({from, to, bpm, timePasses, textToText, matchShape, onBeat})` using shot energy (music section or `beats.json` energy) and intent, explain the choice in one line per cut, then apply. Show the list of choices first if the video has more than 10 cuts.

### `clean`
Place a clean cut (no transition). Then check the two shots: if rhythm and visual logic match, keep the cut. If the cut jumps (same framing, different content, or a time jump), suggest `transition("scaleDissolve")` (10 f) and apply only if the user agrees or explicitly asked for auto.

### `dissolve`
Use `transition("blurDissolve")` by default (blur peaks mid-transition, hides the digital crossfade). For a softer emotional step use `"dissolve"`; for an impulse use `"scaleDissolve"` (100% → 103%). Keep 6–12 frames unless the moment is dramatic.

### `wipe`
Pick: `shapeWipe` (props shape circle/diagonal/panel, x, y, edge color, edgeWidth), `matchReveal` (props x, y in % where a repeating shape sits in both shots — eye → moon, wheel → sun), or `matteWipe` (a moving foreground object carries the next shot). Never without the edge (stroke/colored edge) — it makes the wipe look intentional.

### `glitch`
Use `transition("glitch")` or `transition("phonk")` (VHS darkness + 1-frame invert) with 4–8 frames, centered on the beat/impact. Add `glitch` + `impact` SFX on the frame. Do not use it on every cut — it is an accent.

### `morph`
Use `<MorphText from="..." to="..." at={frame} dur={12–16} />` with `<GooDefs />` mounted once; solid-colored text only. For the background between scenes use `transition("liquid")`. Keep the two words in the same position and size so the morph reads.

### `speedramp`
Use `<SpeedRampCut A={...} B={...} aDur bDur ramp={12} low={0.45} />` (or `rampFrame()` for custom layouts / `<OffthreadVideo playbackRate>` for footage). Auto-pick `low` 0.4–0.5 (0.4 for fast motion in the shot, 0.5 for slow). Easing is the S-curve, never linear. Add a soft whoosh on the cut frame.

### `beat`
1) Run `python tools/beats.py <audio> .` (or use the music bpm from script.json) → `src/beats.json`. 2) Put scene changes on `downbeats` (bar starts), hard hits (phonk/glitch/flash) on `hits`, and center each transition on the beat (start = beat − frames/2). 3) Choose kinds with `pickTransition({..., onBeat: true})`. 4) Add SFX cues on the same frames.

### `edit`
Cut like the reference edits (`references/transitions.md` → "Edit staples"): most cuts are **hard cuts on a hit** plus one short event on the new shot. Default `punchIn` (6 f) on hits, `exposure` (8 f, 1 f up / 4 f down) on big hits and section changes, `blackDip` (3 black frames) before the drop. Accents, never twice in a row: `invertCut` / `threshold` (phonk, horror), `stutter` (build-ups), `shrinkPop` / `hueShift` (character edits), `push` (vertical feeds), `pixelate` / `card` (meme edits), `tvOff` (endings). Place cuts on `beats.json` `hits`, add `HitShake` on the same frames, put the SFX cue on the cut frame.

### `random`
For each cut compute energy (music section: stop/break/intro=low, ui/build=mid, drop=high; or `beats.json` energy) and call `pickTransition()`. Calm videos: never repeat the same kind more than twice in a row. Edits: repeat one kind in bursts of 2–5 on consecutive hits and change it on a downbeat; never more than 3 accents (invert, glitch, black) in a row. Print `cut i: <kind> (<frames> f) — <why>` for each, then apply.

For edits (`beat`, `edit`, `random`): start from `python tools/transplan.py src/beats.json --start <s> --end <s> --drop <s>` (measured grammar: cuts on onsets, bursts of 2–5 of one kind, black + flash on the drop) and wrap each shot in `<EditCam kind={shot.cam}>`.

Rules that always apply:
- Offer the **clean cut first**. Add an effect only when it is motivated (time passes, energy changes, shapes match, beat hit).
- Duration 6–16 frames for invisible transitions; longer only for dramatic moments.
- Easing is mandatory: `ease`, `sCurve`, `out`, `in` or `bezier(...)`. Linear is refused by `transition()` unless explicitly asked.
- Motion blur on moving transitions (whip, zoom, split, depth, matte, speed ramp).
- Overlap is automatic: put shots in `<TransitionSeries>` and insert `transition(kind)`; a `null` result means a clean cut (no transition element).
- Audio: put a whoosh/hit SFX cue on the transition frame in `script.json` (or use the beats from `tools/beats.py`).
