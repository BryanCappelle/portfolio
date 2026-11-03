import type * as THREE from "three";
import type {
  ActiveAnimationEvent,
  AnimationEventDispatch,
  AnimationRuntime,
  AnimationStep,
  AnimationTimeline,
  CameraKeyframe,
  EasingName,
} from "./types";
import { AnimationEventType } from "./types";

/**
 * Fluent authoring helper.
 *
 * ```ts
 * new AnimationBuilder().draw(curve).wait(1).reveal(2).run();
 * ```
 */
export class AnimationBuilder {
  private steps: AnimationStep[] = [];

  draw(
    curve: THREE.CatmullRomCurve3,
    options: {
      duration?: number;
      easing?: EasingName;
      color?: string;
      showMarker?: boolean;
      camera?: { keyframes: CameraKeyframe[]; easing?: EasingName };
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
        ? { duration: durationOrOptions, easing: easingName, keyframes }
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

        runtime.events.push(
          toActiveEvent(event, runtime.events.length, runtime.elapsed),
        );
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

function toActiveEvent(
  event: AnimationEventDispatch,
  id: number,
  startedAt: number,
): ActiveAnimationEvent {
  const isDestroy = event.type === AnimationEventType.Destroy;

  return {
    id,
    type: event.type,
    curve: event.curve,
    startedAt,
    duration: event.duration ?? (isDestroy ? 2 : 1.5),
    easing: event.easing ?? (isDestroy ? "smooth-out" : "smooth"),
    color: event.color ?? "#dffaff",
    particleCount:
      "particleCount" in event ? (event.particleCount ?? 500) : undefined,
    spread: "spread" in event ? (event.spread ?? 1.5) : undefined,
    opacity: "opacity" in event ? (event.opacity ?? 0.35) : undefined,
  };
}
