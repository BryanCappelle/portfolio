import * as THREE from "three";
import {
  easing,
  resolveStep,
  type AnimationRuntime,
  type CameraKeyframe,
} from "../animation";

export type CameraPose = {
  /** How far the camera sits from the subject. */
  distance: number;
  /** Rotation around the vertical axis. */
  azimuth: number;
  /** Height above the horizontal plane. */
  elevation: number;
  /** 0 = flying along the drawing, 1 = framing the finished subject. */
  reveal: number;
};

const SETTLED_POSE: CameraPose = {
  distance: 1,
  azimuth: 0,
  elevation: 0,
  reveal: 1,
};

/** Catmull-Rom style interpolation of one camera property. */
function interpolate(
  keys: CameraKeyframe[],
  t: number,
  property: keyof CameraKeyframe,
) {
  let index = 0;

  while (index < keys.length - 2 && t > keys[index + 1].t) {
    index++;
  }

  const current = keys[index];
  const next = keys[index + 1];
  const previous = keys[Math.max(0, index - 1)];
  const after = keys[Math.min(keys.length - 1, index + 2)];

  const u = THREE.MathUtils.clamp((t - current.t) / (next.t - current.t), 0, 1);

  const value = current[property];
  const nextValue = next[property];
  const slopeIn = (nextValue - previous[property]) * 0.5;
  const slopeOut = (after[property] - value) * 0.5;

  const u2 = u * u;
  const u3 = u2 * u;

  return (
    (2 * u3 - 3 * u2 + 1) * value +
    (u3 - 2 * u2 + u) * slopeIn +
    (-2 * u3 + 3 * u2) * nextValue +
    (u3 - u2) * slopeOut
  );
}

function poseFromKeys(keys: CameraKeyframe[], t: number) {
  return {
    distance: interpolate(keys, t, "distance"),
    azimuth: interpolate(keys, t, "azimuth"),
    elevation: interpolate(keys, t, "elevation"),
  };
}

/**
 * Reads the camera instructions of the step playing right now. A step can
 * drive the camera in three ways: as a reveal, with a path attached to a draw
 * step, or as an orbit. Anything else keeps the camera settled.
 */
export function resolveCameraPose(
  runtime: AnimationRuntime,
  elapsed: number,
): CameraPose {
  const resolved = runtime.running
    ? resolveStep(runtime.timeline, elapsed)
    : null;

  if (!resolved) return SETTLED_POSE;

  const { step, localProgress } = resolved;

  if (step.type === "camera" && step.mode === "reveal") {
    const t = easing(step.easing, localProgress);

    if (step.keyframes.length >= 2) {
      return { ...poseFromKeys(step.keyframes, t), reveal: t };
    }

    return {
      distance: 5.2 - 4.2 * t,
      azimuth: 0.5 * (1 - t),
      elevation: 0.35 * (1 - t),
      reveal: t,
    };
  }

  if (step.type === "draw" && step.camera?.keyframes) {
    const t = easing(step.camera.easing ?? "linear", localProgress);

    return { ...poseFromKeys(step.camera.keyframes, t), reveal: 0 };
  }

  if (
    step.type === "camera" &&
    step.mode === "orbit" &&
    step.keyframes.length >= 2
  ) {
    const t = easing(step.easing, localProgress);

    return { ...poseFromKeys(step.keyframes, t), reveal: t >= 1 ? 1 : 0.5 };
  }

  return SETTLED_POSE;
}
