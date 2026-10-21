---
name: motion-design
description: Turn a short prompt into a polished, voiced After Effects-style video with Remotion (React). Use when the user asks for any video, promo, ad, intro, outro, trailer, title animation, kinetic typography, reels/shorts/TikTok edit, lower thirds, logo reveal, explainer, or says "like After Effects / Alight Motion". Includes built-in voice-over with per-word timing (words animate exactly when spoken), procedural sound effects and music, a component kit (zoom-blur/slam/whip/stretch/wobble/glitch text, warp streaks, speed lines, light slashes, glow, particles, camera, AE-style UI mocks), a director workflow, editing grammar, 14 themes and font pairings.
---

# Motion design: prompt → voiced, After Effects-quality video

You are the motion designer, editor **and** sound designer. The user gives one line; you decide format, script, voice, theme, pacing, effects and sound, then build it with the kit. Remotion API details live in the `remotion:*` skills if installed — this skill is about taste, sync and speed.

## Workflow

1. **Direct** — read `references/director.md`. Extract the brief, pick a theme (`references/themes.md`) and fonts (`references/fonts.md`), write the script as beats. Print a 3–5 line plan. Ask at most one question, only for a real blocker.
2. **Set up the project** (if there is none):
   - `npx create-video@latest` → Blank template, then `npm i`.
   - Copy `kit/` from this skill into `src/kit/`; copy `tools/` anywhere (they are Python scripts).
   - `npx remotion add @remotion/google-fonts @remotion/transitions @remotion/noise @remotion/paths @remotion/layout-utils`
   - tsconfig: `"resolveJsonModule": true` (voice timings are imported as JSON).
3. **Script** — write `script.json` (format in `tools/build.py` docstring; full example `examples/trailer-script.json`): one beat per shot with `text` (what is spoken = what is on screen), `lead`/`tail`/`min` frames, `sfx` cues tied to words (`["impact", "w0"]`, `["riser", "end"]`), and a `music` mode where the energy changes (`intro | drop | build | break | ui | stop`). Text the TTS would mispronounce (English brand names in a Russian script) — write phonetically in `text`, keep the real spelling on screen.
4. **Build audio + timing** — `pip install edge-tts numpy scipy librosa imageio-ffmpeg` once, then `python tools/build.py script.json .` → neural voice per line (default `en-US-BrianMultilingualNeural`: most expressive, speaks Russian cleanly), trimmed + broadcast voice chain, `src/timeline.json` with every word's frame, synthesized SFX on cues, an arranged 123-BPM bed with sidechain pumping and ducking under the voice, mastered to −14 LUFS / −1 dBTP → `public/audio/master.wav` (+ stems). Re-run after any script change; TTS is cached.
5. **Build visuals** — one component per beat receiving `ShotProps` (`w(i)` = frame word *i* starts, `we(i)`, `dur`). Wrap each in `<Exit dur kind>` (3–5 f exits: `zoom`, `streakY`, `streakX`, `slice`, `whipL/R`, `spin`, `drop`), map ids → components, render `<TimelineShots timeline={timelineJson} shots={SHOTS} />` (it also plays the master). Mount `<ChromaDefs />` once. **Reference implementation: `examples/Trailer.tsx` + `examples/trailer-script.json`** — read it first; it is the quality bar.
6. **Check** — render stills of 4–6 key frames (`npx remotion still <Id> --frame=<n> out/c<n>.png`) and Read them. Fix overflow, empty frames, wrong fonts, words appearing before they are spoken.
7. **Render** — `npx remotion render <Id> out/video.mp4 --concurrency=50%`. Tell the user where the file is.

## Modes (slash commands)

`commands/*.md` → `/ae-motion:<mode>` (edit, cinematic, lyric, clip, tutorial, gym, gaming, ad, amv, travel, meme, news, fashion, horror, wedding, realestate, asmr, reaction). Each loads `modes/<mode>.json` — format sizes, palette, fonts, grade, text presets, timing, `effects` (the modifier stack: kit component names), `exits`, `audio` (voice/rate/musicStyle/bpm/sections, cut + beat behavior). A project file `.ae-motion/modes/<mode>.json` overrides the built-in one. Media-driven modes (lyric, clip, reaction, gaming) use `tools/transcribe.py` on the user's file instead of TTS. Mode building blocks live in `kit/modes.tsx` (Grade, LightLeak, VHS, Flicker, AnamorphicFlare, ImpactFrame, ChapterCard, QuoteCard, KaraokeLine, MemeCaption, Wasted, JPText, LowerThird, ProgressBar, Ticker, BreakingBanner, StepBadge, HighlightBox, Callout, ZoomTo, StatCard, TimerDisplay, Hitmarker, KillFeed, ComboCounter, PriceTag, CTAButton, BeforeAfter, MapPin, DayCounter, PiP, CommentBubble, MangaPanels, EmojiPop). `examples/Modes.tsx` flies through all modes.

## Music, SFX and what real edits do

- **Music: search online first** — `references/music.md` (genre by topic: phonk for edits, slowed+reverb for sad, epic for cinematic…; WebSearch → shortlist → ask before every download → `yt-dlp` → `beats.py` → `musicFile`/`musicStart`). Generated `musicStyle` only as fallback. Command `/ae-motion:music-find`.
- **SFX engine** — `references/sfx.md`, `tools/sfxgen.py` (8 categories, specs as cues, `layer:<transition>` stacks, packs, beat sync, AI via ElevenLabs), `tools/audit.py`. Commands `/ae-motion:sfx-find|sfx-generate|sfx-sync|sfx-layer|sfx-audit|sfx-pack`.
- **Real edits** — `references/edits-breakdown.md` (28 TikTok edits measured): ~7 cuts per 10 s, half the cuts on audio transients, whiteout bloom flash ≈ 2 per 10 s, hit shakes, zoom punches, strobe flips, invert frames, halation. Kit: `kit/editfx.tsx` (BloomFlash, HitShake, ZoomPunch, InvertFlash, Strobe, Threshold, Mirror, PixelStreak, Halation, FlickerTitle, PercentCounter, BlackDip) + transitions `whiteout`, `blackDip`, and the measured edit staples `punchIn`, `exposure`, `invertCut`, `threshold`, `shrinkPop`, `push`, `pixelate`, `tvOff`, `hueShift`, `stutter`, `card` (table in `references/transitions.md`). New reference edits: `tools/transscan.py` (`/ae-motion:trans-learn`). Plan an edit's cuts with the measured grammar (cuts on onsets, bursts of 2–5 of one kind, kind changes on phrases, black + flash on the drop, camera life on every hit cut): `tools/transplan.py` (`/ae-motion:trans-plan`) + `<EditCam>` / `BloomFlash` (measured flash curve) from `kit/editfx.tsx`.

## Transitions

Use `kit/cuts.tsx` — read `references/transitions.md` before placing any transition. Clean cut first; `transition(kind)` inside `<TransitionSeries>` (automatic overlap); `pickTransition()` for the choice; `SpeedRampCut`, `MorphText` + `GooDefs`; `tools/beats.py` for beat-synced cuts. Commands: `/ae-motion:transition`, `trans-clean`, `trans-dissolve`, `trans-wipe`, `trans-speedramp`, `trans-beat`, `trans-morph`, `trans-glitch`, `trans-random`, `trans-edit`, `trans-learn`. Demos: `examples/Transitions.tsx`, `examples/EditCuts.tsx` (11 edit staples, 9:16).

## Sync rules (what makes it feel edited, not generated)

- **Every on-screen word lands on its spoken frame**: `delay={w(i)}`. Never hard-code word delays when there is a voice line.
- **Background/scene changes happen on words**, not between them: `const stage = f < w(1) ? 0 : f < w(2) ? 1 : 2`.
- **SFX on the same frames**: hit/boom on slams, whoosh on whips and scene flips, slash on light slashes, pop on pops, click/key on UI, riser into a logo, shimmer on sparkles. 1–3 SFX per beat, never more.
- **Silence is a tool**: a beat with no voice (`min` only) is a breath — use it for the logo hit or a visual-only flourish.
- Music ducks under the voice automatically (`duckTo`); keep music 0.25–0.4.

## The kit (`kit/`, import from `./kit`)

| File | Components |
|---|---|
| `easing.ts` | `EASE` (easy, out, in, inOut, back), `prog`, `pop`, `mix`, `envelope`, `beatFrames`, `clamp` |
| `audio.tsx` | `TimelineShots` (shots + master audio from `timeline.json`), `shotProps`, `Captions` (TikTok word captions), `Sfx`, types `ShotProps`, `TimelineData` |
| `kinetic.tsx` | `Exit` (3–5 f shot exits/entrances), `Chroma` + `ChromaDefs` (RGB split), `TypeOn` (glitch typing), `WireExtrude`, `eta()`, `ZoomIn` (radial zoom-blur entrance), `WarpStreaks`, `SpeedLines`, `Slash` (light saber), `Pops`, `ScrollStack` (vertical camera through lines), `Wobble`, `WeightShift`, `Scatter`, `MorphShape`, `Filmstrip`, `GlowPill`, `CompGrid`, `TransformBox`, `LayerBars`, `KeyLanes`, `GraphCurve`, `EchoTower`, `DiagonalBand`, `TerminalLine`, `GradientText`, `Sparkle`, `Ruler`, `Bulb`, `RepeatStretch`, `ChatCard`, `LightSweep` |
| `text.tsx` | `Fit` (fill width exactly), `SlamText`, `WhipIn`, `Letters` (rise/pop/drop/blur), `Words`, `MaskReveal`, `Typewriter`, `Counter`, `Outline`, `Extrude` (3D), `EchoStack`, `Stretch`, `Glitch`, `Highlight`, `Underline`, `CheckerText`, `punch()` |
| `fx.tsx` | `Smear` (directional blur), `Glow`, `Grain`, `Vignette`, `Scanlines`, `DotGrid`, `Orb`, `Bokeh`, `LightStreak`, `Sparks`, `Starburst`, `Shockwave`, `Cube3D`, `Viewfinder`, `HudRing`, `Letterbox`, `Flash` |
| `camera.tsx` | `Camera` (push-in, drift, `hits` shakes, roll), `Parallax`, `Tilt3D` |
| `transitions.tsx` | presentations `whip()`, `zoomThrough()`, `zoomBlur()`, `streak()`, `slices()` for `<TransitionSeries>` (for voiced edits prefer hard cuts + `Exit`) |
| `ui.tsx` | `PromptBox`, `Timeline`, `RenderBar`, `NodeGraph`, `Cursor`, `PlayerMock` |

All animation props are in **frames relative to the shot**. Components read `useCurrentFrame()`, so they restart inside each beat.

Examples: `Trailer.tsx` (voiced, 36 beats, the target style), `KineticPromo.tsx` (silent, 15 shots), `Showcase.tsx` (every component with captions).

## Rules that separate "AE" from "PowerPoint"

- **Nothing appears plainly.** Words enter with `ZoomIn` (zoom blur), `WhipIn` (smear), `Stretch`, `Letters drop`, `MaskReveal` — pick by beat energy.
- **Hard color flips** between dark / paper / red on word boundaries are the main "transition" of kinetic edits.
- **Nothing linear** except constant drift. Entrances `EASE.out`/springs, exits `EASE.in`, camera `EASE.inOut`.
- **Every shot has life**: `Camera` push/shake, particles, orb glow, grid drift. No frozen frames.
- **Depth**: background texture → mid (shapes, UI mocks) → type → overlays (grain, vignette).
- **Variety**: ≥ 6 shot types per minute (editing.md). Never the same entrance twice in a row.
- **Type**: wide heavy display for slams (Unbounded / Archivo Black), condensed for long lines (Oswald), one italic serif accent line, mono for UI. Use `Fit` so words fill the frame. Check Cyrillic.
- **Safe areas**: 9:16 — keep text out of the top 10 % and bottom 20 %.

## Polish checklist

- [ ] Hook in the first second (dot → warp → zoom-blur word + hit)
- [ ] Words land on spoken frames; SFX on the same frames
- [ ] A logo-hit beat (streak + sparks + shockwave + flash + glow + boom)
- [ ] Music ducked under voice; final fade to black
- [ ] Grain + vignette over everything
- [ ] Stills checked: no overflow, no blank frames

## Formats

| Use | Size | fps |
|---|---|---|
| Reels / Shorts / TikTok | 1080×1920 | 30 (60 for very fast edits) |
| YouTube / presentation | 1920×1080 | 30 or 60 |
| Square | 1080×1080 | 30 |

## Gotchas

- `AbsoluteFill` is `flex-direction: column` by default — pass `flexDirection: "row"` for side-by-side layouts.
- Google font `subsets` must be typed: `["cyrillic", "latin"] as ("cyrillic" | "latin")[]`.
- edge-tts occasionally returns "No audio was received" — build.py retries 5× and caches results; if it still fails, check internet and re-run.
- build.py trims TTS silence to the spoken words, so pace shots with `lead`/`tail`, not with pauses in the text.
- Mix targets (measured from a top reference): voice median ≈ −15.5 dBFS, music in gaps ≈ 7.5 dB under the voice, a sub thump + whoosh on almost every cut (build.py adds them automatically; disable per beat with `"auto": false`).
- Windows: `spawn ...chrome-headless-shell.exe ENOENT` while the file exists = path longer than 260 chars. Create a junction with a short path (`New-Item -ItemType Junction -Path $env:TEMP\vid -Target <project>`) and run Remotion from there.
- Mixing presentations in one array needs `TransitionPresentation<any>` typing (see `examples/Showcase.tsx`).

## Limits (be honest with the user)

Remotion renders HTML/CSS/SVG/WebGL. Real 3D scenes need `@remotion/three`; particles here are 2D; radial/zoom blur is faked with echo copies. Generated music is a simple synth beat — suggest the user's own track for anything important. Edge TTS needs internet and sends the script text to Microsoft.

## References

- `references/music.md` — finding and fitting real music.
- `references/sfx.md` — sound design engine.
- `references/edits-breakdown.md` — measured TikTok edits.
- `references/transitions.md` — transition engine: categories, controls, picker, the 3 rules.
- `references/director.md` — prompt → brief → beat list, defaults, theme by topic.
- `references/editing.md` — rhythm, cut types, shot vocabulary, layout, sound design.
- `references/reference-breakdown.md` — frame-by-frame breakdown of a top kinetic trailer: what each beat does.
- `references/themes.md` — 14 themes: palette + fonts + motion character.
- `references/fonts.md` — Google Fonts pairings, Cyrillic support.
- `references/effects.md` — raw AE effect → Remotion recipes (for things outside the kit).
