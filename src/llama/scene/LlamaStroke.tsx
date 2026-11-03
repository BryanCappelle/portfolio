import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import { easing, resolveStep, type AnimationRuntime } from "../animation";
import { createStrokeMesh, setStrokeProgress } from "./strokeMesh";
import { useIdleFloat, type IdleFloatConfig } from "./useIdleFloat";

type Props = {
  runtime: AnimationRuntime;
  elapsed: RefObject<number>;
  pointer: RefObject<THREE.Vector2>;
  /** Where the drawing head is, so the camera can follow it. */
  followTarget: RefObject<THREE.Vector3>;
  /** Exposed so the speech bubble can be anchored to the llama. */
  groupRef: RefObject<THREE.Group | null>;
  idle?: IdleFloatConfig;
};

/**
 * The llama itself: one tube per drawn curve, revealed progressively, plus
 * the glowing marker that travels along the stroke while it is drawn.
 */
export default function LlamaStroke({
  runtime,
  elapsed,
  pointer,
  followTarget,
  groupRef,
  idle,
}: Props) {
  const marker = useRef<THREE.Group>(null);

  const strokes = useMemo(
    () =>
      runtime.timeline.steps.flatMap((step, index) =>
        step.type === "draw"
          ? [{ step, index, mesh: createStrokeMesh(step.curve, step.color) }]
          : [],
      ),
    [runtime],
  );

  useIdleFloat(runtime, groupRef, pointer, idle);

  useFrame(() => {
    const resolved = resolveStep(runtime.timeline, elapsed.current);

    for (const stroke of strokes) {
      if (isHidden(stroke.step.curve, runtime, resolved?.index ?? -1)) {
        setStrokeProgress(stroke.mesh, 0);
      } else if (!resolved || stroke.index > resolved.index) {
        setStrokeProgress(stroke.mesh, 0);
      } else if (stroke.index < resolved.index) {
        setStrokeProgress(stroke.mesh, 1);
      } else {
        setStrokeProgress(
          stroke.mesh,
          easing(stroke.step.easing, resolved.localProgress),
        );
      }
    }

    const head = marker.current;
    if (!head) return;

    if (
      !resolved ||
      resolved.step.type !== "draw" ||
      !resolved.step.showMarker
    ) {
      head.visible = false;
      return;
    }

    const progress = easing(resolved.step.easing, resolved.localProgress);
    resolved.step.curve.getPointAt(progress, head.position);
    head.visible = true;
    followTarget.current.copy(head.position);
  });

  return (
    <group ref={groupRef}>
      {strokes.map((stroke) => (
        <primitive key={stroke.index} object={stroke.mesh} />
      ))}

      <group ref={marker}>
        <mesh>
          <sphereGeometry args={[0.045, 32, 32]} />
          <meshBasicMaterial color="white" toneMapped={false} />
        </mesh>
        <pointLight color="#dffaff" intensity={3} distance={2.5} decay={2} />
      </group>
    </group>
  );
}

/** A curve disappears once a destroy step or event has caught up with it. */
function isHidden(
  curve: THREE.CatmullRomCurve3,
  runtime: AnimationRuntime,
  currentStepIndex: number,
) {
  const destroyIndex = runtime.timeline.steps.findIndex(
    (step) => step.type === "destroy" && step.curve === curve,
  );

  if (destroyIndex !== -1 && currentStepIndex >= destroyIndex) return true;

  return runtime.events.some(
    (event) =>
      event.type === "destroy" &&
      event.curve === curve &&
      runtime.elapsed >= event.startedAt,
  );
}
