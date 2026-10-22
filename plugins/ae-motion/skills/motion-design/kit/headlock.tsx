// Head lock: the video moves so the tracked head stays in the centre; the picture repeats as a seamless tile (what leaves on the
// right comes back on the left), so the frame never shows black. Track from tools/headtrack.py.
import React from "react";
import { AbsoluteFill, OffthreadVideo, useCurrentFrame, useVideoConfig } from "remotion";

export type HeadTrack = { fps: number; width: number; height: number; frames: number; center: number[][]; size: number[] };

/** Tracked head centre (0..1) at composition frame f. */
export const headAt = (track: HeadTrack, f: number, fps: number, startFrom = 0) => {
  const i = Math.min(track.frames - 1, Math.max(0, Math.round(((f + startFrom) / fps) * track.fps)));
  return track.center[i];
};

/**
 * src: staticFile(...) of the video; track: JSON from headtrack.py; startFrom: video frame (composition fps) to start at.
 * zoom: scale over "cover" (1 = video covers the frame). follow: 1 = head locked to the centre, 0.5 = halfway.
 * mirror: neighbour tiles are flipped, so the edges meet without a seam (a reflected world instead of a copy).
 * at: where the head is held, 0..1 of the composition (default centre).
 */
export const HeadLock: React.FC<{ src: string; track: HeadTrack; startFrom?: number; zoom?: number; follow?: number; mirror?: boolean; at?: [number, number]; muted?: boolean; style?: React.CSSProperties }> = ({
  src,
  track,
  startFrom = 0,
  zoom = 1,
  follow = 1,
  mirror = false,
  at = [0.5, 0.5],
  muted = true,
  style,
}) => {
  const f = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const s = Math.max(W / track.width, H / track.height) * zoom;
  const tw = track.width * s;
  const th = track.height * s;
  const [cx, cy] = headAt(track, f, fps, startFrom);
  // tile origin that puts the head at `at`; follow < 1 blends towards the plain centred video
  const ox = ((W - tw) / 2) * (1 - follow) + (W * at[0] - cx * tw) * follow;
  const oy = ((H - th) / 2) * (1 - follow) + (H * at[1] - cy * th) * follow;
  const x0 = ox - Math.ceil(ox / tw) * tw; // first tile column at or left of 0
  const y0 = oy - Math.ceil(oy / th) * th;
  const tiles: React.ReactNode[] = [];
  for (let x = x0; x < W; x += tw)
    for (let y = y0; y < H; y += th) {
      const kx = Math.round((x - ox) / tw); // tile index relative to the "home" tile, for mirroring
      const ky = Math.round((y - oy) / th);
      const flip = mirror ? `scale(${kx % 2 ? -1 : 1}, ${ky % 2 ? -1 : 1})` : undefined;
      tiles.push(
        <div key={`${kx},${ky}`} style={{ position: "absolute", left: x, top: y, width: tw, height: th, transform: flip }}>
          <OffthreadVideo src={src} trimBefore={startFrom} muted={muted || kx !== 0 || ky !== 0} style={{ width: "100%", height: "100%" }} />
        </div>,
      );
    }
  return <AbsoluteFill style={{ overflow: "hidden", background: "#000", ...style }}>{tiles}</AbsoluteFill>;
};
