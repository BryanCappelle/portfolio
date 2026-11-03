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

type FillTarget = {
  key: string;
  geometry: THREE.BufferGeometry;
  material: THREE.MeshBasicMaterial;
  opacity: number;
  easing: (progress: number) => number;
  /** Timeline step index, or null for a dispatched event. */
  stepIndex: number | null;
  /** Event start time, only used when `stepIndex` is null. */
  event?: ActiveAnimationEvent;
};

const CURVE_SAMPLES = 400;

function createFillGeometry(curve: THREE.CatmullRomCurve3) {
  const shape = new THREE.Shape();
  const points = curve.getPoints(CURVE_SAMPLES);

  points.forEach((point, index) => {
    if (index === 0) shape.moveTo(point.x, point.y);
    else shape.lineTo(point.x, point.y);
  });
  shape.closePath();

  return new THREE.ShapeGeometry(shape);
}

function createFillMaterial(color: string) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  });
}

/** Fills the area enclosed by a curve (the "paint bucket" of the timeline). */
export default function ShapeFill({ runtime, elapsed }: Props) {
  const targets = useMemo<FillTarget[]>(() => {
    const timelineTargets = runtime.timeline.steps.flatMap((step, index) => {
      if (step.type !== "fill") return [];

      return [
        {
          key: `step-${index}`,
          stepIndex: index,
          geometry: createFillGeometry(step.curve),
          material: createFillMaterial(step.color),
          opacity: step.opacity,
          easing: (progress: number) => easing(step.easing, progress),
        },
      ];
    });

    const eventTargets = runtime.events.flatMap((event) => {
      if (event.type !== "fill") return [];

      return [
        {
          key: `event-${event.id}`,
          stepIndex: null,
          event,
          geometry: createFillGeometry(event.curve),
          material: createFillMaterial(event.color),
          opacity: event.opacity ?? 0.35,
          easing: (progress: number) => easing(event.easing, progress),
        },
      ];
    });

    return [...timelineTargets, ...eventTargets];
  }, [runtime, runtime.revision]);

  useFrame(() => {
    const resolved = resolveStep(runtime.timeline, elapsed.current);

    for (const target of targets) {
      if (!target.event) {
        if (target.stepIndex === null) continue;

        if (!resolved || resolved.index < target.stepIndex) {
          target.material.opacity = 0;
        } else if (resolved.index > target.stepIndex) {
          target.material.opacity = target.opacity;
        } else {
          target.material.opacity =
            target.opacity * target.easing(resolved.localProgress);
        }

        continue;
      }

      const progress = THREE.MathUtils.clamp(
        (runtime.elapsed - target.event.startedAt) / target.event.duration,
        0,
        1,
      );

      target.material.opacity =
        progress >= 1
          ? target.opacity
          : target.opacity * target.easing(progress);
    }
  });

  return (
    <>
      {targets.map((target) => (
        <mesh
          key={target.key}
          geometry={target.geometry}
          material={target.material}
        />
      ))}
    </>
  );
}
