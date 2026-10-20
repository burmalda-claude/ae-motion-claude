import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { pop } from "./easing";

// Timing and sound come from tools/build.py:
//   src/timeline.json   — shot layout + the frame every spoken word starts/ends
//   public/audio/master.wav — mixed & mastered voice + SFX + music
// Shots only do visuals; they receive word frames as props so every animation lands on its word.

export type TimelineWord = { w: string; f: number; fe: number }; // frames, relative to the shot
export type TimelineShot = { id: string; from: number; dur: number; lead: number; words: TimelineWord[] };
export type TimelineData = { fps: number; total: number; shots: TimelineShot[] };

/** Props every shot receives. */
export type ShotProps = {
  /** Frame (relative to the shot) when spoken word #i starts. Past the end → last word. No voice → i * 8. */
  w: (i: number) => number;
  /** Frame when word #i ends. */
  we: (i: number) => number;
  /** Shot length in frames. */
  dur: number;
  words: TimelineWord[];
};

export const shotProps = (s: TimelineShot): ShotProps => {
  const at = (i: number, k: "f" | "fe") => (s.words.length ? s.words[Math.max(0, Math.min(i, s.words.length - 1))][k] : i * 8 + (k === "fe" ? 6 : 0));
  return { w: (i) => at(i, "f"), we: (i) => at(i, "fe"), dur: s.dur, words: s.words };
};

/** Plays every shot of the timeline with its component, plus the master audio. Unknown ids render a red warning card. */
export const TimelineShots: React.FC<{ timeline: TimelineData; shots: Record<string, React.FC<ShotProps>>; audio?: string | null }> = ({
  timeline,
  shots,
  audio = "audio/master.wav",
}) => (
  <>
    {timeline.shots.map((s) => {
      const Shot = shots[s.id];
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
          {Shot ? (
            <Shot {...shotProps(s)} />
          ) : (
            <AbsoluteFill style={{ background: "#300", color: "#f66", fontSize: 60, justifyContent: "center", alignItems: "center" }}>no shot component for “{s.id}”</AbsoluteFill>
          )}
        </Sequence>
      );
    })}
    {audio && <Audio src={staticFile(audio)} />}
  </>
);

/** Total duration helper for <Composition durationInFrames={...}>. */
export const timelineDuration = (t: TimelineData) => t.total;

/** TikTok-style captions: the word being spoken, big and centered, popping in on each word. */
export const Captions: React.FC<{ words: TimelineWord[]; style?: React.CSSProperties; highlight?: string; y?: string }> = ({ words, style, highlight = "#ff2a3d", y = "78%" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = words.findIndex((w) => frame >= w.f && frame < w.fe + 3);
  if (idx < 0) return null;
  const s = pop(frame, fps, words[idx].f, 11, 260);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: y,
          left: 0,
          right: 0,
          textAlign: "center",
          transform: `translateY(-50%) scale(${0.7 + 0.3 * s})`,
          fontSize: 96,
          fontWeight: 900,
          color: "#fff",
          WebkitTextStroke: "3px #000",
          textShadow: `0 6px 0 #000, 0 0 24px ${highlight}`,
          ...style,
        }}
      >
        {words[idx].w}
      </div>
    </AbsoluteFill>
  );
};

/** Extra one-off sound inside a shot, when you can't rebuild the master (prefer "sfx" cues in script.json). */
export const Sfx: React.FC<{ src: string; at?: number; volume?: number }> = ({ src, at = 0, volume = 0.6 }) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none">
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);
