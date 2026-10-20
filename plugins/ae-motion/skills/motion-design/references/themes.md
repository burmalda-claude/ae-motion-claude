# Themes

Each theme = palette + fonts + motion character. Pick one per video. `bg` → `surface` → `text` → `accent` order; accent ≤ 10 % of the frame.

## 1. Clean Tech (Apple keynote)
- Palette: bg `#000000`, surface `#1D1D1F`, text `#F5F5F7`, muted `#86868B`, accent `#2997FF`
- Fonts: Inter 800 / Inter 400
- Motion: slow, smooth. Ease-out `bezier(0.16,1,0.3,1)`, 20–30 frame entrances, blur 20px→0 on reveal, slow 1.05 push-in. No shake, no glitch.

## 2. Neon Cyber
- Palette: bg `#0A0A14`, surface `#151528`, text `#E8E8FF`, accent `#00F0FF`, accent2 `#FF2BD6`, accent3 `#B4FF39`
- Fonts: Orbitron 800 / Exo 2 500
- Motion: snappy (8–12 frame entrances), glow on text and lines, glitch/RGB-split on cuts, scanlines overlay, grid floor with perspective.

## 3. Bold Promo / Sport
- Palette: bg `#111111`, text `#FFFFFF`, accent `#FF3B1F`, accent2 `#FFD400`
- Fonts: Unbounded 900 / Montserrat 500 (or Oswald 700 for condensed)
- Motion: aggressive. Spring overshoot (damping 10), hard slides, camera shake on hits, speed ramps, text filling the whole frame, quick 4–6 frame cuts on beats.

## 4. Swiss / Minimal Editorial
- Palette: bg `#F2F0EB`, text `#111111`, accent `#E63312`
- Fonts: Inter 700 (or Manrope 800) / Inter 400
- Motion: grid-based, mask reveals (text slides up from behind a line), linear-ish precise moves with Easy Ease, lots of whitespace, no glow.

## 5. Luxury / Fashion
- Palette: bg `#0E0D0B`, text `#F3EDE2`, accent `#C9A96E` (gold)
- Fonts: Cormorant Garamond 600 italic / Raleway 400 tracking 0.2em caps
- Motion: very slow (40–60 frame fades with blur), letter-by-letter opacity, thin gold lines drawing (trim path), grain 4 %.

## 6. Retro Y2K / Vaporwave
- Palette: bg `#1B0B3A`, gradient `#FF6EC7 → #7873F5 → #4ADEDE`, text `#FFFFFF`, accent `#FFE45E`
- Fonts: Rubik Mono One / Press Start 2P accents
- Motion: bouncy springs, chrome/gradient text, rotating stars and shapes, VHS noise, chromatic aberration.

## 7. Soft Gradient SaaS
- Palette: bg `#0B1020`, gradient blobs `#6366F1`, `#EC4899`, `#22D3EE` (blurred 120px), text `#FFFFFF`, muted `#94A3B8`
- Fonts: Space Grotesk 700 / Inter 400
- Motion: floating blurred blobs (noise-driven drift), glassmorphism cards (`backdropFilter: blur(20px)`, white 8 % bg, 1px white 15 % border), UI mockups sliding in with spring.

## 8. Playful / Kids / Social
- Palette: bg `#FFF6E5`, text `#2B2B2B`, colors `#FF6B6B #4ECDC4 #FFD93D #6C5CE7`
- Fonts: Nunito 900 / Rubik 500
- Motion: squash & stretch, big overshoot springs (damping 8), wiggle, pop-in scale 0 → 1.15 → 1, stickers with white outline.

## 9. Dark Documentary / Cinematic
- Palette: bg `#0C0C0C`, text `#EDEDED`, accent `#D4A373`
- Fonts: Playfair Display 700 / Lora 400
- Motion: Ken Burns on photos (scale 1→1.15 + slight pan over 5 s), letterbox bars 2.39:1, slow fades through black, heavy grain 6 %, vignette.

## 10. Terminal / Hacker
- Palette: bg `#0D1117`, text `#C9D1D9`, accent `#3FB950`, accent2 `#58A6FF`
- Fonts: JetBrains Mono 700 / 400
- Motion: typewriter text (1 char per 1–2 frames) with blinking cursor, line-by-line reveals, subtle CRT flicker.

## 11. Kinetic Red (tech trailer)
- Palette: bg `#0B0B0D` / paper `#F1F0EE` / red `#FF2A3D` — shots flip hard between the three backgrounds. Text black on paper/red, white on dark.
- Fonts: Archivo Black (huge, uppercase, -0.03em; for Russian text use Unbounded 900 or Dela Gothic One) + Oswald 700 (condensed lines) + Playfair Display italic (one soft accent line) + JetBrains Mono (UI/labels)
- Motion: 4–24 frame shots, `SlamText`, `Stretch`, `WhipIn`, `Glitch` on cuts, camera hits, red `Orb` + `DotGrid` + `Bokeh` on dark shots, logo hit with `LightStreak` + `Sparks` + `Flash`, mock UI (prompt box, timeline, node graph, render bar). Reference: `examples/KineticPromo.tsx`.

## 12. Brutalist Mono
- Palette: bg `#FFFFFF`, text `#000000`, accent `#0047FF` (or none)
- Fonts: Archivo Black / Space Grotesk 500 / JetBrains Mono labels
- Motion: hard cuts only, no easing on position (linear snaps), oversized type cropped by the frame, grid lines, numbers and labels everywhere, invert (black bg) every 4th shot.

## 13. Acid Hype
- Palette: bg `#0A0A0A`, acid `#C6FF00`, hot pink `#FF2E93`, white
- Fonts: Unbounded 900 / Dela Gothic One for Cyrillic punch / Inter 600
- Motion: very fast (4–8 frame beats), strobing color flips acid↔black, `Stretch`, `EchoStack`, starbursts, stickers with thick outlines, heavy camera shake on drops.

## 14. Anime Impact
- Palette: bg `#FFFFFF` / `#111111`, red `#E60012`, yellow `#FFD500`
- Fonts: Dela Gothic One (supports Cyrillic) / Russo One / Noto Sans JP for kana accents
- Motion: speed lines (repeating-conic-gradient from center), impact frames (1–2 frames inverted colors), `Starburst` behind characters, `Shockwave`, zoom punches, freeze-frame + slow push.
