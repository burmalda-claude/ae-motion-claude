# ae-motion

[Русский](README.ru.md) | **English**

A [Claude Code](https://claude.com/claude-code) plugin that teaches Claude to make videos that look like After Effects work — without After Effects. Videos are built in code with [Remotion](https://www.remotion.dev/) (React); the plugin turns a one-line prompt into a finished, AE-quality video: Claude directs it (script, pacing, theme) and builds it from a ready component kit, themes, fonts and editing rules.

## What's inside

One skill, `motion-design`, which Claude loads on its own when you ask for a video, intro, titles, promo, reels and so on. You write one line — Claude acts as director, motion designer, editor and sound designer.

| Part | What it does |
|---|---|
| **Director mode** (`references/director.md`) | Turns a short prompt into a full brief without a questionnaire: format, length, theme by topic, language, script as short beats, then builds |
| **Voice + sound engine** (`tools/build.py`, `tools/sound.py`) | One command turns `script.json` into: neural voice-over per line (Edge TTS, default Brian Multilingual — expressive, clean Russian) with **per-word frame timings**, a broadcast voice chain, synthesized SFX on word cues, an arranged 123-BPM music bed with sections, sidechain pumping and ducking, mastered to −14 LUFS. Mix targets measured from a top reference |
| **23 synthesized SFX** | impact, hit, sub thump, boom, whoosh, swish-in, zoom, riser, reverse swell, light-saber slash, glitch, type-on, click, key, pop, shimmer, ding, tick, shutter, stutter, tape stop… No samples, no licenses |
| **Component kit** (`kit/`) | 70+ Remotion components: kinetic text, zoom-blur, warp streaks, speed lines, light slashes, camera, transitions, AE-style UI mocks, voice timeline |
| **Reference trailer** (`examples/Trailer.tsx`) | A voiced 86-second, 45-shot kinetic trailer in Russian, rebuilt shot-for-shot after studying every frame and the audio of a top tech promo — the quality bar |
| **Reference breakdown** (`references/reference-breakdown.md`) | That study as a pattern library: what every beat does and which component makes it |
| **Editing grammar / themes / fonts / effects** | Rhythm, cut types, shot vocabulary; 14 themes; ~23 font pairings; raw AE → Remotion recipes |

### Kit components

| Group | Components |
|---|---|
| Voice & sound | `layoutBeats` (shot length = spoken line), `VoiceTimeline` (shots + voice + SFX + ducked music), `Sfx`, `TypingSfx`, `Captions` (TikTok word captions) |
| Kinetic | `ZoomIn` (radial zoom blur), `WarpStreaks`, `SpeedLines`, `Slash` (light saber), `Pops`, `ScrollStack` (vertical camera through lines), `Wobble`, `WeightShift`, `Scatter`, `MorphShape`, `RepeatStretch`, `DiagonalBand`, `GlowPill`, `LightSweep` |
| Text | `Fit`, `SlamText`, `WhipIn`, `Letters` (rise / pop / drop / blur), `Words`, `MaskReveal`, `Typewriter`, `Counter`, `Outline`, `Extrude` (3D), `EchoStack`, `Stretch`, `Glitch`, `Highlight`, `Underline`, `CheckerText`, `TerminalLine`, `GradientText`, `punch()` |
| Effects | `Smear` (directional blur), `Glow`, `Grain`, `Vignette`, `Scanlines`, `DotGrid`, `Orb`, `Bokeh`, `LightStreak`, `Sparks`, `Sparkle`, `Starburst`, `Shockwave`, `Cube3D`, `Viewfinder`, `HudRing`, `Letterbox`, `Flash`, `Bulb` |
| Camera | `Camera` (push-in, drift, impact shakes, roll), `Parallax`, `Tilt3D` |
| Transitions | `whip()`, `zoomThrough()`, `zoomBlur()`, `streak()`, `slices()` + official fade / slide / wipe / flip / clock wipe |
| AE-style UI | `CompGrid`, `TransformBox`, `LayerBars`, `KeyLanes`, `GraphCurve`, `EchoTower`, `Timeline`, `RenderBar`, `Ruler`, `Filmstrip`, `PlayerMock`, `PromptBox`, `ChatCard`, `NodeGraph`, `Cursor` |

## Styles (themes)

Name a theme in your request (or don't — Claude picks one by topic) — Claude uses its palette, fonts and motion character for the whole video.

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
| **Kinetic Red** | AI/tech launches, trailers | Archivo Black + Oswald + Playfair italic | black / paper / red `#FF2A3D`, hard flips | 4–24 frame shots, slams, whips, glitch, logo hit with streak + sparks, mock UI |
| **Brutalist Mono** | design studios, portfolios | Archivo Black + Space Grotesk | white, black, blue | hard snaps, oversized cropped type, grid and labels |
| **Acid Hype** | drops, music, streetwear | Unbounded + Dela Gothic One | black, acid green, hot pink | strobing color flips, stretch, echo stacks, heavy shake |
| **Anime Impact** | gaming, anime edits | Dela Gothic One + Russo One | white/black, red, yellow | speed lines, impact frames, starbursts, zoom punches |

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
| Kinetic trailer | Archivo Black (Cyrillic: Dela Gothic One, Unbounded) | Oswald ✅ / JetBrains Mono ✅ |
| Heavy display | Dela Gothic One ✅ | Inter ✅ |
| Tech squared | Russo One ✅ | Exo 2 ✅ |
| Tall condensed | Big Shoulders Display (Cyrillic: Oswald) | Inter ✅ |
| Fashion grotesk | Syne (Cyrillic: Manrope) | Inter ✅ |
| Wide techno | Michroma (Cyrillic: Unbounded) | Space Grotesk |
| Soft italic accent | Playfair Display italic ✅ | — |

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

You need Node.js and Python 3 (`pip install edge-tts numpy scipy librosa imageio-ffmpeg`). Claude sets up the Remotion project and installs packages itself. Voice-over needs internet (Edge TTS); without it a robotic offline Windows voice is used.

## Example

> Make a 15-second Reels promo in the Neon Cyber style: "New collection. Available now."

Claude picks the theme, writes the voice script, generates the voice-over with word timings, synthesizes SFX and a beat, builds every shot synced to the spoken words, checks stills and renders the mp4.

## Structure

```
ae-motion-claude/
├── .claude-plugin/marketplace.json
└── plugins/ae-motion/
    ├── .claude-plugin/plugin.json
    └── skills/motion-design/
        ├── SKILL.md
        ├── kit/            ← easing, text, fx, kinetic, camera, transitions, ui, audio (+ index.ts)
        ├── tools/          ← build.py (script → voice, timing, SFX, music, master), sound.py (synths, DSP)
        ├── examples/       ← Trailer.tsx + trailer-script.json, KineticPromo.tsx, Showcase.tsx
        └── references/{director,editing,reference-breakdown,themes,fonts,effects}.md
```

## Fonts

Google Fonts (SIL Open Font License), not included in the repository.
