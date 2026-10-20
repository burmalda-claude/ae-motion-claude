// Reference composition: fast kinetic-typography promo (red / black / white), 1920x1080 @ 30fps, ~15 s.
// Register in Root.tsx:
//   <Composition id="KineticPromo" component={KineticPromo} width={1920} height={1080} fps={30} durationInFrames={KINETIC_PROMO_DURATION} />
// Copy the kit into src/kit first. Swap words, keep the rhythm.
import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import {
  Bokeh, Camera, Cube3D, DotGrid, EchoStack, Extrude, Flash, Glitch, Glow, Grain, Highlight, HudRing, LightStreak,
  Letters, MaskReveal, NodeGraph, Orb, Outline, PromptBox, RenderBar, Shockwave, SlamText, Sparks, Starburst, Stretch,
  Timeline, Typewriter, Vignette, Viewfinder, WhipIn, Words,
} from "../kit";

const { fontFamily: HEAVY } = loadArchivo();
const { fontFamily: COND } = loadOswald("normal", { weights: ["700"] });
const { fontFamily: SERIF } = loadSerif("italic");
const { fontFamily: MONO } = loadMono("normal", { weights: ["500"] });

const RED = "#ff2a3d";
const INK = "#0b0b0d";
const PAPER = "#f1f0ee";

const big: React.CSSProperties = { fontFamily: HEAVY, fontSize: 260, lineHeight: 0.9, letterSpacing: "-0.03em", textTransform: "uppercase" };
// AbsoluteFill is flex-direction: column by default; add `row` for side-by-side layouts.
const center: React.CSSProperties = { justifyContent: "center", alignItems: "center", textAlign: "center" };
const row: React.CSSProperties = { ...center, flexDirection: "row" };

// Backgrounds alternate hard between shots — the color flip IS the transition.
const Dark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: INK }}>
    <DotGrid />
    <Orb y="60%" />
    <Bokeh count={14} />
    {children}
  </AbsoluteFill>
);
const Paper: React.FC<{ children: React.ReactNode }> = ({ children }) => <AbsoluteFill style={{ background: PAPER, color: INK }}>{children}</AbsoluteFill>;
const Red: React.FC<{ children: React.ReactNode }> = ({ children }) => <AbsoluteFill style={{ background: RED, color: INK }}>{children}</AbsoluteFill>;

// Each shot is a tiny component; durations live in SHOTS so the edit can be retimed in one place.
const S1 = () => (
  <Paper>
    <Camera hits={[0]}>
      <AbsoluteFill style={center}>
        <SlamText style={big}>NO</SlamText>
        <WhipIn from="left" delay={5} style={{ ...big, color: RED, fontSize: 200 }}>
          <Glitch every={9} burst={3}>WAY</Glitch>
        </WhipIn>
      </AbsoluteFill>
    </Camera>
  </Paper>
);
const S2 = () => (
  <Red>
    <Camera hits={[0, 10]}>
      <AbsoluteFill style={center}>
        <Letters text="OKAY," mode="drop" stagger={2} style={big} />
      </AbsoluteFill>
    </Camera>
  </Red>
);
const S3 = () => (
  <Dark>
    <AbsoluteFill style={center}>
      <Glow strength={0.6}>
        <SlamText style={{ ...big, color: "#fff" }}>
          OKAY<span style={{ color: RED }}>.</span>
        </SlamText>
      </Glow>
    </AbsoluteFill>
  </Dark>
);
const S4 = () => (
  <Dark>
    <Camera push={0.12}>
      <AbsoluteFill style={center}>
        <Outline color="#fff" width={4} style={{ ...big, fontSize: 200 }}>THAT</Outline>
        <Extrude depth={30} angle={30} side="#7a7a7a" style={big}>
          <Stretch>I DID</Stretch>
        </Extrude>
      </AbsoluteFill>
    </Camera>
  </Dark>
);
const S5 = () => (
  <Dark>
    <AbsoluteFill style={{ ...center, gap: 50 }}>
      <MaskReveal>
        <div style={{ fontFamily: COND, fontSize: 130, color: "#fff", textTransform: "uppercase" }}>
          without touching <span style={{ color: RED }}>After Effects</span>
        </div>
      </MaskReveal>
      <Timeline delay={6} dur={40} />
    </AbsoluteFill>
  </Dark>
);
const S6 = () => (
  <Paper>
    <AbsoluteFill style={{ ...row, gap: 40 }}>
      <div style={{ ...big, fontSize: 150, textAlign: "left" }}>
        <Words text="AND BEFORE YOU ASK" accent={["ASK"]} stagger={3} style={{ maxWidth: 1100 }} />
      </div>
      <Starburst size={520} delay={10} />
    </AbsoluteFill>
  </Paper>
);
const S7 = () => (
  <Dark>
    <AbsoluteFill style={{ ...center, gap: 60 }}>
      <div style={{ ...big, fontSize: 120, color: "#fff" }}>
        THIS ISN'T AN <Highlight delay={6}>MCP</Highlight>
      </div>
      <NodeGraph
        width={1500}
        height={420}
        delay={8}
        nodes={[
          { id: "a", x: 220, y: 260, title: "Claude", sub: "AI model" },
          { id: "b", x: 750, y: 160, title: "MCP", sub: "protocol", hot: true },
          { id: "c", x: 1280, y: 260, title: "Remotion", sub: "renderer" },
        ]}
        edges={[["a", "b"], ["b", "c"]]}
      />
    </AbsoluteFill>
  </Dark>
);
const S8 = () => (
  <Dark>
    <AbsoluteFill style={center}>
      <LightStreak />
      <Sparks delay={10} />
      <Shockwave delay={10} />
      <Glow strength={0.8}>
        <SlamText delay={10} style={{ ...big, fontSize: 280, fontStyle: "italic", color: "#fff" }}>
          KATANA
        </SlamText>
      </Glow>
    </AbsoluteFill>
    <Flash delay={10} dur={5} />
  </Dark>
);
const S9 = () => (
  <Dark>
    <AbsoluteFill style={center}>
      <PromptBox text="Create a 15-second cinematic animation" highlight={["15-second", "cinematic", "animation"]} sendAt={70} accent={RED} />
    </AbsoluteFill>
  </Dark>
);
const S10 = () => (
  <Paper>
    <AbsoluteFill style={{ ...row, gap: 80 }}>
      <SlamText style={{ ...big, fontSize: 300 }}>3D</SlamText>
      <Cube3D size={280} color={RED} />
    </AbsoluteFill>
  </Paper>
);
const S11 = () => (
  <Dark>
    <Viewfinder />
    <AbsoluteFill style={center}>
      <WhipIn from="right" style={{ ...big, color: "#fff", fontSize: 220 }}>CAMERA</WhipIn>
    </AbsoluteFill>
  </Dark>
);
const S12 = () => (
  <Dark>
    <AbsoluteFill style={{ ...row, gap: 60 }}>
      <HudRing />
      <div style={{ fontFamily: SERIF, fontSize: 90, color: "#fff", textAlign: "left", width: 600 }}>
        <Typewriter text="and wait for the transition—" cps={18} />
      </div>
    </AbsoluteFill>
  </Dark>
);
const S13 = () => (
  <Dark>
    <AbsoluteFill style={center}>
      <EchoStack text="KEYFRAMES." copies={7} style={{ ...big, fontSize: 130 }} />
    </AbsoluteFill>
  </Dark>
);
const S14 = () => (
  <Dark>
    <AbsoluteFill style={{ ...center, gap: 40 }}>
      <div style={{ ...big, fontSize: 200, color: "#fff" }}>RENDER</div>
      <RenderBar dur={45} />
    </AbsoluteFill>
  </Dark>
);
const S15 = () => (
  <Red>
    <Camera hits={[0]}>
      <AbsoluteFill style={center}>
        <div style={{ fontFamily: MONO, fontSize: 40, letterSpacing: "0.2em" }}>MADE WITH —</div>
        <SlamText style={{ ...big, fontSize: 380 }}>
          ONE PROMPT<span style={{ color: PAPER }}>.</span>
        </SlamText>
      </AbsoluteFill>
    </Camera>
  </Red>
);

// [component, frames] — 4–24 frames per beat is the pace of this style.
const SHOTS: [React.FC, number][] = [
  [S1, 24], [S2, 18], [S3, 20], [S4, 28], [S5, 60], [S6, 40], [S7, 66], [S8, 50],
  [S9, 90], [S10, 30], [S11, 26], [S12, 50], [S13, 30], [S14, 54], [S15, 45],
];
export const KINETIC_PROMO_DURATION = SHOTS.reduce((s, [, d]) => s + d, 0);

export const KineticPromo: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Series>
      {SHOTS.map(([Shot, d], i) => (
        <Series.Sequence key={i} durationInFrames={d}>
          <Shot />
        </Series.Sequence>
      ))}
    </Series>
    <Grain opacity={0.07} />
    <Vignette strength={0.5} />
  </AbsoluteFill>
);
