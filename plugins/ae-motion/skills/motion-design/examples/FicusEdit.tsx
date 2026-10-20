// Test edit: real Brazilian phonk (FMA, CC BY) + real SFX (Mixkit). Cuts come from the track's beats/hits (src/edit-plan.json).
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import plan from "./edit-plan.json";
import { FicusPhoto } from "./Ficus";
import {
  BloomFlash, Chroma, ChromaDefs, DotGrid, EASE, Exit, ExitKind, FlickerTitle, Grain, Halation, HitShake, InvertFlash, Mirror, PixelStreak, SpeedLines, Strobe,
  Vignette, WarpStreaks, ZoomPunch, prog,
} from "../kit";

export const FICUS_EDIT_DURATION = plan.total;
const sub = { subsets: ["cyrillic", "latin"] as ("cyrillic" | "latin")[] };
const { fontFamily: WIDE } = loadUnbounded("normal", { weights: ["900"], ...sub });
const { fontFamily: COND } = loadOswald("normal", { weights: ["700"], ...sub });
const ACID = "#b6ff00";
const RED = "#ff0a1e";
const C: React.CSSProperties = { justifyContent: "center", alignItems: "center", textAlign: "center" };
type Shot = { from: number; dur: number; look: string; in: string };

const Look: React.FC<{ s: Shot; i: number }> = ({ s, i }) => {
  const f = useCurrentFrame();
  const push = 1 + 0.06 * (f / Math.max(1, s.dur));
  const photo = (h: number, extra?: Partial<React.ComponentProps<typeof FicusPhoto>>) => <FicusPhoto h={h} {...extra} />;
  switch (s.look) {
    case "intro": {
      // build-up: silhouette in warp streaks, title letters flicker on the beats, everything accelerates into the drop
      const k = f / s.dur;
      return (
        <AbsoluteFill style={{ background: "#020302" }}>
          <WarpStreaks speed={0.8 + k * 3} count={Math.round(60 + k * 120)} color={ACID} />
          <AbsoluteFill style={{ ...C, paddingTop: 260, transform: `scale(${0.55 + k * 0.45})`, opacity: 0.25 + k * 0.75 }}>{photo(1150, { silhouette: true, aura: 0.6 + k })}</AbsoluteFill>
          <AbsoluteFill style={{ ...C, justifyContent: "flex-start", paddingTop: 170 }}>
            <FlickerTitle text="ФИКУС" delay={8} per={14} style={{ fontFamily: WIDE, fontWeight: 900, fontSize: 130, color: "#fff" }} />
          </AbsoluteFill>
        </AbsoluteFill>
      );
    }
    case "aura":
      return (
        <AbsoluteFill style={{ background: "#040504" }}>
          <DotGrid opacity={0.35} color="rgba(182,255,0,0.3)" />
          <AbsoluteFill style={{ ...C, paddingTop: 300, transform: `scale(${push})` }}>{photo(1250, { electric: true, bolts: 14, aura: 1.4, chroma: Math.max(0, 30 - f * 6) })}</AbsoluteFill>
        </AbsoluteFill>
      );
    case "strobe":
      return (
        <AbsoluteFill>
          <Strobe colors={[RED, "#ffffff"]} every={3} />
          <AbsoluteFill style={{ ...C, paddingTop: 300, transform: `scale(${push})` }}>{photo(1200, { aura: 0, silhouette: true })}</AbsoluteFill>
        </AbsoluteFill>
      );
    case "close":
      return (
        <Halation color={ACID} strength={1.2}>
          <AbsoluteFill style={{ background: "#0a0f02", overflow: "hidden" }}>
            <Img src={staticFile("img/ficus.png")} style={{ position: "absolute", left: "-60%", top: "-25%", width: "220%", transform: `scale(${push}) rotate(${-4 + f * 0.3}deg)`, transformOrigin: "50% 30%" }} />
          </AbsoluteFill>
        </Halation>
      );
    case "mirror":
      return (
        <AbsoluteFill style={{ background: "#040504" }}>
          <Mirror mode={2}>
            <AbsoluteFill style={{ ...C, paddingTop: 260, transform: `scale(${push})` }}>{photo(1100, { aura: 1.2, electric: true, bolts: 8 })}</AbsoluteFill>
          </Mirror>
        </AbsoluteFill>
      );
    case "streak":
      return (
        <PixelStreak at={0} dur={Math.min(10, s.dur)} columns={36}>
          <AbsoluteFill style={{ background: ACID, ...C, paddingTop: 300 }}>{photo(1200, { aura: 0.4, color: "#ffffff" })}</AbsoluteFill>
        </PixelStreak>
      );
    case "invert":
      return (
        <InvertFlash at={[0]} frames={2}>
          <AbsoluteFill style={{ background: "#040504" }}>
            <SpeedLines color={ACID} opacity={0.6} inner={0.3} count={80} />
            <AbsoluteFill style={{ ...C, paddingTop: 300, transform: `scale(${push * 1.05})` }}>{photo(1250, { electric: true, bolts: 12, aura: 1.3 })}</AbsoluteFill>
          </AbsoluteFill>
        </InvertFlash>
      );
    case "dip": {
      // the track breathes for 3 beats: slow, dark, desaturated, letters stretch
      const k = f / s.dur;
      return (
        <AbsoluteFill style={{ background: "#000", filter: "grayscale(0.85)" }}>
          <AbsoluteFill style={{ ...C, paddingTop: 260, transform: `scale(${1.15 - k * 0.1}) rotate(${k * 3}deg)`, filter: `blur(${(1 - k) * 2}px)` }}>{photo(1200, { aura: 0.3, color: "#ffffff" })}</AbsoluteFill>
          <AbsoluteFill style={{ ...C, justifyContent: "flex-start", paddingTop: 200 }}>
            <div style={{ fontFamily: COND, fontSize: 120, color: "#fff", letterSpacing: `${0.05 + k * 0.4}em` }}>ТИШИНА…</div>
          </AbsoluteFill>
        </AbsoluteFill>
      );
    }
    case "final": {
      const k = prog(f, 0, 10, EASE.out);
      return (
        <AbsoluteFill style={{ background: "#040504" }}>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 60%, ${ACID}55, transparent 65%)` }} />
          <AbsoluteFill style={{ ...C, paddingTop: 360 }}>{photo(1300, { electric: true, bolts: 18, aura: 1.6 })}</AbsoluteFill>
          <AbsoluteFill style={{ ...C, justifyContent: "flex-start", paddingTop: 140 }}>
            <div style={{ fontFamily: WIDE, fontWeight: 900, fontSize: 210, color: "#fff", textShadow: `0 0 20px ${ACID}, 0 0 60px ${ACID}`, transform: `scale(${2.2 - k * 1.2})`, opacity: k }}>ФИКУС</div>
            <div style={{ fontFamily: COND, fontSize: 56, color: ACID, letterSpacing: "0.3em", opacity: prog(f, 8, 8) }}>КОРОЛЬ ПОДОКОННИКА</div>
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [s.dur - 10, s.dur], [0, 1], { extrapolateLeft: "clamp" }) }} />
        </AbsoluteFill>
      );
    }
    default: {
      // word slams on acid / red, alternating
      const word = s.look.split(":")[1];
      const bg = i % 2 ? ACID : RED;
      const sc = 1 + 1.6 * (1 - prog(f, 0, 4, EASE.out));
      return (
        <AbsoluteFill style={{ background: bg, ...C }}>
          <AbsoluteFill style={{ ...C, paddingTop: 700, opacity: 0.9 }}>{photo(800, { aura: 0.2, color: "#ffffff" })}</AbsoluteFill>
          <Chroma amount={Math.max(0, 24 - f * 6)}>
            <div style={{ fontFamily: WIDE, fontWeight: 900, fontSize: word.length > 8 ? 88 : 200, color: "#050505", transform: `scale(${sc})`, letterSpacing: "-0.02em" }}>{word}</div>
          </Chroma>
        </AbsoluteFill>
      );
    }
  }
};

const EXIT: Record<string, ExitKind> = { whip: "whipL", zoom: "zoom", glitch: "slice", whiteout: "none", cut: "none" };
const shots = plan.shots as Shot[];
const HITS = shots.map((s) => s.from).filter((f) => f >= plan.drop && f < plan.dip).concat(shots.map((s) => s.from).filter((f) => f >= plan.redrop));

export const FicusEdit: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <ChromaDefs />
    <HitShake hits={HITS} amp={22} len={6}>
      <ZoomPunch hits={HITS} peak={1.08} len={6}>
        {shots.map((s, i) => {
          const next = shots[i + 1];
          return (
            <Sequence key={i} from={s.from} durationInFrames={s.dur}>
              <Exit dur={s.dur} kind={next ? EXIT[next.in] ?? "none" : "none"} frames={3} enter={s.in === "zoom" ? "zoom" : s.in === "whip" ? "whipR" : "none"} inFrames={3}>
                <Look s={s} i={i} />
              </Exit>
            </Sequence>
          );
        })}
      </ZoomPunch>
    </HitShake>
    {shots.filter((s) => s.in === "whiteout").map((s, i) => <BloomFlash key={i} at={s.from} up={2} down={6} />)}
    <Audio src={staticFile("audio/master.wav")} />
    <Grain opacity={0.06} />
    <Vignette strength={0.5} />
    <div style={{ position: "absolute", bottom: 26, left: 0, right: 0, textAlign: "center", fontFamily: COND, fontSize: 24, color: "rgba(255,255,255,0.45)" }}>music: Alex Morgan — Brazilian Phonk With Heavy Bass Drop (CC BY 4.0)</div>
  </AbsoluteFill>
);
