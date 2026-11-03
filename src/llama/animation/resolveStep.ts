import type { AnimationStep, AnimationTimeline } from "./types";

export type ResolvedStep = {
  index: number;
  step: AnimationStep;
  localTime: number;
  localProgress: number;
};

/** Finds the timeline step playing at `elapsed` seconds. */
export function resolveStep(
  timeline: AnimationTimeline,
  elapsed: number,
): ResolvedStep | null {
  let cursor = 0;

  for (let index = 0; index < timeline.steps.length; index++) {
    const step = timeline.steps[index];
    const end = cursor + step.duration;

    if (elapsed < end || index === timeline.steps.length - 1) {
      const localTime = elapsed - cursor;

      return {
        index,
        step,
        localTime,
        localProgress:
          step.duration === 0
            ? 1
            : Math.max(0, Math.min(1, localTime / step.duration)),
      };
    }

    cursor = end;
  }

  return null;
}
