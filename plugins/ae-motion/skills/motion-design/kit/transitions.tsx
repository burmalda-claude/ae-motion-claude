import React from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { EASE, mix } from "./easing";
import { Smear } from "./fx";

// Custom presentations for <TransitionSeries.Transition presentation={...} />.
// Use with linearTiming({ durationInFrames: 8–14 }) — the curves are applied here.

type WhipProps = { direction?: "left" | "right" | "up" | "down" };

const WhipComp: React.FC<TransitionPresentationComponentProps<WhipProps>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const d = passedProps.direction ?? "left";
  const sx = d === "left" ? -1 : d === "right" ? 1 : 0;
  const sy = d === "up" ? -1 : d === "down" ? 1 : 0;
  const p = EASE.inOut(presentationProgress);
  const off = presentationDirection === "entering" ? 1 - p : -p; // in units of frame size
  const blur = Math.sin(presentationProgress * Math.PI) * 60;
  return (
    <AbsoluteFill style={{ transform: `translate(${-sx * off * 100}%, ${-sy * off * 100}%)` }}>
      <Smear x={sx ? blur : 0} y={sy ? blur : 0} style={{ width: "100%", height: "100%" }}>
        <AbsoluteFill>{children}</AbsoluteFill>
      </Smear>
    </AbsoluteFill>
  );
};
/** Whip pan: both shots slide with heavy directional blur. direction = where the picture travels ("left" = new shot comes in from the right). */
export const whip = (props: WhipProps = {}): TransitionPresentation<WhipProps> => ({ component: WhipComp, props });

type ZoomProps = { scale?: number };
const ZoomComp: React.FC<TransitionPresentationComponentProps<ZoomProps>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const k = passedProps.scale ?? 3;
  const p = EASE.inOut(presentationProgress);
  const entering = presentationDirection === "entering";
  const s = entering ? mix(1 / k, 1, p) : mix(1, k, p);
  const o = entering ? Math.min(1, p * 2) : 1 - Math.max(0, p * 2 - 1);
  const blur = Math.sin(presentationProgress * Math.PI) * 18;
  return <AbsoluteFill style={{ transform: `scale(${s})`, opacity: o, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>;
};
/** Zoom-through: outgoing shot flies into the lens, incoming grows from the center. */
export const zoomThrough = (props: ZoomProps = {}): TransitionPresentation<ZoomProps> => ({ component: ZoomComp, props });

type SliceProps = { slices?: number; color?: string };
const SliceComp: React.FC<TransitionPresentationComponentProps<SliceProps>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const n = passedProps.slices ?? 6;
  if (presentationDirection === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      {Array.from({ length: n }, (_, i) => {
        const p = EASE.out(Math.min(1, Math.max(0, presentationProgress * 1.6 - (i / n) * 0.6)));
        return (
          <AbsoluteFill
            key={i}
            style={{ clipPath: `inset(${(i / n) * 100}% 0 ${100 - ((i + 1) / n) * 100}% 0)`, transform: `translateX(${(i % 2 ? 1 : -1) * (1 - p) * 100}%)` }}
          >
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
/** Incoming shot slides in as alternating horizontal slices. */
export const slices = (props: SliceProps = {}): TransitionPresentation<SliceProps> => ({ component: SliceComp, props });

type StreakProps = { axis?: "x" | "y" };
const StreakComp: React.FC<TransitionPresentationComponentProps<StreakProps>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const vertical = (passedProps.axis ?? "y") === "y";
  const p = EASE.inOut(presentationProgress);
  const entering = presentationDirection === "entering";
  const k = entering ? 1 - p : p; // 0 = settled, 1 = fully streaked
  const st = 1 + k * 7;
  const blur = k * 70;
  return (
    <AbsoluteFill style={{ opacity: entering ? Math.min(1, p * 2.5) : 1 - Math.max(0, p * 2 - 1), transform: vertical ? `scaleY(${st})` : `scaleX(${st})` }}>
      <Smear x={vertical ? 0 : blur} y={vertical ? blur : 0} style={{ width: "100%", height: "100%" }}>
        <AbsoluteFill>{children}</AbsoluteFill>
      </Smear>
    </AbsoluteFill>
  );
};
/** Column/row streak: the picture stretches into motion-blurred bars and snaps back (kinetic trailer cut). */
export const streak = (props: StreakProps = {}): TransitionPresentation<StreakProps> => ({ component: StreakComp, props });

const ZoomBlurComp: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = EASE.inOut(presentationProgress);
  const entering = presentationDirection === "entering";
  const s = entering ? mix(0.4, 1, p) : mix(1, 2.6, p);
  const amt = Math.sin(presentationProgress * Math.PI);
  const o = entering ? Math.min(1, p * 2) : 1 - Math.max(0, p * 2 - 1);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {[3, 2, 1].map((i) => (
        <AbsoluteFill key={i} style={{ transform: `scale(${s * (1 + i * 0.08 * amt)})`, opacity: 0.3 * amt, filter: `blur(${4 * i}px)` }}>
          {children}
        </AbsoluteFill>
      ))}
      <AbsoluteFill style={{ transform: `scale(${s})`, filter: `blur(${amt * 6}px)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
/** Radial zoom blur: outgoing rushes into the lens with echo trails, incoming lands from behind. */
export const zoomBlur = (): TransitionPresentation<Record<string, never>> => ({ component: ZoomBlurComp, props: {} });
