import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { fitText } from "@remotion/layout-utils";
import { EASE, clamp, mix, pop, prog } from "./easing";
import { Smear } from "./fx";
import { Chroma } from "./kinetic";

type Base = { delay?: number; style?: React.CSSProperties };
type Dir = "left" | "right" | "up" | "down";
const vec = (d: Dir) => ({ left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] })[d] as [number, number];

/** Word slams in from big scale with blur, settles with a small overshoot. The kinetic-typography workhorse. */
export const SlamText: React.FC<Base & { children: React.ReactNode; from?: number }> = ({ children, delay = 0, from = 2.4, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 14, 220);
  const p = prog(frame, delay, 5);
  return (
    <div style={{ display: "inline-block", transform: `scale(${mix(from, 1, s)})`, opacity: p, filter: `blur(${(1 - p) * 14}px)`, ...style }}>
      {children}
    </div>
  );
};

/** Whip in from a side with directional motion blur proportional to speed. */
export const WhipIn: React.FC<Base & { children: React.ReactNode; from?: Dir; distance?: number; dur?: number }> = ({
  children,
  delay = 0,
  from = "right",
  distance = 1400,
  dur = 6,
  style,
}) => {
  const frame = useCurrentFrame();
  const [dx, dy] = vec(from);
  const p = prog(frame, delay, dur, EASE.out);
  const v = (p - prog(frame - 1, delay, dur, EASE.out)) * distance; // px per frame
  return (
    <Smear x={dx ? v * 0.6 : 0} y={dy ? v * 0.6 : 0} style={{ display: "inline-block", ...style }}>
      <div style={{ transform: `translate(${dx * distance * (1 - p)}px, ${dy * distance * (1 - p)}px)`, opacity: p > 0 ? 1 : 0 }}>
        <Chroma amount={Math.min(36, Math.abs(v) * 0.12)} angle={dy ? 90 : 0}>{children}</Chroma>
      </div>
    </Smear>
  );
};

/** Per-letter stagger (AE Text Animator with Offset). */
export const Letters: React.FC<Base & { text: string; stagger?: number; mode?: "rise" | "pop" | "drop" | "blur" }> = ({
  text,
  delay = 0,
  stagger = 2,
  mode = "rise",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span style={{ display: "inline-flex", whiteSpace: "pre", ...style }}>
      {[...text].map((ch, i) => {
        const s = pop(frame, fps, delay + i * stagger, mode === "pop" ? 9 : 14);
        const t =
          mode === "pop"
            ? `scale(${s})`
            : mode === "drop"
              ? `translateY(${(1 - s) * -120}px) rotate(${(1 - s) * (random(`l${i}`) - 0.5) * 60}deg)`
              : mode === "blur"
                ? `scale(${mix(1.4, 1, s)})`
                : `translateY(${(1 - s) * 80}px)`;
        return (
          <span
            key={i}
            style={{ display: "inline-block", opacity: Math.min(1, s * 1.5), transform: t, filter: mode === "blur" ? `blur(${(1 - s) * 12}px)` : undefined }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

/** Per-word stagger. Words listed in `accent` get `accentStyle` (e.g. red). */
export const Words: React.FC<Base & { text: string; stagger?: number; accent?: string[]; accentStyle?: React.CSSProperties; gap?: string }> = ({
  text,
  delay = 0,
  stagger = 4,
  accent = [],
  accentStyle = { color: "#ff2a3d" },
  gap = "0.25em",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", columnGap: gap, ...style }}>
      {text.split(" ").map((w, i) => {
        const s = pop(frame, fps, delay + i * stagger, 13);
        const isAccent = accent.includes(w.replace(/[^\p{L}\p{N}]/gu, ""));
        return (
          <span key={i} style={{ display: "inline-block", opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 60}px) scale(${mix(0.8, 1, s)})`, ...(isAccent ? accentStyle : {}) }}>
            {w}
          </span>
        );
      })}
    </span>
  );
};

/** Text rises from behind an invisible line (mask reveal). */
export const MaskReveal: React.FC<Base & { children: React.ReactNode; from?: Dir; dur?: number }> = ({ children, delay = 0, from = "down", dur = 8, style }) => {
  const frame = useCurrentFrame();
  const [dx, dy] = vec(from);
  const p = prog(frame, delay, dur);
  return (
    <div style={{ overflow: "hidden", display: "inline-block", ...style }}>
      <div style={{ transform: `translate(${dx * 105 * (1 - p)}%, ${dy * 105 * (1 - p)}%)` }}>{children}</div>
    </div>
  );
};

/** Typewriter with blinking cursor; words in `highlight` get a colored box (prompt-box look). */
export const Typewriter: React.FC<Base & { text: string; cps?: number; highlight?: string[]; highlightColor?: string; cursor?: boolean }> = ({
  text,
  delay = 0,
  cps = 22,
  highlight = [],
  highlightColor = "rgba(255,42,61,0.85)",
  cursor = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(0, Math.floor(((frame - delay) / fps) * cps));
  const shown = text.slice(0, n);
  const done = n >= text.length;
  return (
    <span style={{ whiteSpace: "pre-wrap", ...style }}>
      {shown.split(/(\s+)/).map((w, i) =>
        highlight.some((h) => h.startsWith(w) && w.trim()) ? (
          <span key={i} style={{ background: highlightColor, borderRadius: 6, padding: "0 0.15em", boxShadow: `0 0 18px ${highlightColor}` }}>
            {w}
          </span>
        ) : (
          <span key={i}>{w}</span>
        ),
      )}
      {cursor && <span style={{ opacity: !done || Math.floor(frame / 15) % 2 ? 1 : 0, marginLeft: 2 }}>|</span>}
    </span>
  );
};

/** Rolling number counter. */
export const Counter: React.FC<Base & { to: number; from?: number; dur?: number; locale?: string; suffix?: string; prefix?: string }> = ({
  to,
  from = 0,
  dur = 40,
  delay = 0,
  locale = "en-US",
  suffix = "",
  prefix = "",
  style,
}) => {
  const frame = useCurrentFrame();
  const v = Math.round(mix(from, to, prog(frame, delay, dur)));
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{prefix + v.toLocaleString(locale) + suffix}</span>;
};

/** Hollow outline text. */
export const Outline: React.FC<{ children: React.ReactNode; color?: string; width?: number; style?: React.CSSProperties }> = ({ children, color = "#fff", width = 3, style }) => (
  <span style={{ color: "transparent", WebkitTextStroke: `${width}px ${color}`, ...style }}>{children}</span>
);

/** Fake 3D extrusion (stacked text-shadows). angle in degrees, depth in px. */
export const Extrude: React.FC<{ children: React.ReactNode; depth?: number; angle?: number; side?: string; face?: string; style?: React.CSSProperties }> = ({
  children,
  depth = 24,
  angle = 35,
  side = "#8a8a8a",
  face = "#fff",
  style,
}) => {
  const a = (angle * Math.PI) / 180;
  const shadow = Array.from({ length: depth }, (_, i) => `${(i + 1) * Math.cos(a)}px ${(i + 1) * Math.sin(a)}px 0 ${side}`).join(",");
  return <span style={{ color: face, textShadow: shadow, ...style }}>{children}</span>;
};

/** Echo stack: the same line repeated, fading out above/below (cascading "LAYERS / KEYFRAMES" look). */
export const EchoStack: React.FC<Base & { text: string; copies?: number; step?: number; direction?: "up" | "down"; color?: string }> = ({
  text,
  copies = 6,
  step = 0.82,
  delay = 0,
  direction = "up",
  color = "#fff",
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexDirection: direction === "up" ? "column-reverse" : "column", alignItems: "center", lineHeight: step, ...style }}>
      {Array.from({ length: copies }, (_, i) => {
        const p = prog(frame, delay + i * 2, 10);
        return (
          <div key={i} style={{ color, opacity: p * (1 - i / copies), transform: `translateY(${(direction === "up" ? 1 : -1) * (1 - p) * 40}px) scale(${1 - i * 0.04})` }}>
            {text}
          </div>
        );
      })}
    </div>
  );
};

/** Horizontal stretch: letters start smeared wide and snap into place. */
export const Stretch: React.FC<Base & { children: React.ReactNode; from?: number; dur?: number }> = ({ children, delay = 0, from = 4, dur = 14, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.out);
  const sx = mix(from, 1, p);
  return (
    <Smear x={(sx - 1) * 10} style={{ display: "inline-block", ...style }}>
      <div style={{ transform: `scaleX(${sx}) scaleY(${mix(0.6, 1, p)})`, opacity: Math.min(1, p * 3) }}>{children}</div>
    </Smear>
  );
};

/** Glitch: RGB split + horizontal slice offsets in short bursts. `every` = frames between bursts. */
export const Glitch: React.FC<{ children: React.ReactNode; every?: number; burst?: number; amount?: number; style?: React.CSSProperties; force?: boolean }> = ({
  children,
  every = 36,
  burst = 5,
  amount = 18,
  style,
  force = false,
}) => {
  const frame = useCurrentFrame();
  const on = force || frame % every < burst;
  const g = on ? noise2D("glitch", frame * 0.9, 0) * amount : 0;
  const slices = on ? [0, 1, 2].map((k) => ({ top: random(`gt${frame}${k}`) * 85, h: 4 + random(`gh${frame}${k}`) * 12, dx: (random(`gx${frame}${k}`) - 0.5) * amount * 4 })) : [];
  const layer = (extra: React.CSSProperties) => <div style={{ position: "absolute", inset: 0, ...extra }}>{children}</div>;
  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      {on && layer({ color: "#ff0040", transform: `translateX(${g}px)`, mixBlendMode: "screen", opacity: 0.9 })}
      {on && layer({ color: "#00e5ff", transform: `translateX(${-g}px)`, mixBlendMode: "screen", opacity: 0.9 })}
      <div style={{ position: "relative" }}>{children}</div>
      {slices.map((s, k) => (
        <div key={k} style={{ position: "absolute", inset: 0, clipPath: `inset(${s.top}% 0 ${100 - s.top - s.h}% 0)`, transform: `translateX(${s.dx}px)` }}>
          {children}
        </div>
      ))}
    </div>
  );
};

/** Colored box that wipes in behind a word (highlighter / label). */
export const Highlight: React.FC<Base & { children: React.ReactNode; color?: string; pad?: string; dur?: number }> = ({
  children,
  delay = 0,
  color = "#ff2a3d",
  pad = "0 0.15em",
  dur = 8,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.inOut);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: pad, ...style }}>
      <span style={{ position: "absolute", inset: 0, background: color, transform: `scaleX(${p})`, transformOrigin: "left" }} />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

/** Underline that sweeps in. */
export const Underline: React.FC<Base & { children: React.ReactNode; color?: string; thickness?: number }> = ({ children, delay = 0, color = "#ff2a3d", thickness = 8, style }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 12, EASE.inOut);
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      {children}
      <span style={{ position: "absolute", left: 0, right: 0, bottom: -thickness * 1.2, height: thickness, background: color, transform: `scaleX(${p})`, transformOrigin: "left", boxShadow: `0 0 16px ${color}` }} />
    </span>
  );
};

/** Text filled with a transparency checkerboard (the "RENDER" look). */
export const CheckerText: React.FC<{ children: React.ReactNode; a?: string; b?: string; cell?: number; style?: React.CSSProperties }> = ({
  children,
  a = "#ddd",
  b = "#888",
  cell = 14,
  style,
}) => (
  <span
    style={{
      background: `repeating-conic-gradient(${a} 0% 25%, ${b} 0% 50%) 0 0 / ${cell * 2}px ${cell * 2}px`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      ...style,
    }}
  >
    {children}
  </span>
);

/** Scale "punch" on a beat: 1 → peak → 1 over a few frames. Use on any element: style={{transform: `scale(${punch(frame, 30)})`}}. */
export const punch = (frame: number, at: number, peak = 1.08, dur = 8) =>
  interpolate(frame, [at, at + 2, at + dur], [1, peak, 1], clamp);

/** Text sized to fill `width` exactly (capped at `max` px). Needs @remotion/layout-utils and a loaded font. */
export const Fit: React.FC<{ text: string; width: number; max?: number; fontFamily: string; fontWeight?: number | string; letterSpacing?: string; style?: React.CSSProperties }> = ({
  text,
  width,
  max = 400,
  fontFamily,
  fontWeight = 900,
  letterSpacing,
  style,
}) => {
  const { fontSize } = fitText({ text, withinWidth: width, fontFamily, fontWeight, letterSpacing });
  return <span style={{ fontFamily, fontWeight, letterSpacing, fontSize: Math.min(max, fontSize), lineHeight: 0.95, whiteSpace: "pre", ...style }}>{text}</span>;
};
