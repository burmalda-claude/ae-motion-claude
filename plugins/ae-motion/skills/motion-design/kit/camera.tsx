import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { noise2D } from "@remotion/noise";
import { EASE, clamp, mix, prog } from "./easing";

/**
 * Virtual camera for a whole shot: slow push-in, optional drift, optional impact shakes.
 * hits = frames (relative to the shot) where a shake impulse fires.
 */
export const Camera: React.FC<{
  children: React.ReactNode;
  push?: number; // total extra zoom over the shot, e.g. 0.06
  drift?: number; // px of slow noise drift
  hits?: number[];
  shake?: number; // px amplitude of hit shakes
  rotate?: number; // deg of slow roll over the shot
  dur?: number; // shot length in frames (defaults to the enclosing Sequence/composition)
  style?: React.CSSProperties;
}> = ({ children, push = 0.05, drift = 6, hits = [], shake = 26, rotate = 0, dur, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = Math.min(1, frame / Math.max(1, dur ?? durationInFrames));
  const amp = hits.reduce((a, h) => a + (frame >= h ? interpolate(frame, [h, h + 14], [1, 0], clamp) : 0), 0);
  const x = noise2D("cx", frame * 0.02, 0) * drift + noise2D("sx", frame * 0.9, 0) * shake * amp;
  const y = noise2D("cy", frame * 0.02, 0) * drift + noise2D("sy", frame * 0.9, 0) * shake * amp;
  const r = rotate * t + noise2D("sr", frame * 0.9, 0) * 2 * amp;
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px,${y}px) scale(${1 + push * EASE.easy(t)}) rotate(${r}deg)`, ...style }}>{children}</AbsoluteFill>
  );
};

/** Parallax layer: moves `depth` × the camera pan. depth 0 = static, 1 = full. */
export const Parallax: React.FC<{ children: React.ReactNode; depth: number; pan?: number; dur?: number; style?: React.CSSProperties }> = ({ children, depth, pan = 200, dur, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const x = -pan * depth * EASE.easy(Math.min(1, frame / Math.max(1, dur ?? durationInFrames)));
  return <AbsoluteFill style={{ transform: `translateX(${x}px)`, ...style }}>{children}</AbsoluteFill>;
};

/** 3D tilt-in of a card/scene (AE 3D layer with camera). */
export const Tilt3D: React.FC<{ children: React.ReactNode; delay?: number; fromX?: number; fromY?: number; fromZ?: number; style?: React.CSSProperties }> = ({
  children,
  delay = 0,
  fromX = 25,
  fromY = -30,
  fromZ = -600,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, delay, 22, EASE.out);
  return (
    <div style={{ perspective: 1600, ...style }}>
      <div style={{ transform: `translateZ(${mix(fromZ, 0, p)}px) rotateX(${mix(fromX, 0, p)}deg) rotateY(${mix(fromY, 0, p)}deg)`, opacity: Math.min(1, p * 2) }}>
        {children}
      </div>
    </div>
  );
};
