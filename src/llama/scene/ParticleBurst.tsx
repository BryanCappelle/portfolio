import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMemo, type RefObject } from "react";
import {
  easing,
  resolveStep,
  type ActiveAnimationEvent,
  type AnimationRuntime,
} from "../animation";

type Props = {
  runtime: AnimationRuntime;
  elapsed: RefObject<number>;
};

type BurstTarget = {
  key: string;
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
  samples: THREE.Vector3[];
  directions: THREE.Vector3[];
  progressEasing: (progress: number) => number;
  /** Timeline step index, or null for a dispatched event. */
  stepIndex: number | null;
  event?: ActiveAnimationEvent;
};

const DEFAULT_PARTICLE_COUNT = 500;
const DEFAULT_SPREAD = 1.5;
const PARTICLE_SIZE = 0.035;
/** Slight lift so the dust falls instead of floating. */
const GRAVITY = 0.35;

function createBurst(
  curve: THREE.CatmullRomCurve3,
  particleCount: number,
  spread: number,
  color: string,
) {
  const points = curve.getPoints(Math.max(particleCount - 1, 1));
  const samples = points.slice(0, particleCount);
  const positions = new Float32Array(particleCount * 3);

  samples.forEach((sample, index) => {
    positions[index * 3] = sample.x;
    positions[index * 3 + 1] = sample.y;
    positions[index * 3 + 2] = sample.z;
  });

  const directions = samples.map(() =>
    new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(spread),
      THREE.MathUtils.randFloatSpread(spread),
      THREE.MathUtils.randFloatSpread(spread * 0.5),
    ).normalize(),
  );

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color,
    size: PARTICLE_SIZE,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    toneMapped: false,
  });

  return { geometry, material, samples, directions };
}

/** Turns a destroyed curve into a burst of particles that fades away. */
export default function ParticleBurst({ runtime, elapsed }: Props) {
  const targets = useMemo<BurstTarget[]>(() => {
    const fromTimeline = runtime.timeline.steps.flatMap((step, index) => {
      if (step.type !== "destroy") return [];

      return [
        {
          key: `step-${index}`,
          stepIndex: index,
          ...createBurst(
            step.curve,
            step.particleCount,
            step.spread,
            step.color,
          ),
          progressEasing: (progress: number) => easing(step.easing, progress),
        },
      ];
    });

    const fromEvents = runtime.events.flatMap((event) => {
      if (event.type !== "destroy") return [];

      return [
        {
          key: `event-${event.id}`,
          stepIndex: null,
          event,
          ...createBurst(
            event.curve,
            event.particleCount ?? DEFAULT_PARTICLE_COUNT,
            event.spread ?? DEFAULT_SPREAD,
            event.color,
          ),
          progressEasing: (progress: number) => easing(event.easing, progress),
        },
      ];
    });

    return [...fromTimeline, ...fromEvents];
  }, [runtime, runtime.revision]);

  useFrame(() => {
    const resolved = resolveStep(runtime.timeline, elapsed.current);

    for (const target of targets) {
      const rawProgress = resolveBurstProgress(target, resolved, runtime);
      if (rawProgress === null) continue;

      const progress = target.progressEasing(rawProgress);
      const position = target.geometry.attributes
        .position as THREE.BufferAttribute;

      target.samples.forEach((sample, index) => {
        const direction = target.directions[index];

        position.array[index * 3] = sample.x + direction.x * progress;
        position.array[index * 3 + 1] =
          sample.y + direction.y * progress + progress * progress * GRAVITY;
        position.array[index * 3 + 2] = sample.z + direction.z * progress;
      });

      position.needsUpdate = true;
      target.material.opacity = 1 - progress;
    }
  });

  return (
    <>
      {targets.map((target) => (
        <points
          key={target.key}
          geometry={target.geometry}
          material={target.material}
        />
      ))}
    </>
  );
}

/** 0 → 1 burst progress, or null when the burst has not started. */
function resolveBurstProgress(
  target: BurstTarget,
  resolved: ReturnType<typeof resolveStep>,
  runtime: AnimationRuntime,
) {
  if (target.event) {
    return THREE.MathUtils.clamp(
      (runtime.elapsed - target.event.startedAt) / target.event.duration,
      0,
      1,
    );
  }

  if (
    target.stepIndex === null ||
    !resolved ||
    resolved.index !== target.stepIndex
  ) {
    return null;
  }

  return resolved.localProgress;
}
