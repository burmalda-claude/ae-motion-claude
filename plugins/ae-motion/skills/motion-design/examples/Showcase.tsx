// Register: <Composition id="Showcase" component={Showcase} width={1920} height={1080} fps={30} durationInFrames={SHOWCASE_DURATION} />
// Showcase of every kit component, one shot each, with a caption naming what is on screen.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { loadFont as loadArchivo } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import {
  Bokeh, Camera, CheckerText, Counter, Cube3D, DotGrid, EchoStack, Extrude, Flash, Glitch, Glow, Grain, Highlight, HudRing,
  Letterbox, Letters, LightStreak, MaskReveal, NodeGraph, Orb, Outline, Parallax, PlayerMock, PromptBox, RenderBar, Scanlines,
  Shockwave, SlamText, Smear, Sparks, Starburst, Stretch, Tilt3D, Timeline, Typewriter, Underline, Vignette, Viewfinder, WhipIn,
  Words, Cursor, punch, slices, whip, zoomThrough, prog, EASE,
} from "../kit";

const { fontFamily: HEAVY } = loadArchivo();
const { fontFamily: COND } = loadOswald("normal", { weights: ["700"] });
const { fontFamily: SERIF } = loadSerif("italic", { weights: ["400"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["500"] });

const RED = "#ff2a3d";
const INK = "#0b0b0d";
const PAPER = "#f1f0ee";
const big: React.CSSProperties = { fontFamily: HEAVY, fontSize: 220, lineHeight: 0.92, letterSpacing: "-0.03em", textTransform: "uppercase" };
const col: React.CSSProperties = { justifyContent: "center", alignItems: "center", textAlign: "center" };
const row: React.CSSProperties = { ...col, flexDirection: "row" };

const Caption: React.FC<{ group: string; name: string; dark?: boolean }> = ({ group, name, dark = true }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, 4, 10);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        bottom: 50,
        fontFamily: MONO,
        fontSize: 30,
        color: dark ? "#fff" : INK,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
        display: "flex",
        gap: 16,
        alignItems: "center",
      }}
    >
      <span style={{ background: RED, color: "#fff", padding: "4px 12px", borderRadius: 6 }}>{group}</span>
      <span>{name}</span>
    </div>
  );
};

const Dark: React.FC<{ children: React.ReactNode; group: string; name: string; bg?: boolean }> = ({ children, group, name, bg = true }) => (
  <AbsoluteFill style={{ background: INK, color: "#fff" }}>
    {bg && <DotGrid opacity={0.6} />}
    {children}
    <Caption group={group} name={name} />
  </AbsoluteFill>
);
const Paper: React.FC<{ children: React.ReactNode; group: string; name: string }> = ({ children, group, name }) => (
  <AbsoluteFill style={{ background: PAPER, color: INK }}>
    {children}
    <Caption group={group} name={name} dark={false} />
  </AbsoluteFill>
);
const Red: React.FC<{ children: React.ReactNode; group: string; name: string }> = ({ children, group, name }) => (
  <AbsoluteFill style={{ background: RED, color: INK }}>
    {children}
    <Caption group={group} name={name} dark={false} />
  </AbsoluteFill>
);

// ---------- shots ----------
const Intro = () => (
  <Dark group="FX" name="LightStreak · Sparks · Shockwave · Flash · Glow · Orb · Bokeh">
    <Orb />
    <Bokeh count={22} />
    <LightStreak />
    <Sparks delay={12} />
    <Shockwave delay={12} />
    <AbsoluteFill style={col}>
      <Glow strength={0.8}>
        <SlamText delay={12} style={{ ...big, fontSize: 200, fontStyle: "italic", color: "#fff" }}>
          AE-MOTION
        </SlamText>
      </Glow>
      <div style={{ fontFamily: MONO, fontSize: 36, marginTop: 30 }}>
        <Words text="every effect in one video" delay={24} stagger={3} accent={["effect"]} />
      </div>
    </AbsoluteFill>
    <Flash delay={12} dur={5} />
  </Dark>
);
const ShotSlam = () => (
  <Paper group="TEXT" name="SlamText">
    <Camera hits={[0, 14]}>
      <AbsoluteFill style={col}>
        <SlamText style={big}>NO</SlamText>
        <SlamText delay={14} style={{ ...big, color: RED }}>
          WAY.
        </SlamText>
      </AbsoluteFill>
    </Camera>
  </Paper>
);
const ShotWhip = () => (
  <Dark group="TEXT" name="WhipIn + Smear (directional blur)">
    <AbsoluteFill style={col}>
      <WhipIn from="left" style={big}>FAST</WhipIn>
      <WhipIn from="right" delay={10} style={{ ...big, color: RED }}>
        MOVES
      </WhipIn>
    </AbsoluteFill>
  </Dark>
);
const ShotLetters = () => (
  <Paper group="TEXT" name="Letters: rise · pop · drop · blur">
    <AbsoluteFill style={{ ...col, gap: 10 }}>
      <Letters text="RISE" mode="rise" style={{ ...big, fontSize: 150 }} />
      <Letters text="POP" mode="pop" delay={8} style={{ ...big, fontSize: 150, color: RED }} />
      <Letters text="DROP" mode="drop" delay={16} style={{ ...big, fontSize: 150 }} />
      <Letters text="BLUR" mode="blur" delay={24} style={{ ...big, fontSize: 150 }} />
    </AbsoluteFill>
  </Paper>
);
const ShotWords = () => (
  <Dark group="TEXT" name="Words (accent) + MaskReveal">
    <AbsoluteFill style={{ ...col, gap: 30 }}>
      <Words text="ONE PROMPT." style={{ ...big, fontSize: 140 }} />
      <Words text="ONE VIDEO." accent={["VIDEO"]} delay={8} style={{ ...big, fontSize: 140 }} />
      <MaskReveal delay={18}>
        <div style={{ fontFamily: COND, fontSize: 90, textTransform: "uppercase", color: "#aaa" }}>rises from behind a line</div>
      </MaskReveal>
      <MaskReveal delay={24} from="left">
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 80 }}>or slides out of a mask</div>
      </MaskReveal>
    </AbsoluteFill>
  </Dark>
);
const ShotType = () => (
  <Dark group="TEXT" name="Typewriter (highlighted tokens) + Counter">
    <AbsoluteFill style={{ ...col, gap: 60 }}>
      <div style={{ fontFamily: MONO, fontSize: 64, width: 1500, textAlign: "left" }}>
        <Typewriter text="render a cinematic 15-second trailer" highlight={["cinematic", "15-second"]} cps={26} />
      </div>
      <div style={{ ...big, fontSize: 200, color: RED }}>
        <Counter to={1000000} dur={45} delay={10} suffix="+" />
      </div>
    </AbsoluteFill>
  </Dark>
);
const ShotOutline = () => (
  <Dark group="TEXT" name="Outline + Extrude (3D text)">
    <Camera push={0.1}>
      <AbsoluteFill style={col}>
        <Outline width={4} style={big}>
          THAT
        </Outline>
        <Extrude depth={32} angle={30} side="#6d6d6d" style={big}>
          I DID
        </Extrude>
      </AbsoluteFill>
    </Camera>
  </Dark>
);
const ShotEcho = () => (
  <Dark group="TEXT" name="EchoStack">
    <AbsoluteFill style={col}>
      <EchoStack text="KEYFRAMES." copies={7} style={{ ...big, fontSize: 120 }} />
    </AbsoluteFill>
  </Dark>
);
const ShotStretch = () => (
  <Red group="TEXT" name="Stretch">
    <AbsoluteFill style={col}>
      <Stretch style={{ ...big, fontSize: 260 }}>STRETCH</Stretch>
    </AbsoluteFill>
  </Red>
);
const ShotGlitch = () => (
  <Dark group="TEXT" name="Glitch (RGB split + slices)">
    <AbsoluteFill style={col}>
      <Glitch every={12} burst={5} amount={22} style={{ ...big, fontSize: 260, color: "#fff" }}>
        GLITCH
      </Glitch>
    </AbsoluteFill>
  </Dark>
);
const ShotHighlight = () => {
  const frame = useCurrentFrame();
  return (
    <Paper group="TEXT" name="Highlight · Underline · CheckerText · punch()">
      <AbsoluteFill style={{ ...col, gap: 40 }}>
        <div style={{ ...big, fontSize: 130 }}>
          THIS ISN'T AN{" "}
          <Highlight delay={6} style={{ color: "#fff" }}>
            MCP
          </Highlight>
        </div>
        <div style={{ ...big, fontSize: 130 }}>
          <Underline delay={14}>KEYFRAMES</Underline>
        </div>
        <div style={{ ...big, fontSize: 150, transform: `scale(${punch(frame, 30) * punch(frame, 45)})` }}>
          <CheckerText a="#c9c9c9" b="#7a7a7a">RENDER</CheckerText>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};
const ShotShapes = () => (
  <Paper group="FX" name="Starburst · Shockwave · Cube3D">
    <AbsoluteFill style={{ ...row, gap: 120 }}>
      <div style={{ position: "relative", width: 620, height: 620, display: "grid", placeItems: "center" }}>
        <Starburst size={620} delay={4} style={{ position: "absolute" }} />
        <SlamText delay={8} style={{ ...big, fontSize: 140, color: "#fff", position: "relative" }}>
          BOOM
        </SlamText>
      </div>
      <Cube3D size={300} color={RED} />
    </AbsoluteFill>
    <Shockwave delay={8} x="30%" />
  </Paper>
);
const ShotHud = () => (
  <Dark group="FX" name="Viewfinder · HudRing">
    <Viewfinder />
    <Orb size={700} />
    <AbsoluteFill style={{ ...row, gap: 80 }}>
      <HudRing size={460} />
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 90, width: 640, textAlign: "left" }}>
        <Typewriter text="and wait for the transition—" cps={20} delay={8} />
      </div>
    </AbsoluteFill>
  </Dark>
);
const ShotOverlays = () => (
  <AbsoluteFill style={{ background: "linear-gradient(135deg,#2b1a10,#0b0b0d 60%)", color: "#f3e7d3" }}>
    <AbsoluteFill style={col}>
      <MaskReveal>
        <div style={{ fontFamily: SERIF, fontSize: 150, fontStyle: "italic" }}>Cinematic</div>
      </MaskReveal>
    </AbsoluteFill>
    <Letterbox />
    <Scanlines opacity={0.1} />
    <Grain opacity={0.14} />
    <Vignette strength={0.8} />
    <Caption group="FX" name="Letterbox · Scanlines · Grain · Vignette" />
  </AbsoluteFill>
);
const ShotCamera = () => (
  <Red group="CAMERA" name="Camera: push-in + impact shakes (hits)">
    <Camera hits={[6, 22, 38]} shake={34} push={0.08}>
      <AbsoluteFill style={col}>
        <SlamText delay={6} style={big}>HIT</SlamText>
        <SlamText delay={22} style={{ ...big, color: "#fff" }}>
          HIT
        </SlamText>
        <SlamText delay={38} style={big}>HIT</SlamText>
      </AbsoluteFill>
    </Camera>
  </Red>
);
const ShotParallax = () => (
  <Dark group="CAMERA" name="Parallax (3 depths) + Tilt3D" bg={false}>
    <Parallax depth={0.2} pan={300}>
      <DotGrid opacity={0.8} />
    </Parallax>
    <Parallax depth={0.5} pan={300}>
      <Orb x="70%" size={800} />
      <Bokeh count={16} />
    </Parallax>
    <Parallax depth={1} pan={300}>
      <AbsoluteFill style={col}>
        <Tilt3D>
          <div style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 28, padding: "60px 90px" }}>
            <div style={{ ...big, fontSize: 120 }}>DEPTH</div>
            <div style={{ fontFamily: MONO, fontSize: 32, opacity: 0.7 }}>background · mid · foreground</div>
          </div>
        </Tilt3D>
      </AbsoluteFill>
    </Parallax>
  </Dark>
);
const ShotPrompt = () => (
  <Dark group="UI" name="PromptBox">
    <Orb y="55%" />
    <AbsoluteFill style={col}>
      <PromptBox text="Create a 15-second cinematic animation" highlight={["15-second", "cinematic", "animation"]} sendAt={80} cps={22} />
    </AbsoluteFill>
  </Dark>
);
const ShotTimeline = () => (
  <Dark group="UI" name="Timeline + Cursor">
    <AbsoluteFill style={col}>
      <Timeline dur={60} width={1300} />
    </AbsoluteFill>
    <Cursor
      path={[
        { x: 1500, y: 900, at: 0 },
        { x: 1240, y: 560, at: 25, click: true },
        { x: 900, y: 640, at: 50, click: true },
        { x: 1000, y: 700, at: 70 },
      ]}
    />
  </Dark>
);
const ShotGraph = () => (
  <Dark group="UI" name="NodeGraph">
    <AbsoluteFill style={col}>
      <NodeGraph
        width={1500}
        height={600}
        nodes={[
          { id: "a", x: 220, y: 300, title: "Prompt", sub: "user" },
          { id: "b", x: 750, y: 160, title: "Claude", sub: "director", hot: true },
          { id: "c", x: 750, y: 460, title: "Kit", sub: "components" },
          { id: "d", x: 1280, y: 300, title: "Video", sub: "mp4" },
        ]}
        edges={[["a", "b"], ["b", "c"], ["b", "d"], ["c", "d"]]}
      />
    </AbsoluteFill>
  </Dark>
);
const ShotRender = () => (
  <Dark group="UI" name="RenderBar + PlayerMock">
    <AbsoluteFill style={{ ...row, gap: 100 }}>
      <RenderBar dur={70} width={700} />
      <PlayerMock width={760} delay={6} />
    </AbsoluteFill>
  </Dark>
);
const Outro = () => (
  <Red group="END" name="Smear on a static word · Grain on everything">
    <AbsoluteFill style={col}>
      <div style={{ fontFamily: MONO, fontSize: 40, letterSpacing: "0.2em" }}>MADE WITH —</div>
      <SlamText style={{ ...big, fontSize: 300 }}>
        ONE PROMPT<span style={{ color: PAPER }}>.</span>
      </SlamText>
      <Smear x={0} style={{ fontFamily: MONO, fontSize: 36, marginTop: 30 }}>
        github.com/burmalda-claude/ae-motion-claude
      </Smear>
    </AbsoluteFill>
  </Red>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type T = TransitionPresentation<any>; // mixed presentations in one list
// [shot, frames, transition INTO the next shot (or null = hard cut)]
const SHOTS: [React.FC, number, T | null][] = [
  [Intro, 75, null],
  [ShotSlam, 40, whip({ direction: "left" })],
  [ShotWhip, 45, null],
  [ShotLetters, 60, zoomThrough()],
  [ShotWords, 60, null],
  [ShotType, 75, slices()],
  [ShotOutline, 50, null],
  [ShotEcho, 45, null],
  [ShotStretch, 35, null],
  [ShotGlitch, 45, whip({ direction: "up" })],
  [ShotHighlight, 60, null],
  [ShotShapes, 55, fade()],
  [ShotHud, 75, wipe()],
  [ShotOverlays, 60, null],
  [ShotCamera, 60, slide({ direction: "from-right" })],
  [ShotParallax, 75, zoomThrough()],
  [ShotPrompt, 100, null],
  [ShotTimeline, 80, whip({ direction: "left" })],
  [ShotGraph, 80, null],
  [ShotRender, 85, slices()],
  [Outro, 75, null],
];
const T_DUR = 12;
export const SHOWCASE_DURATION = SHOTS.reduce((s, [, d, t], i) => s + d - (t && i < SHOTS.length - 1 ? T_DUR : 0), 0);

export const Showcase: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <TransitionSeries>
      {SHOTS.flatMap(([Shot, d, t], i) => {
        const items = [
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={d}>
            <Shot />
          </TransitionSeries.Sequence>,
        ];
        if (t && i < SHOTS.length - 1) items.push(<TransitionSeries.Transition key={`t${i}`} presentation={t} timing={linearTiming({ durationInFrames: T_DUR, easing: EASE.linear })} />);
        return items;
      })}
    </TransitionSeries>
    <Grain opacity={0.06} />
    <Vignette strength={0.45} />
  </AbsoluteFill>
);
