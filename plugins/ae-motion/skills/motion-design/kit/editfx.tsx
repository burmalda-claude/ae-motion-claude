// Effects measured in 28 real TikTok edits (references/edits-breakdown.md). Frames are relative to the shot.
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, clamp, prog } from "./easing";
import { Smear } from "./fx";

/** Measured in the reference edits (tools/transscan.py + deep pass, 840 events / 27 edits). Frames at the edit's fps. */
export const EDIT_TIMING = {
  /** flash brightness / peak for frames -2..+8 around the cut: starts on the OLD shot, peak on -1 and 0, ~8 frame tail */
  flash: [0.38, 1, 1, 0.74, 0.54, 0.45, 0.33, 0.27, 0.22, 0.17, 0.1],
  creepIn: 1.05, // new shot pushes in +5% over ~7 frames (accelerating)
  settle: 0.96, // or lands punched in and settles -4% (big punches: up to 2x -> 1x)
  shake: 0.025, // camera shake on hit cuts: 1.5–3.5 % of frame width per frame, decays over the shot
  rot: 1, // degrees of rotational shake (p90 ~5)
  burstGap: 4, // frames between events of the same kind inside a burst (runs of 2–5)
  changeGap: 14, // frames before the kind changes (phrase boundary)
  black: 3, // black frames before a drop
  blur: 6, // directional blur frames around a whip / blur cut
  dissolve: 4, // dissolves in edits are short
};

/** Brightness of the measured flash at frame f for a cut at `at` (0..1). `len` stretches the tail. */
export const flashCurve = (f: number, at: number, len = 1) => {
  const k = (f - at) / len + 2;
  if (k < 0 || k > 10) return 0;
  const i = Math.floor(k);
  return EDIT_TIMING.flash[i] + (EDIT_TIMING.flash[Math.min(10, i + 1)] - EDIT_TIMING.flash[i]) * (k - i);
};

/** Whiteout bloom flash on a hit. Default = the measured curve (starts 2 frames before `at`, peak -1..0, 8-frame tail); pass up/down for a custom triangle. */
export const BloomFlash: React.FC<{ at: number; up?: number; down?: number; color?: string; len?: number }> = ({ at, up, down, color = "#fff", len = 1 }) => {
  const f = useCurrentFrame();
  const o = up === undefined && down === undefined ? flashCurve(f, at, len) : interpolate(f, [at - (up ?? 2), at, at + (down ?? 6)], [0, 1, 0], { ...clamp, easing: EASE.out });
  if (o <= 0) return null;
  const c = /^#[0-9a-f]{3}$/i.test(color) ? "#" + [...color.slice(1)].map((h) => h + h).join("") : color; // "#fff" + "cc" is not a colour
  return <AbsoluteFill style={{ background: `radial-gradient(circle, ${c} 0%, ${c} ${30 + o * 40}%, ${c}cc 100%)`, opacity: o, pointerEvents: "none" }} />;
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

/** Camera life of a shot right after an edit cut (measured): "creep" pushes in +5 % accelerating, "settle" lands punched in and
 * eases out, "punch" = big settle (1.5x -> 1x). Plus a hit shake that decays over the shot. Wrap one shot; frames are shot-relative. */
export const EditCam: React.FC<{ kind?: "creep" | "settle" | "punch" | "none"; dur: number; shake?: number; seed?: string; children: React.ReactNode }> = ({
  kind = "creep",
  dur,
  shake = EDIT_TIMING.shake,
  seed = "ec",
  children,
}) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / Math.max(1, Math.min(dur, 8)));
  const s =
    kind === "creep" ? 1 + (EDIT_TIMING.creepIn - 1) * EASE.in(t) * Math.max(1, f / 8) ** 0.5
    : kind === "settle" ? 1 + (1 / EDIT_TIMING.settle - 1) * (1 - EASE.out(t))
    : kind === "punch" ? 1 + 0.5 * (1 - EASE.out(Math.min(1, f / 6)))
    : 1;
  const k = shake * Math.max(0, 1 - f / Math.max(6, dur)); // shake decays over the shot
  const x = noise2D(seed + "x", f * 0.9, 0) * k * 100;
  const y = noise2D(seed + "y", f * 0.9, 3) * k * 100;
  const r = noise2D(seed + "r", f * 0.9, 7) * EDIT_TIMING.rot * (k / Math.max(1e-6, shake));
  return <AbsoluteFill style={{ transform: `translate(${x}%, ${y}%) rotate(${r}deg) scale(${s * (1 + 2 * k)})` }}>{children}</AbsoluteFill>;
};
