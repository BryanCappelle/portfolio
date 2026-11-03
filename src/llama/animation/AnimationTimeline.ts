import type * as THREE from "three";

export type EasingName =
  | "linear"
  | "smooth"
  | "smooth-in"
  | "smooth-out"
  | "ease-in-out";

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

export type DrawStep = {
  type: "draw";
  curve: THREE.CatmullRomCurve3;
  duration: number;
  easing: EasingName;
  color: string;
  showMarker: boolean;
  camera?: CameraRigConfig;
};

export type WaitStep = {
  type: "wait";
  duration: number;
};

export type CameraStep = {
  type: "camera";
  mode: "reveal" | "orbit" | "hold";
  duration: number;
  easing: EasingName;
  keyframes: CameraKeyframe[];
};

export type DestroyStep = {
  type: "destroy";
  curve: THREE.CatmullRomCurve3;
  duration: number;
  easing: EasingName;
  color: string;
  particleCount: number;
  spread: number;
};

export type FillStep = {
  type: "fill";
  curve: THREE.CatmullRomCurve3;
  duration: number;
  easing: EasingName;
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

export function easing(name: EasingName, value: number) {
  const t = Math.max(0, Math.min(1, value));

  switch (name) {
    case "smooth":
      return t * t * (3 - 2 * t);
    case "smooth-in":
      return t * t;
    case "smooth-out":
      return 1 - (1 - t) * (1 - t);
    case "ease-in-out":
      return -(Math.cos(Math.PI * t) - 1) / 2;
    default:
      return t;
  }
}

export class AnimationBuilder {
  private steps: AnimationStep[] = [];

  draw(
    curve: THREE.CatmullRomCurve3,
    options: {
      duration?: number;
      easing?: EasingName;
      color?: string;
      showMarker?: boolean;
      camera?: CameraRigConfig;
    } = {},
  ) {
    this.steps.push({
      type: "draw",
      curve,
      duration: options.duration ?? 3,
      easing: options.easing ?? "smooth",
      color: options.color ?? "#dffaff",
      showMarker: options.showMarker ?? true,
      camera: options.camera,
    });
    return this;
  }

  wait(duration = 1) {
    this.steps.push({ type: "wait", duration });
    return this;
  }

  destroy(
    curve: THREE.CatmullRomCurve3,
    options: {
      duration?: number;
      easing?: EasingName;
      color?: string;
      particleCount?: number;
      spread?: number;
    } = {},
  ) {
    this.steps.push({
      type: "destroy",
      curve,
      duration: options.duration ?? 2,
      easing: options.easing ?? "smooth-out",
      color: options.color ?? "#dffaff",
      particleCount: options.particleCount ?? 500,
      spread: options.spread ?? 1.5,
    });
    return this;
  }

  fill(
    curve: THREE.CatmullRomCurve3,
    options: {
      duration?: number;
      easing?: EasingName;
      color?: string;
      opacity?: number;
    } = {},
  ) {
    this.steps.push({
      type: "fill",
      curve,
      duration: options.duration ?? 2,
      easing: options.easing ?? "smooth",
      color: options.color ?? "#dffaff",
      opacity: options.opacity ?? 0.35,
    });
    return this;
  }

  reveal(
    durationOrOptions:
      | number
      | {
          duration?: number;
          easing?: EasingName;
          keyframes?: CameraKeyframe[];
        } = 2,
    easingName: EasingName = "smooth",
    keyframes: CameraKeyframe[] = [],
  ) {
    const options =
      typeof durationOrOptions === "number"
        ? {
            duration: durationOrOptions,
            easing: easingName,
            keyframes,
          }
        : durationOrOptions;

    this.steps.push({
      type: "camera",
      mode: "reveal",
      duration: options.duration ?? 2,
      easing: options.easing ?? "smooth",
      keyframes: options.keyframes ?? [],
    });
    return this;
  }

  holdCamera(duration = 1) {
    this.steps.push({
      type: "camera",
      mode: "hold",
      duration,
      easing: "linear",
      keyframes: [],
    });
    return this;
  }

  orbit(
    duration = 3,
    keyframes: CameraKeyframe[] = [],
    easing: EasingName = "smooth",
  ) {
    this.steps.push({
      type: "camera",
      mode: "orbit",
      duration,
      easing,
      keyframes,
    });
    return this;
  }

  build(): AnimationTimeline {
    return {
      steps: [...this.steps],
      duration: this.steps.reduce((total, step) => total + step.duration, 0),
    };
  }

  run(): AnimationRuntime {
    const runtime: AnimationRuntime = {
      timeline: this.build(),
      elapsed: 0,
      progress: 0,
      running: true,
      finished: false,
      destroyed: false,
      destroyedCurves: new Set(),
      revision: 0,
      events: [],
      dispatch: () => false,
      isDestroyed: () => false,
    };

    runtime.isDestroyed = (curve) => runtime.destroyedCurves.has(curve);

    runtime.dispatch = (...events) => {
      if (!runtime.finished || events.length === 0) return false;

      let dispatched = false;

      for (const event of events) {
        if (
          event.type === AnimationEventType.Destroy &&
          runtime.isDestroyed(event.curve)
        ) {
          continue;
        }

        const activeEvent: ActiveAnimationEvent = {
          id: runtime.events.length,
          type: event.type,
          curve: event.curve,
          startedAt: runtime.elapsed,
          duration:
            event.duration ??
            (event.type === AnimationEventType.Destroy ? 2 : 1.5),
          easing:
            event.easing ??
            (event.type === AnimationEventType.Destroy
              ? "smooth-out"
              : "smooth"),
          color: event.color ?? "#dffaff",
          particleCount:
            "particleCount" in event ? (event.particleCount ?? 500) : undefined,
          spread: "spread" in event ? (event.spread ?? 1.5) : undefined,
          opacity: "opacity" in event ? (event.opacity ?? 0.35) : undefined,
        };

        runtime.events.push(activeEvent);
        if (event.type === AnimationEventType.Destroy) {
          runtime.destroyed = true;
          runtime.destroyedCurves.add(event.curve);
        }
        dispatched = true;
      }

      if (!dispatched) return false;

      runtime.revision += 1;
      runtime.running = true;
      return true;
    };

    return runtime;
  }
}

export function resolveStep(timeline: AnimationTimeline, elapsed: number) {
  let cursor = 0;

  for (let index = 0; index < timeline.steps.length; index++) {
    const step = timeline.steps[index];
    const end = cursor + step.duration;

    if (elapsed < end || index === timeline.steps.length - 1) {
      return {
        index,
        step,
        localTime: elapsed - cursor,
        localProgress:
          step.duration === 0
            ? 1
            : Math.max(0, Math.min(1, (elapsed - cursor) / step.duration)),
      };
    }

    cursor = end;
  }

  return null;
}
