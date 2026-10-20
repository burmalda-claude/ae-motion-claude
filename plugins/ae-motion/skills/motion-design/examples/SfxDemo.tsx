// SFX engine demo (20 s): same transition without/with SFX → categories with real waveforms → beat-synced hits → "AI" prompt → finale.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import timelineJson from "./timeline-sfx.json"; // build.py output for the demo
import waveJson from "./sfx-wave.json";
import { BloomFlash, ChromaDefs, DotGrid, EASE, Grain, HitShake, ShotProps, Slide, Strobe, TimelineData, TimelineShots, TypeOn, Vignette, ZoomIn, ZoomPunch, prog, transition } from "../kit";

const timeline = timelineJson as TimelineData;
export const SFX_DEMO_DURATION = timeline.total;
const waves = waveJson.waves as Record<string, { spec: string; peaks: number[] }>;
const sub = { subsets: ["cyrillic", "latin"] as ("cyrillic" | "latin")[] };
const { fontFamily: WIDE } = loadUnbounded("normal", { weights: ["900"], ...sub });
const { fontFamily: MONO } = loadMono("normal", { weights: ["500", "700"], ...sub });
const { fontFamily: COND } = loadOswald("normal", { weights: ["700"], ...sub });
const ACID = "#b6ff00";
const C: React.CSSProperties = { justifyContent: "center", alignItems: "center", textAlign: "center" };
const big = (s: number, x?: React.CSSProperties): React.CSSProperties => ({ fontFamily: WIDE, fontWeight: 900, fontSize: s, lineHeight: 0.95, textTransform: "uppercase", ...x });

/** Waveform that "plays": bars light up from `at` over `dur` frames. */
const Wave: React.FC<{ id: string; at: number; dur: number; color?: string; width?: number; height?: number }> = ({ id, at, dur, color = ACID, width = 1300, height = 260 }) => {
  const f = useCurrentFrame();
  const pk = waves[id].peaks;
  const head = interpolate(f, [at, at + dur], [0, pk.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bw = width / pk.length;
  return (
    <svg width={width} height={height}>
      {pk.map((v, i) => {
        const h = Math.max(3, v * height * 0.95);
        const lit = i < head;
        return <rect key={i} x={i * bw + 1} y={(height - h) / 2} width={bw - 2} height={h} rx={2} fill={lit ? color : "rgba(255,255,255,0.15)"} style={lit ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined} />;
      })}
      <line x1={head * bw} x2={head * bw} y1={0} y2={height} stroke="#fff" strokeWidth={3} opacity={head > 0 && head < pk.length ? 1 : 0} />
    </svg>
  );
};

const Badge: React.FC<{ text: string; ok?: boolean }> = ({ text, ok }) => (
  <div style={{ position: "absolute", left: 50, top: 50, fontFamily: COND, fontSize: 64, textTransform: "uppercase", color: "#fff", background: ok ? "#169c4b" : "#c4161c", padding: "6px 26px", borderRadius: 10 }}>
    {ok ? "🔊 " : "🔇 "}
    {text}
  </div>
);

const Card: React.FC<{ bg: string; word: string; color?: string }> = ({ bg, word, color = "#fff" }) => (
  <AbsoluteFill style={{ background: bg, ...C }}>
    <DotGrid opacity={0.25} />
    <div style={big(230, { color })}>{word}</div>
  </AbsoluteFill>
);
const Compare: React.FC<{ withSfx: boolean }> = ({ withSfx }) => {
  const t = transition("whip")!;
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={35 + t.frames / 2}>
          <Card bg="#0b0b14" word="ВЖУХ" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t.presentation} timing={t.timing} />
        <TransitionSeries.Sequence durationInFrames={35 + t.frames / 2}>
          <Card bg="#ff2a3d" word="БАХ" color="#111" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Badge text={withSfx ? "с SFX: whoosh + snare + sub" : "без SFX"} ok={withSfx} />
      {withSfx && (
        <div style={{ position: "absolute", left: 50, right: 50, bottom: 40, display: "flex", gap: 20 }}>
          {(["layer_whoosh", "layer_snare", "layer_sub"] as const).map((k, i) => (
            <div key={k} style={{ flex: 1, background: "rgba(0,0,0,0.6)", borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, color: ACID, marginBottom: 6 }}>{["whoosh → ends on cut", "snare ← starts on cut", "sub ← tail"][i]}</div>
              <Wave id={k} at={i === 0 ? 27 : 35} dur={i === 0 ? 8 : 14} width={520} height={70} />
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
const NoSfx: React.FC<ShotProps> = () => <Compare withSfx={false} />;
const WithSfx: React.FC<ShotProps> = () => <Compare withSfx />;

const CATS: Record<string, { title: string; at: number; dur: number; bg: string }> = {
  whoosh: { title: "Whoosh", at: 2, dur: 14, bg: "#0b0b14" },
  impact: { title: "Impact", at: 4, dur: 22, bg: "#1a0508" },
  riser: { title: "Riser", at: 2, dur: 24, bg: "#05101a" },
  ambience: { title: "Ambience", at: 0, dur: 28, bg: "#06140c" },
  ui: { title: "UI", at: 6, dur: 16, bg: "#0f172a" },
};
const Cat: React.FC<{ id: string }> = ({ id }) => {
  const c = CATS[id];
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: c.bg, ...C, gap: 30 }}>
      <DotGrid opacity={0.2} />
      <div style={{ ...big(150, { color: "#fff" }), transform: `scale(${1 + 0.08 * (1 - prog(f, c.at, 8, EASE.out))})` }}>{c.title}</div>
      <Wave id={id} at={c.at} dur={c.dur} />
      <div style={{ fontFamily: MONO, fontSize: 32, color: ACID }}>{waves[id].spec}</div>
    </AbsoluteFill>
  );
};
const mk = (id: string): React.FC<ShotProps> => () => <Cat id={id} />;

const BEAT = 14;
const HITS = Array.from({ length: 9 }, (_, k) => BEAT * (k + 1));
const Beat: React.FC<ShotProps> = () => {
  const f = useCurrentFrame();
  const n = HITS.filter((h) => f >= h).length;
  return (
    <AbsoluteFill>
      <Strobe colors={["#050605", "#050605", ACID]} every={BEAT} from={0} />
      <HitShake hits={HITS} amp={26}>
        <ZoomPunch hits={HITS} peak={1.12}>
          <AbsoluteFill style={C}>
            <Img src={staticFile("img/ficus.png")} style={{ height: 760, filter: `drop-shadow(0 0 30px ${ACID})` }} />
          </AbsoluteFill>
        </ZoomPunch>
      </HitShake>
      {HITS.map((h) => (
        <BloomFlash key={h} at={h} up={1} down={4} />
      ))}
      <div style={{ position: "absolute", left: 50, top: 50, fontFamily: MONO, fontSize: 36, color: "#fff", background: "rgba(0,0,0,0.7)", padding: "8px 18px", borderRadius: 10 }}>
        /sfx-sync · 128 BPM · хит {n}/9 · distorted_hit + dark whoosh
      </div>
    </AbsoluteFill>
  );
};

const Ai: React.FC<ShotProps> = () => {
  const f = useCurrentFrame();
  const gen = f >= 70;
  return (
    <AbsoluteFill style={{ background: "#0d0d10", ...C, gap: 40 }}>
      <DotGrid opacity={0.2} />
      <div style={{ width: 1400, background: "rgba(120,120,200,0.25)", border: "2px solid rgba(255,255,255,0.3)", borderRadius: 24, padding: "30px 40px", fontFamily: MONO, fontSize: 46, color: "#fff", textAlign: "left" }}>
        <span style={{ color: ACID }}>/sfx-generate </span>
        <TypeOn text={`«${waveJson.ai_prompt}»`} delay={8} perChar={1.4} cursor={!gen} />
      </div>
      {gen && (
        <>
          <Slide at={70} vertical from={120} dur={6}>
            <div style={{ fontFamily: MONO, fontSize: 34, color: ACID }}>→ {waveJson.ai_spec}</div>
          </Slide>
          <Wave id="ai" at={76} dur={16} width={1400} height={220} color="#7aa7ff" />
          <div style={{ fontFamily: MONO, fontSize: 28, color: "rgba(255,255,255,0.7)" }}>audit: clipping ok · true peak −1.5 dBTP · phase ok · robotic ok</div>
        </>
      )}
    </AbsoluteFill>
  );
};

const Final: React.FC<ShotProps> = ({ dur }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#050605", ...C }}>
      <ZoomIn delay={4} from={2.4} dur={5}>
        <div style={big(150, { color: ACID, textShadow: `0 0 40px ${ACID}` })}>ЗВУК,</div>
      </ZoomIn>
      <Slide at={14} vertical from={160} dur={6}>
        <div style={{ fontFamily: COND, fontSize: 90, color: "#fff", textTransform: "uppercase" }}>который не стыдно показать</div>
      </Slide>
      <BloomFlash at={4} up={1} down={6} />
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [dur - 12, dur], [0, 1], { extrapolateLeft: "clamp" }) }} />
    </AbsoluteFill>
  );
};

export const SfxDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <ChromaDefs />
    <TimelineShots
      timeline={timeline}
      audio="audio/sfxdemo.wav"
      shots={{ nosfx: NoSfx, withsfx: WithSfx, whoosh: mk("whoosh"), impact: mk("impact"), riser: mk("riser"), ambience: mk("ambience"), ui: mk("ui"), beat: Beat, ai: Ai, final: Final }}
    />
    <Grain opacity={0.05} />
    <Vignette strength={0.35} />
  </AbsoluteFill>
);
