// Effects reverse-engineered from kinetic tech trailers (frame-by-frame study).
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, clamp, mix, pop, prog } from "./easing";
import { Smear } from "./fx";

/** Radial zoom-blur entrance: content rushes in from `from` scale with trailing echo copies (fake radial blur). */
export const ZoomIn: React.FC<{ children: React.ReactNode; delay?: number; from?: number; dur?: number; echoes?: number; style?: React.CSSProperties }> = ({
  children,
  delay = 0,
  from = 3.2,
  dur = 6,
  echoes = 6,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.out);
  const pPrev = prog(frame - 1, delay, dur, EASE.out);
  const s = mix(from, 1, p);
  const v = Math.abs(mix(from, 1, p) - mix(from, 1, pPrev)); // scale speed per frame
  if (frame < delay) return null;
  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      {v > 0.002 &&
        Array.from({ length: echoes }, (_, i) => (
          <div
            key={i}
            style={{ position: "absolute", inset: 0, transform: `scale(${s * (1 + (i + 1) * v * 0.35 * Math.sign(from - 1))})`, opacity: 0.35 * (1 - i / echoes), filter: `blur(${2 + i * 1.5}px)` }}
          >
            {children}
          </div>
        ))}
      <div style={{ transform: `scale(${s})`, opacity: Math.min(1, p * 4), filter: `blur(${v * 40}px)` }}>
        <Chroma amount={Math.min(40, v * 160)}>{children}</Chroma>
      </div>
    </div>
  );
};

/** Stars streaking out of a center point (warp speed). */
export const WarpStreaks: React.FC<{ count?: number; color?: string; speed?: number; x?: string; y?: string; delay?: number; seed?: string }> = ({
  count = 60,
  color = "#ffffff",
  speed = 1,
  x = "50%",
  y = "50%",
  delay = 0,
  seed = "warp",
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const t = Math.max(0, frame - delay);
  const ramp = prog(frame, delay, 20, EASE.in);
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const off = random(`${seed}o${i}`);
        const life = ((t * 0.02 * speed * (0.6 + random(`${seed}s${i}`))) + off) % 1;
        const d = life ** 2 * width * 0.75;
        const len = 6 + life * 220 * ramp;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: len,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${color})`,
              transform: `rotate(${a}rad) translateX(${d}px)`,
              transformOrigin: "0 50%",
              opacity: Math.min(1, life * 3) * ramp,
            }}
          />
        );
      })}
    </div>
  );
};

/** Comic radial speed lines around the frame edge; flicker every 2 frames. */
export const SpeedLines: React.FC<{ color?: string; count?: number; inner?: number; opacity?: number; thickness?: number; delay?: number }> = ({
  color = "#111",
  count = 70,
  inner = 0.42,
  opacity = 0.8,
  thickness = 3,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (frame < delay) return null;
  const seed = Math.floor(frame / 2);
  const R = Math.hypot(width, height) / 2;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        if (random(`sl${seed}-${i}`) < 0.35) return null;
        const a = (i / count) * Math.PI * 2 + random(`sla${i}`) * 0.05;
        const r0 = R * (inner + random(`slr${seed}-${i}`) * 0.25);
        const r1 = r0 + R * (0.08 + random(`sll${seed}-${i}`) * 0.2);
        return (
          <line
            key={i}
            x1={width / 2 + Math.cos(a) * r0}
            y1={height / 2 + Math.sin(a) * r0}
            x2={width / 2 + Math.cos(a) * r1}
            y2={height / 2 + Math.sin(a) * r1}
            stroke={color}
            strokeWidth={thickness * (0.5 + random(`slw${i}`))}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

/** Lightsaber slash: a glowing line that cuts across the frame at an angle. */
export const Slash: React.FC<{ delay?: number; angle?: number; color?: string; dur?: number; thickness?: number; y?: string }> = ({
  delay = 0,
  angle = -12,
  color = "#ff2a3d",
  dur = 10,
  thickness = 6,
  y = "50%",
}) => {
  const frame = useCurrentFrame();
  const head = prog(frame, delay, dur * 0.6, EASE.out);
  const tail = prog(frame, delay + dur * 0.4, dur * 0.6, EASE.in);
  if (frame < delay || tail >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: "-10%",
        width: "120%",
        top: y,
        height: thickness,
        transform: `rotate(${angle}deg)`,
        clipPath: `inset(0 ${(1 - head) * 100}% 0 ${tail * 100}%)`,
        background: `linear-gradient(90deg, ${color}, #fff 50%, ${color})`,
        boxShadow: `0 0 12px ${color}, 0 0 40px ${color}, 0 0 90px ${color}`,
        borderRadius: thickness,
      }}
    />
  );
};

/** Small words popping in around the frame (e.g. "HA" "HA"). */
export const Pops: React.FC<{ items: { text: string; x: string; y: string; at: number; rot?: number }[]; style?: React.CSSProperties; life?: number }> = ({ items, style, life = 18 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {items.map((it, i) => {
        if (frame < it.at || frame > it.at + life) return null;
        const s = pop(frame, fps, it.at, 8, 300);
        const out = prog(frame, it.at + life - 5, 5, EASE.in);
        return (
          <div key={i} style={{ position: "absolute", left: it.x, top: it.y, transform: `translate(-50%,-50%) scale(${s * (1 - out)}) rotate(${it.rot ?? -8}deg)`, ...style }}>
            {it.text}
          </div>
        );
      })}
    </>
  );
};

/** Vertical camera move through a tall stack of lines. `focus[i]` = frame when line i is centered. */
export const ScrollStack: React.FC<{ lines: React.ReactNode[]; focus: number[]; lineHeight: number; style?: React.CSSProperties }> = ({ lines, focus, lineHeight, style }) => {
  const frame = useCurrentFrame();
  const idx = focus.map((_, i) => i);
  const pos = focus.length > 1 ? interpolate(frame, focus, idx, { ...clamp, easing: EASE.inOut }) : 0;
  const prev = focus.length > 1 ? interpolate(frame - 1, focus, idx, { ...clamp, easing: EASE.inOut }) : 0;
  const v = Math.abs(pos - prev) * lineHeight;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
      <Smear y={v * 0.35}>
        <div style={{ transform: `translateY(${-(pos - (lines.length - 1) / 2) * lineHeight}px)`, display: "flex", flexDirection: "column", alignItems: "center", ...style }}>
          {lines.map((l, i) => (
            <div key={i} style={{ height: lineHeight, display: "flex", alignItems: "center", opacity: 1 - Math.min(0.75, Math.abs(i - pos) * 0.45) }}>
              {l}
            </div>
          ))}
        </div>
      </Smear>
    </AbsoluteFill>
  );
};

/** Letters that keep wobbling independently (kinetic type). */
export const Wobble: React.FC<{ text: string; amount?: number; speed?: number; style?: React.CSSProperties; delay?: number }> = ({ text, amount = 1, speed = 0.08, style, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <span style={{ display: "inline-flex", whiteSpace: "pre", ...style }}>
      {[...text].map((ch, i) => {
        const s = pop(frame, fps, delay + i * 1.5, 12);
        const r = noise2D(`wr${i}`, frame * speed, 0) * 14 * amount;
        const yy = noise2D(`wy${i}`, frame * speed, 3) * 18 * amount;
        const sc = 1 + noise2D(`ws${i}`, frame * speed, 7) * 0.12 * amount;
        return (
          <span key={i} style={{ display: "inline-block", opacity: Math.min(1, s * 1.5), transform: `translateY(${yy + (1 - s) * 60}px) rotate(${r}deg) scale(${sc})` }}>
            {ch}
          </span>
        );
      })}
    </span>
  );
};

/** Cross-fade the same text between two font styles (e.g. black → thin) with a squash. */
export const WeightShift: React.FC<{ children: React.ReactNode; from: React.CSSProperties; to: React.CSSProperties; at: number; dur?: number; style?: React.CSSProperties }> = ({
  children,
  from,
  to,
  at,
  dur = 8,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, dur, EASE.inOut);
  const squash = 1 - Math.sin(p * Math.PI) * 0.08;
  return (
    <div style={{ display: "grid", transform: `scaleY(${squash})`, ...style }}>
      <div style={{ gridArea: "1/1", opacity: 1 - p, ...from }}>{children}</div>
      <div style={{ gridArea: "1/1", opacity: p, ...to }}>{children}</div>
    </div>
  );
};

/** Letters fly apart with spin starting at `at`. */
export const Scatter: React.FC<{ text: string; at: number; style?: React.CSSProperties; power?: number }> = ({ text, at, style, power = 1 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 16, EASE.in);
  return (
    <span style={{ display: "inline-flex", whiteSpace: "pre", ...style }}>
      {[...text].map((ch, i) => {
        const dx = (random(`scx${i}`) - 0.5) * 900 * power;
        const dy = (random(`scy${i}`) - 0.2) * 700 * power;
        const r = (random(`scr${i}`) - 0.5) * 360;
        return (
          <span key={i} style={{ display: "inline-block", transform: `translate(${dx * p}px, ${dy * p}px) rotate(${r * p}deg)`, opacity: 1 - p }}>
            {ch}
          </span>
        );
      })}
    </span>
  );
};

/** Shape morph: circle → rounded square → rotated square, with ghost outlines. */
export const MorphShape: React.FC<{ size?: number; color?: string; at?: number; dur?: number; ghosts?: boolean }> = ({ size = 320, color = "#ff2a3d", at = 0, dur = 30, ghosts = true }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, dur, EASE.inOut);
  const radius = mix(50, 14, p);
  const rot = mix(0, 405, p);
  const box = (k: number, o: number, fill: boolean) => (
    <div
      key={k}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: `${radius}%`,
        background: fill ? color : "transparent",
        border: fill ? undefined : `2px solid ${color}`,
        transform: `rotate(${rot - k * 9}deg) scale(${1 + k * 0.04})`,
        opacity: o,
        boxShadow: fill ? `0 20px 60px rgba(0,0,0,0.25)` : undefined,
      }}
    />
  );
  const moving = p > 0 && p < 1;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {ghosts && moving && [3, 2, 1].map((k) => box(k, 0.25, false))}
      {box(0, 1, true)}
    </div>
  );
};

/** Film strip with sprocket holes, frames scrolling horizontally, red marks inside. */
export const Filmstrip: React.FC<{ width?: number; height?: number; speed?: number; color?: string; mark?: string }> = ({
  width = 900,
  height = 120,
  speed = 6,
  color = "#f1f0ee",
  mark = "#ff2a3d",
}) => {
  const frame = useCurrentFrame();
  const cell = height * 0.9;
  const n = Math.ceil(width / cell) + 2;
  const off = (frame * speed) % cell;
  return (
    <div style={{ width, height, overflow: "hidden", position: "relative", background: color, borderRadius: 6 }}>
      {[0, 1].map((r) => (
        <div
          key={r}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            [r ? "bottom" : "top"]: height * 0.06,
            height: height * 0.1,
            backgroundImage: `repeating-linear-gradient(90deg, #111 0 ${height * 0.12}px, transparent ${height * 0.12}px ${height * 0.22}px)`,
            backgroundPosition: `${-frame * speed}px 0`,
          }}
        />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: i * cell - off,
            top: height * 0.22,
            width: cell * 0.86,
            height: height * 0.56,
            background: "#fff",
            border: "2px solid #ddd",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ width: height * 0.26, height: height * 0.26, background: mark, borderRadius: i % 2 ? "50%" : 4, transform: `rotate(${i * 20}deg)` }} />
        </div>
      ))}
    </div>
  );
};

/** Glowing pill/button outline with a label (logo badge). */
export const GlowPill: React.FC<{ children: React.ReactNode; color?: string; delay?: number; fill?: boolean; style?: React.CSSProperties }> = ({
  children,
  color = "#ff2a3d",
  delay = 0,
  fill = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 12);
  const pulse = 1 + 0.25 * Math.sin(frame / 5);
  return (
    <div
      style={{
        padding: "0.25em 0.9em",
        borderRadius: 999,
        border: `0.08em solid ${color}`,
        background: fill ? color : "rgba(255,255,255,0.92)",
        boxShadow: `0 0 ${20 * pulse}px ${color}, 0 0 ${60 * pulse}px ${color}, inset 0 0 ${16 * pulse}px ${color}`,
        transform: `scale(${s})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** After Effects composition background: gray, grid, rulers. */
export const CompGrid: React.FC<{ bg?: string; line?: string }> = ({ bg = "#1e1e20", line = "rgba(255,255,255,0.06)" }) => (
  <AbsoluteFill
    style={{
      background: bg,
      backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
      backgroundSize: "120px 120px",
    }}
  >
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 18, background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 1px, transparent 1px 12px)" }} />
    <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 18, background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.25) 0 1px, transparent 1px 12px)" }} />
  </AbsoluteFill>
);

/** AE transform/selection box with 8 handles drawn around children. */
export const TransformBox: React.FC<{ children: React.ReactNode; delay?: number; color?: string; pad?: number }> = ({ children, delay = 0, color = "#fff", pad = 10 }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 8);
  const h = (pos: React.CSSProperties) => <div style={{ position: "absolute", width: 12, height: 12, border: `2px solid ${color}`, background: "#1e1e20", transform: "translate(-50%,-50%)", ...pos }} />;
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      {p > 0 && (
        <span style={{ position: "absolute", inset: -pad, border: `2px solid ${color}`, opacity: p }}>
          {h({ left: 0, top: 0 })}
          {h({ left: "50%", top: 0 })}
          {h({ left: "100%", top: 0 })}
          {h({ left: 0, top: "50%" })}
          {h({ left: "100%", top: "50%" })}
          {h({ left: 0, top: "100%" })}
          {h({ left: "50%", top: "100%" })}
          {h({ left: "100%", top: "100%" })}
        </span>
      )}
    </span>
  );
};

/** AE layer panel: layer bars stacking in from below. */
export const LayerBars: React.FC<{ names?: string[]; width?: number; delay?: number; stagger?: number }> = ({
  names = ["Title — Text", "Shape Layer 3", "Adjustment", "Null 1", "BG Solid"],
  width = 1100,
  delay = 0,
  stagger = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 12 }}>
      {names.map((n, i) => {
        const s = pop(frame, fps, delay + (names.length - 1 - i) * stagger, 14);
        return (
          <div
            key={i}
            style={{
              height: 52,
              marginLeft: i * 40,
              background: "linear-gradient(180deg,#d9d9de,#a9a9b2)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 22,
              color: "#222",
              transform: `translateY(${(1 - s) * 140}px)`,
              opacity: Math.min(1, s * 2),
            }}
          >
            ⊙ {n}
          </div>
        );
      })}
    </div>
  );
};

/** Rows of keyframe diamonds popping in, with a sweeping playhead. */
export const KeyLanes: React.FC<{ rows?: number; cols?: number; width?: number; delay?: number; color?: string; dark?: boolean }> = ({
  rows = 4,
  cols = 9,
  width = 1500,
  delay = 0,
  color = "#111",
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ph = prog(frame, delay, 40, EASE.linear);
  return (
    <div style={{ width, position: "relative" }}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ height: 70, borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`, position: "relative" }}>
          {Array.from({ length: cols }, (_, c) => {
            const x = (c + 0.5 + random(`kl${r}${c}`) * 0.6) / (cols + 1);
            const s = pop(frame, fps, delay + Math.round(x * 40), 10, 260);
            return (
              <div
                key={c}
                style={{ position: "absolute", left: x * width, top: 35, width: 20, height: 20, background: x < ph ? "#ff2a3d" : color, transform: `translate(-50%,-50%) rotate(45deg) scale(${s})` }}
              />
            );
          })}
        </div>
      ))}
      <div style={{ position: "absolute", top: -10, bottom: 0, left: ph * width, width: 3, background: "#ff2a3d" }} />
    </div>
  );
};

/** Easing curve with bezier handles drawing itself (graph editor). */
export const GraphCurve: React.FC<{ width?: number; height?: number; delay?: number; color?: string }> = ({ width = 1400, height = 420, delay = 0, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 24, EASE.inOut);
  const d = `M 0 ${height} C ${width * 0.55} ${height}, ${width * 0.45} 0, ${width} 0`;
  const len = width * 1.35;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <path d={d} stroke={color} strokeWidth={8} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - p)} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
      <g opacity={prog(frame, delay + 12, 10)}>
        <line x1={0} y1={height} x2={width * 0.55} y2={height} stroke={color} strokeWidth={2} />
        <line x1={width} y1={0} x2={width * 0.45} y2={0} stroke={color} strokeWidth={2} />
        {[
          [0, height],
          [width * 0.55, height],
          [width * 0.45, 0],
          [width, 0],
        ].map(([x, y], i) => (
          <rect key={i} x={x - 9} y={y - 9} width={18} height={18} fill={i % 3 === 0 ? color : "#1e1e20"} stroke={color} strokeWidth={2} transform={`rotate(45 ${x} ${y})`} />
        ))}
      </g>
    </svg>
  );
};

/** Echo stack tilted in 3D and slowly rotating (tower of repeated words). */
export const EchoTower: React.FC<{ words: string[]; copies?: number; style?: React.CSSProperties; delay?: number }> = ({ words, copies = 3, style, delay = 0 }) => {
  const frame = useCurrentFrame();
  const all = Array.from({ length: copies }, () => words).flat();
  const rot = interpolate(frame, [delay, delay + 90], [-25, 25]);
  return (
    <div style={{ perspective: 1400 }}>
      <div style={{ transform: `rotateX(38deg) rotateZ(${rot * 0.3}deg) rotateY(${rot}deg)`, transformStyle: "preserve-3d", display: "flex", flexDirection: "column", alignItems: "center", ...style }}>
        {all.map((w, i) => {
          const p = prog(frame, delay + i * 2, 8);
          return (
            <div key={i} style={{ opacity: p * (0.35 + 0.65 * (i / all.length)), transform: `translateZ(${(i - all.length) * 6}px) scale(${0.6 + 0.4 * (i / all.length)})`, lineHeight: 0.95 }}>
              {w}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Tilted color band sliding across with text on it. */
export const DiagonalBand: React.FC<{ children: React.ReactNode; color?: string; angle?: number; delay?: number; height?: number }> = ({
  children,
  color = "#ff2a3d",
  angle = -10,
  delay = 0,
  height = 300,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 12, EASE.out);
  const v = (p - prog(frame - 1, delay, 12, EASE.out)) * 2400;
  return (
    <div style={{ position: "absolute", left: "-20%", right: "-20%", top: "50%", height, transform: `translateY(-50%) rotate(${angle}deg) translateX(${(1 - p) * 120}%)` }}>
      <Smear x={v * 0.4} style={{ width: "100%", height: "100%" }}>
        <div style={{ width: "100%", height: "100%", background: `linear-gradient(90deg, transparent, ${color} 12%, ${color} 88%, transparent)`, display: "grid", placeItems: "center", boxShadow: `0 0 80px ${color}` }}>
          {children}
        </div>
      </Smear>
    </div>
  );
};

/** Terminal-style line: "›_" chevron + typed word + cursor. */
export const TerminalLine: React.FC<{ text: string; delay?: number; cps?: number; color?: string; accent?: string; style?: React.CSSProperties; outline?: boolean }> = ({
  text,
  delay = 0,
  cps = 18,
  color = "#fff",
  accent = "#ff2a3d",
  style,
  outline = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.max(0, Math.floor(((frame - delay) / fps) * cps));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.3em", color, ...style }}>
      <span style={{ color: accent, fontSize: "0.6em", fontFamily: "JetBrains Mono, monospace" }}>›_</span>
      <span style={outline ? { color: "transparent", WebkitTextStroke: `0.03em ${color}` } : undefined}>{text.slice(0, n)}</span>
      <span style={{ width: "0.08em", height: "0.9em", background: accent, opacity: Math.floor(frame / 12) % 2 ? 1 : 0.2 }} />
    </div>
  );
};

/** Text with gradient fill. */
export const GradientText: React.FC<{ children: React.ReactNode; from?: string; to?: string; angle?: number; style?: React.CSSProperties }> = ({
  children,
  from = "#f7ff3c",
  to = "#7dff6a",
  angle = 90,
  style,
}) => (
  <span style={{ background: `linear-gradient(${angle}deg, ${from}, ${to})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", ...style }}>{children}</span>
);

/** Four-point sparkle star that spins and pulses. */
export const Sparkle: React.FC<{ size?: number; color?: string; delay?: number }> = ({ size = 80, color = "#f7ff3c", delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 9) * (1 + 0.15 * Math.sin(frame / 4));
  return (
    <svg width={size} height={size} viewBox="-10 -10 20 20" style={{ transform: `scale(${s}) rotate(${frame * 3}deg)`, filter: `drop-shadow(0 0 8px ${color})` }}>
      <path d="M0 -10 Q1.2 -1.2 10 0 Q1.2 1.2 0 10 Q-1.2 1.2 -10 0 Q-1.2 -1.2 0 -10 Z" fill={color} />
    </svg>
  );
};

/** Timeline ruler with ticks and a glowing playhead dot travelling from `from` to `to` (0..1). */
export const Ruler: React.FC<{ width?: number; delay?: number; dur?: number; color?: string; from?: number; to?: number }> = ({
  width = 1600,
  delay = 0,
  dur = 60,
  color = "#ff2a3d",
  from = 0,
  to = 1,
}) => {
  const frame = useCurrentFrame();
  const grow = prog(frame, delay, 14, EASE.out);
  const ph = mix(from, to, prog(frame, delay + 6, dur, EASE.inOut));
  return (
    <div style={{ width, height: 40, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 18, height: 3, width: width * grow, background: `linear-gradient(90deg, ${color}, rgba(255,255,255,0.4))`, boxShadow: `0 0 12px ${color}` }} />
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: (i / 39) * width, top: i % 5 ? 24 : 20, width: 2, height: i % 5 ? 8 : 14, background: "rgba(255,255,255,0.5)", opacity: grow }} />
      ))}
      <div style={{ position: "absolute", left: ph * width, top: 19, width: 26, height: 26, borderRadius: "50%", background: color, transform: "translate(-50%,-50%)", boxShadow: `0 0 20px ${color}, 0 0 50px ${color}` }} />
    </div>
  );
};

/** Light bulb icon with rays (idea). */
export const Bulb: React.FC<{ size?: number; color?: string; delay?: number }> = ({ size = 140, color = "#ff2a3d", delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 10);
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" style={{ transform: `scale(${s})`, filter: `drop-shadow(0 0 10px ${color})` }}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI + (i / 8) * Math.PI;
        return <line key={i} x1={Math.cos(a) * 8} y1={Math.sin(a) * 8 - 2} x2={Math.cos(a) * 10.5} y2={Math.sin(a) * 10.5 - 2} stroke={color} strokeWidth={0.8} strokeLinecap="round" opacity={0.5 + 0.5 * Math.abs(Math.sin(frame / 6 + i))} />;
      })}
      <path d="M0 -7 a5 5 0 0 1 3 9 v2 h-6 v-2 a5 5 0 0 1 3 -9 z" fill={color} />
      <rect x={-2.6} y={4.6} width={5.2} height={1.2} fill="#ddd" />
      <rect x={-2.2} y={6.2} width={4.4} height={1.2} fill="#ddd" />
    </svg>
  );
};

/** One letter + a run of repeated letters that stretches out ("FUUUUU"). */
export const RepeatStretch: React.FC<{ first: string; repeat: string; max?: number; at?: number; dur?: number; style?: React.CSSProperties }> = ({
  first,
  repeat,
  max = 7,
  at = 0,
  dur = 24,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, dur, EASE.out);
  const n = Math.max(1, Math.round(mix(1, max, p)));
  const v = p - prog(frame - 1, at, dur, EASE.out);
  return (
    <div style={{ display: "flex", whiteSpace: "pre", ...style }}>
      <span>{first}</span>
      <Smear x={v * 400}>
        <span style={{ display: "inline-block", transform: `scaleX(${1 + v * 6})`, transformOrigin: "left" }}>{repeat.repeat(n)}</span>
      </Smear>
    </div>
  );
};

/** Claude-style chat card that types a prompt and shows a thinking blur. */
export const ChatCard: React.FC<{ title?: string; question?: string; prompt: string; delay?: number; width?: number; accent?: string }> = ({
  title = "Claude",
  question = "What are we making today?",
  prompt,
  delay = 0,
  width = 760,
  accent = "#ff2a3d",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 14);
  const n = Math.max(0, Math.floor(((frame - delay - 8) / fps) * 22));
  return (
    <div style={{ width, background: "#fafafa", borderRadius: 26, padding: 34, boxShadow: "0 30px 90px rgba(0,0,0,0.5)", transform: `scale(${s})`, fontFamily: "Inter, sans-serif", color: "#222" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 700 }}>
        <span style={{ color: accent }}>✳</span> {title}
      </div>
      <div style={{ fontSize: 26, opacity: 0.6, margin: "22px 0" }}>{question}</div>
      <div style={{ border: "1.5px solid #ddd", borderRadius: 16, padding: "18px 22px", fontFamily: "JetBrains Mono, monospace", fontSize: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>
          {prompt.slice(0, n)}
          <span style={{ opacity: Math.floor(frame / 12) % 2 ? 1 : 0 }}>|</span>
        </span>
        <span style={{ width: 40, height: 40, borderRadius: "50%", background: accent, color: "#fff", display: "grid", placeItems: "center", fontSize: 22 }}>↑</span>
      </div>
    </div>
  );
};

/** Diagonal light sweep flash across the frame (transition accent). */
export const LightSweep: React.FC<{ at?: number; dur?: number; color?: string }> = ({ at = 0, dur = 10, color = "#ffffff" }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, dur, EASE.inOut);
  if (frame < at || p >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "-50%",
          bottom: "-50%",
          width: "40%",
          left: `${mix(-60, 130, p)}%`,
          transform: "rotate(20deg)",
          background: `linear-gradient(90deg, transparent, ${color}cc 45%, #fff 50%, ${color}cc 55%, transparent)`,
          filter: "blur(6px)",
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Fast-cut toolkit (frame-by-frame study: entrances 2–5 f, exits 3–6 f, heavy blur + chroma).

/** Chromatic aberration: red/cyan copies offset by `amount` px along `angle` (deg). Use on fast moves. */
export const Chroma: React.FC<{ amount: number; angle?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ amount, angle = 0, children, style }) => {
  if (Math.abs(amount) < 0.5) return <div style={style}>{children}</div>;
  const dx = Math.cos((angle * Math.PI) / 180) * amount;
  const dy = Math.sin((angle * Math.PI) / 180) * amount;
  return (
    <div style={{ position: "relative", ...style }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${dx}px,${dy}px)`, filter: "url(#chroma-r)", opacity: 0.85, mixBlendMode: "screen" }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${-dx}px,${-dy}px)`, filter: "url(#chroma-c)", opacity: 0.85, mixBlendMode: "screen" }}>{children}</div>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};
/** Mount once per composition: SVG filters used by <Chroma>. */
export const ChromaDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id="chroma-r">
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
    </filter>
    <filter id="chroma-c">
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
    </filter>
  </svg>
);

export type ExitKind = "zoom" | "zoomOut" | "streakY" | "streakX" | "slice" | "spin" | "whipL" | "whipR" | "drop" | "none";
/** Shot exit over the last `frames` frames of a shot of length `dur` (and optional entrance over the first `inFrames`). */
export const Exit: React.FC<{ dur: number; kind?: ExitKind; frames?: number; enter?: ExitKind; inFrames?: number; children: React.ReactNode }> = ({
  dur,
  kind = "none",
  frames = 4,
  enter = "none",
  inFrames = 3,
  children,
}) => {
  const frame = useCurrentFrame();
  const out = kind === "none" ? 0 : prog(frame, dur - frames, frames, EASE.in);
  const inn = enter === "none" ? 1 : prog(frame, 0, inFrames, EASE.out);
  const k = out > 0 ? out : 1 - inn;
  const mode = out > 0 ? kind : enter;
  const sign = out > 0 ? 1 : -1;
  if (k <= 0.001 || mode === "none") return <AbsoluteFill>{children}</AbsoluteFill>;
  let tr = "";
  let blurX = 0;
  let blurY = 0;
  let op = 1;
  let chroma = 0;
  let clip: string | undefined;
  switch (mode) {
    case "zoom":
      tr = `scale(${sign > 0 ? 1 + k * 3.5 : 1 - k * 0.6})`;
      blurX = blurY = k * 18;
      chroma = k * 22;
      op = sign > 0 ? 1 - k * 0.6 : 1 - k;
      break;
    case "zoomOut":
      tr = `scale(${1 - k * 0.7})`;
      blurX = blurY = k * 10;
      op = 1 - k;
      break;
    case "streakY":
      tr = `scaleY(${1 + k * 6})`;
      blurY = k * 60;
      op = 1 - k * 0.5;
      break;
    case "streakX":
      tr = `scaleX(${1 + k * 5})`;
      blurX = k * 70;
      op = 1 - k * 0.5;
      break;
    case "whipL":
    case "whipR": {
      const d = (mode === "whipL" ? -1 : 1) * sign;
      tr = `translateX(${d * k * 110}%)`;
      blurX = k * 80;
      chroma = k * 30;
      break;
    }
    case "spin":
      tr = `scale(${1 + k * 1.5}) rotate(${sign * k * 25}deg)`;
      blurX = blurY = k * 14;
      op = 1 - k * 0.7;
      break;
    case "drop":
      tr = `translateY(${sign * k * 120}%)`;
      blurY = k * 50;
      break;
    case "slice":
      clip = undefined;
      break;
  }
  if (mode === "slice") {
    const n = 7;
    return (
      <AbsoluteFill>
        {Array.from({ length: n }, (_, i) => (
          <AbsoluteFill
            key={i}
            style={{
              clipPath: `inset(${(i / n) * 100}% 0 ${100 - ((i + 1) / n) * 100}% 0)`,
              transform: `translateX(${(random(`sl${i}`) - 0.5) * 2 * k * 900}px)`,
              filter: `blur(${k * 8}px)`,
              opacity: 1 - k * 0.3,
            }}
          >
            {children}
          </AbsoluteFill>
        ))}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ transform: tr, opacity: op, clipPath: clip }}>
      <Smear x={blurX} y={blurY} style={{ width: "100%", height: "100%" }}>
        <Chroma amount={chroma} style={{ width: "100%", height: "100%" }}>
          <AbsoluteFill>{children}</AbsoluteFill>
        </Chroma>
      </Smear>
    </AbsoluteFill>
  );
};

const GLYPHS = "█▓▒░#/\<>_-=+*01";
/** Type-on with glitch: each char shows 1–2 random glyph frames before resolving. `perChar` frames per char. */
export const TypeOn: React.FC<{ text: string; delay?: number; perChar?: number; style?: React.CSSProperties; cursor?: boolean }> = ({
  text,
  delay = 0,
  perChar = 1.3,
  style,
  cursor = false,
}) => {
  const frame = useCurrentFrame();
  const chars = [...text];
  const t = frame - delay;
  return (
    <span style={{ whiteSpace: "pre", ...style }}>
      {chars.map((c, i) => {
        const at = i * perChar;
        if (t < at) return <span key={i} style={{ opacity: 0 }}>{c}</span>;
        const glitching = t < at + 2 && c !== " ";
        return (
          <span key={i} style={glitching ? { opacity: 0.8, filter: "blur(1px)" } : undefined}>
            {glitching ? GLYPHS[Math.floor(random(`g${i}-${frame}`) * GLYPHS.length)] : c}
          </span>
        );
      })}
      {cursor && <span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}>|</span>}
    </span>
  );
};

/** Wireframe extrusion: outline text with N stacked outline copies receding (3D wire look). */
export const WireExtrude: React.FC<{ children: React.ReactNode; depth?: number; dx?: number; dy?: number; color?: string; width?: number; style?: React.CSSProperties }> = ({
  children,
  depth = 10,
  dx = 2.2,
  dy = -2.2,
  color = "#fff",
  width = 2,
  style,
}) => (
  <span style={{ position: "relative", display: "inline-block", ...style }}>
    {Array.from({ length: depth }, (_, i) => (
      <span
        key={i}
        style={{ position: i === 0 ? "relative" : "absolute", left: 0, top: 0, color: "transparent", WebkitTextStroke: `${width}px ${color}`, transform: `translate(${(depth - 1 - i) * dx}px, ${(depth - 1 - i) * dy}px)`, opacity: i === depth - 1 ? 1 : 0.35 }}
      >
        {children}
      </span>
    ))}
  </span>
);

/** Rolls a value upward over time (ETA counters going UP, like a never-ending render). */
export const eta = (frame: number, startSec: number, perFrame: number) => {
  const s = Math.floor(startSec + frame * perFrame);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
};
