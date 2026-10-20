import { Easing, interpolate, spring } from "remotion";

// After Effects-like curves. Easing.bezier accepts y outside 0..1, so `back` overshoots.
export const EASE = {
  linear: (t: number) => t,
  easy: Easing.bezier(0.33, 0, 0.67, 1), // AE "Easy Ease"
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo out — default for entrances
  in: Easing.bezier(0.7, 0, 0.84, 0), // exits
  inOut: Easing.bezier(0.87, 0, 0.13, 1), // whips, camera moves
  back: Easing.bezier(0.34, 1.56, 0.64, 1), // overshoot
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 progress of an animation that starts at `start` and lasts `dur` frames. */
export const prog = (frame: number, start: number, dur: number, easing: (t: number) => number = EASE.out) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], { ...clamp, easing });

/** Springy 0→1 (overshoots when damping is low). */
export const pop = (frame: number, fps: number, delay = 0, damping = 12, stiffness = 180) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness, mass: 0.8 } });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Enter + hold + exit envelope: 0→1 over `inDur`, holds, 1→0 over `outDur` ending at `end`. */
export const envelope = (frame: number, start: number, end: number, inDur = 10, outDur = 8) =>
  Math.min(prog(frame, start, inDur), 1 - prog(frame, end - outDur, outDur, EASE.in));

/** Frames per beat for a given BPM. Place cuts on multiples of this. */
export const beatFrames = (bpm: number, fps: number) => (60 / bpm) * fps;
