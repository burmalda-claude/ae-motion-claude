# What real TikTok edits do (28 edits measured frame by frame + audio)

Source: 28 edits from the user's reference folder (anime AMVs, Rick & Morty edits, car edit, space edit, horror/meme edits, gacha/vtuber edits), 7–60 s, mostly 1:1 and 9:16.

## Numbers (median, p25–p75)
| Metric | Value | Meaning for us |
|---|---|---|
| Cuts per 10 s | **7.4** | a new shot every ~1.3 s on average… |
| Frames between cuts | **21** (17–32) | …but bursts of 2–6 frame cuts on drops |
| Cuts landing on an audio onset (±2 f) | **52 %** (41–82 %) | cut on transients (kick/snare/vocal chop), not just on the beat grid |
| Cuts landing on the beat grid | 38 % | the beat grid alone is not enough → use `beats.json` `hits` |
| White/bright flashes per 10 s | **2.2** | the whiteout flash is THE transition of edits |
| Music BPM | **123** (108–144), cluster at 160–172 (double-time phonk) | |
| Sub-bass (<60 Hz) share of the spectrum | **~45 %** | music is 808/sub-heavy; never thin out the low end |
| Crest factor | **~3** | music is heavily limited/saturated (loud, "crushed") |
| Motion (optical flow p95) | 3.5 | constant camera movement, shakes, zooms — still shots are rare |

## Transition vocabulary seen (most → least common)
1. **Whiteout / bloom flash** — the image blows out to white over 1–3 frames (with blur + bloom), the new shot fades out of white over 3–6 frames. Used on the beat in almost every edit. → `transition("whiteout")`, `<BloomFlash at>`.
2. **Hard cut on a transient** — plain cut exactly on a kick/snare/vocal chop. → `transition("cut")` placed on `hits`.
3. **Shake + directional blur on the hit** — 4–8 frames of shake with motion blur after the cut. → `<HitShake at>`.
4. **Zoom punch** — 105–120 % scale pop on the hit, eased back. → `punch()`, `<ZoomPunch at>`.
5. **Strobe color flips** — background alternates every 1–3 frames (red ↔ white with a black cutout subject). → `<Strobe>`, `<Threshold>`.
6. **RGB split / chromatic + glitch slices** on accents. → `transition("glitch")`, `Chroma`.
7. **Invert flash** — 1–2 inverted frames on a hit. → `<InvertFlash at>`.
8. **Mirror / kaleidoscope** — the frame mirrors into 2–4 copies for a beat. → `<Mirror>`.
9. **Pixel streak / smear** — vertical pixel-sort streaks on drops. → `<PixelStreak>`.
10. **Black dip** — 2–4 black frames before the final beat drop / ending. → `transition("blackDip")`.
11. **Radial zoom blur in/out** (space edit, car edit). → `transition("zoom")`.
12. **Character glow / halation** — subjects get a white/colored outer glow, highlights bloom. → `<Halation>`, `Glow`.
13. Overlays: progress `%` counter, title letters flickering on one by one (`S P A C E`), small watermark/credit text.

## Look
- Heavy contrast + saturation, crushed blacks, blown highlights, bloom on everything bright.
- Grain is rare; sharpness + glow is common. Color: either hyper-saturated (anime) or 2-tone (red/white, b/w + one color).
- Text is minimal: 1 title, credits, sometimes lyric words.

## Sound
- Music carries everything: one track, cut to start near the drop; the edit ends on the last hit or a reverb tail / black.
- Few extra SFX — when present: whoosh into a whiteout, impact on the first frame, reverse cymbal before a drop, vine boom / meme stingers in meme edits.
- Phonk family dominates (Brazilian funk/phonk with cowbell and distorted 808, drift phonk, "slowed + reverb" for sad edits), then hyperpop/jcore for gacha/vtuber, epic/trailer for space/cinematic, trap for cars.
