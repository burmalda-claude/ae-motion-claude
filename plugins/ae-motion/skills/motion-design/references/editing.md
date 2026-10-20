# Editing grammar (kinetic / AE-style)

## Rhythm
- Cut on a grid. @30fps: 120 BPM = 15 frames per beat, 8th notes = 7.5. Shot lengths 4, 6, 8, 12, 15, 24, 30 frames.
- Accelerate toward the climax (24 → 15 → 8 → 4 frames), then a long calm hold for the logo.
- Every 3–5 shots, change something big: background color, scale (huge word → small UI), or direction.

## Cut types (cheapest → fanciest)
| Cut | How | When |
|---|---|---|
| Hard cut + color flip | next shot has inverted bg (black → red → white) | default for kinetic; feels like a transition by itself |
| Smash cut with slam | next word `SlamText` from scale 2.4 + `Camera hits={[0]}` | emphasis |
| Whip | `whip({direction})` presentation, 8–12f | change of topic |
| Zoom-through | `zoomThrough()` 10–14f | going "into" an idea or UI |
| Slices | `slices()` 10f | tech / glitchy |
| Flash | `<Flash />` at frame 0 of incoming shot | logo hits, drops |
| Match cut | same word/shape in same position across shots, only style changes | repeating hero word |
| Mask wipe | `clipPath` circle/inset on the incoming shot | calmer themes |

## Shot vocabulary (mix at least 4 per video)
1. **Slam word** — one huge word, fills 70–90 % width. `SlamText`.
2. **Stack** — 2–4 lines, different sizes/weights, one accent line. `Words` / `MaskReveal` per line.
3. **Letters drop / pop** — `Letters mode="drop"` for playful, `"blur"` for elegant.
4. **Stretch / smear** — `Stretch`, `WhipIn`.
5. **Outline + solid** — the same word hollow above, solid below. `Outline` + `Extrude`.
6. **Echo stack** — `EchoStack` for lists ("LAYERS. KEYFRAMES. GRAPH EDITOR.").
7. **Glitch word** — `Glitch` for 4–8 frames on cuts.
8. **Badge / highlight** — word in a colored box `Highlight`, or pill with glow.
9. **Shape hit** — `Starburst`, `Shockwave`, `Cube3D`, circle wipe behind text.
10. **Logo reveal** — `LightStreak` → `Sparks` + `Shockwave` + `Flash` → glowing logo, `Bokeh` around.
11. **UI demo** — `PromptBox`, `Timeline`, `NodeGraph`, `RenderBar`, `PlayerMock`, `Cursor`.
12. **HUD / camera** — `Viewfinder`, `HudRing` with a typed caption.
13. **Counter** — big number rolling up (`Counter`) for stats.
14. **Photo / footage** — Ken Burns + grain; or footage inside text (track matte).

## Layout
- Kinetic: text centered or hard-left with 6–8 % margin. Mixed sizes in one stack: 1 huge, 1 medium, 1 small caps label.
- Vertical 9:16: words stacked, max 8–10 characters per line at full size; keep the bottom 20 % and top 10 % clear.
- Overlap elements: a shape partially behind a word, a word partly off-frame — it feels designed.

## Accent and color
- One accent color, used on ≤ 1 word per shot plus small details (dots, lines, cursor).
- Punctuation as design: a colored period after a word ("OKAY.") is a cheap signature move.

## Sound design (if audio exists)
- Whoosh on whips, hit/boom on slams and logo, click on UI presses, riser before the reveal.
- Put SFX in `public/sfx/` and place `<Audio>` inside the shot's `Sequence` at the hit frame.
