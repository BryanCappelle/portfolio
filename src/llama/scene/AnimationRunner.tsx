import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type { AnimationRuntime } from "../animation";

type Props = {
  runtime: AnimationRuntime;
  /** Seconds elapsed in the timeline, shared with every scene component. */
  elapsed: RefObject<number>;
  /** 0 → 1 progress of the timeline. */
  progress: RefObject<number>;
  /** Called once, the first time the timeline reaches its end. */
  onFinish?: () => void;
};

/** Advances the timeline clock every frame. Renders nothing. */
export default function AnimationRunner({
  runtime,
  elapsed,
  progress,
  onFinish,
}: Props) {
  const announced = useRef(false);

  useFrame((_, delta) => {
    if (!runtime.running) return;

    const lastEventEnd = runtime.events.reduce(
      (latest, event) => Math.max(latest, event.startedAt + event.duration),
      runtime.timeline.duration,
    );

    runtime.elapsed = Math.min(runtime.elapsed + delta, lastEventEnd);
    runtime.progress =
      runtime.timeline.duration > 0
        ? runtime.elapsed / runtime.timeline.duration
        : 0;

    elapsed.current = runtime.elapsed;
    progress.current = runtime.progress;

    if (runtime.elapsed >= runtime.timeline.duration) {
      runtime.finished = true;

      if (!announced.current) {
        announced.current = true;
        onFinish?.();
      }
    }

    if (runtime.elapsed >= lastEventEnd) {
      runtime.running = false;
    }
  });

  return null;
}
