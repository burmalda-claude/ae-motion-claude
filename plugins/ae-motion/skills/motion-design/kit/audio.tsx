import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, pop } from "./easing";

// ---------- Voice data (written by tools/voice.py into src/voice.json) ----------
export type VoiceWord = { w: string; start: number; end: number }; // seconds, relative to the line's audio
export type VoiceLine = { file: string; text: string; duration: number; words: VoiceWord[] };
export type VoiceData = { voice: string; lines: Record<string, VoiceLine> };

/** Props every shot receives from <VoiceTimeline>. */
export type ShotProps = {
  /** Frame (relative to the shot) when spoken word #i starts. Past the end → last word. No voice → i * 8. */
  w: (i: number) => number;
  /** Frame when word #i ends. */
  we: (i: number) => number;
  /** Shot length in frames. */
  dur: number;
  line?: VoiceLine;
};

export type Beat = {
  id: string;
  Shot: React.FC<ShotProps>;
  vo?: string; // key in voice.lines
  min?: number; // minimum frames
  tail?: number; // frames after the voice line ends (default 6)
  lead?: number; // frames before the voice starts (default 3)
  sfx?: { name: string; at: number | ((p: ShotProps) => number); volume?: number; rate?: number }[];
};

/** Seconds until the last word ends (TTS audio files have trailing silence). */
export const spokenEnd = (line: VoiceLine) => (line.words.length ? line.words[line.words.length - 1].end + 0.1 : line.duration);

export type Placed = { beat: Beat; from: number; dur: number; props: ShotProps };

/** Lays beats end to end; each shot is as long as its voice line (+lead/tail) or `min`, whichever is longer. */
export function layoutBeats(beats: Beat[], voice: VoiceData | undefined, fps: number): { placed: Placed[]; total: number } {
  let from = 0;
  const placed = beats.map((beat) => {
    const line = beat.vo ? voice?.lines[beat.vo] : undefined;
    const lead = beat.lead ?? 3;
    const wf = (i: number, key: "start" | "end") => {
      if (!line || line.words.length === 0) return i * 8 + (key === "end" ? 6 : 0);
      const word = line.words[Math.max(0, Math.min(i, line.words.length - 1))];
      return lead + Math.round(word[key] * fps);
    };
    // TTS files carry ~0.7 s of trailing silence; pace shots by the last spoken word instead
    const voiceFrames = line ? lead + Math.ceil(spokenEnd(line) * fps) + (beat.tail ?? 6) : 0;
    const dur = Math.max(beat.min ?? 20, voiceFrames);
    const props: ShotProps = { w: (i) => wf(i, "start"), we: (i) => wf(i, "end"), dur, line };
    const p = { beat, from, dur, props };
    from += dur;
    return p;
  });
  return { placed, total: from };
}

/** Renders laid-out beats: shot visuals, its voice line and its sound effects. Optional music bed with ducking under the voice. */
export const VoiceTimeline: React.FC<{
  placed: Placed[];
  music?: string; // e.g. "music/beat.wav"
  musicVolume?: number;
  duckTo?: number; // music volume multiplier while voice plays
  voiceVolume?: number;
}> = ({ placed, music, musicVolume = 0.35, duckTo = 0.45, voiceVolume = 1 }) => {
  const { fps } = useVideoConfig();
  // frames where voice is active, for ducking
  const spans = placed
    .filter((p) => p.props.line)
    .map((p) => [p.from + (p.beat.lead ?? 3), p.from + (p.beat.lead ?? 3) + Math.ceil(spokenEnd(p.props.line!) * fps)] as const);
  const duck = (f: number) => {
    let k = 1;
    for (const [a, b] of spans) {
      const inside = interpolate(f, [a - 4, a, b, b + 8], [0, 1, 1, 0], clamp);
      k = Math.min(k, 1 - (1 - duckTo) * inside);
    }
    return k;
  };
  return (
    <>
      {placed.map(({ beat, from, dur, props }) => (
        <Sequence key={beat.id} from={from} durationInFrames={dur} name={beat.id}>
          <beat.Shot {...props} />
          {props.line && (
            <Sequence from={beat.lead ?? 3} layout="none">
              <Audio src={staticFile(props.line.file)} volume={voiceVolume} />
            </Sequence>
          )}
          {beat.sfx?.map((s, i) => (
            <Sfx key={i} name={s.name} at={typeof s.at === "function" ? s.at(props) : s.at} volume={s.volume} rate={s.rate} />
          ))}
        </Sequence>
      ))}
      {music && <Audio src={staticFile(music)} volume={(f) => musicVolume * duck(f) * interpolate(f, [0, 15], [0, 1], clamp)} />}
    </>
  );
};

/** One-shot sound effect from public/sfx/<name>.wav at a frame (relative to the parent Sequence). */
export const Sfx: React.FC<{ name: string; at?: number; volume?: number; rate?: number }> = ({ name, at = 0, volume = 0.6, rate = 1 }) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} playbackRate={rate} />
  </Sequence>
);

/** Keystroke sounds for a typewriter: one `key` sfx every `every` frames from `at` for `count` keys. */
export const TypingSfx: React.FC<{ at?: number; count: number; every?: number; volume?: number }> = ({ at = 0, count, every = 2, volume = 0.35 }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <Sfx key={i} name="key" at={at + i * every} volume={volume * (0.7 + ((i * 37) % 10) / 30)} rate={0.9 + ((i * 53) % 10) / 40} />
    ))}
  </>
);

/** TikTok-style captions: the word being spoken, big and centered, popping in on each word. */
export const Captions: React.FC<{ line: VoiceLine; lead?: number; style?: React.CSSProperties; highlight?: string; y?: string }> = ({
  line,
  lead = 3,
  style,
  highlight = "#ff2a3d",
  y = "78%",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - lead) / fps;
  const idx = line.words.findIndex((w) => t >= w.start && t < w.end + 0.08);
  if (idx < 0) return null;
  const word = line.words[idx];
  const s = pop(frame, fps, lead + Math.round(word.start * fps), 11, 260);
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
        {word.w}
      </div>
    </AbsoluteFill>
  );
};
