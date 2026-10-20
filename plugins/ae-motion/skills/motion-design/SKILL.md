---
name: motion-design
description: Turn a short prompt into a polished After Effects-style video with Remotion (React). Use when the user asks for any video, promo, ad, intro, outro, trailer, title animation, kinetic typography, reels/shorts/TikTok edit, lower thirds, logo reveal, explainer, or says "like After Effects / Alight Motion". Includes a ready component kit (slam/whip/stretch/glitch text, glow, grain, particles, light streaks, sparks, starbursts, camera shake, whip/zoom/slice transitions, mock UI like prompt box, timeline, node graph, render bar), a director workflow, editing grammar, 14 themes and font pairings.
---

# Motion design: prompt → After Effects-quality video

You are the motion designer **and** the director. The user gives one line; you decide format, script, theme, pacing and effects, then build it with the kit. Remotion API details live in the `remotion:*` skills if installed — this skill is about taste and speed.

## Workflow

1. **Direct** — read `references/director.md`. Extract the brief, pick a theme (`references/themes.md`) and fonts (`references/fonts.md`), write the beat list. Print a 3–5 line plan. Don't interrogate the user; ask at most one question and only for a real blocker.
2. **Set up the project** (if there is none):
   - `npx create-video@latest` → Blank template, then `npm i`.
   - Copy `kit/` from this skill into `src/kit/` (all files). Copy `examples/KineticPromo.tsx` only if useful as a starting point.
   - Install what the kit uses: `npx remotion add @remotion/google-fonts @remotion/transitions @remotion/noise @remotion/paths` (plus `@remotion/motion-blur`, `@remotion/lottie`, `@remotion/media-utils` if needed).
3. **Build** — one small component per shot, a `SHOTS: [Component, frames][]` table, `<Series>` (hard cuts) or `<TransitionSeries>` (with `whip()`, `zoomThrough()`, `slices()`, or official `fade/slide/wipe`). Follow `references/editing.md` for rhythm and shot variety. Use `references/effects.md` for anything the kit doesn't cover.
4. **Check** — `npx remotion still <Id> --frame=<n> out/check-<n>.png` on 3–4 key frames (hook, logo hit, busiest shot, end). Look at them with the Read tool. Fix overflow, unreadable text, empty frames, wrong fonts.
5. **Render** — `npx remotion render <Id> out/video.mp4` (add `--concurrency=50%` on weak PCs). Tell the user where the file is.

## The kit (`kit/`, import from `./kit`)

| File | Components |
|---|---|
| `easing.ts` | `EASE` (easy, out, in, inOut, back), `prog`, `pop`, `mix`, `envelope`, `beatFrames`, `clamp` |
| `text.tsx` | `SlamText`, `WhipIn`, `Letters` (rise/pop/drop/blur), `Words` (with accent words), `MaskReveal`, `Typewriter` (highlighted tokens), `Counter`, `Outline`, `Extrude` (3D), `EchoStack`, `Stretch`, `Glitch`, `Highlight`, `Underline`, `CheckerText`, `punch()` |
| `fx.tsx` | `Smear` (directional blur), `Glow`, `Grain`, `Vignette`, `Scanlines`, `DotGrid`, `Orb`, `Bokeh`, `LightStreak`, `Sparks`, `Starburst`, `Shockwave`, `Cube3D`, `Viewfinder`, `HudRing`, `Letterbox`, `Flash` |
| `camera.tsx` | `Camera` (push-in, drift, `hits` shakes, roll), `Parallax`, `Tilt3D` |
| `transitions.tsx` | presentations `whip()`, `zoomThrough()`, `slices()` for `<TransitionSeries>` |
| `ui.tsx` | `PromptBox`, `Timeline`, `RenderBar`, `NodeGraph`, `Cursor`, `PlayerMock` |

All animation props are in **frames relative to the shot** (`delay`, `dur`, `hits`). Components read `useCurrentFrame()`, so they restart inside each `Series.Sequence`.

`examples/KineticPromo.tsx` is a complete 15-shot reference in the Kinetic Red style — read it before building a kinetic video; match its density.

## Rules that separate "AE" from "PowerPoint"

- **Nothing linear** except constant drift. Entrances `EASE.out` or springs, exits `EASE.in`, camera `EASE.inOut`.
- **Animate 2–3 properties at once**: position + scale + blur/opacity. Fast moves get `Smear`/motion blur.
- **Stagger and overlap**: letters 1–2 f, words 3–5 f, elements start before the previous one ends.
- **Every shot has life**: `Camera` push or drift, particles, pulsing glow. No frozen frames.
- **Depth**: background texture (grid/orb/gradient) → mid (shapes, UI) → foreground (type) → overlays (grain, vignette).
- **Variety**: ≥ 4 different shot types per video (see editing.md). Same animation twice in a row = boring.
- **Pace**: kinetic promos 4–24 f per shot; calm themes 45–90 f. Hold the final logo/CTA ≥ 1.5 s.
- **Type**: ≤ 2 families + mono for UI. Huge headlines (fill 70–90 % width), tight tracking. Check Cyrillic support.
- **Safe areas**: 9:16 — keep text out of the top 10 % and bottom 20 %.

## Polish checklist (run before rendering)

- [ ] Hook in the first 1 s, logo/CTA held at the end
- [ ] Grain + vignette on the whole composition
- [ ] Camera movement or shake in every shot
- [ ] Motion blur/smear on whips and fast slides
- [ ] At least one logo-hit moment (streak + sparks + flash + glow)
- [ ] Accent color only on 1 word per shot
- [ ] Stills checked: no text overflowing the frame, no blank frames

## Formats

| Use | Size | fps |
|---|---|---|
| Reels / Shorts / TikTok | 1080×1920 | 30 (60 for very fast edits) |
| YouTube / presentation | 1920×1080 | 30 or 60 |
| Square | 1080×1080 | 30 |

## Limits (be honest with the user)

Remotion renders HTML/CSS/SVG/WebGL. Real 3D scenes need `@remotion/three` (three.js); particles here are 2D; there is no optical-flow time remap or AI rotoscoping. For effects beyond the kit, prefer Lottie exports from AE (`@remotion/lottie`) or footage in `public/`.

## References

- `references/director.md` — prompt → brief → beat list, defaults, theme by topic.
- `references/editing.md` — rhythm, cut types, 14 shot types, layout, sound design.
- `references/themes.md` — 14 themes: palette + fonts + motion character.
- `references/fonts.md` — Google Fonts pairings, Cyrillic support.
- `references/effects.md` — raw AE effect → Remotion recipes (for things outside the kit).
