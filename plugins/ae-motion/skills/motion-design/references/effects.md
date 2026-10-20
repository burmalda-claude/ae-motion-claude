# After Effects → Remotion

All snippets assume `const frame = useCurrentFrame(); const { fps, width, height } = useVideoConfig();` and `import { interpolate, spring, Easing, AbsoluteFill, Sequence, Img, staticFile } from "remotion";`.
Always pass `{ extrapolateLeft: "clamp", extrapolateRight: "clamp" }` to `interpolate` unless you want values to keep going.

## Keyframes & easing

| AE | Remotion |
|---|---|
| Easy Ease (F9) | `Easing.bezier(0.33, 0, 0.67, 1)` |
| Strong ease-out (Flow "expo out") | `Easing.bezier(0.16, 1, 0.3, 1)` |
| Ease-in (exits) | `Easing.bezier(0.7, 0, 0.84, 0)` |
| Overshoot / bounce expression | `spring({ frame, fps, config: { damping: 10, stiffness: 120 } })` |
| No overshoot, smooth | `spring({ frame, fps, config: { damping: 200 } })` |
| Hold keyframe | `frame < 30 ? a : b` |

```tsx
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
// entrance: slide up + fade + unblur, 18 frames
const p = interpolate(frame, [0, 18], [0, 1], { ...clamp, easing: ease });
const style = {
  transform: `translateY(${(1 - p) * 60}px)`,
  opacity: p,
  filter: `blur(${(1 - p) * 12}px)`,
};
```

Spring with delay: `spring({ frame: frame - delay, fps, ... })`.

## Text animators

```tsx
// per-letter stagger (AE text animator with offset)
const Letters: React.FC<{ text: string; stagger?: number }> = ({ text, stagger = 2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span style={{ display: "inline-flex", whiteSpace: "pre" }}>
      {[...text].map((ch, i) => {
        const s = spring({ frame: frame - i * stagger, fps, config: { damping: 12 } });
        return (
          <span key={i} style={{ display: "inline-block", opacity: s,
            transform: `translateY(${(1 - s) * 40}px) scale(${0.6 + 0.4 * s})` }}>{ch}</span>
        );
      })}
    </span>
  );
};
```
- Per word: split on `" "` and stagger 4–6 frames.
- **Mask reveal** (text rises from behind a line): wrap in `<div style={{ overflow: "hidden" }}>` and animate inner `translateY(100% → 0)`.
- **Typewriter**: `text.slice(0, Math.floor(frame / 2))` + cursor `opacity: Math.floor(frame / 15) % 2`.
- **Counter / number roll**: `Math.round(interpolate(frame, [0, 45], [0, target], { ...clamp, easing: ease })).toLocaleString("ru-RU")`; use `fontVariantNumeric: "tabular-nums"` so digits don't jitter.
- **Tracking in** (letter-spacing animation): `letterSpacing: \`${interpolate(frame,[0,40],[0.5,-0.02],clamp)}em\``.

## Motion blur
```tsx
import { CameraMotionBlur, Trail } from "@remotion/motion-blur";
<CameraMotionBlur shutterAngle={180} samples={10}>{/* fast-moving layer */}</CameraMotionBlur>
<Trail layers={6} lagInFrames={0.6} trailOpacity={0.6}>{/* echo / ghost trail */}</Trail>
```
Wrap only the moving layers — samples multiply render time.

## Glow (AE Glow / Deep Glow)
```tsx
const glow = (c: string) => ({
  color: c,
  textShadow: `0 0 8px ${c}, 0 0 24px ${c}, 0 0 64px ${c}`,
});
// for images/shapes: filter: `drop-shadow(0 0 12px ${c}) drop-shadow(0 0 40px ${c})`
```
Pulse it: multiply blur radii by `1 + 0.3 * Math.sin(frame / 6)`.

## Wiggle / camera shake (AE wiggle expression)
```tsx
import { noise2D } from "@remotion/noise";
const amp = 12, freq = 0.08; // px, speed
const x = noise2D("x", frame * freq, 0) * amp;
const y = noise2D("y", frame * freq, 0) * amp;
const r = noise2D("r", frame * freq, 0) * 1.5; // deg
// apply to a wrapper around the whole scene: transform: `translate(${x}px,${y}px) rotate(${r}deg)`
```
Impact shake: multiply `amp` by `interpolate(frame, [hit, hit + 12], [1, 0], clamp)`.

## Camera / parallax / 3D layers
```tsx
// slow push-in for the whole scene
<AbsoluteFill style={{ transform: `scale(${interpolate(frame, [0, durationInFrames], [1, 1.06])})` }}>
// parallax: move bg 0.3x, mid 0.6x, fg 1x of the same offset
// 3D: parent { perspective: 1200 }, child { transform: `rotateY(${deg}deg) translateZ(${z}px)`, transformStyle: "preserve-3d" }
```

## Trim paths / stroke draw
```tsx
import { evolvePath, getLength } from "@remotion/paths";
const d = "M 100 500 C 400 100, 800 900, 1100 500";
const progress = interpolate(frame, [0, 30], [0, 1], { ...clamp, easing: ease });
const { strokeDasharray, strokeDashoffset } = evolvePath(progress, d);
<svg width={width} height={height}><path d={d} stroke="#fff" strokeWidth={6} fill="none"
  strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} /></svg>
```
Shape morph: `interpolatePath(progress, pathA, pathB)` from `@remotion/paths`. Ready shapes: `@remotion/shapes` (`<Circle>`, `<Rect>`, `<Star>`, `<Triangle>`, `<Pie>`, `makeStar()` etc.).

## Masks & mattes
- Rectangle wipe: `clipPath: \`inset(0 ${100 - p * 100}% 0 0)\``
- Circle reveal (iris): `clipPath: \`circle(${p * 150}% at 50% 50%)\``
- Diagonal: `clipPath: \`polygon(0 0, ${p*200}% 0, ${p*200 - 100}% 100%, 0 100%)\``
- Track matte (video inside text): text with `backgroundImage`/`WebkitBackgroundClip: "text"`, or `maskImage` with an SVG/PNG.
- Feathered mask: `maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)"`.

## Stylize overlays (put on top, `pointerEvents: "none"`)
```tsx
// Film grain — re-seeded every frame
<AbsoluteFill style={{ opacity: 0.05, mixBlendMode: "overlay" }}>
  <svg width="100%" height="100%">
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 100} /></filter>
    <rect width="100%" height="100%" filter="url(#g)" />
  </svg>
</AbsoluteFill>
// Vignette
<AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />
// Scanlines
<AbsoluteFill style={{ opacity: 0.15, background: "repeating-linear-gradient(0deg, #000 0 2px, transparent 2px 4px)" }} />
// Letterbox 2.39:1
const bar = (height - width / 2.39) / 2; // two black divs of this height top and bottom
```

## Glitch / RGB split (chromatic aberration)
```tsx
const g = frame % 40 < 4 ? noise2D("g", frame, 0) * 14 : 0; // short bursts
<div style={{ position: "relative" }}>
  <div style={{ position: "absolute", color: "#ff0040", transform: `translateX(${g}px)`, mixBlendMode: "screen" }}>{t}</div>
  <div style={{ position: "absolute", color: "#00e5ff", transform: `translateX(${-g}px)`, mixBlendMode: "screen" }}>{t}</div>
  <div style={{ position: "relative", color: "#fff" }}>{t}</div>
</div>
```
Slice glitch: duplicate layer, `clipPath: inset(${y}% 0 ${100 - y - 8}% 0)` + horizontal offset for 2–3 frames.

## Backgrounds
- Animated gradient: `background: \`linear-gradient(${frame * 0.5}deg, #6366F1, #EC4899)\``.
- Blurred blobs: 3 circles 600–900px, `filter: blur(120px)`, positions driven by `noise2D` with slow `frame * 0.005`.
- Grid floor (synthwave): repeating-linear-gradient grid in a div with `transform: perspective(600px) rotateX(70deg)`, animate `backgroundPositionY` with `frame`.
- Glassmorphism card: `background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 24`.

## Transitions between scenes
```tsx
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={slide({ direction: "from-right" })}
    timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })} />
  <TransitionSeries.Sequence durationInFrames={90}><SceneB /></TransitionSeries.Sequence>
</TransitionSeries>
```
`clockWipe` needs `{ width, height }`. Total length = sum of sequences − sum of transitions.
Extra AE-style cuts (no package): **zoom-through** (scale outgoing to 3 + blur while incoming scales 0.5→1), **whip pan** (fast translateX + `CameraMotionBlur`), **flash** (white AbsoluteFill opacity 0→1→0 over 6 frames on the cut).

## Speed ramp / time remap
`<OffthreadVideo src={...} playbackRate={2} />` for constant speed. For ramps: compute a remapped frame and render that video frame via `<Sequence from={-remapped}>`, or cut the clip into segments with different `playbackRate`.

## Images & footage
- Ken Burns: `<Img>` with `transform: scale(1 → 1.15) translate(…)` over the scene.
- Video: `<OffthreadVideo src={staticFile("clip.mp4")} />` (put files in `public/`).
- Lottie (After Effects export via Bodymovin / LottieFiles): `import { Lottie } from "@remotion/lottie"` → `<Lottie animationData={json} />`. This is the way to reuse real AE animations.

## Audio & beat sync
```tsx
import { Audio } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
const audio = useAudioData(staticFile("music.mp3"));
const bars = audio ? visualizeAudio({ fps, frame, audioData: audio, numberOfSamples: 32 }) : [];
const bass = bars[0] ?? 0; // drive scale/glow with it: scale 1 + bass * 0.3
<Audio src={staticFile("music.mp3")} volume={(f) => interpolate(f, [0, 30], [0, 1], clamp)} />
```
For cuts on beats: know BPM → `beatFrames = (60 / bpm) * fps`; place scene boundaries on multiples.

## Typical durations (30 fps)
| Thing | Frames |
|---|---|
| Text entrance | 12–20 |
| Letter stagger | 1–2 |
| Item stagger | 3–6 |
| Scene transition | 12–24 |
| Hold time to read a line | ~ 2 frames per character, min 45 |
| Flash / impact | 4–8 |
