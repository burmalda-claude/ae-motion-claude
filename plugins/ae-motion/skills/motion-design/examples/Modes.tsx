// Fly-through of all command modes: one "button" (slash command) swaps the whole stack every 16 frames.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import timelineJson from "./timeline-modes.json" /* build.py output, see README */;
import {
  AnamorphicFlare, BreakingBanner, Bokeh, Callout, Captions, ChromaDefs, ComboCounter, CommentBubble, CTAButton, DayCounter, DotGrid, EmojiPop, Exit, Flicker, Grade,
  Grain, HighlightBox, Hitmarker, ImpactFrame, JPText, KaraokeLine, KillFeed, Letterbox, LightLeak, LightStreak, LowerThird, MapPin, MemeCaption, PiP, PriceTag,
  ProgressBar, Scanlines, ShotProps, SlamText, SpeedLines, Starburst, StatCard, StepBadge, Ticker, TimelineData, TimelineShots, TypeOn, VHS, Vignette, ZoomIn, pop, prog,
} from "../kit";

const timeline = timelineJson as TimelineData;
export const MODES_DURATION = timeline.total;
const sub = { subsets: ["cyrillic", "latin"] as ("cyrillic" | "latin")[] };
const { fontFamily: WIDE } = loadUnbounded("normal", { weights: ["900"], ...sub });
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"], ...sub });
const { fontFamily: SERIF } = loadSerif("italic", { weights: ["400"], ...sub });
const { fontFamily: BANGERS } = loadBangers();
const { fontFamily: ANTON } = loadOswald("normal", { weights: ["700"], ...sub }); // Anton has no Cyrillic
const { fontFamily: MONT } = loadMontserrat("normal", { weights: ["800"], ...sub });

declare const require: (path: string) => { name: string; effects: string[]; formats: string[] }; // webpack JSON context
const presets: Record<string, { name: string; effects: string[]; formats: string[] }> = Object.fromEntries(
  ["edit", "cinematic", "lyric", "clip", "tutorial", "gym", "gaming", "ad", "amv", "travel", "meme", "news", "fashion", "horror", "wedding", "realestate", "asmr", "reaction"].map((id) => [id, require(`../modes/${id}.json`)]),
);

const C: React.CSSProperties = { justifyContent: "center", alignItems: "center", textAlign: "center" };

/** The "button": command chip that types + presses, then the stack chips. */
const Hud: React.FC<{ id: string }> = ({ id }) => {
  const f = useCurrentFrame();
  const p = presets[id];
  const press = f >= 3 && f < 6;
  return (
    <>
      <div style={{ position: "absolute", left: 40, top: 36, display: "flex", gap: 14, alignItems: "center", fontFamily: MONO, fontSize: 40, zIndex: 10 }}>
        <div style={{ background: press ? "#fff" : "rgba(0,0,0,0.75)", color: press ? "#000" : "#fff", padding: "10px 22px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.6)", transform: `scale(${press ? 0.92 : 1})` }}>
          <TypeOn text={`/ae-motion:${id}`} perChar={0.25} />
        </div>
        <div style={{ background: "rgba(0,0,0,0.6)", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: 26 }}>{p.formats.join(" · ")}</div>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 30, display: "flex", flexWrap: "wrap", gap: 8, zIndex: 10 }}>
        {p.effects.slice(0, 8).map((e, i) => (
          <div key={i} style={{ fontFamily: MONO, fontSize: 22, background: "rgba(0,0,0,0.7)", color: "#b6ff00", padding: "4px 12px", borderRadius: 8, transform: `scale(${pop(f, 30, 4 + i, 12, 300)})` }}>
            {e}
          </div>
        ))}
      </div>
    </>
  );
};

const big = (size: number, x?: React.CSSProperties): React.CSSProperties => ({ fontFamily: WIDE, fontWeight: 900, fontSize: size, lineHeight: 0.95, textTransform: "uppercase", ...x });
const fakeWords = (text: string, start: number, step: number) => text.split(" ").map((w, i) => ({ w, f: start + i * step, fe: start + i * step + step }));

const SCENES: Record<string, React.FC> = {
  edit: () => (
    <AbsoluteFill style={{ background: "#050605", ...C }}>
      <SpeedLines color="#b6ff00" opacity={0.6} inner={0.3} />
      <LightStreak color="#b6ff00" y="50%" />
      <ZoomIn from={3} dur={4}>
        <div style={big(260, { color: "#fff", textShadow: "0 0 40px #b6ff00" })}>ЭДИТ</div>
      </ZoomIn>
    </AbsoluteFill>
  ),
  cinematic: () => (
    <AbsoluteFill style={{ background: "#000" }}>
      <Grade look="cinematic">
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #3a2a1a, #050505)", ...C }}>
          <div style={{ fontFamily: SERIF, fontSize: 170, color: "#f2ead8", letterSpacing: `${0.3 - prog(useCurrentFrame(), 0, 16) * 0.25}em` }}>Глава I</div>
        </AbsoluteFill>
      </Grade>
      <AnamorphicFlare delay={0} dur={16} y="52%" />
      <Letterbox />
    </AbsoluteFill>
  ),
  lyric: () => (
    <AbsoluteFill style={{ background: "linear-gradient(135deg,#1a0b2e,#0b0b14)", ...C }}>
      <KaraokeLine words={fakeWords("я танцую под этот бит", 0, 3)} style={big(110, { maxWidth: 1600 })} fill="#ff3df2" />
    </AbsoluteFill>
  ),
  clip: () => (
    <AbsoluteFill style={{ background: "#1b1b1f" }}>
      <AbsoluteFill style={{ ...C, justifyContent: "flex-start", paddingTop: 140 }}>
        <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 80, color: "#000", background: "#ffd400", padding: "6px 24px" }}>ВОТ ПОЧЕМУ ВСЕ ОШИБАЮТСЯ</div>
      </AbsoluteFill>
      <Captions words={fakeWords("и это меняет всё", 0, 4)} y="62%" highlight="#ffd400" style={{ fontFamily: MONT }} />
      <LowerThird name="Алексей" sub="гость подкаста" y="76%" accent="#ffd400" scale={0.8} />
      <ProgressBar dur={16} color="#ffd400" top />
    </AbsoluteFill>
  ),
  tutorial: () => (
    <AbsoluteFill style={{ background: "#0f172a" }}>
      <div style={{ position: "absolute", left: 360, top: 260, width: 1200, height: 560, background: "#e5e7eb", borderRadius: 18 }}>
        <div style={{ margin: 40, height: 60, width: 420, background: "#cbd5e1", borderRadius: 10 }} />
        <div style={{ margin: 40, height: 80, width: 260, background: "#2f6bff", borderRadius: 12 }} />
      </div>
      <HighlightBox x={390} y={460} w={320} h={110} />
      <StepBadge n={2} label="Нажми «Экспорт»" y="80px" x="1100px" />
      <Callout x={720} y={520} fromX={1100} fromY={720} label="сюда" delay={2} />
    </AbsoluteFill>
  ),
  gym: () => (
    <AbsoluteFill style={{ background: "#000", ...C, flexDirection: "row", gap: 80 }}>
      <SlamText from={3}>
        <div style={{ fontFamily: ANTON, fontSize: 260, color: "#fff" }}>ЕЩЁ</div>
      </SlamText>
      <StatCard label="ПОВТОРЕНИЙ" value={100} delay={2} font={ANTON} />
    </AbsoluteFill>
  ),
  gaming: () => (
    <AbsoluteFill style={{ background: "radial-gradient(#183040,#05060a)" }}>
      <DotGrid opacity={0.4} color="rgba(0,240,255,0.3)" />
      <Hitmarker x="50%" y="50%" at={2} kill />
      <Hitmarker x="42%" y="58%" at={8} />
      <KillFeed entries={[{ at: 2, killer: "W1kc", victim: "noob", weapon: "AWP" }, { at: 8, killer: "W1kc", victim: "bot", weapon: "AK" }]} accent="#00f0ff" />
      <div style={{ position: "absolute", left: 120, top: 380 }}>
        <ComboCounter hits={[2, 8, 12]} color="#00f0ff" />
      </div>
      <Scanlines opacity={0.18} />
    </AbsoluteFill>
  ),
  ad: () => (
    <AbsoluteFill style={{ background: "#f5f5f7", ...C, flexDirection: "row", gap: 100 }}>
      <div style={{ width: 360, height: 520, borderRadius: 60, background: "linear-gradient(160deg,#2f6bff,#111)", boxShadow: "0 40px 80px rgba(0,0,0,0.25)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 40, alignItems: "flex-start" }}>
        <PriceTag price="9 990 ₽" old="14 990 ₽" />
        <CTAButton label="Купить" delay={4} />
      </div>
    </AbsoluteFill>
  ),
  amv: () => (
    <AbsoluteFill style={{ background: "#fff" }}>
      <SpeedLines color="#111" opacity={0.7} inner={0.25} count={90} />
      <AbsoluteFill style={C}>
        <Starburst size={900} color="#e60012" delay={0} />
      </AbsoluteFill>
      <AbsoluteFill style={C}>
        <div style={{ fontFamily: BANGERS, fontSize: 280, color: "#111", transform: "rotate(-8deg)" }}>BOOM!</div>
      </AbsoluteFill>
      <JPText text="必殺技" size={140} color="#111" style={{ position: "absolute", right: 120, top: 120 }} />
      <ImpactFrame at={6} />
    </AbsoluteFill>
  ),
  travel: () => (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#5ab0ff,#ffd6a0 70%,#c96a2b)" }}>
      <Grade look="warm">
        <AbsoluteFill />
      </Grade>
      <MapPin x="55%" y="48%" label="Стамбул" />
      <div style={{ position: "absolute", left: 80, top: 160 }}>
        <DayCounter day={3} font={MONT} />
      </div>
      <LightLeak strength={0.7} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  ),
  meme: () => (
    <AbsoluteFill style={{ background: "#333" }}>
      <AbsoluteFill style={{ background: "radial-gradient(#777,#222)", transform: `scale(${1 + 0.4 * prog(useCurrentFrame(), 6, 4)})` }} />
      <MemeCaption top="когда пишешь промпт" bottom="а он сразу работает" size={100} />
      <EmojiPop emoji="💀" at={6} x="78%" y="45%" />
    </AbsoluteFill>
  ),
  news: () => (
    <AbsoluteFill style={{ background: "linear-gradient(160deg,#1a2a4a,#0b1a33)" }}>
      <BreakingBanner title="Фикус признан королём подоконника" />
      <Ticker items={["Курс зелени растёт", "Кактусы недовольны", "Полив по расписанию"]} />
    </AbsoluteFill>
  ),
  fashion: () => (
    <AbsoluteFill style={{ background: "#f2f0eb" }}>
      <Grade look="fashion">
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 120 }}>
          <div style={{ fontFamily: ANTON, fontSize: 320, color: "#111", lineHeight: 0.85 }}>SS/26</div>
          <div style={{ fontFamily: SERIF, fontSize: 70, color: "#111", marginTop: 20 }}>коллекция «Тишина»</div>
        </AbsoluteFill>
      </Grade>
    </AbsoluteFill>
  ),
  horror: () => (
    <AbsoluteFill style={{ background: "#030303" }}>
      <VHS>
        <Flicker amount={0.7}>
          <AbsoluteFill style={{ background: "radial-gradient(#202a20,#030303)", ...C }}>
            <div style={{ fontFamily: SERIF, fontSize: 200, color: "#a10000", textShadow: "4px 0 #0f3" }}>не оборачивайся</div>
          </AbsoluteFill>
        </Flicker>
      </VHS>
    </AbsoluteFill>
  ),
  wedding: () => (
    <AbsoluteFill style={{ background: "radial-gradient(#4a3424,#1a1410)", ...C }}>
      <Bokeh count={20} color="#e8c9a0" />
      <div style={{ fontFamily: SERIF, fontSize: 150, color: "#fff8ee" }}>Анна & Илья</div>
      <div style={{ fontFamily: MONO, fontSize: 36, color: "#e8c9a0", letterSpacing: "0.5em", marginTop: 20 }}>12 · 09 · 2026</div>
      <LightLeak strength={0.5} />
    </AbsoluteFill>
  ),
  realestate: () => (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#e8edf0,#c9d3d8)" }}>
      <div style={{ position: "absolute", left: 200, right: 200, bottom: 200, height: 260, background: "#8b6f55", borderRadius: 20 }} />
      <LowerThird name="Гостиная" sub="24 м² · панорамные окна" accent="#0f766e" bg="rgba(255,255,255,0.95)" color="#111" y="12%" />
      <div style={{ position: "absolute", right: 80, top: 80 }}>
        <PriceTag price="12,4 млн ₽" accent="#0f766e" />
      </div>
    </AbsoluteFill>
  ),
  asmr: () => (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #a8e6cf, #0e0e10 70%)", ...C }}>
      <div style={{ fontFamily: MONT, fontWeight: 200, fontSize: 90, color: "#fff", letterSpacing: "0.4em" }}>тише</div>
    </AbsoluteFill>
  ),
  reaction: () => (
    <AbsoluteFill style={{ background: "#14141c" }}>
      <AbsoluteFill style={{ background: "linear-gradient(135deg,#2a2a40,#101018)" }} />
      <PiP name="W1kcsed" accent="#8b5cf6">
        <AbsoluteFill style={{ background: "radial-gradient(#6a5acd,#1b1b2b)" }} />
      </PiP>
      <CommentBubble user="фикусфан" text="это легендарно" at={2} />
      <EmojiPop emoji="😂" at={6} x="45%" y="30%" />
    </AbsoluteFill>
  ),
};

const IDS = Object.keys(SCENES);
export const Modes: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <ChromaDefs />
    <TimelineShots
      timeline={timeline}
      audio="audio/modes.wav"
      shots={Object.fromEntries(
        IDS.map((id) => {
          const Scene = SCENES[id];
          const Shot: React.FC<ShotProps> = (p) => (
            <Exit dur={p.dur} kind={["zoom", "slice", "whipL", "streakY", "spin", "whipR"][IDS.indexOf(id) % 6] as never} frames={3} enter="zoom" inFrames={3}>
              <Scene />
              <Hud id={id} />
            </Exit>
          );
          return [id, Shot];
        }),
      )}
    />
    <Vignette strength={0.4} />
  </AbsoluteFill>
);

