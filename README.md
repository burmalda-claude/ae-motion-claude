# ae-motion

[Русский](README.ru.md) | **English**

A [Claude Code](https://claude.com/claude-code) plugin that teaches Claude to make videos that look like After Effects work — without After Effects. Videos are built in code with [Remotion](https://www.remotion.dev/) (React); the plugin gives Claude the taste: fonts, themes, animation principles and code equivalents of AE effects.

## What's inside

One skill, `motion-design`, which Claude loads on its own when you ask for a video, intro, titles, promo, reels and so on.

| File | Contents |
|---|---|
| `SKILL.md` | Workflow (theme → storyboard → scenes → polish), rules for professional-looking motion, polish checklist, video formats |
| `references/fonts.md` | ~16 Google Fonts pairings by style, with Cyrillic support marked. Fonts load via `@remotion/google-fonts` — nothing to download |
| `references/themes.md` | 10 ready themes: Clean Tech, Neon Cyber, Bold Promo, Swiss, Luxury, Y2K, SaaS Gradient, Playful, Cinematic, Terminal — palette + fonts + motion character |
| `references/effects.md` | AE effects → Remotion code: Easy Ease, spring overshoot, per-letter animation, motion blur, Glow, wiggle/shake, parallax and 3D, Trim Paths, masks and mattes, grain, vignette, glitch, transitions, Lottie, beat sync |

## Styles (themes)

Name a theme in your request — Claude uses its palette, fonts and motion character for the whole video.

| Theme | Good for | Fonts | Palette | Motion |
|---|---|---|---|---|
| **Clean Tech** | product launches, Apple-like | Inter | black, gray, blue `#2997FF` | smooth and slow, blur-in reveals, gentle camera push-in |
| **Neon Cyber** | gaming, tech, cyberpunk | Orbitron + Exo 2 | dark navy, neon cyan/pink/lime | snappy, glow, glitch on cuts, scanlines, grid floor |
| **Bold Promo / Sport** | promos, sport, sales | Unbounded + Montserrat | black, white, red, yellow | aggressive: overshoot, hard slides, camera shake, beat cuts |
| **Swiss / Minimal** | infographics, editorial | Inter / Manrope | paper beige, black, red | grid-based, mask reveals, lots of whitespace |
| **Luxury / Fashion** | fashion, premium, jewelry | Cormorant Garamond + Raleway | near-black, cream, gold | very slow, letter-by-letter fades, drawn gold lines, grain |
| **Retro Y2K / Vaporwave** | retro, music, memes | Rubik Mono One + Press Start 2P | purple, pink-lilac-teal gradient | bouncy springs, chrome text, VHS noise, RGB split |
| **Soft Gradient SaaS** | startups, apps, IT products | Space Grotesk + Inter | dark bg, blurred color blobs | floating blobs, glass cards, UI sliding in with springs |
| **Playful / Kids** | social, kids, light content | Nunito + Rubik | cream, bright red/teal/yellow/purple | squash & stretch, big overshoot, pop-ins, stickers |
| **Cinematic / Documentary** | documentaries, stories, trailers | Playfair Display + Lora | black, off-white, ochre | Ken Burns on photos, 2.39:1 letterbox, fades through black, heavy grain |
| **Terminal / Hacker** | dev, code, IT tutorials | JetBrains Mono | GitHub dark, green, blue | typewriter with cursor, line-by-line reveals, CRT flicker |

## Fonts by style

All Google Fonts, loaded automatically. ✅ = Cyrillic supported.

| Style | Headline | Body |
|---|---|---|
| Clean tech | Inter ✅ | Inter ✅ |
| Modern geometric | Manrope ✅ | Manrope ✅ |
| Bold promo / sport | Unbounded ✅ | Montserrat ✅ |
| Condensed impact | Oswald ✅ | Roboto ✅ |
| Huge poster display | Anton / Bebas Neue (Cyrillic: Oswald, Russo One) | Inter ✅ |
| Futuristic / gaming | Orbitron | Exo 2 ✅ |
| Startup / product | Space Grotesk | IBM Plex Sans ✅ |
| Editorial / luxury | Playfair Display ✅ | Lora ✅ |
| Elegant serif | Cormorant Garamond ✅ | Raleway ✅ |
| Rounded friendly | Nunito ✅ | Nunito ✅ |
| Playful | Rubik ✅ | Rubik ✅ |
| Retro / Y2K | Rubik Mono One ✅ | Press Start 2P ✅ |
| Handwritten accent | Caveat ✅ | — |
| Marker / brush | Permanent Marker (Cyrillic: Neucha, Marck Script) | — |
| Code / terminal | JetBrains Mono ✅ | JetBrains Mono ✅ |

## Effects

| After Effects | What you get |
|---|---|
| Easy Ease, ease-out, Overshoot | smooth keyframes and bounces instead of linear motion |
| Text Animator | per-letter and per-word reveals, mask rise, typewriter, number counter, tracking |
| Motion Blur, Echo | motion blur and ghost trails |
| Glow / Deep Glow | neon glow on text and shapes, pulsing |
| Wiggle, Camera Shake | jitter and impact shake |
| 3D Camera, Parallax | camera push-in, layer parallax, 3D rotations |
| Trim Paths, Shape Morph | line drawing, shape morphing, ready shapes (star, circle, etc.) |
| Masks, Track Matte | wipes, iris reveal, video inside text, feathered masks |
| Noise / Grain, Vignette, Scanlines, Letterbox | film grain, vignette, scanlines, cinema bars |
| Glitch, RGB Split | glitch, chromatic aberration, slice glitch |
| Backgrounds | animated gradients, blurred blobs, synthwave grid floor, glass cards |
| Transitions | fade, slide, wipe, flip, clock wipe, plus zoom-through, whip pan, flash |
| Time Remap | speed up / slow down footage |
| Lottie (Bodymovin) | real AE animations and LottieFiles |
| Audio Spectrum | music-reactive motion (bass drives scale/glow), cuts on beats |

## Formats

| Where | Size | FPS |
|---|---|---|
| Reels / Shorts / TikTok | 1080×1920 | 30 or 60 |
| YouTube | 1920×1080 | 30 or 60 |
| Square post | 1080×1080 | 30 |

## Installation

```bash
claude plugin marketplace add burmalda-claude/ae-motion-claude
claude plugin install ae-motion@ae-motion-local
```

Or from a local folder: `claude plugin marketplace add ./ae-motion-claude`.

You need a Remotion project (`npx create-video@latest`) and Node.js. Extra packages (`@remotion/transitions`, `@remotion/motion-blur`, etc.) Claude installs as needed.

## Example

> Make a 15-second Reels promo in the Neon Cyber style: "New collection. Available now."

Claude picks the theme, writes the scene list, builds the composition with transitions, glow and grain, and renders preview stills.

## Structure

```
ae-motion-claude/
├── .claude-plugin/marketplace.json
└── plugins/ae-motion/
    ├── .claude-plugin/plugin.json
    └── skills/motion-design/
        ├── SKILL.md
        └── references/{fonts,themes,effects}.md
```

## Fonts

Google Fonts (SIL Open Font License), not included in the repository.
