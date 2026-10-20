---
name: motion-design
description: Make videos that look like After Effects / Alight Motion work, using Remotion (React). Use when the user asks for a motion-design video, promo, intro, title animation, kinetic typography, reels/shorts edit, lower thirds, explainer, or "make it look like After Effects". Provides font pairings, visual themes, and code equivalents of AE effects (easing, motion blur, glow, grain, shake, trim paths, masks, transitions).
---

# Motion design (After Effects look, Remotion engine)

Remotion API details live in the `remotion:*` skills if installed — this skill is about **taste**: what to pick so the result looks designed, not default.

## Workflow

1. **Pick a theme** from `references/themes.md` (or ask the user for a vibe in one line). The theme fixes palette, fonts and motion character. Stick to it for the whole video.
2. **Storyboard** in scenes of 1.5–4 s. One idea per scene. Write the scene list before coding.
3. **Build** each scene as its own component inside `<TransitionSeries>`; animate with the recipes in `references/effects.md`.
4. **Polish pass** (the part that makes it look like AE) — run the checklist below.
5. Render a still of key frames (`npx remotion still`) and look at it before the full render.

## Rules that make it look professional

- **Never linear motion.** Use Easy Ease (`Easing.bezier(0.33, 0, 0.67, 1)`), strong ease-out for entrances (`Easing.bezier(0.16, 1, 0.3, 1)`), or `spring()`. Linear only for constant drift/rotation.
- **Stagger everything.** Letters 1–2 frames apart, list items 3–5 frames apart. Nothing important appears all at once.
- **Overlap.** The next element starts moving before the previous one finishes (offset 30–60 % of its duration).
- **Animate 2–3 properties together**: position + opacity + blur/scale. A pure fade looks cheap.
- **Entrances fast, exits faster**: in 12–20 frames, out 8–12 frames (at 30 fps).
- **Always some life on screen**: slow camera push-in (scale 1 → 1.05 over the scene), drifting background gradient, or grain. Never a frozen frame.
- **Depth**: 3 layers minimum — background (gradient/texture), midground (shapes), foreground (text). Parallax them at different speeds.
- **Type**: max 2 font families per video. Headlines big (8–14 % of frame height), tight letter-spacing (-0.02em) for sans, generous for all-caps (0.1em+).
- **Safe areas**: keep text inside 90 % of the frame; for 9:16 keep the bottom 20 % clear (UI overlays).
- **Sync to audio**: cut and hit accents on beats if there is music (see audio section in effects.md).

## Polish checklist

- [ ] Motion blur on fast moves (`CameraMotionBlur`)
- [ ] Film grain or subtle noise overlay (2–6 % opacity)
- [ ] Vignette
- [ ] At least one non-fade transition between scenes
- [ ] Easing on every keyframe, overshoot on at least the hero element
- [ ] Colors only from the chosen theme palette

## Formats

| Use | Size | fps |
|---|---|---|
| Reels / Shorts / TikTok | 1080×1920 | 30 or 60 |
| YouTube | 1920×1080 | 30 or 60 |
| Square post | 1080×1080 | 30 |

## Packages to install as needed

`@remotion/google-fonts @remotion/transitions @remotion/motion-blur @remotion/noise @remotion/paths @remotion/shapes @remotion/layout-utils @remotion/lottie @remotion/media-utils` — install with `npx remotion add <pkg>` (keeps versions matched to the project's Remotion version).

## References

- `references/fonts.md` — Google Fonts pairings by style, loaded with `@remotion/google-fonts` (no downloads).
- `references/themes.md` — ready themes: palette + fonts + motion character.
- `references/effects.md` — AE effect → Remotion code recipes.
