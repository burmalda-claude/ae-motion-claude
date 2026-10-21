// Check of tools/transplan.py: abstract cards cut by src/trans-plan.json, then re-scanned with tools/transscan.py.
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import plan from "./trans-plan.json"; // tools/transplan.py output (sample: trans-plan.example.json)
import { BloomFlash, DotGrid, EditCam, HitShake, Orb } from "./kit";

export const PLAN_TEST_DURATION = plan.total;
type Shot = (typeof plan.shots)[number];
const PAL = ["#ff2a3d", "#1f6bff", "#b6ff00", "#ff8a00", "#8a3dff", "#00d1c1", "#ff3d9a", "#ffd400"];

const Card: React.FC<{ i: number }> = ({ i }) => (
  <AbsoluteFill style={{ background: `linear-gradient(${i * 47}deg, ${PAL[i % 8]}, #050505)` }}>
    <DotGrid opacity={0.4} />
    <Orb x={`${20 + ((i * 37) % 60)}%`} y={`${25 + ((i * 53) % 50)}%`} size={420} color={PAL[(i + 3) % 8]} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 360, height: 360, border: "18px solid #fff", transform: `rotate(${i * 23}deg)`, borderRadius: i % 3 ? 0 : 200 }} />
    </AbsoluteFill>
  </AbsoluteFill>
);

/** Entry for cut kinds that need the outgoing blur (whip / blurDissolve) or a short dissolve — in-shot, no overlap. */
const Entry: React.FC<{ s: Shot; children: React.ReactNode }> = ({ s, children }) => {
  const f = useCurrentFrame();
  if (s.in === "whip") {
    const k = interpolate(f, [0, 6], [1, 0], { extrapolateRight: "clamp" });
    return <AbsoluteFill style={{ transform: `translateX(${k * 40}%)`, filter: `blur(${k * 24}px) brightness(${1 - 0.15 * k})` }}>{children}</AbsoluteFill>;
  }
  if (s.in === "blurDissolve" || s.in === "dissolve") {
    const k = interpolate(f, [0, 4], [1, 0], { extrapolateRight: "clamp" });
    return <AbsoluteFill style={{ opacity: 1 - 0.6 * k, filter: `blur(${s.in === "blurDissolve" ? k * 18 : 0}px)` }}>{children}</AbsoluteFill>;
  }
  if (s.in === "invertCut") return <AbsoluteFill style={{ filter: f < 2 ? "invert(1)" : undefined }}>{children}</AbsoluteFill>;
  return <>{children}</>;
};

export const PlanTest: React.FC = () => {
  const shots = plan.shots as Shot[];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <HitShake hits={shots.filter((s) => s.fx === "shake").map((s) => s.from)} amp={20} len={6}>
        {shots.map((s, i) => (
          <Sequence key={i} from={s.from} durationInFrames={s.dur}>
            {s.fx === "black" ? (
              <AbsoluteFill style={{ background: "#000" }} />
            ) : (
              <EditCam kind={s.cam as "creep" | "settle" | "punch" | "none"} dur={s.dur} seed={`s${i}`}>
                <Entry s={s}>
                  <Card i={i} />
                </Entry>
              </EditCam>
            )}
          </Sequence>
        ))}
      </HitShake>
      {shots.filter((s) => s.fx === "flash").map((s) => (
        <BloomFlash key={s.from} at={s.from} />
      ))}
    </AbsoluteFill>
  );
};
