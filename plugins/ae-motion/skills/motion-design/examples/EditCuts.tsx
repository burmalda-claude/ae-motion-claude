// Edit-staple transitions measured in the reference edits (tools/transscan.py), one after another on vertical cards.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { CutKind, DotGrid, Orb, transition } from "../kit";

const { fontFamily: ANTON } = loadAnton();
const { fontFamily: MONO } = loadMono("normal", { weights: ["700"], subsets: ["latin"] });
const KINDS: CutKind[] = ["punchIn", "exposure", "invertCut", "shrinkPop", "push", "pixelate", "threshold", "tvOff", "hueShift", "stutter", "card"];
const BG = ["#ff2a3d", "#1f6bff", "#b6ff00", "#ff8a00", "#8a3dff", "#00d1c1", "#ff3d9a", "#ffd400", "#2bd96b", "#ff5e2a", "#3dbbff", "#f2f2f2"];
const SHOT = 34;

const Card: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const bg = BG[i % BG.length];
  const name = i < KINDS.length ? KINDS[i] : "end";
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, ${bg}, #050505 85%)`, justifyContent: "center", alignItems: "center" }}>
      <DotGrid opacity={0.35} />
      <Orb x="70%" y="20%" size={500} color={bg} />
      <Img src={staticFile("img/ficus.png")} style={{ height: 1000, marginTop: 300, transform: `scale(${1 + f * 0.003}) rotate(${(i % 2 ? -1 : 1) * 3}deg)`, filter: "drop-shadow(0 0 40px #000)" }} />
      <div style={{ position: "absolute", top: 220, fontFamily: ANTON, fontSize: 210, color: "#fff", textShadow: "0 8px 40px #000" }}>{String(i + 1).padStart(2, "0")}</div>
      {/* the label names the transition that leads OUT of this card */}
      <div style={{ position: "absolute", bottom: 160, fontFamily: MONO, fontSize: 64, color: "#fff", background: "#000a", padding: "10px 30px", borderRadius: 14 }}>
        {name === "end" ? "← 11 new cuts" : `next: ${name}`}
      </div>
    </AbsoluteFill>
  );
};

const ts = KINDS.map((k) => transition(k)!);
export const EDIT_CUTS_DURATION = SHOT * (KINDS.length + 1) - ts.reduce((a, t) => a + t.frames, 0);

export const EditCuts: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <TransitionSeries>
      {[...KINDS, null].map((_, i) => (
        <React.Fragment key={i}>
          <TransitionSeries.Sequence durationInFrames={SHOT}>
            <Card i={i} />
          </TransitionSeries.Sequence>
          {i < KINDS.length && <TransitionSeries.Transition presentation={ts[i].presentation} timing={ts[i].timing} />}
        </React.Fragment>
      ))}
    </TransitionSeries>
  </AbsoluteFill>
);
