// Voiced kinetic trailer (Russian), rebuilt shot-for-shot from a frame-by-frame study (every frame) of a top kinetic tech promo.
// Timing + sound: tools/build.py script.json . -> src/timeline.json + public/audio/master.wav
// Rules from the study: words land on their spoken frame; entrances 3–6 f with motion blur + chroma; exits 3–5 f; hard bg flips.
import React from "react";
import { AbsoluteFill, Freeze, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import timelineJson from "./timeline.json"; // generated: python tools/build.py examples/trailer-script.json .
import {
  Bokeh, Bulb, Camera, Chroma, ChromaDefs, CheckerText, CompGrid, Cube3D, Cursor, DiagonalBand, DotGrid, EASE, EchoTower, Exit, ExitKind, Extrude, Filmstrip,
  Fit, Flash, Glitch, Glow, GlowPill, GradientText, Grain, GraphCurve, Highlight, HudRing, KeyLanes, LayerBars, Letters, LightStreak, LightSweep, NodeGraph,
  Outline, Pops, RepeatStretch, Ruler, Shockwave, ShotProps, Slash, Smear, Sparkle, Sparks, SpeedLines, Starburst, Stretch, TerminalLine, Tilt3D, TimelineData,
  TimelineShots, TransformBox, TypeOn, Vignette, Viewfinder, WarpStreaks, WeightShift, WhipIn, WireExtrude, Wobble, ZoomIn, eta, mix, pop, prog, shotProps,
} from "../kit";

const timeline = timelineJson as TimelineData;
export const TRAILER_DURATION = timeline.total;

const sub = { subsets: ["cyrillic", "latin"] as ("cyrillic" | "latin")[] };
const { fontFamily: WIDE } = loadUnbounded("normal", { weights: ["900", "400"], ...sub });
const { fontFamily: COND } = loadOswald("normal", { weights: ["700", "300"], ...sub });
const { fontFamily: SERIF } = loadSerif("italic", { weights: ["400"], ...sub });
const { fontFamily: MONO } = loadMono("normal", { weights: ["500", "700"], ...sub });

const RED = "#ff2a3d";
const INK = "#08080a";
const PAPER = "#ececf0";
const W = 1920;

const C: React.CSSProperties = { justifyContent: "center", alignItems: "center", textAlign: "center" };
const ROW: React.CSSProperties = { ...C, flexDirection: "row" };
const wide = (size: number, x?: React.CSSProperties): React.CSSProperties => ({ fontFamily: WIDE, fontWeight: 900, fontSize: size, lineHeight: 0.92, letterSpacing: "-0.02em", textTransform: "uppercase", ...x });
const cond = (size: number, x?: React.CSSProperties): React.CSSProperties => ({ fontFamily: COND, fontWeight: 700, fontSize: size, lineHeight: 0.92, textTransform: "uppercase", ...x });
const glowWhite: React.CSSProperties = { color: "#fff", textShadow: `0 0 18px rgba(255,60,80,0.9), 0 0 60px rgba(255,30,50,0.6)` };
const clampX = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------------- backgrounds
const Dark: React.FC<{ children?: React.ReactNode; glow?: string; bokeh?: boolean; grid?: boolean }> = ({ children, glow = "50% 115%", bokeh = true, grid = true }) => (
  <AbsoluteFill style={{ background: INK, color: "#fff" }}>
    {grid && <DotGrid opacity={0.45} gap={26} />}
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at ${glow}, rgba(255,30,55,0.55), transparent 70%)` }} />
    {bokeh && <Bokeh count={14} maxSize={16} />}
    {children}
  </AbsoluteFill>
);
const Red: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #ff4a5c 0%, ${RED} 45%, #b80d1f 100%)`, color: INK }}>{children}</AbsoluteFill>
);
const Paper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #fbfbfd 0%, ${PAPER} 55%, #c9c9d0 100%)`, color: INK }}>{children}</AbsoluteFill>
);
const Gray: React.FC<{ children?: React.ReactNode; light?: boolean }> = ({ children, light }) => (
  <AbsoluteFill style={{ filter: "grayscale(1)", background: light ? "#d9d9dc" : "#1d1d20", color: light ? INK : "#fff" }}>
    {!light && <CompGrid bg="#1d1d20" line="rgba(255,255,255,0.05)" />}
    {children}
  </AbsoluteFill>
);
const RedDot: React.FC<{ size?: number; x?: string; y?: string }> = ({ size = 18, x = "50%", y = "50%" }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: "#ff4d5e", transform: `translate(-50%,-50%) scale(${1 + 0.18 * Math.sin(f / 3)})`, boxShadow: `0 0 ${size}px ${RED}, 0 0 ${size * 4}px ${RED}` }} />
  );
};

/** Fast slide-in with velocity-matched blur + chroma (the reference's default entrance). */
const Slide: React.FC<{ at: number; from?: number; vertical?: boolean; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, from = 900, vertical, dur = 5, children, style }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur, EASE.out);
  const v = (p - prog(f - 1, at, dur, EASE.out)) * Math.abs(from);
  const x = from * (1 - p);
  return (
    <div style={{ opacity: f >= at ? 1 : 0, transform: vertical ? `translateY(${x}px)` : `translateX(${x}px)`, ...style }}>
      <Smear x={vertical ? 0 : v * 0.5} y={vertical ? v * 0.5 : 0}>
        <Chroma amount={Math.min(30, v * 0.2)} angle={vertical ? 90 : 0}>
          {children}
        </Chroma>
      </Smear>
    </div>
  );
};

// ---------------- shots
const No: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  const hit = w(0);
  return (
    <Dark bokeh={false} glow="50% 50%">
      {f < hit + 2 && <WarpStreaks speed={2.2} count={140} />}
      {f < hit + 1 && <RedDot size={interpolate(f, [0, hit], [8, 30], clampX)} />}
      <AbsoluteFill style={C}>
        <Glow strength={0.8}>
          <ZoomIn delay={hit} from={0.15} dur={5} echoes={7}>
            <div style={wide(420, { color: "#fff" })}>НЕ</div>
          </ZoomIn>
        </Glow>
      </AbsoluteFill>
      {f >= hit && <Flash delay={hit} dur={4} color="#fff" />}
    </Dark>
  );
};

const May: React.FC<ShotProps> = ({ w }) => (
  <Red>
    <AbsoluteFill style={{ ...C, opacity: 0.12 }}>
      <div style={cond(420, { letterSpacing: "0.02em" })}>МОЖЕТ</div>
    </AbsoluteFill>
    <AbsoluteFill style={C}>
      <WhipIn from="right" delay={w(0)} dur={4}>
        <Fit text="МОЖЕТ" width={1700} max={330} fontFamily={COND} fontWeight={700} />
      </WhipIn>
    </AbsoluteFill>
    <Slash delay={w(0) + 3} angle={-4} color="#fff" thickness={5} dur={8} />
  </Red>
);

const Be: React.FC<ShotProps> = ({ w }) => (
  <Paper>
    <SpeedLines color="#111" opacity={0.35} inner={0.55} count={60} />
    <Camera hits={[w(0)]} shake={22} push={0.06}>
      <AbsoluteFill style={C}>
        <ZoomIn delay={w(0)} from={1.6} dur={4}>
          <div style={wide(360)}>
            БЫТЬ<span style={{ color: RED }}>.</span>
          </div>
        </ZoomIn>
      </AbsoluteFill>
    </Camera>
  </Paper>
);

const Stack: React.FC<ShotProps> = () => (
  <Paper>
    <Camera push={0.08}>
      <AbsoluteFill style={C}>
        <Slide at={0} from={-700}>
          <div style={wide(210)}>НЕ</div>
        </Slide>
        <Slide at={2} from={900}>
          <Glitch every={7} burst={3} amount={20}>
            <div style={cond(210, { color: RED, letterSpacing: "0.03em" })}>МОЖЕТ</div>
          </Glitch>
        </Slide>
        <Slide at={4} from={-700}>
          <div style={wide(210)}>
            БЫТЬ<span style={{ color: RED }}>.</span>
          </div>
        </Slide>
      </AbsoluteFill>
    </Camera>
  </Paper>
);

const Okay1: React.FC<ShotProps> = ({ w }) => (
  <Red>
    <Camera hits={[w(0)]} shake={14}>
      <AbsoluteFill style={C}>
        <Letters text="ОКЕЙ," mode="blur" delay={w(0)} stagger={1} style={wide(300)} />
      </AbsoluteFill>
      <Pops
        style={wide(80, { color: "#fff" })}
        life={30}
        items={[
          { text: "ХА", x: "86%", y: "18%", at: 14, rot: -6 },
          { text: "ХА", x: "14%", y: "84%", at: 22, rot: 8 },
          { text: "ХА", x: "84%", y: "86%", at: 28, rot: -3 },
        ]}
      />
    </Camera>
  </Red>
);

const Okay2: React.FC<ShotProps> = ({ w }) => (
  <Dark>
    <Camera push={0.05}>
      <AbsoluteFill style={C}>
        <Slide at={Math.max(0, w(0) - 2)} vertical from={-500} dur={5}>
          <div style={wide(300, glowWhite)}>
            ОКЕЙ<span style={{ color: RED }}>.</span>
          </div>
        </Slide>
      </AbsoluteFill>
      <Pops style={wide(46, { color: RED })} life={20} items={[{ text: "ха", x: "84%", y: "26%", at: w(0) + 6, rot: -8 }]} />
    </Camera>
  </Dark>
);

const BELIEVE_A = ["ТЫ", "ПРАВДА", "ВЕРИШЬ,"];
const Believe: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  const page = f < w(3) ? 0 : f < w(7) ? 1 : 2;
  if (page === 0) {
    const shown = BELIEVE_A.filter((_, i) => f >= w(i)).length;
    const scroll = interpolate(f, [w(0), w(1), w(2)], [0, -60, -150], { ...clampX, easing: EASE.out });
    return (
      <Dark bokeh={false}>
        <AbsoluteFill style={{ ...C, transform: `translateY(${scroll}px)` }}>
          {BELIEVE_A.slice(0, shown).map((t, i) => (
            <Slide key={i} at={w(i)} vertical from={260} dur={4}>
              <div style={wide([250, 230, 200][i], { color: "#fff" })}>{t}</div>
            </Slide>
          ))}
        </AbsoluteFill>
      </Dark>
    );
  }
  if (page === 1)
    return (
      <Dark bokeh={false}>
        <AbsoluteFill style={{ ...C, alignItems: "flex-start", paddingLeft: 120 }}>
          <Slide at={w(3)} vertical from={-300} dur={4}>
            <WireExtrude depth={9} dx={3} dy={-3} width={3} style={wide(220)}>
              ЧТО
            </WireExtrude>
          </Slide>
          <div style={{ display: "flex", gap: 40, alignItems: "baseline" }}>
            <Slide at={w(4)} from={-400} dur={3}>
              <div style={wide(230, { color: "#fff" })}>Я</div>
            </Slide>
            <Slide at={w(5)} from={700} dur={4}>
              <div style={wide(230, { color: "#fff" })}>ДАЖЕ</div>
            </Slide>
          </div>
          <Slide at={w(6)} from={-900} dur={4}>
            <div style={wide(250, { color: RED, textShadow: `0 0 40px ${RED}` })}>НЕ</div>
          </Slide>
        </AbsoluteFill>
      </Dark>
    );
  return (
    <Dark glow="50% 50%">
      <Camera push={0.1}>
        <AbsoluteFill style={C}>
          <ZoomIn delay={w(7)} from={0.6} dur={5}>
            <Fit text="ОТКРЫВАЛ" width={1720} max={300} fontFamily={WIDE} style={glowWhite} />
          </ZoomIn>
        </AbsoluteFill>
      </Camera>
    </Dark>
  );
};

const AeWindow: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ width: 1180, background: "#f4f4f6", borderRadius: 20, padding: "22px 26px", fontFamily: MONO, color: "#555", boxShadow: "0 50px 140px rgba(0,0,0,0.7)" }}>
      <div style={{ textAlign: "center", fontSize: 22, marginBottom: 12 }}>After Effects</div>
      {(
        [
          ["Text", "#aaa", [0.1, 0.35, 0.6]],
          ["Shape 1", "#ff8a3d", [0.15, 0.5, 0.85]],
          ["Shape 2", RED, [0.25, 0.45, 0.65]],
          ["Camera", "#aaa", [0.05, 0.55, 0.95]],
        ] as [string, string, number[]][]
      ).map(([n, c, keys], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", height: 46 }}>
          <div style={{ width: 160, fontSize: 20 }}>● {n}</div>
          <div style={{ position: "relative", flex: 1, height: 2, background: "#ccc" }}>
            {(i === 1 || i === 2) && <div style={{ position: "absolute", left: "12%", right: "12%", top: -9, height: 18, borderRadius: 9, background: c }} />}
            {keys.map((k, j) => (
              <div key={j} style={{ position: "absolute", left: `${k * 100}%`, top: -9, width: 18, height: 18, background: "#222", transform: "rotate(45deg)" }} />
            ))}
          </div>
        </div>
      ))}
      <div style={{ position: "relative", height: 0 }}>
        <div style={{ position: "absolute", left: 160 + ((f * 11) % 960), bottom: 0, height: 200, width: 3, background: RED }} />
      </div>
    </div>
  );
};
const Ae: React.FC<ShotProps> = ({ w, dur }) => {
  const f = useCurrentFrame();
  const late = f >= w(2);
  const cut = w(4);
  return (
    <Dark glow="50% 100%">
      <Camera hits={[cut + 2]} shake={18}>
        <AbsoluteFill style={{ alignItems: "flex-start", padding: "70px 110px" }}>
          <div style={cond(150, { color: "#fff", letterSpacing: "0.01em", textAlign: "left" })}>
            {!late ? (
              <TypeOn text="AFTER EFFECTS" delay={w(0)} perChar={0.9} />
            ) : (
              <>
                <TypeOn text="ДЛЯ ЭТОГО " delay={w(2)} perChar={0.7} />
                <span style={{ color: RED }}>
                  <TypeOn text="ВИДЕО?" delay={w(4) - 2} perChar={0.8} />
                </span>
              </>
            )}
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ ...C, paddingTop: 220 }}>
          <Tilt3D delay={w(0)} fromX={35} fromY={-20} fromZ={-500}>
            <AeWindow />
          </Tilt3D>
        </AbsoluteFill>
        <Cursor path={[{ x: 1600, y: 1000, at: w(0) }, { x: 1300, y: 760, at: w(1) + 2, click: true }, { x: 1380, y: 820, at: dur }]} />
        <Slash delay={cut} angle={22} y="64%" thickness={12} dur={7} />
        <Slash delay={cut + 3} angle={-22} y="64%" thickness={12} dur={7} />
        <Sparks delay={cut + 5} x="50%" y="64%" radius={600} count={30} />
      </Camera>
    </Dark>
  );
};

const Ask: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  const q1 = prog(f, w(4) - 2, 8, EASE.back);
  const q2 = prog(f, w(4) + 8, 6, EASE.back);
  const q3 = prog(f, w(4) + 18, 6, EASE.back);
  return (
    <Paper>
      <Camera push={0.05}>
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 110 }}>
          <div style={{ textAlign: "left" }}>
            <Slide at={w(0)} from={-500} dur={4}>
              <div style={wide(70)}>А ПРЕЖДЕ ЧЕМ</div>
            </Slide>
            <Slide at={w(3)} vertical from={200} dur={4}>
              <div style={wide(210)}>ТЫ</div>
            </Slide>
            <Slide at={w(4)} vertical from={200} dur={4}>
              <div style={wide(190, { color: RED })}>СПРОСИШЬ</div>
            </Slide>
          </div>
        </AbsoluteFill>
        <div style={{ position: "absolute", right: -40, top: -40, ...wide(860, { color: RED }), transform: `translateX(${(1 - q1) * 600}px) rotate(${(1 - q1) * 40}deg)`, opacity: q1 > 0 ? 1 : 0 }}>?</div>
        <div style={{ position: "absolute", right: 520, bottom: 60, ...wide(300), transform: `scale(${q2}) rotate(${(1 - q2) * -30}deg)` }}>?</div>
        <div style={{ position: "absolute", right: 640, top: 60, transform: `scale(${q3})` }}>
          <Outline color={INK} width={5} style={wide(220)}>
            ?
          </Outline>
        </div>
      </Camera>
    </Paper>
  );
};

const Nope: React.FC<ShotProps> = ({ w }) => (
  <Red>
    <SpeedLines color="rgba(0,0,0,0.55)" inner={0.38} count={80} delay={w(0)} />
    <Camera hits={[w(0)]} shake={40} push={0.14}>
      <AbsoluteFill style={C}>
        <ZoomIn delay={w(0)} from={3.2} dur={4}>
          <Extrude depth={30} angle={35} side="#5e0610" face={INK} style={wide(400)}>
            НЕТ.
          </Extrude>
        </ZoomIn>
      </AbsoluteFill>
    </Camera>
  </Red>
);

const NotPlugin: React.FC<ShotProps> = ({ w, dur }) => {
  const f = useCurrentFrame();
  const strike = dur - 12;
  return (
    <Dark>
      <AbsoluteFill style={{ alignItems: "flex-start", padding: "70px 100px" }}>
        <div style={{ display: "flex", gap: 34, alignItems: "center", ...wide(130) }}>
          <Slide at={w(0)} from={-600} dur={4}>
            <span style={glowWhite}>ЭТО</span>
          </Slide>
          <Slide at={w(1)} from={500} dur={3}>
            <Glitch every={9} burst={3} amount={14}>
              <span style={{ color: RED }}>НЕ</span>
            </Glitch>
          </Slide>
          {f >= w(2) && (
            <Highlight delay={w(2)} style={{ color: "#fff" }}>
              ПЛАГИН
            </Highlight>
          )}
        </div>
        <div style={{ height: 4, width: interpolate(f, [w(0), w(0) + 8], [0, 1100], clampX), background: RED, boxShadow: `0 0 20px ${RED}`, marginTop: 12 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ ...C, paddingTop: 200 }}>
        <div style={{ transform: "scale(1.15)" }}>
          <NodeGraph
            width={1500}
            height={520}
            delay={w(1)}
            nodes={[
              { id: "a", x: 220, y: 320, title: "Claude", sub: "AI model" },
              { id: "b", x: 750, y: 170, title: "Плагин", sub: "MCP", hot: true },
              { id: "c", x: 1280, y: 320, title: "After Effects", sub: "app" },
            ]}
            edges={[
              ["a", "b"],
              ["b", "c"],
            ]}
          />
        </div>
      </AbsoluteFill>
      {f >= strike && (
        <AbsoluteFill style={C}>
          <ZoomIn delay={strike} from={2.5} dur={4}>
            <div style={wide(230, { color: RED, textShadow: `0 0 50px ${RED}` })}>НЕ ПЛАГИН</div>
          </ZoomIn>
        </AbsoluteFill>
      )}
    </Dark>
  );
};

const ThisIs: React.FC<ShotProps> = ({ w, dur }) => {
  const f = useCurrentFrame();
  const flip = dur - 9;
  if (f >= flip)
    return (
      <Red>
        <Camera hits={[flip]} shake={30}>
          <AbsoluteFill style={C}>
            <ZoomIn delay={flip} from={1.8} dur={3}>
              <Fit text="ЭТО" width={1600} max={760} fontFamily={WIDE} />
            </ZoomIn>
          </AbsoluteFill>
        </Camera>
      </Red>
    );
  return (
    <Dark bokeh={false} glow="50% 50%">
      <AbsoluteFill>
        <LightStreak delay={4} y="50%" thickness={3} />
      </AbsoluteFill>
      {f < w(0) && <RedDot size={22} />}
      <AbsoluteFill style={C}>
        <ZoomIn delay={w(0)} from={0.3} dur={5}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, transform: "translateY(-30px)", opacity: 0.4 }}>
              <WireExtrude depth={6} dx={0} dy={-10} width={2} style={wide(300)}>
                ЭТО
              </WireExtrude>
            </div>
            <div style={wide(300, glowWhite)}>ЭТО</div>
          </div>
        </ZoomIn>
      </AbsoluteFill>
    </Dark>
  );
};

const Logo: React.FC<{ hit: number; subText?: string; subAt?: number; size?: number }> = ({ hit, subText = "для Claude Code", subAt, size = 240 }) => (
  <>
    <LightStreak delay={hit - 6} y="50%" thickness={4} />
    <Sparks delay={hit} radius={760} count={36} />
    <Shockwave delay={hit} size={2400} />
    <AbsoluteFill style={C}>
      <Glow strength={0.9}>
        <ZoomIn delay={hit} from={2.2} dur={5}>
          <div style={wide(size, { ...glowWhite, fontStyle: "italic", letterSpacing: "-0.05em", textTransform: "none" })}>AE-MOTION</div>
        </ZoomIn>
      </Glow>
      <div style={{ fontFamily: MONO, fontSize: 38, color: "#fff", marginTop: 18, height: 50 }}>
        <span style={{ color: RED }}>✳ </span>
        <TypeOn text={subText} delay={subAt ?? hit + 10} perChar={0.8} />
      </div>
    </AbsoluteFill>
    <Flash delay={hit} dur={5} />
  </>
);

const LogoShot: React.FC<ShotProps> = () => {
  const f = useCurrentFrame();
  return (
    <Dark glow="50% 55%">
      {f < 8 && (
        <AbsoluteFill style={C}>
          <div style={{ fontFamily: MONO, fontSize: 70, color: "#fff", borderBottom: `4px solid ${RED}`, paddingBottom: 8 }}>
            <TypeOn text="✳ Claude Code" perChar={0.5} />
          </div>
        </AbsoluteFill>
      )}
      {f >= 6 && <Logo hit={8} />}
    </Dark>
  );
};

const Tell: React.FC<ShotProps> = ({ w }) => (
  <Paper>
    <Slash delay={0} angle={-8} color={RED} thickness={3} dur={10} y="45%" />
    <AbsoluteFill style={{ ...C, alignItems: "flex-start", paddingLeft: 120 }}>
      <div style={{ display: "flex", gap: 40 }}>
        <Slide at={w(0)} from={900} dur={4}>
          <div style={wide(170)}>ТЫ</div>
        </Slide>
        <Slide at={w(1)} from={900} dur={4}>
          <div style={wide(170)}>ГОВОРИШЬ</div>
        </Slide>
      </div>
      <Slide at={w(2)} vertical from={260} dur={4}>
        <div style={wide(240)}>КЛОДУ,</div>
      </Slide>
    </AbsoluteFill>
  </Paper>
);

const ChatCard2: React.FC<{ typed: string; delay: number }> = ({ typed, delay }) => {
  const f = useCurrentFrame();
  const s = pop(f, 30, delay, 14);
  return (
    <div style={{ width: 760, background: "#fafafa", borderRadius: 26, padding: 32, boxShadow: "0 30px 90px rgba(0,0,0,0.6)", transform: `scale(${s}) rotate(${(1 - s) * 6}deg)`, fontFamily: "Inter, sans-serif", color: "#222" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 700 }}>
        <span style={{ color: RED }}>✳</span> Claude
      </div>
      <div style={{ fontSize: 24, opacity: 0.55, margin: "20px 0" }}>Что делаем сегодня?</div>
      <div style={{ border: "1.5px solid #ddd", borderRadius: 16, padding: "18px 22px", fontFamily: MONO, fontSize: 26, display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 40 }}>
        <span>
          {typed}
          <span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0 }}>|</span>
        </span>
        <span style={{ width: 40, height: 40, borderRadius: "50%", background: RED, color: "#fff", display: "grid", placeItems: "center", fontSize: 22 }}>↑</span>
      </div>
    </div>
  );
};
const Want: React.FC<ShotProps> = ({ w, dur }) => {
  const f = useCurrentFrame();
  const txt = "15-секундный ролик…";
  const n = Math.max(0, Math.floor(interpolate(f, [w(0) + 4, dur - 4], [0, txt.length], clampX)));
  return (
    <Dark bokeh={false}>
      <AbsoluteFill style={{ ...ROW, gap: 80, justifyContent: "space-between", padding: "0 90px" }}>
        <div style={{ textAlign: "left" }}>
          <Slide at={w(0)} from={-600} dur={4}>
            <div style={cond(130, { color: "#fff" })}>ЧТО ХОЧЕШЬ</div>
          </Slide>
          <Slide at={w(2)} vertical from={200} dur={4}>
            <div style={cond(170, { color: RED })}>УВИДЕТЬ</div>
          </Slide>
        </div>
        <div style={{ transform: "scale(1.2)", transformOrigin: "100% 50%" }}>
          <ChatCard2 typed={txt.slice(0, n)} delay={w(0)} />
        </div>
      </AbsoluteFill>
    </Dark>
  );
};

const Pill: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  const fill = prog(f, w(1) + 10, 14, EASE.inOut);
  return (
    <Dark glow="50% 50%">
      <LightStreak delay={0} y="50%" />
      <Camera push={0.15}>
        <AbsoluteFill style={C}>
          {f >= w(1) - 2 && (
            <GlowPill delay={w(1) - 2} style={wide(170, { color: INK, fontStyle: "italic", textTransform: "none", background: `linear-gradient(90deg, ${RED} ${fill * 100}%, #fff ${fill * 100}%)` })}>
              AE-MOTION
            </GlowPill>
          )}
        </AbsoluteFill>
      </Camera>
    </Dark>
  );
};

const ShapeCycle: React.FC<{ at: number; size?: number }> = ({ at, size = 260 }) => {
  const f = useCurrentFrame();
  const t = f - at;
  const phase = t < 0 ? 0 : Math.min(2, Math.floor(t / 14));
  const local = t - phase * 14;
  const s = 0.75 + 0.25 * prog(local, 0, 6, EASE.back);
  const shapes: React.CSSProperties[] = [{ borderRadius: "50%" }, { clipPath: "polygon(50% 4%, 96% 92%, 4% 92%)" }, { borderRadius: 26 }];
  return <div style={{ width: size, height: size, background: RED, transform: `scale(${s}) rotate(${phase === 2 ? local * 3 : 0}deg)`, boxShadow: `0 0 50px rgba(255,42,61,0.5)`, ...shapes[phase] }} />;
};

const Turns: React.FC<ShotProps> = ({ w }) => (
  <Dark bokeh={false}>
    <AbsoluteFill style={{ padding: "90px 100px", flexDirection: "row", gap: 60, alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 34, paddingTop: 40 }}>
        <Slide at={0} from={-900} dur={5}>
          <Filmstrip width={820} height={120} />
        </Slide>
        <Slide at={w(0)} from={-600} dur={4}>
          <div style={cond(110, { color: "#fff", textAlign: "left", whiteSpace: "nowrap" })}>ПРЕВРАЩАЕТ ЭТО</div>
        </Slide>
        <Slide at={w(2)} from={-400} dur={3}>
          <div style={cond(110, { color: RED, textAlign: "left" })}>В</div>
        </Slide>
      </div>
      <Tilt3D delay={0} fromY={-30} fromX={10} fromZ={-300}>
        <div style={{ width: 760, height: 470, background: "#f2f2f4", borderRadius: 18, display: "grid", placeItems: "center", boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}>
          <ShapeCycle at={w(0)} />
        </div>
      </Tilt3D>
    </AbsoluteFill>
    <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, textAlign: "center" }}>
      <Slide at={w(3)} vertical from={300} dur={4}>
        <Fit text="АНИМАЦИЮ." width={1700} max={250} fontFamily={WIDE} style={{ color: "#fff" }} />
      </Slide>
    </div>
  </Dark>
);

const ThatsIt: React.FC<ShotProps> = ({ w }) => (
  <Dark glow="50% 50%">
    <AbsoluteFill style={ROW}>
      {["ВОТ", "И", "ВСЁ."].map((t, i) => (
        <Stretch key={i} delay={w(i)} from={3} dur={6} style={{ marginRight: 40 }}>
          <div style={cond(260, { color: i === 2 ? RED : "#fff" })}>{t}</div>
        </Stretch>
      ))}
    </AbsoluteFill>
  </Dark>
);

const Write: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  return (
    <Dark glow="50% 100%">
      <AbsoluteFill style={C}>
        <div style={wide(110, glowWhite)}>
          <TypeOn text="ВСЁ, ЧТО НУЖНО —" delay={w(0)} perChar={1} />
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 20 }}>
          <ZoomIn delay={w(3)} from={1.8} dur={4}>
            <div style={wide(250, { color: RED, textShadow: `0 0 40px ${RED}` })}>НАПИСАТЬ:</div>
          </ZoomIn>
          <div style={{ width: 18, height: 230, background: "#fff", marginLeft: 16, opacity: Math.floor(f / 8) % 2 ? 1 : 0.2 }} />
        </div>
      </AbsoluteFill>
    </Dark>
  );
};

// Prompt typed exactly while it is spoken: each word types between its start and end frame.
const PROMPT_WORDS = ["Сделай ", "15-секундную ", "кинематографичную ", "анимацию."];
const HL = new Set([1, 2]);
const Prompt: React.FC<ShotProps> = ({ w, we, dur }) => {
  const f = useCurrentFrame();
  const send = dur - 16;
  const open = prog(f, 0, 10, EASE.out);
  const pressed = f >= send;
  return (
    <Dark>
      <Camera push={0.25} hits={[send]} shake={24}>
        <AbsoluteFill style={C}>
          <div style={{ transform: `perspective(1600px) rotateX(${(1 - open) * 40 + Math.sin(f / 30) * 4}deg) rotateY(${-8 + f * 0.08}deg)` }}>
            <div
              style={{
                width: 1400,
                minHeight: 230,
                transform: `scaleX(${open})`,
                background: "linear-gradient(180deg, rgba(120,120,200,0.55), rgba(70,70,140,0.5))",
                border: "2px solid rgba(255,255,255,0.35)",
                borderRadius: 28,
                padding: "46px 150px 46px 56px",
                position: "relative",
                boxShadow: "0 40px 140px rgba(0,0,0,0.6), inset 0 0 60px rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 54, color: "#fff", lineHeight: 1.55, textAlign: "left" }}>
                {PROMPT_WORDS.map((word, i) => {
                  const n = Math.round(interpolate(f, [w(i), Math.max(w(i) + 2, we(i))], [0, word.length], clampX));
                  if (n <= 0) return null;
                  const part = word.slice(0, n);
                  return HL.has(i) ? (
                    <span key={i} style={{ background: `rgba(255,42,61,${0.8 * prog(f, w(i), 5)})`, borderRadius: 8, padding: "0 6px", boxShadow: `0 0 26px rgba(255,42,61,0.7)` }}>
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  );
                })}
                <span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0 }}>|</span>
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 36,
                  bottom: 36,
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  border: `3px solid ${RED}`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 40,
                  color: "#fff",
                  transform: `scale(${pressed ? interpolate(f, [send, send + 3, send + 8], [1, 0.8, 1.4], { extrapolateRight: "clamp" }) : 1})`,
                  background: pressed ? RED : "transparent",
                  boxShadow: `0 0 30px ${RED}`,
                }}
              >
                ↵
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Camera>
      {pressed && <SpeedLines color="#fff" opacity={0.75} inner={0.2} count={90} />}
      {pressed && <Flash delay={send + 4} dur={6} color={RED} />}
    </Dark>
  );
};

const Kinetic: React.FC<ShotProps> = ({ w, dur }) => (
  <Red>
    <AbsoluteFill style={C}>
      <WeightShift at={dur - 12} from={{}} to={{ transform: "scaleX(0.82)" }}>
        <div>
          <Wobble text="КИНЕТИЧЕСКИЙ" delay={w(0)} amount={1.3} speed={0.12} style={wide(150, { letterSpacing: "0.04em" })} />
          <div>
            <Slide at={w(1)} vertical from={160} dur={4}>
              <div style={wide(200)}>ТЕКСТ.</div>
            </Slide>
          </div>
        </div>
      </WeightShift>
    </AbsoluteFill>
  </Red>
);

const Morph: React.FC<ShotProps> = ({ w }) => (
  <Dark bokeh={false} glow="50% 50%">
    <AbsoluteFill style={C}>
      <div style={{ position: "absolute" }}>
        <ShapeCycle at={w(0) - 2} size={520} />
      </div>
      <Slide at={w(0)} from={-900} dur={4} style={{ position: "relative" }}>
        <div style={wide(220, { color: "#fff", textShadow: "0 10px 50px rgba(0,0,0,0.6)" })}>МОРФИНГ</div>
      </Slide>
      <Slide at={w(1)} from={900} dur={4} style={{ position: "relative" }}>
        <div style={wide(180, { color: "#fff" })}>ФОРМ.</div>
      </Slide>
    </AbsoluteFill>
  </Dark>
);

const ThreeD: React.FC<ShotProps> = ({ w }) => (
  <Paper>
    <Camera push={0.06}>
      <AbsoluteFill style={C}>
        <div style={{ display: "flex", alignItems: "center", gap: 170 }}>
          <ZoomIn delay={w(0)} from={1.8} dur={4}>
            <div style={wide(330, { textTransform: "none" })}>3D</div>
          </ZoomIn>
          <Cube3D size={300} color={RED} />
        </div>
        <Slide at={w(1)} vertical from={220} dur={4}>
          <div style={wide(160)}>ЭЛЕМЕНТЫ.</div>
        </Slide>
      </AbsoluteFill>
    </Camera>
  </Paper>
);

const CameraShot: React.FC<ShotProps> = ({ w, dur }) => {
  const f = useCurrentFrame();
  const orbit = interpolate(f, [0, dur], [-18, 14]);
  const p = prog(f, w(1), 20, EASE.inOut);
  return (
    <Dark glow="50% 60%">
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d="M 80 900 C 600 760, 900 1020, 1840 600" stroke={RED} strokeWidth={5} fill="none" strokeDasharray={2200} strokeDashoffset={2200 * (1 - p)} style={{ filter: `drop-shadow(0 0 12px ${RED})` }} />
      </svg>
      <AbsoluteFill style={{ ...C, perspective: 1300 }}>
        <div style={{ transform: `rotateY(${orbit}deg) rotateZ(-7deg) rotateX(12deg)`, transformStyle: "preserve-3d" }}>
          <Slide at={w(0)} from={-900} dur={4}>
            <div style={wide(150, { color: "#fff", textAlign: "left" })}>ПЛАВНАЯ</div>
          </Slide>
          <Slide at={w(1)} from={900} dur={4}>
            <div style={wide(240, glowWhite)}>КАМЕРА.</div>
          </Slide>
        </div>
      </AbsoluteFill>
    </Dark>
  );
};

const Now: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  if (f < w(3))
    return (
      <Dark bokeh={false} grid={false} glow="50% 50%">
        <AbsoluteFill style={C}>
          {f < w(1) && (
            <ZoomIn delay={w(0)} from={2} dur={4}>
              <div style={wide(300, { color: RED })}>А</div>
            </ZoomIn>
          )}
          <Slide at={w(1)} vertical from={-200} dur={4}>
            <div style={wide(230, { color: "#fff" })}>ТЕПЕРЬ</div>
          </Slide>
          {f >= w(2) && (
            <Slide at={w(2)} vertical from={200} dur={4}>
              <div style={wide(230, { color: "#fff" })}>
                СМ
                <span style={{ position: "relative" }}>
                  О
                  <span style={{ position: "absolute", left: "50%", top: "52%", width: 60, height: 60, borderRadius: "50%", background: RED, transform: "translate(-50%,-50%)", boxShadow: `0 0 30px ${RED}` }} />
                </span>
                ТРИ
              </div>
            </Slide>
          )}
        </AbsoluteFill>
      </Dark>
    );
  return (
    <Paper>
      <div style={{ position: "absolute", left: 0, right: 0, top: "58%", height: 3, background: RED, transform: `scaleX(${prog(f, w(3) - 4, 6)})` }} />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 110 }}>
        <Slide at={w(3)} from={-300} dur={3}>
          <div style={wide(90)}>НА</div>
        </Slide>
        <Letters text="БУКВЫ." mode="drop" delay={w(4)} stagger={2} style={wide(300)} />
      </AbsoluteFill>
    </Paper>
  );
};

const StretchShot: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  const flip = w(0) + 16;
  if (f < flip)
    return (
      <Paper>
        <div style={{ position: "absolute", left: 0, right: 0, top: "62%", height: 3, background: RED }} />
        <AbsoluteFill style={C}>
          <Wobble text="ТЯНУТСЯ!" delay={w(0)} amount={2} speed={0.25} style={cond(300, { letterSpacing: "0.02em" })} />
        </AbsoluteFill>
      </Paper>
    );
  const sx = interpolate(f, [flip, flip + 4, flip + 14], [0.35, 1.6, 1], { extrapolateRight: "clamp", easing: EASE.out });
  return (
    <Red>
      <AbsoluteFill style={C}>
        <Smear x={Math.abs(sx - 1) * 40}>
          <div style={{ transform: `scaleX(${sx})`, ...wide(190, { letterSpacing: "0.06em" }) }}>ТЯНУТСЯ!</div>
        </Smear>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: "60%", height: 4, background: INK, transform: `scaleX(${prog(f, flip + 4, 8)})` }} />
    </Red>
  );
};

const Follow: React.FC<ShotProps> = ({ w, dur }) => {
  const f = useCurrentFrame();
  const fly = interpolate(f, [w(1), w(3)], [0.6, 1.5], { ...clampX, easing: EASE.inOut });
  if (f < w(3))
    return (
      <Dark bokeh={false}>
        <SpeedLines color="rgba(255,255,255,0.8)" inner={0.3} count={70} opacity={0.6} />
        {f < w(1) && (
          <AbsoluteFill style={C}>
            <ZoomIn delay={w(0)} from={0.5} dur={5}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 200, color: "#fff" }}>хм…</div>
            </ZoomIn>
          </AbsoluteFill>
        )}
        <AbsoluteFill style={{ ...C, transform: `scale(${fly}) rotate(-8deg)` }}>
          <Slide at={w(1)} from={-600} dur={4}>
            <div style={wide(200, glowWhite)}>СЛЕДИ</div>
          </Slide>
          <Slide at={w(2)} from={600} dur={3}>
            <div style={wide(120, { color: "#fff", marginLeft: 300 })}>ЗА</div>
          </Slide>
        </AbsoluteFill>
      </Dark>
    );
  const arc = prog(f, dur - 12, 12, EASE.in);
  return (
    <Dark bokeh={false}>
      <Viewfinder delay={w(3)} inset={70} />
      <AbsoluteFill style={C}>
        <ZoomIn delay={w(3)} from={1.6} dur={4}>
          <div style={wide(220, glowWhite)}>КАМЕРОЙ.</div>
        </ZoomIn>
      </AbsoluteFill>
      {arc > 0 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d="M 200 160 Q 900 -100 1500 500" stroke={RED} strokeWidth={8} fill="none" strokeDasharray={1800} strokeDashoffset={1800 * (1 - arc)} style={{ filter: `drop-shadow(0 0 14px ${RED})` }} strokeLinecap="round" />
        </svg>
      )}
    </Dark>
  );
};

const Wait: React.FC<ShotProps> = ({ w, dur }) => (
  <Dark bokeh={false} grid={false} glow="45% 50%">
    <AbsoluteFill style={{ ...ROW, gap: 70 }}>
      <HudRing size={520} delay={0} />
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 92, width: 640, textAlign: "left", color: "#fff", lineHeight: 1.1 }}>
        <TypeOn text="и жди" delay={w(0)} perChar={1.6} />
        <br />
        <TypeOn text="переход —" delay={w(2)} perChar={1.6} cursor />
      </div>
    </AbsoluteFill>
    <LightSweep at={dur - 10} dur={10} />
    <Slash delay={dur - 7} angle={-60} color="#fff" thickness={10} dur={7} />
  </Dark>
);

const Kidding: React.FC<ShotProps> = ({ w, dur }) => {
  const f = useCurrentFrame();
  const thin = dur - 26;
  return (
    <Paper>
      <SpeedLines color="#111" opacity={0.25} inner={0.6} count={60} />
      <div style={{ position: "absolute", right: -160, top: -120, transform: `scale(${1 + 0.05 * Math.sin(f / 4)})` }}>
        <Starburst size={1250} delay={0} spin={0.5} />
      </div>
      <Camera hits={[0, w(2)]} shake={26}>
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 110 }}>
          <WeightShift at={thin} from={{}} to={{ fontWeight: 300 }} style={{ textAlign: "left" }}>
            <div>
              <Slide at={w(0)} from={-700} dur={4}>
                <div style={wide(170)}>ТЫ ЧТО,</div>
              </Slide>
              <Slide at={w(2)} vertical from={200} dur={4}>
                <div style={wide(150)}>ИЗДЕВАЕШЬСЯ</div>
              </Slide>
              <Slide at={w(2) + 6} vertical from={200} dur={4}>
                <div style={wide(200, { color: RED })}>?!</div>
              </Slide>
            </div>
          </WeightShift>
        </AbsoluteFill>
      </Camera>
    </Paper>
  );
};

const Think: React.FC<ShotProps> = ({ w }) => (
  <Gray>
    <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 130 }}>
      <Slide at={w(0)} vertical from={300} dur={5}>
        <Fit text="ПРЕДСТАВЬ," width={1650} max={240} fontFamily={WIDE} />
      </Slide>
      <div style={{ display: "flex", gap: 26, ...wide(84), marginTop: 10 }}>
        <Slide at={w(1)} from={-500} dur={4}>
          <span>КАК ДЕЛАТЬ</span>
        </Slide>
        <TransformBox delay={w(3)}>
          <Slide at={w(3)} from={300} dur={3}>
            <span>ЭТО</span>
          </Slide>
        </TransformBox>
      </div>
      <Slide at={w(4)} vertical from={120} dur={5}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 130, marginTop: 20, marginLeft: 560 }}>по-старому.</div>
      </Slide>
    </AbsoluteFill>
    <Cursor path={[{ x: 1700, y: 1000, at: w(1) }, { x: 1180, y: 600, at: w(3), click: true }, { x: 1210, y: 630, at: w(4) + 20 }]} />
  </Gray>
);

const Layers: React.FC<ShotProps> = ({ w }) => (
  <Gray>
    <AbsoluteFill style={{ ...C, justifyContent: "flex-start", paddingTop: 70, gap: 30 }}>
      <LayerBars delay={0} stagger={3} width={1300} names={["Камера — 3D", "Заголовок — текст", "Форма 3", "Корректирующий", "Null 1", "Фон"]} />
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, textAlign: "center" }}>
      <Slide at={w(0)} vertical from={300} dur={4}>
        <div style={wide(250)}>СЛОИ.</div>
      </Slide>
    </div>
  </Gray>
);

const Keys: React.FC<ShotProps> = ({ w }) => (
  <Gray light>
    <AbsoluteFill style={{ ...C, gap: 50 }}>
      <div style={wide(220, { color: INK })}>
        <TypeOn text="КЛЮЧИ." delay={Math.max(0, w(0) - 2)} perChar={1.2} />
      </div>
      <KeyLanes delay={w(0)} width={1600} rows={4} cols={10} />
    </AbsoluteFill>
  </Gray>
);

const Graph: React.FC<ShotProps> = ({ w }) => (
  <Gray>
    <AbsoluteFill style={{ ...C, gap: 30 }}>
      <Slide at={Math.max(0, w(0) - 2)} from={-800} dur={4}>
        <div style={wide(170)}>ГРАФ-РЕДАКТОР</div>
      </Slide>
      <GraphCurve delay={w(0)} width={1500} height={420} />
    </AbsoluteFill>
  </Gray>
);

const Tower: React.FC<ShotProps> = () => (
  <Gray>
    <AbsoluteFill style={C}>
      <EchoTower words={["СЛОИ.", "КЛЮЧИ.", "ГРАФ-РЕДАКТОР."]} copies={4} style={wide(110)} />
    </AbsoluteFill>
  </Gray>
);

const Then: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  const dots = ".".repeat(Math.max(0, Math.min(3, Math.floor((f - w(1) - 4) / 4) + 1)));
  return (
    <Paper>
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 140 }}>
        <Slide at={w(0)} from={-500} dur={4}>
          <div style={wide(150)}>А ПОТОМ</div>
        </Slide>
        <div style={wide(150, { minHeight: 150 })}>{f >= w(1) ? dots : ""}</div>
      </AbsoluteFill>
    </Paper>
  );
};

const Render: React.FC<ShotProps> = ({ w, dur }) => {
  const f = useCurrentFrame();
  return (
    <Gray>
      <AbsoluteFill style={{ ...C, gap: 40 }}>
        <ZoomIn delay={w(0)} from={1.5} dur={4}>
          <div style={wide(290)}>
            <CheckerText a="#d4d4d4" b="#7a7a7a" cell={18}>
              РЕНДЕР
            </CheckerText>
            <span style={{ color: "#fff" }}>.</span>
          </div>
        </ZoomIn>
        <div style={{ width: 1500, fontFamily: MONO, color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30 }}>
            <span>РЕНДЕРИНГ{".".repeat(1 + (Math.floor(f / 6) % 3))}</span>
            <span>{1 + Math.floor(f / 12)}%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.15)", marginTop: 12 }}>
            <div style={{ width: `${1 + f / 12}%`, height: "100%", background: "#fff" }} />
          </div>
          <div style={{ marginTop: 18, fontSize: 64, fontWeight: 700 }}>ETA {eta(f, 3 * 3600, 97)}</div>
        </div>
      </AbsoluteFill>
      <Slash delay={dur - 8} angle={-14} y="60%" thickness={10} dur={8} />
      <Sparks delay={dur - 6} x="60%" y="60%" />
    </Gray>
  );
};

const Here: React.FC<ShotProps> = ({ w }) => (
  <Dark glow="50% 70%">
    <DiagonalBand delay={0} angle={-10} height={320}>
      <div style={wide(230, { color: "#fff" })}>
        А ЗДЕСЬ<span style={{ color: INK }}>?</span>
      </div>
    </DiagonalBand>
    <Sparks delay={w(1)} radius={800} count={26} />
  </Dark>
);

const Logo2: React.FC<ShotProps> = () => {
  const f = useCurrentFrame();
  return f < 4 ? (
    <Red>
      <AbsoluteFill style={C}>
        <div style={wide(240, { fontStyle: "italic", textTransform: "none", transform: "rotate(-10deg)" })}>AE-MOTION</div>
      </AbsoluteFill>
    </Red>
  ) : (
    <Dark glow="50% 45%">
      <Logo hit={4} subText="Эй-И Моушн" subAt={8} size={230} />
    </Dark>
  );
};

const Pipeline: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  return (
    <Dark glow="20% 30%">
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 150, gap: 6 }}>
        <TerminalLine text="ПРОМПТ" delay={w(0)} cps={30} outline={f >= w(1)} style={wide(160)} />
        {f >= w(1) && (
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Sparkle size={110} delay={w(1)} />
            <Slide at={w(1)} from={-500} dur={4}>
              {f < w(2) ? (
                <GradientText style={wide(160)}>ГЕНЕРАЦИЯ</GradientText>
              ) : (
                <Outline width={3} color="#c8ff3c" style={wide(160)}>
                  ГЕНЕРАЦИЯ
                </Outline>
              )}
            </Slide>
          </div>
        )}
        {f >= w(2) && (
          <ZoomIn delay={w(2)} from={1.8} dur={4}>
            <div style={wide(160, { color: RED, textShadow: `0 0 40px ${RED}`, textAlign: "left" })}>РЕНДЕР.</div>
          </ZoomIn>
        )}
      </AbsoluteFill>
    </Dark>
  );
};

const Player: React.FC<{ children?: React.ReactNode; width?: number; rewind?: boolean }> = ({ children, width = 1500, rewind }) => (
  <div style={{ width, height: width * 0.5, border: "3px solid rgba(255,255,255,0.7)", borderRadius: 22, background: "linear-gradient(160deg, #262a5a, #13142c)", position: "relative", overflow: "hidden", boxShadow: "0 0 80px rgba(255,42,61,0.25)" }}>
    {children}
    <div
      style={{
        position: "absolute",
        left: 50,
        bottom: 60,
        width: 0,
        height: 0,
        borderTop: "50px solid transparent",
        borderBottom: "50px solid transparent",
        ...(rewind ? { borderRight: `80px solid ${RED}` } : { borderLeft: `80px solid ${RED}` }),
      }}
    />
  </div>
);
const ThisVideo: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  const z = prog(f, 0, 10, EASE.out);
  return (
    <Dark bokeh={false}>
      <AbsoluteFill style={C}>
        <div style={{ transform: `scale(${mix(0.2, 1, z)})` }}>
          <Player>
            <div style={{ position: "absolute", left: 60, top: 50, ...wide(64, { color: "#fff" }) }}>
              <TypeOn text="А ЭТО" delay={w(0)} perChar={1.5} />
            </div>
            <div style={{ position: "absolute", left: 180, bottom: 30 }}>
              <Stretch delay={w(2)} from={3} dur={6}>
                <div style={wide(200, glowWhite)}>ВИДЕО?</div>
              </Stretch>
            </div>
          </Player>
        </div>
      </AbsoluteFill>
    </Dark>
  );
};
const Yeah: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  return (
    <Dark bokeh={false}>
      <AbsoluteFill style={C}>
        <Player rewind>
          <div style={{ position: "absolute", left: 60, top: 50, ...wide(64, { color: "#fff" }) }}>А ЭТО</div>
          <div style={{ position: "absolute", left: 180, bottom: 30, ...wide(200, glowWhite) }}>ВИДЕО?</div>
          <div style={{ position: "absolute", right: 60, top: 50, ...wide(64, { color: RED }), transform: `scale(${pop(f, 30, w(0), 10)})` }}>АГА.</div>
        </Player>
      </AbsoluteFill>
    </Dark>
  );
};

// mini player that cycles through frozen frames of earlier shots (recap)
const RECAP = ["be", "okay2", "kinetic", "pipeline", "nope", "logo"];
const Recap: React.FC<{ width: number }> = ({ width }) => {
  const f = useCurrentFrame();
  const id = RECAP[Math.floor(f / 7) % RECAP.length];
  const s = timeline.shots.find((x) => x.id === id);
  const Comp = PLAN[id]?.[0];
  if (!s || !Comp) return null;
  return (
    <div style={{ width, height: width * 0.5625, overflow: "hidden", borderRadius: 14, border: `3px solid ${RED}`, position: "relative", boxShadow: `0 0 50px rgba(255,42,61,0.5)` }}>
      <div style={{ width: W, height: 1080, transform: `scale(${width / W})`, transformOrigin: "0 0", position: "absolute" }}>
        <Freeze frame={Math.round(s.dur * 0.7)}>
          <Comp {...shotProps(s)} />
        </Freeze>
      </div>
    </div>
  );
};

const Idea: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  const shift = prog(f, w(3) - 4, 8, EASE.inOut);
  return (
    <Dark>
      <AbsoluteFill style={{ padding: "120px 110px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, transform: `translateX(${-shift * 40}px)` }}>
          <Bulb size={170} delay={w(1)} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: MONO, fontSize: 64, fontWeight: 700, letterSpacing: "0.1em" }}>
              <TypeOn text="ОТ ПЕРВОЙ" delay={w(0)} perChar={1} />
            </div>
            <ZoomIn delay={w(2)} from={1.6} dur={4}>
              <div style={wide(200, glowWhite)}>ИДЕИ</div>
            </ZoomIn>
          </div>
        </div>
        <Ruler width={1700} delay={w(0)} dur={Math.max(20, w(5) - w(0))} />
        <div style={{ alignSelf: "flex-end", textAlign: "right" }}>
          <div style={{ fontFamily: MONO, fontSize: 64, fontWeight: 700, letterSpacing: "0.1em" }}>
            <TypeOn text="ДО ФИНАЛЬНОГО" delay={w(3)} perChar={0.8} />
          </div>
          <ZoomIn delay={w(5)} from={1.6} dur={4}>
            <div style={wide(170, glowWhite)}>КАДРА</div>
          </ZoomIn>
        </div>
      </AbsoluteFill>
      {f >= w(3) - 2 && (
        <div style={{ position: "absolute", right: 120, top: 120, transform: `scale(${pop(f, 30, w(3) - 2, 13)})` }}>
          <Recap width={620} />
        </div>
      )}
    </Dark>
  );
};

const One: React.FC<ShotProps> = ({ w }) => {
  const f = useCurrentFrame();
  return (
    <Red>
      <Camera hits={[w(1), w(2)]} push={0.06}>
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 100 }}>
          <div style={{ ...wide(110), display: "flex", alignItems: "center", gap: 30 }}>
            <TypeOn text="СДЕЛАНО" delay={w(0)} perChar={1.2} />
            <span style={{ width: interpolate(f, [w(0), w(0) + 10], [0, 300], clampX), height: 3, background: INK, display: "inline-block" }} />
          </div>
          <ZoomIn delay={w(1)} from={2.4} dur={4}>
            <Fit text="ОДНИМ" width={1100} max={330} fontFamily={WIDE} />
          </ZoomIn>
          <WhipIn delay={w(2)} from="right" dur={5}>
            <Fit text="ПРОМПТОМ." width={1700} max={290} fontFamily={WIDE} />
          </WhipIn>
        </AbsoluteFill>
      </Camera>
    </Red>
  );
};

const Wow: React.FC<ShotProps> = ({ w, dur }) => {
  const f = useCurrentFrame();
  return (
    <Red>
      <Camera hits={[w(0)]} shake={30}>
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 90 }}>
          <RepeatStretch first="ВА" repeat="У" max={9} at={w(0)} dur={26} style={wide(280)} />
        </AbsoluteFill>
      </Camera>
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [dur - 6, dur], [0, 1], { extrapolateLeft: "clamp" }) }} />
    </Red>
  );
};

const Outro: React.FC<ShotProps> = ({ dur }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: prog(f, 18, 6) }}>
        <Dark glow="50% 60%">
          <Logo hit={22} subText="для Claude Code" subAt={36} size={250} />
          <div style={{ position: "absolute", bottom: 90, left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontSize: 30, color: "rgba(255,255,255,0.75)" }}>
            <TypeOn text="github.com/burmalda-claude/ae-motion-claude" delay={50} perChar={0.5} />
          </div>
        </Dark>
      </AbsoluteFill>
      {f < 22 && <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 3, background: RED, transform: `scaleX(${prog(f, 6, 14, EASE.out)})`, boxShadow: `0 0 20px ${RED}` }} />}
      <AbsoluteFill style={{ background: "#000", opacity: interpolate(f, [dur - 18, dur], [0, 1], { extrapolateLeft: "clamp" }) }} />
    </AbsoluteFill>
  );
};

// shot id -> [component, exit, exit frames, enter]
const PLAN: Record<string, [React.FC<ShotProps>, ExitKind, number?, ExitKind?]> = {
  no: [No, "whipL", 3],
  may: [May, "slice", 4],
  be: [Be, "drop", 3],
  stack: [Stack, "zoom", 4],
  okay1: [Okay1, "streakY", 4],
  okay2: [Okay2, "zoom", 6],
  believe: [Believe, "streakY", 4],
  ae: [Ae, "slice", 5],
  ask: [Ask, "spin", 4],
  nope: [Nope, "zoom", 5],
  notplugin: [NotPlugin, "zoomOut", 5],
  thisis: [ThisIs, "slice", 4],
  logo: [LogoShot, "zoom", 5],
  tell: [Tell, "zoom", 4],
  want: [Want, "whipR", 4],
  pill: [Pill, "streakX", 4],
  turns: [Turns, "streakY", 4],
  thatsit: [ThatsIt, "streakY", 4],
  write: [Write, "streakX", 4],
  prompt: [Prompt, "zoom", 4],
  kinetic: [Kinetic, "whipL", 4],
  morph: [Morph, "whipL", 4],
  threeD: [ThreeD, "zoom", 4],
  camera: [CameraShot, "whipR", 5],
  now: [Now, "none", 0],
  stretch: [StretchShot, "slice", 4],
  follow: [Follow, "spin", 5],
  wait: [Wait, "zoom", 3],
  kidding: [Kidding, "drop", 5],
  think: [Think, "streakY", 4],
  layers: [Layers, "drop", 4],
  keys: [Keys, "zoom", 3],
  graph: [Graph, "streakY", 4],
  tower: [Tower, "streakY", 4, "streakY"],
  then: [Then, "none", 0],
  render: [Render, "whipR", 4],
  here: [Here, "zoom", 3],
  logo2: [Logo2, "streakY", 4],
  pipeline: [Pipeline, "slice", 4],
  thisvideo: [ThisVideo, "none", 0, "zoomOut"],
  yeah: [Yeah, "whipL", 5],
  idea: [Idea, "zoom", 4],
  one: [One, "zoom", 5],
  wow: [Wow, "none", 0],
  outro: [Outro, "none", 0],
};

const SHOTS: Record<string, React.FC<ShotProps>> = Object.fromEntries(
  Object.entries(PLAN).map(([id, [Comp, kind, frames, enter]]) => {
    const Wrapped: React.FC<ShotProps> = (p) => (
      <Exit dur={p.dur} kind={kind} frames={frames ?? 4} enter={enter ?? "none"} inFrames={4}>
        <Comp {...p} />
      </Exit>
    );
    return [id, Wrapped];
  }),
);

export const Trailer: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <ChromaDefs />
    <TimelineShots timeline={timeline} shots={SHOTS} />
    <Grain opacity={0.07} />
    <Vignette strength={0.55} />
  </AbsoluteFill>
);
