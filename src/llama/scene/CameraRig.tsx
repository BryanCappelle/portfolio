import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import type { AnimationRuntime } from "../animation";
import { resolveCameraPose } from "./cameraPose";

type Props = {
  /** The drawn subject the camera frames when the intro is over. */
  curve: THREE.CatmullRomCurve3;
  elapsed: RefObject<number>;
  /** Point the camera follows while the subject is being drawn. */
  followTarget: RefObject<THREE.Vector3>;
  runtime: AnimationRuntime;
};

const IDLE_FOV = 42;
const MARGIN_DESKTOP = 1.2;
const MARGIN_MOBILE = 1.45;
const MOBILE_ASPECT = 0.75;

/**
 * Moves the camera along the timeline. While a curve is drawn the camera
 * follows the drawing head; once it settles, it frames the whole subject so
 * nothing gets cropped on narrow screens.
 */
export default function CameraRig({
  curve,
  elapsed,
  followTarget,
  runtime,
}: Props) {
  const target = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);
  const currentLook = useMemo(() => new THREE.Vector3(), []);
  const initialized = useRef(false);

  const bounds = useMemo(() => {
    const box = new THREE.Box3().setFromPoints(curve.getPoints(200));
    const center = box.getCenter(new THREE.Vector3());
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);

    return { center, radius: sphere.radius };
  }, [curve]);

  useFrame(({ camera, size }, delta) => {
    const pose = resolveCameraPose(runtime, elapsed.current);
    const { center, radius } = bounds;

    const horizontal = Math.cos(pose.elevation) * pose.distance;
    const orbitOffset = new THREE.Vector3(
      Math.sin(pose.azimuth) * horizontal,
      Math.sin(pose.elevation) * pose.distance,
      Math.cos(pose.azimuth) * horizontal,
    );

    target.copy(followTarget.current).lerp(center, pose.reveal);

    const view = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(size.height, 1);
    const verticalFov = THREE.MathUtils.degToRad(view.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
    const limitingFov = Math.min(verticalFov, horizontalFov) / 2;
    const margin = aspect < MOBILE_ASPECT ? MARGIN_MOBILE : MARGIN_DESKTOP;
    const framingDistance = (radius / Math.sin(limitingFov)) * margin;

    desiredPosition
      .copy(target)
      .addScaledVector(orbitOffset, 1 - pose.reveal)
      .addScaledVector(new THREE.Vector3(0, 0, framingDistance), pose.reveal);

    desiredLook.copy(target);

    if (!initialized.current) {
      camera.position.copy(desiredPosition);
      currentLook.copy(desiredLook);
      initialized.current = true;
    }

    // Frame-rate independent smoothing.
    camera.position.lerp(desiredPosition, 1 - Math.exp(-delta * 6));
    currentLook.lerp(desiredLook, 1 - Math.exp(-delta * 7));
    camera.lookAt(currentLook);

    view.fov = THREE.MathUtils.damp(view.fov, IDLE_FOV, 3, delta);
    view.updateProjectionMatrix();
  });

  return null;
}
