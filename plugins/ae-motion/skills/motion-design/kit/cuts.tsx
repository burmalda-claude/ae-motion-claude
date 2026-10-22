// Transition engine. A transition should disappear into the cut and serve the emotion of the shot.
// Use with <TransitionSeries>: it overlaps the two shots automatically (both are rendered during the transition).
//   const t = transition("blurDissolve");            // {presentation, timing, frames} or null for a clean cut
//   {t && <TransitionSeries.Transition presentation={t.presentation} timing={t.timing} />}
import React from "react";
import { AbsoluteFill, Freeze, interpolate, random, useCurrentFrame } from "remotion";
import { linearTiming } from "@remotion/transitions";
import type { TransitionPresentation, TransitionPresentationComponentProps, TransitionTiming } from "@remotion/transitions";
import { EASE, mix } from "./easing";
import { Smear } from "./fx";
import { whip as whipP, zoomBlur as zoomBlurP } from "./transitions";

// ---------------------------------------------------------------- easing
/** Linear is not offered on purpose: linear transitions read as mechanical. */
export const CUT_EASE = {
  ease: EASE.easy, // AE Easy Ease
  sCurve: EASE.inOut, // strong S — speed ramps, pushes
  out: EASE.out,
  in: EASE.in,
  bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => {
    // cubic-bezier(x1,y1,x2,y2) evaluated by binary search on x
    const bx = (s: number) => 3 * x1 * s * (1 - s) ** 2 + 3 * x2 * s * s * (1 - s) + s ** 3;
    const by = (s: number) => 3 * y1 * s * (1 - s) ** 2 + 3 * y2 * s * s * (1 - s) + s ** 3;
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 24; k++) {
      const m = (lo + hi) / 2;
      if (bx(m) < t) lo = m;
      else hi = m;
    }
    return by((lo + hi) / 2);
  },
};
export type CutEaseName = Exclude<keyof typeof CUT_EASE, "bezier">;

type P<T extends Record<string, unknown>> = TransitionPresentationComponentProps<T>;
const enter = (d: string) => d === "entering";

// ---------------------------------------------------------------- B) dissolves
type DissolveProps = { blur?: number; scale?: number };
const DissolveComp: React.FC<P<DissolveProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const b = (passedProps.blur ?? 0) * Math.sin(p * Math.PI);
  const sc = passedProps.scale ?? 0;
  // both shots keep drifting 100% → 103% so the dissolve reads as an impulse, not a fade
  const s = 1 + sc * p;
  return <AbsoluteFill style={{ opacity: enter(presentationDirection) ? p : 1, filter: b > 0.1 ? `blur(${b}px)` : undefined, transform: `scale(${s})` }}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------- C) wipes & reveals (always with an edge)
type WipeProps = { shape?: "circle" | "diagonal" | "panel"; x?: number; y?: number; edge?: string; edgeWidth?: number };
const WipeComp: React.FC<P<WipeProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const { shape = "circle", x = 50, y = 50, edge = "#fff", edgeWidth = 6 } = passedProps;
  if (!enter(presentationDirection)) return <AbsoluteFill style={{ transform: `scale(${1 + 0.04 * p})` }}>{children}</AbsoluteFill>;
  let clip = "";
  let edgeEl: React.ReactNode = null;
  if (shape === "circle") {
    const r = p * 150;
    clip = `circle(${r}% at ${x}% ${y}%)`;
    edgeEl = <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: `${r * 2 * 1.2}vmax`, height: `${r * 2 * 1.2}vmax`, transform: "translate(-50%,-50%)", borderRadius: "50%", border: `${edgeWidth}px solid ${edge}`, boxShadow: `0 0 24px ${edge}` }} />;
  } else if (shape === "diagonal") {
    const k = mix(-30, 130, p);
    clip = `polygon(0 0, ${k}% 0, ${k - 30}% 100%, 0 100%)`;
    edgeEl = (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <line x1={k} y1={0} x2={k - 30} y2={100} stroke={edge} strokeWidth={edgeWidth / 6} vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 6px ${edge})` }} />
      </svg>
    );
  } else {
    const k = p * 100;
    clip = `inset(0 ${100 - k}% 0 0)`;
    edgeEl = <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(${k}% - ${edgeWidth / 2}px)`, width: edgeWidth, background: edge, boxShadow: `0 0 24px ${edge}` }} />;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>
      {p > 0.01 && p < 0.99 && edgeEl}
    </AbsoluteFill>
  );
};

type MatchProps = { x: number; y: number; r0?: number; edge?: string };
/** Match-cut reveal: a shape at (x,y)% in A (eye) becomes the window into B (moon). */
const MatchComp: React.FC<P<MatchProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const { x, y, r0 = 6, edge = "#fff" } = passedProps;
  if (!enter(presentationDirection))
    return <AbsoluteFill style={{ transformOrigin: `${x}% ${y}%`, transform: `scale(${1 + p * 3})`, filter: `blur(${p * 6}px)` }}>{children}</AbsoluteFill>;
  const r = mix(r0, 150, EASE.in(p));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${r}% at ${x}% ${y}%)`, transformOrigin: `${x}% ${y}%`, transform: `scale(${mix(0.6, 1, p)})` }}>{children}</AbsoluteFill>
      {p < 0.95 && <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: `${r * 2.4}vmax`, height: `${r * 2.4}vmax`, transform: "translate(-50%,-50%)", borderRadius: "50%", border: `3px solid ${edge}`, opacity: 1 - p }} />}
    </AbsoluteFill>
  );
};

type MatteProps = { color?: string; width?: number };
/** Track-matte wipe: a moving foreground object (dark bar) crosses the frame and carries B behind it. */
const MatteComp: React.FC<P<MatteProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const { color = "#111", width = 28 } = passedProps;
  if (!enter(presentationDirection)) return <AbsoluteFill>{children}</AbsoluteFill>;
  const x = mix(-width, 100 + width, p);
  const v = Math.sin(p * Math.PI) * 50;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>{children}</AbsoluteFill>
      <div style={{ position: "absolute", top: "-10%", bottom: "-10%", left: `${x - width}%`, width: `${width}%`, transform: "skewX(-8deg)" }}>
        <Smear x={v} style={{ width: "100%", height: "100%" }}>
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(90deg, ${color}00, ${color} 30%, ${color} 70%, #fff4 100%)` }} />
        </Smear>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- E) atmospheric
type LeakProps = { tone?: "warm" | "cool"; burn?: boolean };
const LeakComp: React.FC<P<LeakProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const peak = Math.sin(p * Math.PI);
  const cols = passedProps.tone === "cool" ? ["#5ab0ff", "#b388ff", "#ffffff"] : ["#ff7a18", "#ffb347", "#fff2d0"];
  const content = <AbsoluteFill style={{ opacity: enter(presentationDirection) ? EASE.inOut(p) : 1 }}>{children}</AbsoluteFill>;
  if (!enter(presentationDirection)) return content;
  return (
    <AbsoluteFill>
      {content}
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: peak, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${mix(10, 90, p)}% 40%, ${cols[0]} 0%, transparent 55%)` }} />
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${mix(90, 30, p)}% 70%, ${cols[1]} 0%, transparent 50%)` }} />
        {passedProps.burn && <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, ${cols[2]} ${peak * 40}%, transparent ${peak * 80}%)` }} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type GlitchProps = { phonk?: boolean; accent?: string };
/** Glitch burst: A until the middle, B after; RGB split + slice offsets + scanlines; phonk adds VHS darkness + 1-frame invert. */
const GlitchComp: React.FC<P<GlitchProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const showing = enter(presentationDirection) ? p >= 0.5 : p < 0.5;
  if (!showing) return null;
  const k = Math.sin(p * Math.PI);
  const seed = Math.floor(p * 12);
  const off = k * 40;
  const slices = Array.from({ length: 6 }, (_, i) => ({ t: random(`gs${seed}${i}`) * 90, h: 3 + random(`gh${seed}${i}`) * 10, dx: (random(`gx${seed}${i}`) - 0.5) * 300 * k }));
  const inv = passedProps.phonk && Math.abs(p - 0.5) < 0.09;
  return (
    <AbsoluteFill style={{ filter: `${inv ? "invert(1) " : ""}${passedProps.phonk ? "contrast(1.4) saturate(0.6)" : ""}` }}>
      <AbsoluteFill style={{ transform: `translateX(${off}px)`, mixBlendMode: "screen", opacity: 0.8, filter: "sepia(1) hue-rotate(-50deg) saturate(5)" }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${-off}px)`, mixBlendMode: "screen", opacity: 0.8, filter: "sepia(1) hue-rotate(150deg) saturate(5)" }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ mixBlendMode: "normal", opacity: 1 - k * 0.5 }}>{children}</AbsoluteFill>
      {slices.map((s, i) => (
        <AbsoluteFill key={i} style={{ clipPath: `inset(${s.t}% 0 ${100 - s.t - s.h}% 0)`, transform: `translateX(${s.dx}px)` }}>
          {children}
        </AbsoluteFill>
      ))}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 2px, transparent 2px 4px)", opacity: k }} />
      {passedProps.phonk && <AbsoluteFill style={{ background: `radial-gradient(ellipse, transparent 40%, rgba(0,0,0,${0.7 * k}) 100%)` }} />}
    </AbsoluteFill>
  );
};

type ParticleProps = { cells?: number; color?: string };
/** Particle dissolve: B appears through randomly ordered square cells; sparks fly off the boundary. */
const ParticleComp: React.FC<P<ParticleProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (!enter(presentationDirection)) return <AbsoluteFill style={{ filter: `blur(${p * 3}px)` }}>{children}</AbsoluteFill>;
  const n = passedProps.cells ?? 24;
  const rows = Math.round(n * 0.5625);
  const rects: string[] = [];
  const sparks: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < n; c++) {
      const t = random(`pc${r}-${c}`) * 0.85;
      if (p >= t + 0.15) rects.push(`<rect x='${c}' y='${r}' width='1.05' height='1.05'/>`);
      else if (p >= t)
        sparks.push(
          <div key={`${r}-${c}`} style={{ position: "absolute", left: `${((c + 0.5) / n) * 100}%`, top: `${((r + 0.5) / rows) * 100}%`, width: 6, height: 6, borderRadius: "50%", background: passedProps.color ?? "#fff", boxShadow: `0 0 10px ${passedProps.color ?? "#fff"}`, transform: `translate(${(p - t) * 600 * (random(`sx${r}${c}`) - 0.5)}px, ${-(p - t) * 500}px)` }} />,
        );
    }
  const mask = `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${n} ${rows}' preserveAspectRatio='none'>${rects.join("")}</svg>`)}")`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}>{children}</AbsoluteFill>
      {sparks}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 2026 trend presets
type LiquidProps = { color?: string };
/** Liquid fill: B rises from the bottom behind a wobbling fluid edge with an accent meniscus. */
const LiquidComp: React.FC<P<LiquidProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (!enter(presentationDirection)) return <AbsoluteFill style={{ transform: `translateY(${-p * 6}%)` }}>{children}</AbsoluteFill>;
  const level = mix(115, -15, EASE.inOut(p));
  const wave = (off: number, amp: number) => {
    const pts = Array.from({ length: 41 }, (_, i) => {
      const x = (i / 40) * 100;
      const y = level + off + Math.sin(i * 0.55 + p * 14) * amp + Math.sin(i * 0.21 - p * 9) * amp * 0.7;
      return `${x}% ${y}%`;
    });
    return `polygon(0% 100%, ${pts.join(", ")}, 100% 100%)`;
  };
  const amp = 4 * Math.sin(p * Math.PI) + 0.5;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: wave(-2.5, amp), background: passedProps.color ?? "#b6ff00" }} />
      <AbsoluteFill style={{ clipPath: wave(0, amp) }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Kinetic split: A tears into top/bottom halves that fly apart with motion blur, B pushes in behind. */
const SplitComp: React.FC<P<Record<string, never>>> = ({ children, presentationDirection, presentationProgress: p }) => {
  if (enter(presentationDirection)) return <AbsoluteFill style={{ transform: `scale(${mix(1.12, 1, EASE.out(p))})` }}>{children}</AbsoluteFill>;
  const e = EASE.in(p);
  const v = Math.sin(p * Math.PI) * 60;
  return (
    <AbsoluteFill>
      {[0, 1].map((h) => (
        <AbsoluteFill key={h} style={{ clipPath: h ? "inset(50% 0 0 0)" : "inset(0 0 50% 0)", transform: `translate(${(h ? 1 : -1) * e * 30}%, ${(h ? 1 : -1) * e * 60}%) rotate(${(h ? 1 : -1) * e * 6}deg)` }}>
          <Smear y={v} style={{ width: "100%", height: "100%" }}>
            <AbsoluteFill>{children}</AbsoluteFill>
          </Smear>
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

/** 2D/3D hybrid: A tips back into depth, B flies out of the screen towards the viewer and lands. */
const DepthComp: React.FC<P<Record<string, never>>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const e = EASE.inOut(p);
  const style: React.CSSProperties = enter(presentationDirection)
    ? { transform: `perspective(1600px) translateZ(${mix(900, 0, e)}px) rotateX(${mix(-25, 0, e)}deg)`, opacity: Math.min(1, p * 2.5), filter: `blur(${(1 - e) * 10}px)` }
    : { transform: `perspective(1600px) translateZ(${mix(0, -1400, e)}px) rotateX(${mix(0, 60, e)}deg)`, opacity: 1 - e * 0.8 };
  return <AbsoluteFill style={{ ...style, transformStyle: "preserve-3d" }}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------- edit staples (measured in 28 TikTok edits)
/** Whiteout: A blows out to white with bloom, B emerges from white — the #1 edit transition. */
const WhiteoutComp: React.FC<P<{ color?: string }>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const c = passedProps.color ?? "#fff";
  const k = enter(presentationDirection) ? 1 - p : p; // 1 = fully white
  const w = EASE.out(Math.min(1, k * 1.4));
  const show = enter(presentationDirection) ? p >= 0.35 : p < 0.35;
  if (!show) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `brightness(${1 + w * 2.5}) blur(${w * 12}px)`, transform: `scale(${1 + w * 0.08})` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: c, opacity: w }} />
    </AbsoluteFill>
  );
};
/** Black dip: A cuts to black for the middle frames, B cuts in. */
const BlackDipComp: React.FC<P<Record<string, never>>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const show = enter(presentationDirection) ? p >= 0.75 : p < 0.25;
  return show ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

// ---------------------------------------------------------------- edit staples II (tools/transscan.py over the 28 reference edits)
/** Exposure settle: A blows out in ~1 frame, (optional pure-color hold), B starts overexposed + soft and settles. Measured: up 1 f, down 4–8 f. */
const ExposureComp: React.FC<P<{ color?: string; hold?: number }>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const c = passedProps.color ?? "#fff";
  const up = 0.12;
  const hold = passedProps.hold ?? 0;
  if (!enter(presentationDirection)) return p < up ? <AbsoluteFill style={{ filter: `brightness(${1 + (p / up) * 3})` }}>{children}</AbsoluteFill> : null;
  if (p < up) return null;
  if (p < up + hold) return <AbsoluteFill style={{ background: c }} />;
  const w = 1 - EASE.out((p - up - hold) / (1 - up - hold));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `brightness(${1 + w * 2.2}) contrast(${1 - w * 0.4}) blur(${w * 10}px)` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: c, opacity: w * 0.85 }} />
    </AbsoluteFill>
  );
};

/** Frame flip: hard cut in the middle; the 1–2 frames around it are negative (invert) or 1-bit b/w (threshold), smeared. */
const FrameFlipComp: React.FC<P<{ mode?: "invert" | "threshold"; width?: number }>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (enter(presentationDirection) ? p < 0.5 : p >= 0.5) return null;
  const on = Math.abs(p - 0.5) < (passedProps.width ?? 0.45); // p is eased: a wide window still means only the frames next to the cut
  const fx = passedProps.mode === "threshold" ? "grayscale(1) contrast(9) brightness(1.15)" : "invert(1) contrast(1.3) blur(6px)";
  return <AbsoluteFill style={on ? { filter: fx, transform: "scale(1.06)" } : undefined}>{children}</AbsoluteFill>;
};

/** Shrink & pop: A shrinks to a point over `bg` (ease-in), B pops in oversized with glow and settles. */
const ShrinkPopComp: React.FC<P<{ bg?: string }>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const mid = 0.6;
  if (!enter(presentationDirection)) {
    if (p >= mid) return null;
    const e = EASE.inOut(p / mid);
    return (
      <AbsoluteFill style={{ background: passedProps.bg ?? "#000" }}>
        <AbsoluteFill style={{ transform: `scale(${1 - 0.88 * e})`, filter: `blur(${e * 3}px)` }}>{children}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (p < mid) return null;
  const q = (p - mid) / (1 - mid);
  return <AbsoluteFill style={{ transform: `scale(${mix(1.35, 1, EASE.out(q))})`, filter: `blur(${(1 - q) * 8}px) brightness(${1 + (1 - q) * 0.8})` }}>{children}</AbsoluteFill>;
};

/** Punch-in: hard cut first, B lands at 130–150 % with a radial zoom blur and settles (the most common edit cut). */
const PunchInComp: React.FC<P<{ peak?: number }>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (!enter(presentationDirection)) return null;
  const k = 1 - p;
  const s = 1 + ((passedProps.peak ?? 1.4) - 1) * k;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${s})`, filter: `blur(${k * 4}px) brightness(${1 + k * 0.4})` }}>{children}</AbsoluteFill>
      {k > 0.05 &&
        [1.06, 1.13].map((z, i) => (
          <AbsoluteFill key={i} style={{ transform: `scale(${s * (1 + (z - 1) * k * 2)})`, opacity: (0.35 - i * 0.12) * k, filter: `blur(${6 + i * 6}px)` }}>
            {children}
          </AbsoluteFill>
        ))}
    </AbsoluteFill>
  );
};

/** Push: B pushes A out of frame (both move), motion blur along the axis. */
const PushComp: React.FC<P<{ direction?: "up" | "down" | "left" | "right" }>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const d = passedProps.direction ?? "up";
  const [ax, sg] = ({ up: ["Y", -1], down: ["Y", 1], left: ["X", -1], right: ["X", 1] } as const)[d];
  const off = enter(presentationDirection) ? -sg * (1 - p) * 100 : sg * p * 100;
  const v = Math.sin(p * Math.PI) * 50;
  return (
    <AbsoluteFill style={{ transform: `translate${ax}(${-off}%)` }}>
      <Smear {...(ax === "X" ? { x: v } : { y: v })} style={{ width: "100%", height: "100%" }}>
        <AbsoluteFill>{children}</AbsoluteFill>
      </Smear>
    </AbsoluteFill>
  );
};

/** SVG mosaic: blocks of `size` px (1 = off). */
const Pixelate: React.FC<{ size: number; children: React.ReactNode }> = ({ size, children }) => {
  const s = Math.round(size);
  if (s < 2) return <AbsoluteFill>{children}</AbsoluteFill>;
  const h = Math.floor(s / 2);
  const id = `aem-px-${s}`; // same size → identical filter, a duplicate id is harmless
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="0" y="0" width="100%" height="100%">
          <feFlood x={h} y={h} width={1} height={1} />
          <feComposite width={s} height={s} />
          <feTile result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
          <feMorphology operator="dilate" radius={h} />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#${id})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
/** Pixelate: A breaks into big blocks, B resolves out of them (optionally out of white, as in the edits). */
const PixelateComp: React.FC<P<{ max?: number; white?: boolean }>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const max = passedProps.max ?? 56;
  const b = enter(presentationDirection);
  if (b ? p < 0.5 : p >= 0.5) return null;
  const q = b ? 1 - (p - 0.5) * 2 : p * 2; // 1 = most blocky
  return (
    <AbsoluteFill style={passedProps.white ? { filter: `brightness(${1 + q * 2})` } : undefined}>
      <Pixelate size={1 + (max - 1) * q}>{children}</Pixelate>
    </AbsoluteFill>
  );
};

/** TV off/on: A collapses into a bright horizontal line on black, B opens out of the line. */
const TvComp: React.FC<P<Record<string, never>>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const b = enter(presentationDirection);
  if (b ? p < 0.5 : p >= 0.5) return null;
  const q = b ? 1 - (p - 0.5) * 2 : p * 2; // 1 = collapsed
  const sy = mix(1, 0.008, b ? EASE.out(q) : EASE.in(q));
  const sx = q > 0.75 ? mix(1, 0.05, (q - 0.75) / 0.25) : 1;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${sx}, ${sy})`, filter: `brightness(${1 + q * 4}) contrast(${1 + q})` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0 2px, transparent 2px 5px)", opacity: q }} />
    </AbsoluteFill>
  );
};

/** Hue sweep: the palette rotates through the spectrum while B dissolves in. */
const HueComp: React.FC<P<{ deg?: number }>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const deg = passedProps.deg ?? 160;
  return enter(presentationDirection) ? (
    <AbsoluteFill style={{ opacity: p, filter: `hue-rotate(${(p - 1) * deg}deg) saturate(${1 + (1 - p) * 0.8})` }}>{children}</AbsoluteFill>
  ) : (
    <AbsoluteFill style={{ filter: `hue-rotate(${p * deg}deg) saturate(${1 + p * 0.8})` }}>{children}</AbsoluteFill>
  );
};

/** Stutter: the edit flickers A/B/A/B every 2–3 frames before landing on B. */
const StutterComp: React.FC<P<{ flips?: number }>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const n = passedProps.flips ?? 4;
  const seg = Math.min(n, Math.floor(p * (n + 1)));
  const showB = seg % 2 === 1 || seg === n;
  return enter(presentationDirection) === showB ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

/** Card expand: B appears as a rounded card in the middle and grows to full frame; A recedes and darkens. */
const CardComp: React.FC<P<{ inset?: number; edge?: string }>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (!enter(presentationDirection)) return <AbsoluteFill style={{ transform: `scale(${1 - 0.06 * p})`, filter: `brightness(${1 - 0.5 * p}) blur(${p * 4}px)` }}>{children}</AbsoluteFill>;
  const i = (passedProps.inset ?? 18) * (1 - p);
  const r = 60 * (1 - p);
  return (
    <AbsoluteFill style={{ clipPath: `inset(${i}% ${i}% round ${r}px)`, opacity: Math.min(1, p * 4) }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.15 * (1 - p)})` }}>{children}</AbsoluteFill>
      {p < 0.95 && <AbsoluteFill style={{ boxShadow: `inset 0 0 0 4px ${passedProps.edge ?? "#fff"}`, borderRadius: r, margin: `${i}%`, opacity: 1 - p }} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- registry
export type CutKind =
  | "cut"
  | "dissolve"
  | "blurDissolve"
  | "scaleDissolve"
  | "shapeWipe"
  | "matchReveal"
  | "matteWipe"
  | "lightLeak"
  | "filmBurn"
  | "glitch"
  | "phonk"
  | "particle"
  | "liquid"
  | "split"
  | "depth"
  | "whip"
  | "zoom"
  | "whiteout"
  | "blackDip"
  | "exposure"
  | "invertCut"
  | "threshold"
  | "shrinkPop"
  | "punchIn"
  | "push"
  | "pixelate"
  | "tvOff"
  | "hueShift"
  | "stutter"
  | "card";

export const CUT_CATEGORY: Record<CutKind, "cut" | "dissolve" | "wipe" | "speed" | "atmospheric" | "trend" | "edit"> = {
  cut: "cut",
  dissolve: "dissolve",
  blurDissolve: "dissolve",
  scaleDissolve: "dissolve",
  shapeWipe: "wipe",
  matchReveal: "wipe",
  matteWipe: "wipe",
  lightLeak: "atmospheric",
  filmBurn: "atmospheric",
  glitch: "atmospheric",
  phonk: "trend",
  particle: "atmospheric",
  liquid: "trend",
  split: "trend",
  depth: "trend",
  whip: "speed",
  zoom: "speed",
  whiteout: "atmospheric",
  blackDip: "cut",
  exposure: "edit",
  invertCut: "edit",
  threshold: "edit",
  shrinkPop: "edit",
  punchIn: "edit",
  push: "speed",
  pixelate: "edit",
  tvOff: "edit",
  hueShift: "edit",
  stutter: "edit",
  card: "edit",
};

/** Default frames: 6–16 for "invisible" transitions; longer only for drama. */
export const CUT_FRAMES: Record<CutKind, number> = {
  cut: 0,
  dissolve: 12,
  blurDissolve: 12,
  scaleDissolve: 10,
  shapeWipe: 12,
  matchReveal: 14,
  matteWipe: 12,
  lightLeak: 16,
  filmBurn: 16,
  glitch: 6,
  phonk: 6,
  particle: 16,
  liquid: 16,
  split: 10,
  depth: 14,
  whip: 8,
  zoom: 10,
  whiteout: 8,
  blackDip: 8,
  exposure: 8,
  invertCut: 4,
  threshold: 3,
  shrinkPop: 8,
  punchIn: 6,
  push: 8,
  pixelate: 10,
  tvOff: 10,
  hueShift: 8,
  stutter: 10,
  card: 10,
};
const DEFAULT_EASE: Partial<Record<CutKind, CutEaseName>> = { whip: "sCurve", zoom: "sCurve", depth: "sCurve", split: "in", liquid: "ease", glitch: "ease", phonk: "ease", push: "sCurve", card: "out" };
/** Moving transitions get motion blur by default (whip, zoom, split, depth already include it). */
export const CUT_MOTION_BLUR: CutKind[] = ["whip", "zoom", "split", "depth", "matteWipe", "matchReveal", "push", "punchIn"];

export type CutOptions = {
  frames?: number;
  ease?: CutEaseName | ((t: number) => number);
  /** escape hatch; linear easing is refused unless this is set */
  allowLinear?: boolean;
  props?: Record<string, unknown>;
};

/** Build a transition. Returns null for "cut" (no overlap: a clean cut needs nothing). */
export function transition(kind: CutKind, opts: CutOptions = {}): { presentation: TransitionPresentation<any>; timing: TransitionTiming; frames: number } | null {
  if (kind === "cut") return null;
  const frames = opts.frames ?? CUT_FRAMES[kind];
  const ease = typeof opts.ease === "function" ? opts.ease : CUT_EASE[opts.ease ?? DEFAULT_EASE[kind] ?? "ease"];
  if (!opts.allowLinear && ease(0.25) === 0.25 && ease(0.75) === 0.75) throw new Error(`transition(${kind}): linear easing is disabled — pick ease, sCurve, out, in or bezier`);
  const pr = opts.props ?? {};
  const comp: Record<Exclude<CutKind, "cut">, TransitionPresentation<any>> = {
    dissolve: { component: DissolveComp, props: { ...pr } },
    blurDissolve: { component: DissolveComp, props: { blur: 10, ...pr } },
    scaleDissolve: { component: DissolveComp, props: { scale: 0.03, blur: 2, ...pr } },
    shapeWipe: { component: WipeComp, props: { shape: "circle", ...pr } },
    matchReveal: { component: MatchComp, props: { x: 50, y: 50, ...pr } },
    matteWipe: { component: MatteComp, props: { ...pr } },
    lightLeak: { component: LeakComp, props: { tone: "warm", ...pr } },
    filmBurn: { component: LeakComp, props: { tone: "warm", burn: true, ...pr } },
    glitch: { component: GlitchComp, props: { ...pr } },
    phonk: { component: GlitchComp, props: { phonk: true, ...pr } },
    particle: { component: ParticleComp, props: { ...pr } },
    liquid: { component: LiquidComp, props: { ...pr } },
    split: { component: SplitComp, props: {} },
    depth: { component: DepthComp, props: {} },
    whip: whipP({ direction: "left", ...(pr as object) }),
    zoom: zoomBlurP(),
    whiteout: { component: WhiteoutComp, props: { ...pr } },
    blackDip: { component: BlackDipComp, props: {} },
    exposure: { component: ExposureComp, props: { ...pr } },
    invertCut: { component: FrameFlipComp, props: { mode: "invert", ...pr } },
    threshold: { component: FrameFlipComp, props: { mode: "threshold", ...pr } },
    shrinkPop: { component: ShrinkPopComp, props: { ...pr } },
    punchIn: { component: PunchInComp, props: { ...pr } },
    push: { component: PushComp, props: { ...pr } },
    pixelate: { component: PixelateComp, props: { ...pr } },
    tvOff: { component: TvComp, props: {} },
    hueShift: { component: HueComp, props: { ...pr } },
    stutter: { component: StutterComp, props: { ...pr } },
    card: { component: CardComp, props: { ...pr } },
  };
  return { presentation: comp[kind], timing: linearTiming({ durationInFrames: frames, easing: ease }), frames };
}

// ---------------------------------------------------------------- smart picker (/transition random)
export type Energy = "low" | "mid" | "high";
export type CutContext = { from: Energy; to: Energy; bpm?: number; textToText?: boolean; timePasses?: boolean; matchShape?: { x: number; y: number }; onBeat?: boolean };
/** Choose a transition from shot energy, BPM and intent — the clean cut first, effects only when motivated. */
export function pickTransition(c: CutContext): { kind: CutKind; frames: number; why: string } {
  const bpm = c.bpm ?? 120;
  const f = (k: CutKind, why: string, frames = CUT_FRAMES[k]) => ({ kind: k, frames, why });
  if (c.matchShape) return f("matchReveal", "shapes match across the cut — let the shape carry it");
  if (c.textToText) return f("liquid", "text becomes text — morph the words (MorphText), fluid bridge for the background", 12);
  if (c.timePasses) return f("blurDissolve", "time passes — dissolve says so", c.from === "high" ? 16 : 12);
  if (c.from === c.to && c.to !== "high") return f("cut", "same energy and rhythm — a clean cut is invisible");
  if (c.from === "high" && c.to === "low") return f("lightLeak", "energy drops — soften with light", 16);
  if (c.from !== "high" && c.to === "high") return bpm >= 120 ? f("zoom", "energy jumps — punch into the drop on the beat", 8) : f("whip", "energy rises — whip into it", 8);
  if (c.from === "high" && c.to === "high") {
    if (c.onBeat) return f("punchIn", "on the beat: hard cut + B lands oversized and settles — the most common cut in real edits");
    return bpm >= 130 ? f("phonk", "high-energy edit at fast tempo — short glitch hit", 6) : f("exposure", "edit staple: blow out in 1 frame, B settles out of the overexposure");
  }
  if (c.from === "mid" && c.to === "low") return f("scaleDissolve", "gentle step down — dissolve with a 3% push", 10);
  return f("shapeWipe", "different scenes, same energy — a clean shape wipe with an edge", 12);
}

// ---------------------------------------------------------------- speed ramp (no effect at all)
/** Remapped source frame for a shot whose last `n` frames ramp speed 100% → `low` (S-curve), or first `n` frames `low` → 100%. */
export function rampFrame(f: number, n: number, low: number, at: "end" | "start", dur: number): number {
  const speed = (i: number) => {
    if (at === "end") {
      const k = (i - (dur - n)) / n;
      return k <= 0 ? 1 : mix(1, low, EASE.inOut(Math.min(1, k)));
    }
    const k = i / n;
    return k >= 1 ? 1 : mix(low, 1, EASE.inOut(k));
  };
  let t = 0;
  for (let i = 0; i < f; i++) t += speed(i);
  return t;
}
/** Speed-ramp cut: A slows to `low` (40–50%) into the cut, B starts at `low` and ramps back to 100%. Shots must be frame-driven components (or <OffthreadVideo>). */
export const SpeedRampCut: React.FC<{ A: React.FC; B: React.FC; aDur: number; bDur: number; ramp?: number; low?: number }> = ({ A, B, aDur, bDur, ramp = 12, low = 0.45 }) => {
  const f = useCurrentFrame();
  if (f < aDur)
    return (
      <Freeze frame={Math.round(rampFrame(f, ramp, low, "end", aDur))}>
        <A />
      </Freeze>
    );
  return (
    <Freeze frame={Math.round(rampFrame(Math.min(f - aDur, bDur), ramp, low, "start", bDur))}>
      <B />
    </Freeze>
  );
};

// ---------------------------------------------------------------- morphing text
/** Mount once: SVG "goo" filter used by MorphText / fluid shapes. */
export const GooDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="goo">
      <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
    </filter>
  </svg>
);
/** Fluid text morph: letters of `from` melt into `to` (blur + alpha threshold). Text must be a solid color. */
export const MorphText: React.FC<{ from: string; to: string; at: number; dur?: number; style?: React.CSSProperties }> = ({ from, to, at, dur = 14, style }) => {
  const f = useCurrentFrame();
  const p = EASE.inOut(interpolate(f, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const blur = Math.sin(p * Math.PI) * 14;
  const layer = (t: string, o: number) => (
    <div style={{ gridArea: "1/1", opacity: o, filter: `blur(${blur}px)`, whiteSpace: "pre", textAlign: "center" }}>{t}</div>
  );
  return (
    <div style={{ display: "grid", filter: "url(#goo)", ...style }}>
      {layer(from, 1 - p)}
      {layer(to, p)}
    </div>
  );
};

// ---------------------------------------------------------------- beat sync
/** Snap a frame to the nearest beat frame (beats from tools/beats.py or beatFrames()). */
export const snapToBeat = (frame: number, beats: number[]) => beats.reduce((best, b) => (Math.abs(b - frame) < Math.abs(best - frame) ? b : best), beats[0] ?? frame);
