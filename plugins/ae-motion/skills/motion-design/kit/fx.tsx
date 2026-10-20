import React, { useId } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, clamp, mix, prog } from "./easing";

const useSvgId = (prefix: string) => prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");

/** Directional motion blur (AE "Directional Blur" / CC Force Motion Blur look). x/y = blur in px along each axis. */
export const Smear: React.FC<{ x?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  x = 0,
  y = 0,
  children,
  style,
}) => {
  const id = useSvgId("smear");
  const active = Math.abs(x) + Math.abs(y) > 0.3;
  return (
    <>
      {active && (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={`${Math.abs(x)} ${Math.abs(y)}`} />
          </filter>
        </svg>
      )}
      <div style={{ ...style, filter: active ? `url(#${id})` : undefined }}>{children}</div>
    </>
  );
};

/** Glow: stacked drop-shadows. Wrap text, shapes or images. */
export const Glow: React.FC<{ color?: string; strength?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  color = "#ff2a3d",
  strength = 1,
  children,
  style,
}) => (
  <div
    style={{
      filter: `drop-shadow(0 0 ${6 * strength}px ${color}) drop-shadow(0 0 ${22 * strength}px ${color}) drop-shadow(0 0 ${60 * strength}px ${color})`,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Animated film grain overlay. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const frame = useCurrentFrame();
  const id = useSvgId("grain");
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 97} />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.65 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

export const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 0.12 }) => (
  <AbsoluteFill
    style={{ pointerEvents: "none", opacity, background: "repeating-linear-gradient(0deg, #000 0 2px, transparent 2px 4px)" }}
  />
);

/** Dot grid background (as in tech promos). Drifts slowly. */
export const DotGrid: React.FC<{ color?: string; gap?: number; size?: number; drift?: number; opacity?: number }> = ({
  color = "rgba(255,255,255,0.18)",
  gap = 28,
  size = 1.6,
  drift = 0.3,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage: `radial-gradient(${color} ${size}px, transparent ${size + 0.5}px)`,
        backgroundSize: `${gap}px ${gap}px`,
        backgroundPosition: `${frame * drift}px ${frame * drift * 0.5}px`,
      }}
    />
  );
};

/** Big soft colored glow blob (the red "light" behind text). */
export const Orb: React.FC<{ x?: string; y?: string; size?: number; color?: string; pulse?: boolean }> = ({
  x = "50%",
  y = "50%",
  size = 900,
  color = "rgba(255,30,50,0.55)",
  pulse = true,
}) => {
  const frame = useCurrentFrame();
  const s = pulse ? 1 + 0.06 * Math.sin(frame / 9) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%,-50%) scale(${s})`,
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        pointerEvents: "none",
      }}
    />
  );
};

/** Floating out-of-focus particles. */
export const Bokeh: React.FC<{ count?: number; color?: string; seed?: string; maxSize?: number }> = ({
  count = 18,
  color = "#ff2a3d",
  seed = "bokeh",
  maxSize = 26,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const size = 4 + r("s") * maxSize;
        const x = (r("x") * width + frame * (r("vx") - 0.5) * 0.8) % width;
        const y = (r("y") * height - frame * (0.2 + r("vy") * 0.6) + height) % height;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / (12 + r("t") * 20) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: tw * (0.25 + r("o") * 0.6),
              filter: `blur(${size * 0.25}px)`,
              boxShadow: `0 0 ${size}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Horizontal lens-flare streak that shoots open from the center (logo reveals). */
export const LightStreak: React.FC<{ delay?: number; color?: string; y?: string; thickness?: number }> = ({
  delay = 0,
  color = "#ff2a3d",
  y = "50%",
  thickness = 3,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 14, EASE.out);
  const fade = interpolate(frame, [delay + 20, delay + 45], [1, 0.5], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: y,
          width: "100%",
          height: thickness,
          transform: `translate(-50%,-50%) scaleX(${p})`,
          background: `linear-gradient(90deg, transparent, ${color} 30%, #fff 50%, ${color} 70%, transparent)`,
          boxShadow: `0 0 18px ${color}, 0 0 40px ${color}`,
          opacity: fade,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: y,
          width: 60,
          height: 60,
          borderRadius: "50%",
          transform: `translate(-50%,-50%) scale(${mix(0, 1, p)})`,
          background: `radial-gradient(circle, #fff 0%, ${color} 35%, transparent 70%)`,
          opacity: fade,
        }}
      />
    </>
  );
};

/** Radial burst of spark lines at `delay` (impact / logo hit). */
export const Sparks: React.FC<{ delay?: number; count?: number; color?: string; radius?: number; x?: string; y?: string }> = ({
  delay = 0,
  count = 22,
  color = "#ff5a5a",
  radius = 420,
  x = "50%",
  y = "50%",
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 22, EASE.out);
  if (frame < delay) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + random(`sp${i}`) * 0.4;
        const len = 20 + random(`spl${i}`) * 60;
        const d = radius * (0.5 + random(`spd${i}`) * 0.5) * p;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: len * (1 - p * 0.7),
              height: 2,
              background: color,
              boxShadow: `0 0 8px ${color}`,
              transform: `rotate(${a}rad) translateX(${d}px)`,
              transformOrigin: "0 50%",
              opacity: 1 - p,
            }}
          />
        );
      })}
    </div>
  );
};

/** Comic starburst / explosion shape behind text. */
export const Starburst: React.FC<{ size?: number; spikes?: number; color?: string; delay?: number; spin?: number; style?: React.CSSProperties }> = ({
  size = 900,
  spikes = 14,
  color = "#ff2a3d",
  delay = 0,
  spin = 0.3,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = prog(frame, delay, 10, EASE.back);
  const pts = Array.from({ length: spikes * 2 }, (_, i) => {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 50 : 50 * (0.55 + random(`sb${i}`) * 0.15);
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ transform: `scale(${p}) rotate(${(frame / fps) * spin * 60}deg)`, overflow: "visible", ...style }}
    >
      <polygon points={pts} fill={color} />
    </svg>
  );
};

/** Expanding ring (impact / transition accent). */
export const Shockwave: React.FC<{ delay?: number; color?: string; size?: number; x?: string; y?: string }> = ({
  delay = 0,
  color = "#ff2a3d",
  size = 1400,
  x = "50%",
  y = "50%",
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 20, EASE.out);
  if (frame < delay || p >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${mix(30, 1, p)}px solid ${color}`,
        transform: `translate(-50%,-50%) scale(${p})`,
        opacity: 1 - p,
      }}
    />
  );
};

/** CSS 3D cube with flat shading. */
export const Cube3D: React.FC<{ size?: number; color?: string; rx?: number; ry?: number }> = ({
  size = 260,
  color = "#ff2a3d",
  rx,
  ry,
}) => {
  const frame = useCurrentFrame();
  const h = size / 2;
  const faces: [string, number][] = [
    [`translateZ(${h}px)`, 1],
    [`rotateY(180deg) translateZ(${h}px)`, 0.6],
    [`rotateY(90deg) translateZ(${h}px)`, 0.8],
    [`rotateY(-90deg) translateZ(${h}px)`, 0.7],
    [`rotateX(90deg) translateZ(${h}px)`, 1.15],
    [`rotateX(-90deg) translateZ(${h}px)`, 0.5],
  ];
  return (
    <div style={{ perspective: size * 5, width: size, height: size }}>
      <div
        style={{
          width: size,
          height: size,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rx ?? -20 + Math.sin(frame / 30) * 8}deg) rotateY(${ry ?? frame * 2}deg)`,
        }}
      >
        {faces.map(([t, light], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              background: color,
              filter: `brightness(${light})`,
              transform: t,
              backfaceVisibility: "hidden",
            }}
          />
        ))}
      </div>
    </div>
  );
};

/** Camera viewfinder: corner brackets + REC dot. */
export const Viewfinder: React.FC<{ color?: string; inset?: number; delay?: number }> = ({ color = "#fff", inset = 60, delay = 0 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 12);
  const i = mix(inset * 3, inset, p);
  const corner = (pos: React.CSSProperties) => (
    <div style={{ position: "absolute", width: 60, height: 60, borderColor: color, borderStyle: "solid", borderWidth: 0, ...pos }} />
  );
  return (
    <AbsoluteFill style={{ opacity: p, pointerEvents: "none" }}>
      {corner({ top: i, left: i, borderTopWidth: 4, borderLeftWidth: 4 })}
      {corner({ top: i, right: i, borderTopWidth: 4, borderRightWidth: 4 })}
      {corner({ bottom: i, left: i, borderBottomWidth: 4, borderLeftWidth: 4 })}
      {corner({ bottom: i, right: i, borderBottomWidth: 4, borderRightWidth: 4 })}
      <div
        style={{
          position: "absolute",
          top: i + 20,
          left: i + 90,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#ff2a3d",
          opacity: Math.floor(frame / 15) % 2 ? 1 : 0.2,
        }}
      />
    </AbsoluteFill>
  );
};

/** HUD ring: tick marks circle that rotates, glowing core. */
export const HudRing: React.FC<{ size?: number; color?: string; delay?: number }> = ({ size = 420, color = "#ff2a3d", delay = 0 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 18);
  const ticks = 72;
  return (
    <div style={{ width: size, height: size, position: "relative", transform: `scale(${mix(0.6, 1, p)})`, opacity: p }}>
      <svg viewBox="-50 -50 100 100" width={size} height={size} style={{ position: "absolute", transform: `rotate(${frame * 0.6}deg)` }}>
        {Array.from({ length: ticks }, (_, k) => (
          <line key={k} x1={0} y1={-48} x2={0} y2={k % 6 === 0 ? -44 : -46} stroke={color} strokeWidth={0.5} transform={`rotate(${(k / ticks) * 360})`} />
        ))}
        <circle r={36} fill="none" stroke={color} strokeWidth={1.2} strokeDasharray={`${p * 226} 226`} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: size * 0.06,
          height: size * 0.06,
          borderRadius: "50%",
          transform: "translate(-50%,-50%)",
          background: "#fff",
          boxShadow: `0 0 20px ${color}, 0 0 60px ${color}`,
        }}
      />
    </div>
  );
};

/** Black bars for a cinemascope look. */
export const Letterbox: React.FC<{ ratio?: number; delay?: number }> = ({ ratio = 2.39, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bar = Math.max(0, (height - width / ratio) / 2) * prog(frame, delay, 15, EASE.inOut);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: bar, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: bar, background: "#000" }} />
    </AbsoluteFill>
  );
};

/** White (or any color) flash on a cut. Put at the start of the incoming shot. */
export const Flash: React.FC<{ color?: string; dur?: number; delay?: number }> = ({ color = "#fff", dur = 6, delay = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 1, delay + dur], [0, 1, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} /> : null;
};
