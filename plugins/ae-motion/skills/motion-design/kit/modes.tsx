// Building blocks for genre modes (modes/*.json). Each is self-contained; frames are relative to the shot.
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, clamp, mix, pop, prog } from "./easing";
import type { TimelineWord } from "./audio";

const sans = "Inter, Montserrat, Roboto, sans-serif";

// ---------------- overlays / grades
export type GradeName = "cinematic" | "warm" | "punch" | "horror" | "fashion" | "bw" | "dream" | "news";
const GRADES: Record<GradeName, { filter: string; tint?: string; blend?: React.CSSProperties["mixBlendMode"] }> = {
  cinematic: { filter: "contrast(1.15) saturate(0.9)", tint: "linear-gradient(180deg, rgba(0,80,110,0.22), rgba(255,140,40,0.14))", blend: "soft-light" },
  warm: { filter: "saturate(1.1) contrast(1.02)", tint: "rgba(255,170,90,0.18)", blend: "soft-light" },
  punch: { filter: "contrast(1.35) saturate(1.25)" },
  horror: { filter: "contrast(1.3) saturate(0.45) hue-rotate(-10deg)", tint: "rgba(0,60,20,0.25)", blend: "multiply" },
  fashion: { filter: "contrast(1.2) saturate(0.7) brightness(1.05)" },
  bw: { filter: "grayscale(1) contrast(1.25)" },
  dream: { filter: "saturate(0.9) brightness(1.08) blur(0.3px)", tint: "rgba(255,200,220,0.16)", blend: "screen" },
  news: { filter: "contrast(1.05) saturate(1.05)" },
};
/** Color grade wrapper (CSS approximation of a LUT). */
export const Grade: React.FC<{ look: GradeName; children: React.ReactNode }> = ({ look, children }) => {
  const g = GRADES[look];
  return (
    <AbsoluteFill style={{ filter: g.filter }}>
      {children}
      {g.tint && <AbsoluteFill style={{ background: g.tint, mixBlendMode: g.blend, pointerEvents: "none" }} />}
    </AbsoluteFill>
  );
};

/** Warm light leaks drifting across the frame (vlog, wedding). */
export const LightLeak: React.FC<{ strength?: number; seed?: string }> = ({ strength = 0.6, seed = "leak" }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none", opacity: strength }}>
      {[0, 1, 2].map((i) => {
        const x = 50 + 60 * Math.sin(f / (60 + i * 17) + random(`${seed}${i}`) * 6);
        const y = 50 + 40 * Math.cos(f / (80 + i * 11) + i);
        return <AbsoluteFill key={i} style={{ background: `radial-gradient(circle at ${x}% ${y}%, ${["#ff7a18", "#ffb347", "#ff3d7f"][i]}cc 0%, transparent 45%)` }} />;
      })}
    </AbsoluteFill>
  );
};

/** VHS tape look: chroma offset copies, tracking band, noise lines, REC/PLAY timestamp. Wrap the content. */
export const VHS: React.FC<{ children: React.ReactNode; label?: string; intensity?: number }> = ({ children, label = "PLAY ▶", intensity = 1 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const jitter = (random(`vj${f}`) - 0.5) * 6 * intensity;
  const band = ((f * 7) % 140) - 20;
  const s = Math.floor(f / fps);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${jitter}px)`, filter: "saturate(1.3) contrast(1.1) blur(0.6px)" }}>
        <AbsoluteFill style={{ transform: `translateX(${4 * intensity}px)`, mixBlendMode: "screen", opacity: 0.5, filter: "sepia(1) hue-rotate(-50deg) saturate(4)" }}>{children}</AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateX(${-4 * intensity}px)`, mixBlendMode: "screen", opacity: 0.5, filter: "sepia(1) hue-rotate(150deg) saturate(4)" }}>{children}</AbsoluteFill>
        <AbsoluteFill>{children}</AbsoluteFill>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: `${band}%`, height: "6%", background: "rgba(255,255,255,0.08)", filter: "blur(2px)", transform: `translateX(${jitter * 4}px)` }} />
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 4px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 50, top: 40, fontFamily: "monospace", fontSize: 40, color: "#fff", textShadow: "2px 0 #f00, -2px 0 #0ff" }}>{label}</div>
      <div style={{ position: "absolute", right: 50, bottom: 40, fontFamily: "monospace", fontSize: 36, color: "#fff" }}>
        {`00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`}
      </div>
    </AbsoluteFill>
  );
};

/** Random brightness flicker (horror). Wrap the content. */
export const Flicker: React.FC<{ children: React.ReactNode; amount?: number }> = ({ children, amount = 0.5 }) => {
  const f = useCurrentFrame();
  const r = random(`fl${Math.floor(f / 2)}`);
  const b = r < 0.12 ? 1 - amount : r > 0.95 ? 1 + amount * 0.6 : 1;
  return <AbsoluteFill style={{ filter: `brightness(${b})` }}>{children}</AbsoluteFill>;
};

/** Anamorphic lens flare: blue horizontal streak + ghost orbs, sweeping across. */
export const AnamorphicFlare: React.FC<{ delay?: number; dur?: number; y?: string; color?: string }> = ({ delay = 0, dur = 40, y = "45%", color = "#5ab0ff" }) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, dur, EASE.inOut);
  if (f < delay || p >= 1) return null;
  const x = mix(-10, 110, p);
  const o = Math.sin(p * Math.PI);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none", opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 6, transform: "translateY(-50%)", background: `linear-gradient(90deg, transparent, ${color} ${x - 30}%, #fff ${x}%, ${color} ${x + 30}%, transparent)`, filter: "blur(2px)" }} />
      <div style={{ position: "absolute", left: `${x}%`, top: y, width: 220, height: 220, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle, #fff 0%, ${color}88 25%, transparent 65%)` }} />
      {[0.4, 0.7, 1.2].map((k, i) => (
        <div key={i} style={{ position: "absolute", left: `${100 - x * k}%`, top: y, width: 60 + i * 40, height: 60 + i * 40, transform: "translate(-50%,-50%)", borderRadius: "50%", border: `2px solid ${color}55`, background: `${color}18` }} />
      ))}
    </AbsoluteFill>
  );
};

/** 1–2 frame inverted impact frame (anime). Put on top; fires at `at`. */
export const ImpactFrame: React.FC<{ at: number; frames?: number }> = ({ at, frames = 2 }) => {
  const f = useCurrentFrame();
  if (f < at || f >= at + frames) return null;
  return <AbsoluteFill style={{ backdropFilter: "invert(1) contrast(2) grayscale(1)", background: (f - at) % 2 ? "rgba(255,0,0,0.25)" : "transparent" }} />;
};

// ---------------- text cards
/** Chapter card: number + title, letter-spaced, fades through black. */
export const ChapterCard: React.FC<{ n: string; title: string; font?: string; color?: string; delay?: number }> = ({ n, title, font = "Playfair Display, serif", color = "#f2ead8", delay = 0 }) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, 18, EASE.out);
  return (
    <AbsoluteFill style={{ background: "#000", justifyContent: "center", alignItems: "center", color, opacity: p }}>
      <div style={{ fontFamily: sans, fontSize: 28, letterSpacing: "0.6em", opacity: 0.7 }}>{n}</div>
      <div style={{ fontFamily: font, fontSize: 110, fontStyle: "italic", marginTop: 20, letterSpacing: `${mix(0.3, 0.02, p)}em` }}>{title}</div>
    </AbsoluteFill>
  );
};

/** Quote card with big quote mark and author line. */
export const QuoteCard: React.FC<{ quote: string; author?: string; font?: string; color?: string; accent?: string; delay?: number }> = ({
  quote,
  author,
  font = "Playfair Display, serif",
  color = "#fff",
  accent = "#d4a373",
  delay = 0,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, 16);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 10%", color, textAlign: "center" }}>
      <div style={{ fontFamily: font, fontSize: 220, lineHeight: 0.6, color: accent, opacity: p }}>“</div>
      <div style={{ fontFamily: font, fontSize: 72, lineHeight: 1.2, fontStyle: "italic", opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>{quote}</div>
      {author && <div style={{ fontFamily: sans, fontSize: 30, letterSpacing: "0.3em", marginTop: 40, opacity: prog(f, delay + 12, 12) }}>— {author}</div>}
    </AbsoluteFill>
  );
};

/** Karaoke line: all words visible, highlight fills each word while it is sung. Words from timeline (frames relative to the shot). */
export const KaraokeLine: React.FC<{ words: TimelineWord[]; style?: React.CSSProperties; base?: string; fill?: string; bounce?: boolean }> = ({
  words,
  style,
  base = "rgba(255,255,255,0.35)",
  fill = "#fff",
  bounce = true,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.45em", ...style }}>
      {words.map((w, i) => {
        const p = interpolate(f, [w.f, Math.max(w.f + 1, w.fe)], [0, 100], clamp);
        const s = bounce ? 1 + 0.12 * (pop(f, fps, w.f, 8, 300) - prog(f, w.f + 4, 6)) : 1;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `scale(${s})`,
              background: `linear-gradient(90deg, ${fill} ${p}%, ${base} ${p}%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              // no CSS filter here: Chrome drops background-clip:text under a filter (renders solid boxes)
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/** Classic meme caption: Impact, white with black stroke, top and/or bottom. */
export const MemeCaption: React.FC<{ top?: string; bottom?: string; size?: number; delay?: number }> = ({ top, bottom, size = 110, delay = 0 }) => {
  const f = useCurrentFrame();
  const st: React.CSSProperties = { fontFamily: "Impact, Anton, 'Arial Black', sans-serif", fontSize: size, color: "#fff", WebkitTextStroke: `${size / 16}px #000`, paintOrder: "stroke", textTransform: "uppercase", textAlign: "center", lineHeight: 1, padding: "0 4%" };
  const s = pop(f, 30, delay, 10, 300);
  return (
    <AbsoluteFill style={{ justifyContent: "space-between", padding: "4% 0", pointerEvents: "none" }}>
      <div style={{ ...st, transform: `scale(${s})` }}>{top}</div>
      <div style={{ ...st, transform: `scale(${s})` }}>{bottom}</div>
    </AbsoluteFill>
  );
};

/** "WASTED"-style ending: desaturate + slow zoom + big red word. Wrap the content. */
export const Wasted: React.FC<{ children: React.ReactNode; at: number; word?: string }> = ({ children, at, word = "WASTED" }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 24, EASE.out);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `grayscale(${p}) contrast(${1 + p * 0.3})`, transform: `scale(${1 + p * 0.12})` }}>{children}</AbsoluteFill>
      {f >= at && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: `rgba(0,0,0,${0.35 * p})` }}>
          <div style={{ fontFamily: "Pricedown, Impact, sans-serif", fontSize: 200, color: "#c2111a", WebkitTextStroke: "6px #000", paintOrder: "stroke", opacity: p, transform: `scale(${mix(1.3, 1, p)})` }}>{word}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** Vertical Japanese text column (anime / AMV). */
export const JPText: React.FC<{ text: string; size?: number; color?: string; delay?: number; style?: React.CSSProperties }> = ({ text, size = 120, color = "#fff", delay = 0, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ writingMode: "vertical-rl", fontFamily: "'Noto Sans JP', 'Dela Gothic One', sans-serif", fontWeight: 900, fontSize: size, color, letterSpacing: "0.05em", ...style }}>
      {[...text].map((c, i) => (
        <span key={i} style={{ opacity: f >= delay + i * 2 ? 1 : 0 }}>
          {c}
        </span>
      ))}
    </div>
  );
};

// ---------------- info graphics
/** Lower third: accent bar + name + subtitle, slides in from the left. */
export const LowerThird: React.FC<{ name: string; sub?: string; delay?: number; accent?: string; bg?: string; color?: string; y?: string; scale?: number }> = ({
  name,
  sub,
  delay = 0,
  accent = "#ff2a3d",
  bg = "rgba(10,10,12,0.85)",
  color = "#fff",
  y = "78%",
  scale = 1,
}) => {
  const f = useCurrentFrame();
  const bar = prog(f, delay, 8, EASE.out);
  const box = prog(f, delay + 3, 10, EASE.out);
  return (
    <div style={{ position: "absolute", left: "5%", top: y, display: "flex", transform: `scale(${scale})`, transformOrigin: "0 0" }}>
      <div style={{ width: 12, background: accent, transform: `scaleY(${bar})`, transformOrigin: "top" }} />
      <div style={{ background: bg, padding: "18px 34px", clipPath: `inset(0 ${(1 - box) * 100}% 0 0)`, color, fontFamily: sans }}>
        <div style={{ fontSize: 52, fontWeight: 800 }}>{name}</div>
        {sub && <div style={{ fontSize: 30, opacity: 0.75, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Thin progress bar along the top/bottom edge for the whole shot (or composition). */
export const ProgressBar: React.FC<{ dur?: number; color?: string; height?: number; top?: boolean }> = ({ dur, color = "#fff", height = 10, top = false }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = Math.min(1, f / Math.max(1, dur ?? durationInFrames));
  return <div style={{ position: "absolute", left: 0, [top ? "top" : "bottom"]: 0, height, width: `${p * 100}%`, background: color, boxShadow: `0 0 12px ${color}` }} />;
};

/** News ticker: endless scrolling headlines in a bar. */
export const Ticker: React.FC<{ items: string[]; label?: string; speed?: number; accent?: string; y?: string }> = ({ items, label = "НОВОСТИ", speed = 6, accent = "#c4161c", y = "92%" }) => {
  const f = useCurrentFrame();
  const text = items.join("   •   ");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 70, display: "flex", background: "#0b1a33", fontFamily: sans, color: "#fff", overflow: "hidden" }}>
      <div style={{ background: accent, padding: "0 30px", display: "flex", alignItems: "center", fontWeight: 900, fontSize: 32, zIndex: 1 }}>{label}</div>
      <div style={{ whiteSpace: "nowrap", fontSize: 34, display: "flex", alignItems: "center", transform: `translateX(${-(f * speed) % (text.length * 18 + 400)}px)`, paddingLeft: 40 }}>
        {text}   •   {text}
      </div>
    </div>
  );
};

/** BREAKING NEWS banner that slams in. */
export const BreakingBanner: React.FC<{ title: string; label?: string; delay?: number; accent?: string }> = ({ title, label = "СРОЧНО", delay = 0, accent = "#c4161c" }) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, 8, EASE.out);
  const blink = Math.floor(f / 10) % 2;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: "72%", display: "flex", fontFamily: sans, transform: `translateX(${(1 - p) * -100}%)` }}>
      <div style={{ background: accent, color: "#fff", fontWeight: 900, fontSize: 44, padding: "14px 30px", opacity: blink ? 1 : 0.85 }}>{label}</div>
      <div style={{ background: "#fff", color: "#111", fontWeight: 800, fontSize: 44, padding: "14px 30px", flex: 1 }}>{title}</div>
    </div>
  );
};

/** Step badge: big number in a circle + label (tutorial). */
export const StepBadge: React.FC<{ n: number; label: string; delay?: number; accent?: string; x?: string; y?: string }> = ({ n, label, delay = 0, accent = "#2f6bff", x = "5%", y = "6%" }) => {
  const f = useCurrentFrame();
  const s = pop(f, 30, delay, 12);
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 20, fontFamily: sans, transform: `scale(${s})`, transformOrigin: "0 50%" }}>
      <div style={{ width: 90, height: 90, borderRadius: "50%", background: accent, color: "#fff", display: "grid", placeItems: "center", fontSize: 50, fontWeight: 900 }}>{n}</div>
      <div style={{ background: "rgba(255,255,255,0.95)", color: "#111", fontWeight: 800, fontSize: 40, padding: "12px 24px", borderRadius: 12 }}>{label}</div>
    </div>
  );
};

/** Pulsing highlight box around a region (px). */
export const HighlightBox: React.FC<{ x: number; y: number; w: number; h: number; delay?: number; color?: string; dim?: boolean }> = ({ x, y, w, h, delay = 0, color = "#ffd400", dim = true }) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, 10, EASE.out);
  const pulse = 1 + 0.03 * Math.sin(f / 4);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {dim && <AbsoluteFill style={{ background: `rgba(0,0,0,${0.5 * p})`, clipPath: `polygon(0 0,100% 0,100% 100%,0 100%,0 ${y}px,${x}px ${y}px,${x}px ${y + h}px,${x + w}px ${y + h}px,${x + w}px ${y}px,0 ${y}px)` }} />}
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, border: `6px solid ${color}`, borderRadius: 16, opacity: p, transform: `scale(${mix(1.3, pulse, p)})`, boxShadow: `0 0 30px ${color}` }} />
    </AbsoluteFill>
  );
};

/** Callout: curved arrow from a label to a point (px). */
export const Callout: React.FC<{ x: number; y: number; label: string; fromX: number; fromY: number; delay?: number; color?: string }> = ({ x, y, label, fromX, fromY, delay = 0, color = "#ffd400" }) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, 14, EASE.inOut);
  const mx = (x + fromX) / 2;
  const my = Math.min(y, fromY) - 120;
  const d = `M ${fromX} ${fromY} Q ${mx} ${my} ${x} ${y}`;
  const len = Math.hypot(x - fromX, y - fromY) * 1.4;
  const ang = Math.atan2(y - my, x - mx);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", overflow: "visible" }}>
        <path d={d} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
        {p > 0.95 && <polygon points="0,-16 30,0 0,16" fill={color} transform={`translate(${x},${y}) rotate(${(ang * 180) / Math.PI})`} />}
      </svg>
      <div style={{ position: "absolute", left: fromX, top: fromY, transform: `translate(-50%, 10px) scale(${pop(f, 30, delay, 12)})`, background: color, color: "#111", fontFamily: sans, fontWeight: 900, fontSize: 40, padding: "10px 22px", borderRadius: 12 }}>{label}</div>
    </AbsoluteFill>
  );
};

/** Zoom-to-detail: camera pushes into point (px) of the children between `at` and `at+dur`. */
export const ZoomTo: React.FC<{ children: React.ReactNode; x: number; y: number; scale?: number; at?: number; dur?: number; hold?: number }> = ({ children, x, y, scale = 2.2, at = 0, dur = 14, hold = 40 }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur, EASE.inOut) - prog(f, at + dur + hold, dur, EASE.inOut);
  return <AbsoluteFill style={{ transformOrigin: `${x}px ${y}px`, transform: `scale(${mix(1, scale, p)})` }}>{children}</AbsoluteFill>;
};

/** Stat card: label + big number counting up (gym, ad). */
export const StatCard: React.FC<{ label: string; value: number; suffix?: string; delay?: number; accent?: string; font?: string }> = ({ label, value, suffix = "", delay = 0, accent = "#ff2a3d", font = "Anton, Oswald, sans-serif" }) => {
  const f = useCurrentFrame();
  const s = pop(f, 30, delay, 12);
  const v = Math.round(mix(0, value, prog(f, delay + 4, 24, EASE.out)));
  return (
    <div style={{ transform: `scale(${s})`, border: `4px solid ${accent}`, padding: "20px 40px", background: "rgba(0,0,0,0.6)", textAlign: "center", color: "#fff" }}>
      <div style={{ fontFamily: sans, fontSize: 34, letterSpacing: "0.3em", opacity: 0.8 }}>{label}</div>
      <div style={{ fontFamily: font, fontSize: 160, lineHeight: 1, color: accent, fontVariantNumeric: "tabular-nums" }}>
        {v.toLocaleString("ru-RU")}
        {suffix}
      </div>
    </div>
  );
};

/** Countdown/stopwatch display mm:ss.ff (gym timer). */
export const TimerDisplay: React.FC<{ from?: number; down?: boolean; color?: string; size?: number }> = ({ from = 60, down = true, color = "#fff", size = 160 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, down ? from - f / fps : f / fps);
  const mm = String(Math.floor(t / 60)).padStart(2, "0");
  const ss = String(Math.floor(t % 60)).padStart(2, "0");
  const cs = String(Math.floor((t * 100) % 100)).padStart(2, "0");
  return <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: size, color, fontVariantNumeric: "tabular-nums" }}>{`${mm}:${ss}.${cs}`}</div>;
};

/** Hitmarker: X flashes at a point with a tick (gaming). `at` = frame. */
export const Hitmarker: React.FC<{ x: string | number; y: string | number; at: number; color?: string; size?: number; kill?: boolean }> = ({ x, y, at, color = "#fff", size = 70, kill = false }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 10) return null;
  const p = (f - at) / 10;
  const c = kill ? "#ff2a3d" : color;
  return (
    <svg width={size * 2} height={size * 2} viewBox="-50 -50 100 100" style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${1.3 - p * 0.3})`, opacity: 1 - p * 0.7, overflow: "visible" }}>
      {[45, 135, 225, 315].map((a) => (
        <line key={a} x1={0} y1={14} x2={0} y2={40} stroke={c} strokeWidth={8} strokeLinecap="round" transform={`rotate(${a})`} />
      ))}
    </svg>
  );
};

/** Killfeed: entries slide in at the top-right at their frames. */
export const KillFeed: React.FC<{ entries: { at: number; killer: string; victim: string; weapon?: string }[]; accent?: string }> = ({ entries, accent = "#ff2a3d" }) => {
  const f = useCurrentFrame();
  const shown = entries.filter((e) => f >= e.at && f < e.at + 150).slice(-5);
  return (
    <div style={{ position: "absolute", right: 40, top: 40, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", fontFamily: sans, fontWeight: 800 }}>
      {shown.map((e, i) => {
        const p = prog(f, e.at, 6, EASE.out);
        return (
          <div key={i} style={{ background: "rgba(0,0,0,0.65)", color: "#fff", padding: "8px 18px", fontSize: 30, borderLeft: `6px solid ${accent}`, transform: `translateX(${(1 - p) * 120}%)` }}>
            {e.killer} <span style={{ color: accent }}>{e.weapon ?? "⌖"}</span> {e.victim}
          </div>
        );
      })}
    </div>
  );
};

/** Combo counter: "x3" pops bigger on each hit frame. */
export const ComboCounter: React.FC<{ hits: number[]; color?: string; size?: number }> = ({ hits, color = "#ffd400", size = 180 }) => {
  const f = useCurrentFrame();
  const n = hits.filter((h) => f >= h).length;
  if (!n) return null;
  const last = hits[n - 1];
  const s = 1 + 0.5 * (1 - prog(f, last, 8, EASE.out));
  return (
    <div style={{ fontFamily: "Bebas Neue, Anton, sans-serif", fontSize: size, color, transform: `scale(${s}) rotate(-8deg)`, textShadow: `0 0 30px ${color}, 6px 6px 0 #000` }}>
      x{n}
    </div>
  );
};

/** Price tag with optional old price strike-through. */
export const PriceTag: React.FC<{ price: string; old?: string; delay?: number; accent?: string }> = ({ price, old, delay = 0, accent = "#ff2a3d" }) => {
  const f = useCurrentFrame();
  const s = pop(f, 30, delay, 10, 260);
  return (
    <div style={{ transform: `scale(${s}) rotate(-6deg)`, background: accent, color: "#fff", fontFamily: "Poppins, Montserrat, sans-serif", fontWeight: 800, padding: "16px 36px", borderRadius: 16, boxShadow: "0 20px 50px rgba(0,0,0,0.3)", textAlign: "center" }}>
      {old && <div style={{ fontSize: 36, opacity: 0.8, textDecoration: "line-through" }}>{old}</div>}
      <div style={{ fontSize: 90, lineHeight: 1 }}>{price}</div>
    </div>
  );
};

/** CTA button that pops in, then pulses; optional press at `pressAt`. */
export const CTAButton: React.FC<{ label: string; delay?: number; pressAt?: number; bg?: string; color?: string }> = ({ label, delay = 0, pressAt, bg = "#111", color = "#fff" }) => {
  const f = useCurrentFrame();
  const s = pop(f, 30, delay, 11);
  const press = pressAt !== undefined ? interpolate(f, [pressAt, pressAt + 3, pressAt + 8], [1, 0.88, 1], clamp) : 1;
  const pulse = 1 + 0.03 * Math.sin(f / 5);
  return (
    <div style={{ transform: `scale(${s * press * pulse})`, background: bg, color, fontFamily: "Poppins, Montserrat, sans-serif", fontWeight: 800, fontSize: 56, padding: "26px 70px", borderRadius: 999, boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}>
      {label} →
    </div>
  );
};

/** Before/after split with a moving divider. Pass two children. */
export const BeforeAfter: React.FC<{ before: React.ReactNode; after: React.ReactNode; delay?: number; dur?: number; labels?: [string, string] }> = ({ before, after, delay = 0, dur = 40, labels = ["ДО", "ПОСЛЕ"] }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0.95, 0.5], { ...clamp, easing: EASE.inOut });
  const tag: React.CSSProperties = { position: "absolute", top: 30, background: "rgba(0,0,0,0.7)", color: "#fff", fontFamily: sans, fontWeight: 800, fontSize: 34, padding: "8px 20px", borderRadius: 8 };
  return (
    <AbsoluteFill>
      <AbsoluteFill>{after}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>{before}</AbsoluteFill>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${p * 100}%`, width: 6, background: "#fff", boxShadow: "0 0 20px rgba(0,0,0,0.5)" }} />
      <div style={{ ...tag, left: 30 }}>{labels[0]}</div>
      <div style={{ ...tag, right: 30 }}>{labels[1]}</div>
    </AbsoluteFill>
  );
};

/** Map pin dropping onto a point with a location label. */
export const MapPin: React.FC<{ x: string | number; y: string | number; label: string; delay?: number; color?: string }> = ({ x, y, label, delay = 0, color = "#ff3d57" }) => {
  const f = useCurrentFrame();
  const drop = pop(f, 30, delay, 9, 220);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-100%)" }}>
      <svg width={80} height={110} viewBox="0 0 40 55" style={{ transform: `translateY(${(1 - drop) * -300}px)`, filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.4))" }}>
        <path d="M20 54 C20 54 2 30 2 19 A18 18 0 1 1 38 19 C38 30 20 54 20 54Z" fill={color} />
        <circle cx={20} cy={19} r={7} fill="#fff" />
      </svg>
      <div style={{ position: "absolute", left: 90, top: 10, whiteSpace: "nowrap", background: "#fff", color: "#111", fontFamily: sans, fontWeight: 800, fontSize: 36, padding: "8px 18px", borderRadius: 10, opacity: prog(f, delay + 8, 8) }}>{label}</div>
    </div>
  );
};

/** "DAY 3" counter card. */
export const DayCounter: React.FC<{ day: number; label?: string; delay?: number; font?: string }> = ({ day, label = "ДЕНЬ", delay = 0, font = "Montserrat, sans-serif" }) => {
  const f = useCurrentFrame();
  const p = prog(f, delay, 10, EASE.out);
  return (
    <div style={{ fontFamily: font, color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,0.5)", opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      <span style={{ fontSize: 40, letterSpacing: "0.4em", fontWeight: 600 }}>{label} </span>
      <span style={{ fontSize: 120, fontWeight: 900 }}>{String(day).padStart(2, "0")}</span>
    </div>
  );
};

/** Picture-in-picture frame (reaction): rounded window with border and a name chip. */
export const PiP: React.FC<{ children: React.ReactNode; x?: string; y?: string; w?: number; h?: number; name?: string; accent?: string; delay?: number }> = ({
  children,
  x = "62%",
  y = "6%",
  w = 640,
  h = 360,
  name,
  accent = "#ff2a3d",
  delay = 0,
}) => {
  const f = useCurrentFrame();
  const s = pop(f, 30, delay, 13);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 24, overflow: "hidden", border: `5px solid ${accent}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", transform: `scale(${s})` }}>
      {children}
      {name && <div style={{ position: "absolute", left: 16, bottom: 14, background: accent, color: "#fff", fontFamily: sans, fontWeight: 800, fontSize: 28, padding: "4px 14px", borderRadius: 8 }}>{name}</div>}
    </div>
  );
};

/** Viewer comment bubble popping in (reaction / stream overlays). */
export const CommentBubble: React.FC<{ user: string; text: string; at: number; x?: string; y?: string; color?: string }> = ({ user, text, at, x = "5%", y = "60%", color = "#8b5cf6" }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = pop(f, 30, at, 12);
  const out = prog(f, at + 70, 8, EASE.in);
  return (
    <div style={{ position: "absolute", left: x, top: y, maxWidth: 700, display: "flex", gap: 14, alignItems: "flex-start", fontFamily: sans, transform: `scale(${s * (1 - out)})`, transformOrigin: "0 100%" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 30, flexShrink: 0 }}>{user[0]?.toUpperCase()}</div>
      <div style={{ background: "#fff", color: "#111", borderRadius: 18, padding: "12px 20px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
        <div style={{ fontWeight: 800, fontSize: 26, color }}>@{user}</div>
        <div style={{ fontSize: 34 }}>{text}</div>
      </div>
    </div>
  );
};

/** Manga panels: diagonal panels, each rendering `render(i)`. */
export const MangaPanels: React.FC<{ count?: number; render: (i: number) => React.ReactNode; delay?: number; stagger?: number; gutter?: number }> = ({ count = 3, render, delay = 0, stagger = 4, gutter = 14 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * 100;
        const b = ((i + 1) / count) * 100;
        const sk = 8;
        const p = prog(f, delay + i * stagger, 8, EASE.out);
        const clip = `polygon(${a + (i ? sk : 0)}% 0, ${b + (i < count - 1 ? sk : 0)}% 0, ${b - (i < count - 1 ? sk : 0)}% 100%, ${a - (i ? sk : 0)}% 100%)`;
        return (
          <AbsoluteFill key={i} style={{ clipPath: clip, padding: gutter / 2, opacity: p, transform: `translateY(${(1 - p) * (i % 2 ? 80 : -80)}px)` }}>
            <AbsoluteFill style={{ border: `${gutter / 2}px solid #fff`, outline: "4px solid #000", overflow: "hidden" }}>{render(i)}</AbsoluteFill>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/** Emoji accent popping at a frame. */
export const EmojiPop: React.FC<{ emoji: string; at: number; x?: string; y?: string; size?: number }> = ({ emoji, at, x = "80%", y = "20%", size = 140 }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 40) return null;
  const s = pop(f, 30, at, 8, 300) * (1 - prog(f, at + 32, 8, EASE.in));
  return <div style={{ position: "absolute", left: x, top: y, fontSize: size, transform: `translate(-50%,-50%) scale(${s}) rotate(${(random(`e${at}`) - 0.5) * 30}deg)` }}>{emoji}</div>;
};
