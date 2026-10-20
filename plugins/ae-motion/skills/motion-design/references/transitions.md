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

## Why transitions look cheap (3 rules)
1. **Overlap** — a transition needs frames of both shots. Without overlap it flashes black or freezes. `<TransitionSeries>` does it for you; plan shot lengths with the overlap in mind (total = sum − transition frames).
2. **Restraint** — the clean cut is the best transition. One effect per 5–10 cuts at most; never the same effect twice in a row. 6–16 frames.
3. **Motivation** — every effect needs a reason in the picture or the sound: time passes (dissolve), a shape matches (match reveal), motion continues (whip, speed ramp), the beat hits (glitch/flash on `hits`).

## References
MridhaFX · DJordanMedia · LesFM · Domer AI (transition breakdowns and 2026 trend roundups the user pointed to).
