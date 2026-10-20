import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";
import { EASE, clamp, mix, pop, prog } from "./easing";
import { Typewriter } from "./text";

// Mock UI pieces that tech/product promos use as "b-roll". All sizes in px, theme via props.

const card = (bg: string, border: string): React.CSSProperties => ({
  background: bg,
  border: `1.5px solid ${border}`,
  borderRadius: 22,
  boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
});

/** Chat/prompt input that types itself, with highlighted keywords and a glowing send button. */
export const PromptBox: React.FC<{
  text: string;
  highlight?: string[];
  delay?: number;
  width?: number;
  accent?: string;
  font?: string;
  cps?: number;
  sendAt?: number; // frame when the send button is "clicked"
}> = ({ text, highlight = [], delay = 0, width = 1100, accent = "#ff2a3d", font = "JetBrains Mono, monospace", cps = 20, sendAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = pop(frame, fps, delay, 16);
  const press = sendAt !== undefined ? interpolate(frame, [sendAt, sendAt + 3, sendAt + 8], [1, 0.85, 1], clamp) : 1;
  return (
    <div
      style={{
        ...card("linear-gradient(180deg, rgba(70,80,120,0.55), rgba(40,44,70,0.55))", "rgba(255,255,255,0.25)"),
        width,
        padding: "40px 120px 40px 48px",
        position: "relative",
        transform: `translateY(${(1 - inP) * 80}px) scale(${mix(0.92, 1, inP)})`,
        opacity: Math.min(1, inP * 1.5),
        backdropFilter: "blur(20px)",
      }}
    >
      <Typewriter text={text} delay={delay + 8} cps={cps} highlight={highlight} highlightColor={accent} style={{ fontFamily: font, fontSize: 44, color: "#fff", lineHeight: 1.5 }} />
      <div
        style={{
          position: "absolute",
          right: 32,
          bottom: 32,
          width: 64,
          height: 64,
          borderRadius: 16,
          border: `2px solid ${accent}`,
          display: "grid",
          placeItems: "center",
          color: "#fff",
          fontSize: 30,
          transform: `scale(${press})`,
          boxShadow: `0 0 24px ${accent}`,
        }}
      >
        ↵
      </div>
    </div>
  );
};

/** After Effects-like timeline: tracks with keyframe diamonds and a moving playhead. */
export const Timeline: React.FC<{
  tracks?: { name: string; color?: string; keys: number[]; bar?: [number, number] }[]; // keys/bar in 0..1 of width
  delay?: number;
  width?: number;
  title?: string;
  playhead?: [number, number]; // 0..1 start/end positions over the shot
  dur?: number;
}> = ({
  tracks = [
    { name: "Text", keys: [0.1, 0.35, 0.6] },
    { name: "Shape 1", color: "#ff8a3d", keys: [0.15, 0.5, 0.85], bar: [0.15, 0.85] },
    { name: "Shape 2", color: "#ff2a3d", keys: [0.25, 0.45, 0.65], bar: [0.25, 0.65] },
    { name: "Camera", keys: [0.05, 0.55, 0.95] },
  ],
  delay = 0,
  width = 1100,
  title = "After Effects",
  playhead = [0.1, 0.8],
  dur = 60,
}) => {
  const frame = useCurrentFrame();
  const inP = prog(frame, delay, 14);
  const ph = mix(playhead[0], playhead[1], prog(frame, delay + 10, dur, EASE.linear));
  const labelW = 200;
  const lane = width - labelW - 60;
  return (
    <div style={{ ...card("#f4f4f4", "#ddd"), width, padding: 30, opacity: inP, transform: `translateY(${(1 - inP) * 60}px)`, fontFamily: "JetBrains Mono, monospace", color: "#555" }}>
      <div style={{ textAlign: "center", fontSize: 26, marginBottom: 20 }}>{title}</div>
      <div style={{ position: "relative" }}>
        {tracks.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", height: 56 }}>
            <div style={{ width: labelW, fontSize: 22 }}>■ {t.name}</div>
            <div style={{ position: "relative", width: lane, height: 2, background: "#ccc" }}>
              {t.bar && (
                <div
                  style={{
                    position: "absolute",
                    left: t.bar[0] * lane,
                    width: (t.bar[1] - t.bar[0]) * lane * prog(frame, delay + 8 + i * 3, 16),
                    top: -8,
                    height: 18,
                    borderRadius: 9,
                    background: t.color,
                  }}
                />
              )}
              {t.keys.map((k, j) => {
                const hit = ph >= k;
                return (
                  <div
                    key={j}
                    style={{
                      position: "absolute",
                      left: k * lane - 9,
                      top: -9,
                      width: 18,
                      height: 18,
                      transform: `rotate(45deg) scale(${hit ? 1.25 : 1})`,
                      background: hit ? t.color ?? "#ff2a3d" : "#333",
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ position: "absolute", top: -14, bottom: 0, left: labelW + ph * lane, width: 3, background: "#ff2a3d" }} />
      </div>
    </div>
  );
};

/** Render progress bar with percent and ETA. */
export const RenderBar: React.FC<{ delay?: number; dur?: number; width?: number; label?: string; accent?: string; to?: number }> = ({
  delay = 0,
  dur = 50,
  width = 1100,
  label = "RENDERING",
  accent = "#fff",
  to = 1,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, dur, EASE.easy) * to;
  const eta = Math.max(0, Math.round((1 - p) * 9999));
  const hh = String(Math.floor(eta / 3600)).padStart(2, "0");
  const mm = String(Math.floor((eta % 3600) / 60)).padStart(2, "0");
  const ss = String(eta % 60).padStart(2, "0");
  return (
    <div style={{ width, fontFamily: "JetBrains Mono, monospace", color: accent }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, marginBottom: 12 }}>
        <span>{label}{".".repeat(1 + (Math.floor(frame / 8) % 3))}</span>
        <span>{Math.round(p * 100)}%</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 4 }}>
        <div style={{ width: `${p * 100}%`, height: "100%", background: accent, borderRadius: 4, boxShadow: `0 0 14px ${accent}` }} />
      </div>
      <div style={{ marginTop: 16, fontSize: 24, opacity: 0.7 }}>ETA {hh}:{mm}:{ss}</div>
    </div>
  );
};

/** Node graph: cards connected by animated glowing cables with a traveling pulse. */
export const NodeGraph: React.FC<{
  nodes: { id: string; x: number; y: number; title: string; sub?: string; hot?: boolean }[];
  edges: [string, string][];
  delay?: number;
  width?: number;
  height?: number;
  accent?: string;
}> = ({ nodes, edges, delay = 0, width = 1600, height = 700, accent = "#ff2a3d" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const byId: Record<string, (typeof nodes)[number]> = {};
  nodes.forEach((n) => (byId[n.id] = n));
  return (
    <div style={{ position: "relative", width, height }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {edges.map(([a, b], i) => {
          const A = byId[a];
          const B = byId[b];
          const mx = (A.x + B.x) / 2;
          const d = `M ${A.x} ${A.y} C ${mx} ${A.y}, ${mx} ${B.y}, ${B.x} ${B.y}`;
          const p = prog(frame, delay + 10 + i * 8, 18, EASE.inOut);
          const { strokeDasharray, strokeDashoffset } = evolvePath(p, d);
          const t = ((frame - delay) / 30 + i * 0.3) % 1;
          return (
            <g key={i}>
              <path d={d} stroke={accent} strokeWidth={4} fill="none" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ filter: `drop-shadow(0 0 8px ${accent})` }} />
              {p >= 1 && <Pulse d={d} t={t} accent={accent} />}
            </g>
          );
        })}
      </svg>
      {nodes.map((n, i) => {
        const s = pop(frame, fps, delay + i * 5, 13);
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              transform: `translate(-50%,-50%) scale(${s})`,
              ...card(n.hot ? accent : "rgba(40,44,60,0.9)", n.hot ? "#ff8a8a" : "rgba(255,255,255,0.2)"),
              padding: "22px 30px",
              minWidth: 220,
              color: "#fff",
              fontFamily: "Inter, sans-serif",
              boxShadow: n.hot ? `0 0 60px ${accent}` : undefined,
            }}
          >
            {n.sub && <div style={{ fontSize: 16, opacity: 0.6, letterSpacing: "0.12em", textTransform: "uppercase" }}>{n.sub}</div>}
            <div style={{ fontSize: 40, fontWeight: 800 }}>{n.title}</div>
          </div>
        );
      })}
    </div>
  );
};

const Pulse: React.FC<{ d: string; t: number; accent: string }> = ({ d, t, accent }) => {
  const pt = getPointAtLength(d, getLength(d) * t);
  if (!pt) return null;
  return <circle r={8} fill="#fff" cx={pt.x} cy={pt.y} style={{ filter: `drop-shadow(0 0 10px ${accent})` }} />;
};

/** Mouse cursor that travels through points (`at` must increase, 2+ points) and clicks at the ones marked. */
export const Cursor: React.FC<{ path: { x: number; y: number; at: number; click?: boolean }[]; color?: string; size?: number }> = ({ path, color = "#fff", size = 56 }) => {
  const frame = useCurrentFrame();
  const at = path.map((p) => p.at);
  const x = interpolate(frame, at, path.map((p) => p.x), { ...clamp, easing: EASE.inOut });
  const y = interpolate(frame, at, path.map((p) => p.y), { ...clamp, easing: EASE.inOut });
  const clickK = path.filter((p) => p.click).reduce((s, p) => Math.min(s, interpolate(frame, [p.at, p.at + 3, p.at + 8], [1, 0.8, 1], clamp)), 1);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, transform: `scale(${clickK})`, transformOrigin: "0 0", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}>
      <path d="M3 2 L3 20 L8 15 L11.5 22 L14.5 20.6 L11 13.8 L18 13.8 Z" fill={color} stroke="#000" strokeWidth={1.2} />
    </svg>
  );
};

/** Video player mock: frame with big play button and scrubbing progress. */
export const PlayerMock: React.FC<{ width?: number; delay?: number; accent?: string; children?: React.ReactNode }> = ({ width = 900, delay = 0, accent = "#ff2a3d", children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 15);
  const p = prog(frame, delay + 10, 90, EASE.linear);
  const h = width * 0.5625;
  return (
    <div style={{ ...card("#f2f2f2", "#ddd"), width, height: h + 60, overflow: "hidden", transform: `scale(${s})`, position: "relative" }}>
      <div style={{ height: h, display: "grid", placeItems: "center", position: "relative" }}>
        {children ?? (
          <svg width={140} height={140} viewBox="0 0 10 10">
            <path d="M2 1 L9 5 L2 9 Z" fill={accent} />
          </svg>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 24px", height: 60, fontFamily: "JetBrains Mono, monospace", fontSize: 20, color: "#333" }}>
        ❚❚
        <div style={{ flex: 1, height: 4, background: "#ccc", position: "relative" }}>
          <div style={{ width: `${p * 100}%`, height: "100%", background: accent }} />
        </div>
        00:00:{String(Math.floor(p * 15)).padStart(2, "0")}
      </div>
    </div>
  );
};
