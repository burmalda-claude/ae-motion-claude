// Transition engine demo (28 s): cheesy preset vs clean cut → 5 categories with knob close-ups → beat-synced phonk section → finale.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import timelineJson from "./timeline-trans.json"; // build.py output for the demo audio
import {
  CUT_EASE, ChromaDefs, Cube3D, CutKind, DotGrid, EASE, GooDefs, Grain, MorphText, ShotProps, Slide, SpeedRampCut, Starburst, TimelineData, TimelineShots, Vignette,
  prog, transition,
} from "../kit";

const timeline = timelineJson as TimelineData;
export const TRANSITIONS_DURATION = timeline.total;
const sub = { subsets: ["cyrillic", "latin"] as ("cyrillic" | "latin")[] };
const { fontFamily: WIDE } = loadUnbounded("normal", { weights: ["900"], ...sub });
const { fontFamily: MONO } = loadMono("normal", { weights: ["500", "700"], ...sub });
const { fontFamily: COND } = loadOswald("normal", { weights: ["700"], ...sub });
const ACID = "#b6ff00";
const C: React.CSSProperties = { justifyContent: "center", alignItems: "center", textAlign: "center" };
const big = (s: number, x?: React.CSSProperties): React.CSSProperties => ({ fontFamily: WIDE, fontWeight: 900, fontSize: s, lineHeight: 0.95, textTransform: "uppercase", ...x });

// ---------------- scene cards (frame-driven so speed ramps can remap them)
const Card: React.FC<{ bg: string; word: string; color?: string; sub?: string }> = ({ bg, word, color = "#fff", sub: s }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: bg, ...C }}>
      <DotGrid opacity={0.25} />
      <div style={{ ...big(220, { color }), transform: `scale(${1 + f * 0.002})` }}>{word}</div>
      {s && <div style={{ fontFamily: MONO, fontSize: 40, color, opacity: 0.75, marginTop: 20 }}>{s}</div>}
    </AbsoluteFill>
  );
};
const FicusCard: React.FC<{ bg: string }> = ({ bg }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: bg, ...C }}>
      <Img src={staticFile("img/ficus.png")} style={{ height: 900, transform: `rotate(${Math.sin(f / 8) * 3}deg)`, filter: `drop-shadow(0 0 30px ${ACID})` }} />
    </AbsoluteFill>
  );
};
const Eye: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#f1ece4", ...C }}>
      <svg width={1000} height={500} viewBox="-100 -50 200 100">
        <path d="M-90 0 Q0 -60 90 0 Q0 60 -90 0Z" fill="#fff" stroke="#111" strokeWidth={3} />
        <circle r={30} fill="#3b6ea8" />
        <circle r={14} fill="#111" />
        <circle r={5} cx={-8 + Math.sin(f / 10) * 2} cy={-8} fill="#fff" />
      </svg>
    </AbsoluteFill>
  );
};
const Moon: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(#1b2a4a,#05070f)" }}>
    {Array.from({ length: 60 }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%`, width: 3, height: 3, borderRadius: "50%", background: "#fff", opacity: 0.6 }} />
    ))}
    <div style={{ position: "absolute", left: "50%", top: "50%", width: 300, height: 300, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #fffbe8, #d8d2bb 60%, #a8a290)", boxShadow: "0 0 80px #fffbe8aa" }} />
  </AbsoluteFill>
);
const Spinner: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0b0b14", ...C, flexDirection: "row", gap: 80 }}>
      <Cube3D size={260} color="#ff2a3d" ry={f * 9} rx={-20} />
      <div style={{ ...big(150, { color: "#fff" }), transform: `translateX(${Math.sin(f / 6) * 80}px)` }}>СКОРОСТЬ</div>
    </AbsoluteFill>
  );
};
const Bars: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: ACID, overflow: "hidden" }}>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: `${((f * 14 + i * 260) % 2200) - 200}px`, top: 0, bottom: 0, width: 90, background: "#111", transform: "skewX(-15deg)" }} />
      ))}
      <AbsoluteFill style={C}>
        <div style={big(150, { color: "#fff", WebkitTextStroke: "6px #111" })}>ПЛАВНО</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------- knob panel (close-up of the controls)
const Knobs: React.FC<{ title: string; kind: string; frames: number; ease: (t: number) => number; easeName: string; blur: boolean; at: number; audio: string }> = ({ title, kind, frames, ease, easeName, blur, at, audio }) => {
  const f = useCurrentFrame();
  const inP = prog(f, 2, 10, EASE.out);
  const t = Math.min(1, Math.max(0, (f - at) / Math.max(1, frames)));
  const pts = Array.from({ length: 41 }, (_, i) => `${(i / 40) * 240},${100 - ease(i / 40) * 100}`).join(" ");
  const row = (label: string, node: React.ReactNode) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
      {node}
    </div>
  );
  return (
    <div style={{ position: "absolute", right: 40, top: 200, width: 640, zoom: 1.08, background: "rgba(12,12,16,0.92)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 22, padding: "26px 32px", fontFamily: MONO, fontSize: 28, color: "#fff", transform: `translateX(${(1 - inP) * 700}px)`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
      <div style={{ fontFamily: COND, fontSize: 52, textTransform: "uppercase", color: ACID }}>{title}</div>
      <div style={{ opacity: 0.6, fontSize: 24, marginBottom: 8 }}>transition("{kind}")</div>
      {row(
        "Duration",
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 200, height: 8, background: "rgba(255,255,255,0.2)", position: "relative", borderRadius: 4 }}>
            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(frames / 16) * 100}%`, background: ACID, borderRadius: 4 }} />
          </span>
          {frames ? `${frames} f` : "0 f"}
        </span>,
      )}
      {row(
        "Easing",
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width={120} height={60} viewBox="-5 -5 250 110">
            <polyline points={pts} fill="none" stroke={ACID} strokeWidth={6} />
            <circle cx={t * 240} cy={100 - ease(t) * 100} r={10} fill="#fff" />
          </svg>
          {easeName}
        </span>,
      )}
      {row("Motion blur", <span style={{ color: blur ? ACID : "#888" }}>{blur ? "● ON" : "○ off"}</span>)}
      {row(
        "Overlap",
        <span style={{ position: "relative", width: 240, height: 34, display: "inline-block" }}>
          <span style={{ position: "absolute", left: 0, width: 150, top: 0, height: 14, background: "#ff2a3d", borderRadius: 3 }} />
          <span style={{ position: "absolute", left: 150 - frames * 5, width: 90 + frames * 5, top: 18, height: 14, background: "#2f6bff", borderRadius: 3 }} />
          {frames > 0 && <span style={{ position: "absolute", left: 150 - frames * 5, width: frames * 5, top: -4, bottom: -4, border: `2px solid ${ACID}`, borderRadius: 4 }} />}
        </span>,
      )}
      {row("Audio sync", <span style={{ color: ACID }}>{audio}</span>)}
    </div>
  );
};

/** Preview monitor on the left (scene at 60%), controls on the right — the "close-up on the knobs" layout. */
const Monitor: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "#0d0d10" }}>
    <DotGrid opacity={0.25} />
    <div style={{ position: "absolute", left: 50, top: 232, width: 1920 * 0.57, height: 1080 * 0.57, borderRadius: 18, overflow: "hidden", border: "3px solid rgba(255,255,255,0.25)", boxShadow: "0 30px 90px rgba(0,0,0,0.6)" }}>
      <div style={{ width: 1920, height: 1080, transform: "scale(0.57)", transformOrigin: "0 0", position: "relative" }}>{children}</div>
    </div>
  </AbsoluteFill>
);

// ---------------- helpers
const Label: React.FC<{ text: string; good?: boolean; at?: number }> = ({ text, good, at = 0 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: 50, top: 50, fontFamily: COND, fontSize: 60, textTransform: "uppercase", color: "#fff", background: good === undefined ? "rgba(0,0,0,0.7)" : good ? "#169c4b" : "#c4161c", padding: "6px 26px", borderRadius: 10, transform: `scale(${0.8 + 0.2 * prog(f, at, 6, EASE.back)})`, transformOrigin: "0 0" }}>
      {good === undefined ? "" : good ? "✓ " : "✕ "}
      {text}
    </div>
  );
};
const Pair: React.FC<{ A: React.ReactNode; B: React.ReactNode; aDur: number; bDur: number; kind: CutKind; frames?: number; props?: Record<string, unknown> }> = ({ A, B, aDur, bDur, kind, frames, props }) => {
  const t = transition(kind, { frames, props });
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={aDur + (t ? t.frames / 2 : 0)}>{A}</TransitionSeries.Sequence>
      {t && <TransitionSeries.Transition presentation={t.presentation} timing={t.timing} />}
      <TransitionSeries.Sequence durationInFrames={bDur + (t ? t.frames / 2 : 0)}>{B}</TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

// cheesy 2012 preset: star spin + rainbow + bounce, 22 frames
const CheesyComp: React.FC<{ children: React.ReactNode; presentationDirection: string; presentationProgress: number }> = ({ children, presentationDirection, presentationProgress: p }) =>
  presentationDirection === "entering" ? (
    <AbsoluteFill style={{ clipPath: `polygon(${Array.from({ length: 10 }, (_, i) => { const r = (i % 2 ? 0.45 : 1) * p * 120; const a = (i / 10) * Math.PI * 2 + p * 6; return `${50 + r * Math.cos(a)}% ${50 + r * Math.sin(a)}%`; }).join(",")})`, filter: `hue-rotate(${p * 720}deg) saturate(3)` }}>{children}</AbsoluteFill>
  ) : (
    <AbsoluteFill style={{ transform: `rotate(${p * 360}deg) scale(${1 - p * 0.6})`, filter: `hue-rotate(${p * 360}deg)` }}>{children}</AbsoluteFill>
  );

// ---------------- shots
const Bad: React.FC<ShotProps> = () => (
  <AbsoluteFill>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={45}>
        <Card bg="#2f6bff" word="КАДР А" />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={{ component: CheesyComp as never, props: {} }} timing={linearTiming({ durationInFrames: 22 })} />
      <TransitionSeries.Sequence durationInFrames={52}>
        <Card bg="#ff2a3d" word="КАДР Б" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Label text="пресет «как в 2012»" good={false} />
  </AbsoluteFill>
);
const Clean: React.FC<ShotProps> = () => (
  <AbsoluteFill>
    <Pair A={<Card bg="#2f6bff" word="КАДР А" />} B={<Card bg="#ff2a3d" word="КАДР Б" />} aDur={38} bDur={37} kind="cut" />
    <Label text="чистый кат" good />
  </AbsoluteFill>
);
const Cat: React.FC<{ title: string; kind: CutKind; easeName: "ease" | "sCurve" | "out" | "in"; blur: boolean; audio: string; A: React.ReactNode; B: React.ReactNode; props?: Record<string, unknown>; frames?: number }> = ({
  title,
  kind,
  easeName,
  blur,
  audio,
  A,
  B,
  props,
  frames,
}) => {
  const t = transition(kind, { frames, props, ease: easeName });
  const fr = t?.frames ?? 0;
  return (
    <AbsoluteFill>
      <Monitor>
        <Pair A={A} B={B} aDur={30} bDur={30} kind={kind} frames={frames} props={props} />
      </Monitor>
      <Knobs title={title} kind={kind} frames={fr} ease={CUT_EASE[easeName]} easeName={easeName} blur={blur} at={30 - fr / 2} audio={audio} />
    </AbsoluteFill>
  );
};
const CatCut: React.FC<ShotProps> = () => <Cat title="1 · The Cut" kind="cut" easeName="ease" blur={false} audio="thump на кадре" A={<FicusCard bg="#101010" />} B={<Card bg="#ff2a3d" word="КАТ" />} />;
const CatDissolve: React.FC<ShotProps> = () => (
  <Cat title="2 · Dissolve" kind="scaleDissolve" frames={12} easeName="ease" blur={false} audio="мягкий whoosh" A={<Card bg="#3a2a1a" word="ДО" color="#f2ead8" sub="blur + 103%" />} B={<Card bg="#1a2a3a" word="ПОСЛЕ" color="#f2ead8" />} />
);
const CatWipe: React.FC<ShotProps> = () => <Cat title="3 · Match Reveal" kind="matchReveal" easeName="ease" blur props={{ x: 50, y: 50, r0: 9, edge: ACID }} audio="swish в край" A={<Eye />} B={<Moon />} />;
const CatSpeed: React.FC<ShotProps> = () => (
  <AbsoluteFill>
    <Monitor>
      <SpeedRampCut A={Spinner} B={Bars} aDur={30} bDur={30} ramp={12} low={0.45} />
    </Monitor>
    <Knobs title="4 · Speed Ramp" kind="SpeedRampCut" frames={12} ease={CUT_EASE.sCurve} easeName="sCurve 100→45→100%" blur audio="whoosh на кат" at={18} />
  </AbsoluteFill>
);
const CatLeak: React.FC<ShotProps> = () => (
  <Cat title="5 · Light Leak" kind="filmBurn" easeName="ease" blur={false} audio="shimmer в бит" A={<Card bg="#0e0e10" word="ДЕНЬ" />} B={<Card bg="#1a1012" word="НОЧЬ" color="#ffd6a0" />} />
);

// beat section: transitions centered exactly on every 2nd beat at 140 BPM
const BEAT = (60 / 140) * 30;
const HITS = Array.from({ length: 10 }, (_, i) => Math.round((i + 1) * 2 * BEAT));
const BEAT_KINDS: CutKind[] = ["phonk", "liquid", "split", "depth", "whip", "glitch", "zoom", "particle", "shapeWipe", "phonk"];
const BEAT_SCENES: React.ReactNode[] = [
  <Card bg="#050605" word="БИТ" color={ACID} />,
  <FicusCard bg="#111" />,
  <Card bg={ACID} word="ЖИДКО" color="#111" />,
  <Card bg="#ff2a3d" word="РАЗРЕЗ" color="#111" />,
  <Card bg="#0b0b14" word="ГЛУБИНА" />,
  <Card bg="#2f6bff" word="ВЖУХ" />,
  <FicusCard bg="#1a0010" />,
  <Card bg="#050605" word="ЗУМ" color={ACID} />,
  <Card bg="#f1ece4" word="ПЫЛЬ" color="#111" />,
  <Card bg="#ff2a3d" word="ВАЙП" />,
  <Card bg="#050605" word="ФОНК" color={ACID} />,
];
const Beat: React.FC<ShotProps> = ({ dur }) => {
  const f = useCurrentFrame();
  const items: React.ReactNode[] = [];
  let prevStart = 0;
  HITS.forEach((h, i) => {
    const t = transition(BEAT_KINDS[i], i === 8 ? { props: { shape: "diagonal", edge: ACID } } : {})!;
    const start = h - t.frames / 2; // center the transition on the beat
    items.push(
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={Math.round(start - prevStart + t.frames)}>
        {BEAT_SCENES[i]}
      </TransitionSeries.Sequence>,
      <TransitionSeries.Transition key={`t${i}`} presentation={t.presentation} timing={t.timing} />,
    );
    prevStart = start;
  });
  items.push(
    <TransitionSeries.Sequence key="last" durationInFrames={Math.round(dur - prevStart)}>
      {BEAT_SCENES[10]}
    </TransitionSeries.Sequence>,
  );
  const lastHit = HITS.filter((h) => h <= f).pop() ?? 0;
  return (
    <AbsoluteFill>
      <TransitionSeries>{items}</TransitionSeries>
      <div style={{ position: "absolute", left: 50, bottom: 50, fontFamily: MONO, fontSize: 30, color: "#fff", background: "rgba(0,0,0,0.65)", padding: "8px 18px", borderRadius: 10 }}>
        /transition beat · 140 BPM · {BEAT_KINDS[Math.max(0, HITS.indexOf(lastHit))]}
      </div>
    </AbsoluteFill>
  );
};

const Final: React.FC<ShotProps> = ({ dur }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#050605", ...C }}>
      <AbsoluteFill style={C}>
        <Starburst size={1400} color="#0f1a00" spin={0.2} />
      </AbsoluteFill>
      <MorphText from="ТРЮКИ" to="ПЕРЕХОДЫ," at={8} dur={16} style={big(200, { color: ACID })} />
      <Slide at={30} vertical from={200} dur={6}>
        <div style={{ fontFamily: COND, fontSize: 90, color: "#fff", textTransform: "uppercase", marginTop: 20 }}>которые не стыдно показать</div>
      </Slide>
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [dur - 12, dur], [0, 1], { extrapolateLeft: "clamp" }) }} />
    </AbsoluteFill>
  );
};

export const Transitions: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <ChromaDefs />
    <GooDefs />
    <TimelineShots
      timeline={timeline}
      audio="audio/trans.wav"
      shots={{ bad: Bad, clean: Clean, cut: CatCut, dissolve: CatDissolve, wipe: CatWipe, speed: CatSpeed, leak: CatLeak, beat: Beat, final: Final }}
    />
    <Grain opacity={0.05} />
    <Vignette strength={0.35} />
  </AbsoluteFill>
);

