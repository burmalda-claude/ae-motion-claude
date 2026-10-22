# ae-motion

[Русский](README.ru.md) | **English**

A [Claude Code](https://claude.com/claude-code) plugin that teaches Claude to make videos that look like After Effects work — without After Effects. Videos are built in code with [Remotion](https://www.remotion.dev/) (React); the plugin turns a one-line prompt into a finished, AE-quality video: Claude directs it (script, pacing, theme) and builds it from a ready component kit, themes, fonts and editing rules.

## What's inside

One skill, `motion-design`, which Claude loads on its own when you ask for a video, intro, titles, promo, reels and so on. You write one line — Claude acts as director, motion designer, editor and sound designer.

| Part | What it does |
|---|---|
| **Brief + director** (`references/brief.md`, `references/director.md`) | First says what it understood and asks one round of one-click questions (frame, length, direction, sound) with its recommendation preselected; then turns the answers into a full brief: format, length, theme by topic, language, script as short beats, then builds |
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

## Brief first, then build

Before making or changing a video Claude says in 2–4 lines what it understood (subject, goal, main message, ending) and asks **one round** of up to 4 questions, each with its own recommendation preselected, so accepting everything takes one click per question:

| Question | Why it is asked |
|---|---|
| Where will it play (9:16 / 16:9 / 1:1 · 4:5) | the frame changes every shot's composition; changing it later means rebuilding everything |
| How long | length sets the beat count and the script: 15 s and 30 s are different videos |
| Direction: 3 options, each = theme + 2–3 named moves + tempo | adjectives ("dynamic") mean different things to everyone; named moves don't |
| Sound: voice + music / your track / music only / silent | voice and beats set shot lengths; changing sound later re-times the edit |
| Assets & words, or "what must not change" when editing | brands and logos can't be invented; approved parts must survive an edit |

Questions already answered by the prompt are skipped. Say "без вопросов" / "no questions" to skip the brief. Details: `references/brief.md`.

## Motion lexicon: 144 names → kit

"I can see it, but what is it called?" The lexicon gives every move a name, a live sample and the kit pieces that build it: 144 names from [motion-prompt](https://github.com/showheyohtaki/motion-prompt) (motion graphics, camera moves & cuts, UI, web effects, photo looks; MIT, © Shohei Ohtaki) plus an ae-motion layer: Russian names and requests, **mapping to kit components** (`≈` when the kit only gives a close look), energy 1–3 and the modes each move fits.

- **Gallery:** https://burmalda-claude.github.io/ae-motion-claude/ — every name animated; search in Russian / English / Japanese or by `#043`, filter by set, mode, energy or "only from the kit", open a card for the timing spec and related moves, pick several, add a note and copy a ready prompt for Claude. Source: `docs/` (GitHub Pages, no build step).
- **The rest of the plugin on the same site:** 18 modes (palette, fonts, timing, effect stack, music sections), 155 kit exports with their docs and cross-links (which modes use a piece, which lexicon names it builds), 30 transitions with a playable sound stack each, the SFX engine (52 playable synthesized sounds + genre packs), 14 themes with live type specimens, 23 font pairs, 30 commands. Generated from the plugin's own files by `python tools/site.py` (`--check` fails on stale data), so the site cannot drift from the plugin.
- **In Claude:** `/ae-motion:lexicon <description>`, or just name a move in a request; Claude searches with `tools/lexicon.py find` and uses the names in the brief's Direction options.
- **Data:** `lexicon/motion-prompt/*.json` (upstream, untouched) + `lexicon/ae.json` (our layer). `python tools/lexicon.py` validates every kit name against the real exports and regenerates `references/lexicon.md` and `docs/lexicon.json`; `--check` fails on stale outputs.

## Commands / Modes

Not sure where to start: `/ae-motion:help`.

One command = the whole stack (effects, text presets, fonts, timing, beat/audio behavior, formats). Commands are namespaced: `/ae-motion:cinematic` (plain `/cinematic` also works when no other plugin uses that name). Presets live in `skills/motion-design/modes/<id>.json`.

- **Live preview:** `npx remotion studio` (hot reload while you tweak).
- **Decompose into modifiers:** say "разобрать" / "decompose" after a command — Claude prints the stack as a numbered modifier list and saves it to `.ae-motion/modes/<id>.json` in your project for manual edits.
- **Presets export/import:** a preset is one JSON file. Export = copy it; import = drop it into `.ae-motion/modes/` (project overrides win over the built-ins). "save as preset <name>" writes the current stack.

| Command | Purpose | Auto-effects (modifiers) | Formats | Example |
|---|---|---|---|---|
| `/ae-motion:edit` | Hard short-form edit about any subject: fast cuts, beat hits, aura/glitch, voice-over. | ZoomIn, WhipIn, Slide, Glitch, Chroma, Camera(hits), SpeedLines… | 9:16, 16:9, 1:1 | 20-сек эдит про фикус с электрической аурой |
| `/ae-motion:cinematic` | Trailers, teasers, cinematic intros in three acts (setup → build → payoff). | Letterbox, Grade(cinematic), Grain(0.1), Vignette, AnamorphicFlare, LightStreak, Camera(push 0.08, slow)… | 16:9, 2.39:1 | 30-сек тизер с тремя актами (setup → build → payoff) |
| `/ae-motion:lyric` | Lyric videos, karaoke, text to music (your track). | KaraokeLine, Letters(pop), punch() on beats, EchoStack(trail), Glow on hits, Chroma, Grain | 16:9, 9:16, 1:1 | синхронный текст с подсветкой по словам |
| `/ae-motion:clip` | Cut long podcasts/interviews into Reels/Shorts clips with hooks and subtitles. | Captions, LowerThird, ProgressBar, EmojiPop, StatCard, Camera(push 0.03), punch on topic change | 9:16, 1:1 | 5 клипов по 30 сек с хуками и субтитрами |
| `/ae-motion:tutorial` | Tutorials, guides, how-tos, screen recordings. | StepBadge, Callout, HighlightBox, ZoomTo, ChapterCard, ProgressBar, Cursor… | 16:9, 9:16 | авто-разметка шагов и подсветка областей экрана |
| `/ae-motion:gym` | Motivation edits, sport, sigma content. | SlamText, StatCard, TimerDisplay, Counter(reps), Camera(hits shake 40), Flash, Chroma… | 9:16, 16:9 | 15-сек мотивашка с хуком, stat-картой и финальным quote |
| `/ae-motion:gaming` | Game highlights and frag montages (your footage + frag timecodes). | Hitmarker, KillFeed, ComboCounter, Glitch, Chroma, Scanlines, HudRing… | 16:9, 9:16 | hitmarkers и счётчики по таймкодам |
| `/ae-motion:ad` | Ads, promos, product videos. | Callout, PriceTag, CTAButton, BeforeAfter, LightStreak(logo), MaskReveal, Words… | 16:9, 9:16, 1:1, 4:5 | 15-сек продуктовый ролик с 3 фичами и CTA |
| `/ae-motion:amv` | Anime edits, AMVs, opening-style. | SpeedLines, ImpactFrame, MangaPanels, JPText, Starburst, Shockwave, Chroma… | 9:16, 16:9 | 20-сек эдит с impact-кадрами на каждый удар |
| `/ae-motion:travel` | Vlogs, travel, lifestyle. | LowerThird, MapPin, DayCounter, QuoteCard, LightLeak, Grain, Letterbox… | 16:9, 9:16, 4:5 | авто-lower-thirds с локацией и счётчиком дня |
| `/ae-motion:meme` | Memes, short jokes, reaction cuts. | MemeCaption, ZoomTo(punch-in), SlamText, Wobble(warp), Camera(shake), Wasted, EmojiPop | 9:16, 1:1 | top/bottom caption + zoom punch на ключевой фразе |
| `/ae-motion:news` | News inserts, documentaries, reports. | LowerThird, BreakingBanner, Ticker, QuoteCard, Timeline, MapPin, Grade(news) | 16:9, 9:16 | нижняя плашка с именем спикера и тикер событий |
| `/ae-motion:fashion` | Fashion edits, lookbooks, runway. | MaskReveal, Outline, Grade(fashion), Grain, Letterbox, slow motion (playbackRate 0.5), runway cut on step | 9:16, 4:5, 16:9 | лукбук с collection name и плавными переходами |
| `/ae-motion:horror` | Horror edits, creepy content, dark aesthetic. | VHS, Flicker, Glitch, Scanlines, Chroma(red/green), Grain(0.15), ImpactFrame(jumpscare)… | 9:16, 16:9 | VHS-эдит с jumpscare на 3-й секунде |
| `/ae-motion:wedding` | Weddings, anniversaries, events. | MaskReveal, QuoteCard, LightLeak, Bokeh, Grade(dream), Grain(0.04), slow motion | 16:9, 9:16, 1:1 | имя пары, дата и мягкий переход между сценами |
| `/ae-motion:realestate` | Property tours, apartment reviews. | LowerThird, PriceTag, Callout, Camera(push 0.05, drift), Parallax, ProgressBar | 16:9, 9:16 | подписи комнат и цена в углу кадра |
| `/ae-motion:asmr` | ASMR, satisfying content, slow edits. | Camera(push 0.03, drift 2), Glow(soft), Grain(0.03) | 9:16, 1:1 | минимум графики, максимум плавности |
| `/ae-motion:reaction` | Reactions, commentary, breakdowns. | PiP, CommentBubble, EmojiPop, ZoomTo(emotion), LowerThird, Captions | 16:9, 9:16 | PiP-рамка + всплывающие комментарии зрителей |

## Music & SFX

**Music is searched online, not generated** (`/ae-motion:music-find`, `references/music.md`): the genre is picked by topic and mood (edits → Brazilian / drift phonk, sad → slowed + reverb, anime → phonk / jcore, space → epic trailer, ads → upbeat corporate…), Claude shortlists 3–5 tracks, **asks before every download**, fetches with `yt-dlp`, analyzes the beat (`beats.py`) and starts the edit 1–2 bars before the drop. Generated music remains as a fallback.

**SFX engine** (`tools/sfxgen.py`, `tools/audit.py`, `references/sfx.md`): 8 categories as parametric generators (unlimited variations), 2–3 layer stacks per transition, genre packs, beat sync, AI generation (ElevenLabs if a key is set), audit for masking / clipping / phase / true peak / LUFS / beat clashes / AI artifacts. Commands: `sfx-find`, `sfx-generate`, `sfx-sync`, `sfx-layer`, `sfx-audit`, `sfx-pack`.

| Category | Examples | Source / license | Command |
|---|---|---|---|
| Whooshes & swipes | short/long, light/heavy, LR/RL/up/down, reverse; 100 variations | procedural · Pixabay/Mixkit (free) · SONNISS | `sfx-layer`, `sfx-pack` |
| Impacts & hits | snare, boom, sub drop, glass, metal; light→heavy, short/long tail | procedural · Pixabay · SONNISS | `sfx-sync`, `sfx-layer` |
| Risers & build-ups | tonal, noise, reverse, uplifter, downlifter; 0.5–8 s; ends on hit/drop/silence | procedural · ElevenLabs | `sfx-generate` |
| Ambience & room tone | room, office, street, forest, coffee shop, rain, wind; seamless loops | procedural · ElevenLabs/Stable Audio · Freesound (check license) | `sfx-generate`, `sfx-find` |
| UI & tech | click, tap, toggle, notification, hover, typing, digital; dry/wet | procedural · Mixkit | `sfx-pack tech` |
| Transition-specific | glitch burst, reverse impact, tape stop, sub drop, whiteout swell | procedural | `sfx-layer` |
| Trends 2026 | hook click/ding/pop, vine boom, boing, record scratch, wasted, phonk 808, distorted hit, cowbell, tesla arc, corrupted, sci-fi whoosh | procedural · meme voice clips via search (Pixabay/YouTube) | `sfx-pack meme/phonk/tech`, `sfx-find` |
| ASMR | soft clicks, rustle, wet | procedural | `sfx-generate` |

### Why your SFX sound cheap
1. **Layering** — one sound is thin. Whoosh on top + impact for the body + sub tail for the weight.
2. **Sync** — in the frame, not "around" it. 1–3 frames off reads as a flam (`sfx-audit` catches it).
3. **Context** — the sound matches the genre (phonk 808 for edits, dry clicks for tutorials, booms + risers for cinematic), not one universal whoosh.

### AI vs library: when to use what
- **Procedural (built-in)** — default: exact length, instant variations, no downloads.
- **AI generation** — specific real-world sounds and long ambiences; always audit (metallic / robotic artifacts).
- **Library** — iconic recordings (meme voice clips, real foley); ask before downloading, log in `CREDITS.md`.

### Credits & licenses
See `references/sfx.md` → table of every suggested source with license and commercial use (Pixabay, Mixkit, YouTube Audio Library, Freesound, SONNISS, ElevenLabs, Stable Audio, AudioGen). Downloaded tracks and sounds are logged per project in `CREDITS.md` (author, source, license, commercial use).

References: DJordanMedia · Versely · SONNISS · AEscripts AI Scorpion SFX.

Motion names, descriptions, specs and the animated samples of the lexicon: [motion-prompt](https://github.com/showheyohtaki/motion-prompt) by Shohei Ohtaki, MIT (license kept in `lexicon/motion-prompt/LICENSE` and `docs/vendor/motion-prompt/LICENSE`).

### What real edits do
`references/edits-breakdown.md`: 28 TikTok edits measured frame by frame — ~7 cuts per 10 s, half of them on audio transients, ~2 whiteout flashes per 10 s, hit shakes, zoom punches, strobe flips, halation; music 108–144 BPM, very sub-heavy. These became `kit/editfx.tsx` and the `whiteout` / `blackDip` transitions. A second pass, `tools/transscan.py`, measured all 1 148 cuts and flashes in those edits (flash up 1 f / down 4 f, black 3 f, blur 6 f, dissolves only 4 f, an event every 8 f) and added 11 edit staples to the engine: `punchIn`, `exposure`, `invertCut`, `threshold`, `shrinkPop`, `push`, `pixelate`, `tvOff`, `hueShift`, `stutter`, `card` (demo: `examples/EditCuts.tsx`, 9:16).

## Transitions

A separate engine (`kit/cuts.tsx`, rules in `references/transitions.md`): a transition should disappear into the cut and serve the emotion of the shot. 5 categories (Cut, Dissolve, Wipe & Reveal, Speed Ramp, Atmospheric) + 2026 trend presets (morph text, liquid, kinetic split, 2D/3D depth, glitch/dark phonk). Every transition has controls: duration (6–16 f for invisible ones), easing (Ease / Bezier / S-curve — linear is refused by default), motion blur on moving transitions, automatic overlap (`<TransitionSeries>`), audio sync (`tools/beats.py` → beats, downbeats, hits, energy). `pickTransition()` chooses from shot energy, BPM and intent — the clean cut first.

| Command | Category | Duration (frames) | Easing | Audio | Example |
|---|---|---|---|---|---|
| `/ae-motion:transition` | all | per cut | per kind | SFX on every transition frame | pick + place transitions for every cut of the video |
| `/ae-motion:transition clean` | Cut | 0 (dissolve 10 if the cut jumps) | — | thump on the cut | clean cut, dissolve only if the cut does not read |
| `/ae-motion:transition dissolve` | Dissolve | 6–12 | Ease | soft whoosh | cross / blur / 100→103% scale dissolve |
| `/ae-motion:transition wipe` | Wipe & Reveal | 12–14 | Ease | swish into the edge | circle/diagonal/panel, eye → moon match cut, track matte; always with an edge |
| `/ae-motion:transition speedramp` | Speed Ramp | ramp 12 | S-curve | whoosh on the cut | 100% → 45% → cut → 45% → 100%, no effect |
| `/ae-motion:transition beat` | any, on beats | 6–16 | per kind | beats.py: beats / downbeats / hits | beat analysis first, transitions centered on beats |
| `/ae-motion:transition morph` | Trend: morph text | 12–16 | S-curve | swish | letters melt into letters (MorphText) + liquid |
| `/ae-motion:transition glitch` | Atmospheric / phonk | 4–8 | Ease | glitch + impact on the hit | RGB split + slices + VHS + 1-frame invert |
| `/ae-motion:transition random` | smart | per kind | per kind | BPM + energy per beat | chooses by shot energy & BPM, never the same twice in a row |
| `/ae-motion:transition edit` | Edit staples (measured) | 3–10 | per kind | impact on the cut frame | punch-in, exposure flash, invert / 1-bit frames, shrink-pop, push, pixelate, TV-off, hue sweep, stutter, card |
| `/ae-motion:trans-plan` | Planner (measured) | per kind | per kind | sfx per cut | `tools/transplan.py`: cuts on onsets, bursts of 2–5 of one kind, black + flash on the drop, camera life (`EditCam`) on every hit cut |
| `/ae-motion:trans-learn` | Analysis | — | — | — | scan your reference edits (`tools/transscan.py`): every cut measured, review strips, mapped to kinds |

### Why your transitions look cheap
1. **Overlap.** A transition needs frames from both shots; without overlap it flashes or freezes. The engine overlaps automatically — plan shot lengths with it in mind.
2. **Restraint.** The clean cut is the best transition. One effect per 5–10 cuts, never the same twice in a row, 6–16 frames.
3. **Motivation.** Every effect needs a reason: time passes (dissolve), a shape matches (match reveal), motion continues (whip, speed ramp), the beat hits (glitch on `hits`).

References: MridhaFX · DJordanMedia · LesFM · Domer AI.

Demo: `examples/Transitions.tsx` (28 s): cheesy preset vs clean cut → 5 categories with the controls on screen → beat-synced phonk section → finale.

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
├── docs/               ← lexicon gallery (GitHub Pages): index.html, lexicon.json, vendor/motion-prompt
└── plugins/ae-motion/
    ├── .claude-plugin/plugin.json
    └── skills/motion-design/
        ├── SKILL.md
        ├── kit/            ← easing, text, fx, kinetic, camera, transitions, ui, audio (+ index.ts)
        ├── tools/          ← build.py (script → voice, timing, SFX, music, master), sound.py (synths, DSP)
        ├── examples/       ← Trailer.tsx + trailer-script.json, KineticPromo.tsx, Showcase.tsx
        ├── lexicon/        ← motion-prompt packs (MIT) + ae.json (ru names, kit mapping, energy, modes)
        └── references/{brief,director,lexicon,editing,transitions,themes,fonts,effects,…}.md
```

## Fonts

Google Fonts (SIL Open Font License), not included in the repository.
