// Effects measured in 28 real TikTok edits (references/edits-breakdown.md). Frames are relative to the shot.
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, clamp, prog } from "./easing";
import { Smear } from "./fx";

/** Whiteout bloom flash on a hit: blows out to white in `up` frames, fades back in `down` frames. Put it on top. */
export const BloomFlash: React.FC<{ at: number; up?: number; down?: number; color?: string }> = ({ at, up = 2, down = 6, color = "#fff" }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - up, at, at + down], [0, 1, 0], { ...clamp, easing: EASE.out });
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(circle, ${color} 0%, ${color} ${30 + o * 40}%, ${color}cc 100%)`, opacity: o, pointerEvents: "none" }} />;
};

/** Wrap content: on each hit, shake with directional motion blur for `len` frames (the edit "hit shake"). */
export const HitShake: React.FC<{ hits: number[]; amp?: number; len?: number; children: React.ReactNode }> = ({ hits, amp = 34, len = 7, children }) => {
  const f = useCurrentFrame();
  const k = hits.reduce((a, h) => Math.max(a, f >= h ? interpolate(f, [h, h + len], [1, 0], clamp) : 0), 0);
  const x = noise2D("hx", f * 1.3, 0) * amp * k;
  const y = noise2D("hy", f * 1.3, 5) * amp * k;
  const r = noise2D("hr", f * 1.3, 9) * 3 * k;
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px,${y}px) rotate(${r}deg) scale(${1 + 0.06 * k})` }}>
      <Smear x={Math.abs(x) * 0.6} y={Math.abs(y) * 0.6} style={{ width: "100%", height: "100%" }}>
        <AbsoluteFill>{children}</AbsoluteFill>
      </Smear>
    </AbsoluteFill>
  );
};

/** Zoom punch on hits: scale pops to `peak` and eases back over `len` frames. */
export const ZoomPunch: React.FC<{ hits: number[]; peak?: number; len?: number; children: React.ReactNode }> = ({ hits, peak = 1.15, len = 8, children }) => {
  const f = useCurrentFrame();
  const s = hits.reduce((a, h) => a * interpolate(f, [h, h + 1, h + len], [1, peak, 1], { ...clamp, easing: EASE.out }), 1);
  return <AbsoluteFill style={{ transform: `scale(${s})` }}>{children}</AbsoluteFill>;
};

/** 1–2 inverted frames on a hit. Wrap content. */
export const InvertFlash: React.FC<{ at: number[]; frames?: number; children: React.ReactNode }> = ({ at, frames = 2, children }) => {
  const f = useCurrentFrame();
  const on = at.some((h) => f >= h && f < h + frames);
  return <AbsoluteFill style={{ filter: on ? "invert(1) contrast(1.2)" : undefined }}>{children}</AbsoluteFill>;
};

/** Background strobe: alternates colors every `every` frames (red ↔ white edit look). */
export const Strobe: React.FC<{ colors?: string[]; every?: number; from?: number }> = ({ colors = ["#ff0a0a", "#ffffff"], every = 3, from = 0 }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: colors[Math.floor(Math.max(0, f - from) / every) % colors.length] }} />;
};

/** Hard black/white threshold of the content (cut-out silhouette look). Use over a <Strobe> with mixBlendMode multiply. */
export const Threshold: React.FC<{ children: React.ReactNode; level?: number }> = ({ children, level = 1.6 }) => (
  <AbsoluteFill style={{ filter: `grayscale(1) contrast(${level * 6}) brightness(${1 + level * 0.1})` }}>{children}</AbsoluteFill>
);

/** Mirror / kaleidoscope: 2 (left-right) or 4 copies. */
export const Mirror: React.FC<{ children: React.ReactNode; mode?: 2 | 4 }> = ({ children, mode = 2 }) => {
  const tiles = mode === 2 ? [[0, 0, false, false], [1, 0, true, false]] : [[0, 0, false, false], [1, 0, true, false], [0, 1, false, true], [1, 1, true, true]];
  const cols = 2;
  const rows = mode === 2 ? 1 : 2;
  return (
    <AbsoluteFill>
      {tiles.map(([cx, cy, fx, fy], i) => (
        <div key={i} style={{ position: "absolute", left: `${(Number(cx) * 100) / cols}%`, top: `${(Number(cy) * 100) / rows}%`, width: `${100 / cols}%`, height: `${100 / rows}%`, overflow: "hidden" }}>
          <div style={{ position: "absolute", width: `${cols * 100}%`, height: `${rows * 100}%`, left: `-${50 * (cols - 1)}%`, top: `-${50 * (rows - 1)}%`, transform: `scale(${fx ? -1 : 1}, ${fy ? -1 : 1})` }}>
            <AbsoluteFill>{children}</AbsoluteFill>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** Vertical pixel-sort streaks over the content for `dur` frames from `at`. */
export const PixelStreak: React.FC<{ at: number; dur?: number; columns?: number; children: React.ReactNode }> = ({ at, dur = 6, columns = 40, children }) => {
  const f = useCurrentFrame();
  const k = f >= at && f < at + dur ? Math.sin(((f - at) / dur) * Math.PI) : 0;
  if (k <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
      {Array.from({ length: columns }, (_, i) => {
        if (random(`ps${i}`) < 0.5) return null;
        const stretch = 1 + k * (2 + random(`pl${i}-${Math.floor(f / 2)}`) * 6);
        return (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${(i / columns) * 100}%`, width: `${100 / columns}%`, overflow: "hidden" }}>
            <div style={{ position: "absolute", width: `${columns * 100}%`, height: "100%", left: `-${i * 100}%`, transform: `scaleY(${stretch})`, transformOrigin: `50% ${random(`po${i}`) * 100}%`, filter: "blur(1px) saturate(1.6)" }}>
              <AbsoluteFill>{children}</AbsoluteFill>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Halation: highlights bloom and subjects get a soft outer glow (anime edit look). Wrap content. */
export const Halation: React.FC<{ children: React.ReactNode; color?: string; strength?: number }> = ({ children, color = "#ffffff", strength = 1 }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ filter: "contrast(1.15) saturate(1.25)" }}>{children}</AbsoluteFill>
    <AbsoluteFill style={{ filter: `brightness(1.6) blur(${18 * strength}px)`, mixBlendMode: "screen", opacity: 0.55 * strength }}>{children}</AbsoluteFill>
    <AbsoluteFill style={{ background: color, mixBlendMode: "soft-light", opacity: 0.12 * strength }} />
  </AbsoluteFill>
);

/** Title whose letters flicker on one by one (`S P A C E`). */
export const FlickerTitle: React.FC<{ text: string; delay?: number; per?: number; style?: React.CSSProperties }> = ({ text, delay = 0, per = 4, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: "0.35em", ...style }}>
      {[...text].map((c, i) => {
        const t = f - delay - i * per;
        const on = t >= 0 && (t > 6 || random(`ft${i}-${f}`) > 0.35);
        return (
          <span key={i} style={{ opacity: on ? 1 : 0, textShadow: "0 0 18px rgba(255,255,255,0.8)" }}>
            {c}
          </span>
        );
      })}
    </div>
  );
};

/** Edit progress counter "37%" in a corner. */
export const PercentCounter: React.FC<{ total: number; style?: React.CSSProperties }> = ({ total, style }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", right: "4%", bottom: "4%", fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 90, color: "#3fe0b0", ...style }}>{Math.min(100, Math.round((f / total) * 100))}%</div>;
};

/** Black dip: `frames` black frames right before `at` (before the final drop / ending). */
export const BlackDip: React.FC<{ at: number; frames?: number }> = ({ at, frames = 3 }) => {
  const f = useCurrentFrame();
  return f >= at - frames && f < at ? <AbsoluteFill style={{ background: "#000" }} /> : null;
};

/** Quick helper: 0→1 envelope on hit frames (for driving any prop). */
export const hitEnvelope = (f: number, hits: number[], len = 8) => hits.reduce((a, h) => Math.max(a, f >= h ? 1 - prog(f, h, len, EASE.out) : 0), 0);
