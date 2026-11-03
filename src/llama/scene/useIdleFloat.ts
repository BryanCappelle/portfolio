import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type { AnimationRuntime } from "../animation";

export type IdleFloatConfig = {
  enabled?: boolean;
  /** Vertical breathing amplitude, in scene units. */
  floatAmplitude?: number;
  floatFrequency?: number;
  swayAmplitude?: number;
  /** How far the head drifts towards the cursor. */
  mouseRange?: number;
  springStiffness?: number;
  springDamping?: number;
};

const DEFAULTS: Required<IdleFloatConfig> = {
  enabled: true,
  floatAmplitude: 0.055,
  floatFrequency: 1.15,
  swayAmplitude: 0.018,
  mouseRange: 0.12,
  springStiffness: 130,
  springDamping: 10,
};

/**
 * Gives the finished llama a life of its own: it floats, sways and leans
 * towards the cursor with a light spring, but only once the intro is over.
 */
export function useIdleFloat(
  runtime: AnimationRuntime,
  groupRef: RefObject<THREE.Group | null>,
  pointer: RefObject<THREE.Vector2>,
  config: IdleFloatConfig = {},
) {
  const position = useRef(new THREE.Vector2());
  const velocity = useRef(new THREE.Vector2());
  const options = { ...DEFAULTS, ...config };

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group || !runtime.finished || runtime.destroyed) return;

    if (!options.enabled) {
      group.position.set(0, 0, 0);
      group.rotation.set(0, 0, 0);
      return;
    }

    const target = new THREE.Vector2(
      pointer.current.x * options.mouseRange,
      pointer.current.y * options.mouseRange,
    );

    velocity.current.x +=
      (target.x - position.current.x) * options.springStiffness * delta;
    velocity.current.y +=
      (target.y - position.current.y) * options.springStiffness * delta;
    velocity.current.multiplyScalar(Math.exp(-options.springDamping * delta));
    position.current.addScaledVector(velocity.current, delta);

    const time = clock.elapsedTime;
    const breathing = Math.sin(time * options.floatFrequency * Math.PI * 2);

    group.position.set(
      position.current.x + breathing * options.floatAmplitude * 0.3,
      position.current.y + breathing * options.floatAmplitude,
      0,
    );

    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      -pointer.current.y * 0.025,
      8,
      delta,
    );
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      pointer.current.x * 0.035,
      8,
      delta,
    );
    group.rotation.z = THREE.MathUtils.damp(
      group.rotation.z,
      Math.sin(time * options.floatFrequency * Math.PI) *
        options.swayAmplitude +
        velocity.current.x * 0.018,
      10,
      delta,
    );
  });
}
