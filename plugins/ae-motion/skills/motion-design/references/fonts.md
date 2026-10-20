# Fonts

All fonts are Google Fonts (free, OFL), loaded at render time — never download font files:

```tsx
import { loadFont } from "@remotion/google-fonts/Unbounded";
const { fontFamily } = loadFont("normal", { weights: ["700", "900"], subsets: ["latin", "cyrillic"] });
```

Import path = font name without spaces (`"Space Grotesk"` → `@remotion/google-fonts/SpaceGrotesk`). Load only the weights you use. For Russian text pick fonts marked **Cyr**.

## By role

| Style | Headline | Body / UI | Cyr |
|---|---|---|---|
| Clean tech (Apple-like) | Inter (700–900) | Inter (400–500) | yes |
| Modern geometric | Manrope 800 | Manrope 500 | yes |
| Bold promo / sport | Unbounded 800–900 | Montserrat 500 | yes |
| Condensed impact | Oswald 700 | Roboto 400 | yes |
| Huge display, poster | Anton | Inter | no (Cyr: Oswald / Russo One) |
| Bebas look | Bebas Neue | Montserrat | no (Cyr: Oswald) |
| Futuristic / gaming | Orbitron 800 | Exo 2 500 | Exo 2 only |
| Startup / product | Space Grotesk 700 | IBM Plex Sans 400 | Plex yes |
| Editorial / luxury | Playfair Display 700 italic | Lora 400 | yes |
| Elegant serif | Cormorant Garamond 600 | Raleway 400 | yes |
| Rounded friendly | Nunito 900 | Nunito 600 | yes |
| Comic / playful | Rubik 800 | Rubik 500 | yes |
| Retro / Y2K | Rubik Mono One | Press Start 2P (accents) | Rubik Mono yes, Press Start yes |
| Handwritten accent | Caveat 700 | — | yes |
| Brush / marker accent | Permanent Marker | — | no (Cyr: Neucha, Marck Script) |
| Code / terminal | JetBrains Mono 700 | JetBrains Mono 400 | yes |
| Kinetic trailer (wide heavy) | Archivo Black | Oswald 700 / JetBrains Mono | Archivo Black no (Cyr: Dela Gothic One, Russo One, Unbounded) |
| Heavy Japanese-style display | Dela Gothic One | Inter | yes |
| Tech squared | Russo One | Exo 2 | yes |
| Tall condensed headline | Big Shoulders Display 900 | Inter | no (Cyr: Oswald) |
| Art-directed / fashion grotesk | Syne 800 | Inter | no (Cyr: Manrope) |
| Wide techno | Michroma | Space Grotesk | no (Cyr: Unbounded) |
| Soft italic accent line | Playfair Display italic | — | yes |

## Typography numbers that look good

- Headline line-height 0.9–1.0, body 1.3–1.4.
- Big sans headlines: `letterSpacing: "-0.03em"`; ALL CAPS labels: `letterSpacing: "0.12em"`, small size, 60–70 % opacity.
- Fit a word to width: `fitText({ text, withinWidth, fontFamily, fontWeight })` from `@remotion/layout-utils` (call after the font has loaded).
- Outline text: `WebkitTextStroke: "3px #fff", color: "transparent"`.
- Gradient text: `background: "linear-gradient(...)", WebkitBackgroundClip: "text", color: "transparent"`.
