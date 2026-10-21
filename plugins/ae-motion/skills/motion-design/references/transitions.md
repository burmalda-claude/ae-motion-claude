# Transition engine (`kit/cuts.tsx`)

A transition should disappear into the cut and serve the emotion of the shot — not show off a trick.

## API
```tsx
import { transition, pickTransition, SpeedRampCut, MorphText, GooDefs, snapToBeat } from "./kit";
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}><A /></TransitionSeries.Sequence>
  {t && <TransitionSeries.Transition presentation={t.presentation} timing={t.timing} />}   // t = transition("blurDissolve")
  <TransitionSeries.Sequence durationInFrames={60}><B /></TransitionSeries.Sequence>
</TransitionSeries>
```
- `transition(kind, {frames?, ease?, props?})` → `{presentation, timing, frames}` or `null` for a clean cut. `<TransitionSeries>` overlaps the two shots automatically (both render during the transition) — no manual overlap.
- `ease`: `ease` (Easy Ease), `sCurve`, `out`, `in`, `CUT_EASE.bezier(x1,y1,x2,y2)`. Linear throws unless `allowLinear: true`.
- `pickTransition({from, to, bpm, timePasses, textToText, matchShape, onBeat})` → `{kind, frames, why}`.
- `SpeedRampCut` / `rampFrame()` — speed ramp with no effect. `MorphText` + `GooDefs` — fluid text. `snapToBeat(frame, beats)`.
- `tools/beats.py <audio> .` → `src/beats.json` (bpm, beats, downbeats, hits, energy per beat).

## Categories
| Kind | Category | Frames | Default ease | Use when |
|---|---|---|---|---|
| `cut` (null) | Cut | 0 | — | rhythm and visual logic match — the default |
| `dissolve` | Dissolve | 12 | ease | time passed, emotion softened |
| `blurDissolve` | Dissolve | 12 | ease | same, hides the digital crossfade |
| `scaleDissolve` | Dissolve | 10 | ease | 100% → 103%: reads as an impulse, not a fade |
| `shapeWipe` | Wipe | 12 | ease | circle / diagonal / panel, **always with an edge stroke** |
| `matchReveal` | Wipe | 14 | ease | a shape repeats across the cut (eye → moon) |
| `matteWipe` | Wipe | 12 | ease | a moving object carries the next shot (track matte) |
| `SpeedRampCut` | Speed | ramp 12 | S-curve | ramp to 40–50% → cut → 40–50% → 100% |
| `whip` / `zoom` | Speed | 8 / 10 | S-curve | energy rises; motion blur built in |
| `lightLeak` / `filmBurn` | Atmospheric | 16 | ease | warm/cool leak on the beat, energy drops |
| `glitch` | Atmospheric | 6 | ease | energetic accent, RGB split + scanline burst |
| `particle` | Atmospheric | 16 | ease | dust/sparks dissolve |
| `MorphText` | 2026 trend | 12–16 | S-curve | letters → letters (fluid text) |
| `liquid` | 2026 trend | 16 | ease | organic fluid fill |
| `split` | 2026 trend | 10 | in | kinetic split: the frame tears apart |
| `depth` | 2026 trend | 14 | S-curve | 2D/3D hybrid: back into depth, out of the screen |
| `phonk` | 2026 trend | 6 | ease | glitch + VHS + 1-frame invert on the hit |

## Edit staples (measured in 28 reference edits with `tools/transscan.py`)
Real TikTok edits barely use "transitions" in the template sense: most cuts are hard cuts **plus a 1–8 frame event on the new shot**. Numbers are medians over the scan (1 148 events).
| Kind | Frames | Seen in | What happens | Use when |
|---|---|---|---|---|
| `punchIn` | 6 | 19/28 edits (zoom-in + blur is the most common non-cut) | hard cut, B lands at 140 % with radial blur and settles | any hit / drop cut — the default "edit cut" (`props.peak`) |
| `whiteout` | 8 | 19/28, ~2 per 10 s | A blows out, B fades out of white | big hits, section changes |
| `exposure` | 8 (long: 12–16) | flash up **1 f**, down **4 f** (long tails up to 10 f) | A blows out in 1 frame, optional pure-color hold (`props.hold`, `color`), B settles from overexposure | the measured whiteout; colored version (`color: "#ff1a1a"`) for solid red/yellow flash frames |
| `invertCut` | 4 | 8/28 | the 1–2 frames around the cut are negative + smeared | phonk hits, horror, "snap" moments |
| `threshold` | 3 | horror / dark edits | 1–2 frames of 1-bit b/w on the cut | brutal accent before a reveal |
| `blackDip` | 8 | 14/28, black lasts **3 f** | 2–4 black frames | right before the drop, ending |
| `shrinkPop` | 8 | gacha/vtuber edits | A shrinks to a point over a color, B pops in oversized with glow | character → character |
| `push` | 8 | 11/28 (slides) | B pushes A out (up/down/left/right) with motion blur | vertical feeds, list-like sequences (`props.direction`) |
| `pixelate` | 10 | meme edits | A breaks into blocks, B resolves out of them (`props.white` = out of white) | meme / retro / game edits |
| `tvOff` | 10 | 2/28 | A collapses into a bright line, B opens out of it | ending a section, retro/glitch |
| `hueShift` | 8 | gacha edits | palette rotates through the spectrum while B dissolves in | same subject, new color world |
| `stutter` | 10 | 3/28 | A/B/A/B flicker every 2 frames, lands on B | build-ups, double-time hits (`props.flips`) |
| `card` | 10 | meme/commentary edits | B appears as a rounded card and grows to full frame | inserting a clip / reaction |
| `dissolve` | **4** in edits | 11/28 | short mix — edits use 3–5 f dissolves, not 12 | only between slow shots |

Rhythm of the scanned edits: an event every **8 frames** on average (bursts of 2–4 f on drops), blur on **6 f** around cuts, RGB split ~2 px for ~4 f, shake on the hit in 19/28 edits. Never stack two "events" on one cut; a hard cut + `HitShake` + `punchIn` is the full edit vocabulary for most cuts.

Learn new references: `python tools/transscan.py <folder_with_videos> <out>` → `transitions.json`, review strips per cut, summary. Look at the strips, then map what you see to the kinds above (`/ae-motion:trans-learn`).

## Why transitions look cheap (3 rules)
1. **Overlap** — a transition needs frames of both shots. Without overlap it flashes black or freezes. `<TransitionSeries>` does it for you; plan shot lengths with the overlap in mind (total = sum − transition frames).
2. **Restraint** — the clean cut is the best transition. One effect per 5–10 cuts at most; never the same effect twice in a row. 6–16 frames.
3. **Motivation** — every effect needs a reason in the picture or the sound: time passes (dissolve), a shape matches (match reveal), motion continues (whip, speed ramp), the beat hits (glitch/flash on `hits`).

## References
MridhaFX · DJordanMedia · LesFM · Domer AI (transition breakdowns and 2026 trend roundups the user pointed to).
