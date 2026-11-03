import type * as THREE from "three";

export type EasingName =
  | "linear"
  | "smooth"
  | "smooth-in"
  | "smooth-out"
  | "ease-in-out";

/** Where the camera sits at a given moment of the animation (t = 0 → 1). */
export type CameraKeyframe = {
  t: number;
  distance: number;
  azimuth: number;
  elevation: number;
};

export type CameraRigConfig = {
  keyframes: CameraKeyframe[];
  easing?: EasingName;
};

type StepTiming = {
  duration: number;
  easing: EasingName;
};

export type DrawStep = StepTiming & {
  type: "draw";
  curve: THREE.CatmullRomCurve3;
  color: string;
  showMarker: boolean;
  camera?: CameraRigConfig;
};

export type WaitStep = {
  type: "wait";
  duration: number;
};

export type CameraStep = StepTiming & {
  type: "camera";
  mode: "reveal" | "orbit" | "hold";
  keyframes: CameraKeyframe[];
};

export type DestroyStep = StepTiming & {
  type: "destroy";
  curve: THREE.CatmullRomCurve3;
  color: string;
  particleCount: number;
  spread: number;
};

export type FillStep = StepTiming & {
  type: "fill";
  curve: THREE.CatmullRomCurve3;
  color: string;
  opacity: number;
};

export type AnimationStep =
  | DrawStep
  | WaitStep
  | CameraStep
  | DestroyStep
  | FillStep;

export type AnimationTimeline = {
  steps: AnimationStep[];
  duration: number;
};

/**
 * Mutable state of a running timeline. The scene reads it every frame;
 * `dispatch` injects new events (destroy / fill) after the timeline ended.
 */
export type AnimationRuntime = {
  timeline: AnimationTimeline;
  elapsed: number;
  progress: number;
  running: boolean;
  finished: boolean;
  destroyed: boolean;
  destroyedCurves: Set<THREE.CatmullRomCurve3>;
  revision: number;
  events: ActiveAnimationEvent[];
  skip: () => void;
  dispatch: (...events: AnimationEventDispatch[]) => boolean;
  isDestroyed: (curve: THREE.CatmullRomCurve3) => boolean;
};

export const AnimationEventType = {
  Destroy: "destroy",
  Fill: "fill",
} as const;

export type AnimationEventType =
  (typeof AnimationEventType)[keyof typeof AnimationEventType];

export type DestroyAnimationEventDispatch = {
  type: typeof AnimationEventType.Destroy;
  curve: THREE.CatmullRomCurve3;
  duration?: number;
  easing?: EasingName;
  color?: string;
  particleCount?: number;
  spread?: number;
};

export type FillAnimationEventDispatch = {
  type: typeof AnimationEventType.Fill;
  curve: THREE.CatmullRomCurve3;
  duration?: number;
  easing?: EasingName;
  color?: string;
  opacity?: number;
};

export type AnimationEventDispatch =
  | DestroyAnimationEventDispatch
  | FillAnimationEventDispatch;

export type ActiveAnimationEvent = {
  id: number;
  type: AnimationEventType;
  curve: THREE.CatmullRomCurve3;
  startedAt: number;
  duration: number;
  easing: EasingName;
  color: string;
  particleCount?: number;
  spread?: number;
  opacity?: number;
};
