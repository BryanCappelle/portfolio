import type * as THREE from "three";
import { AnimationBuilder, type AnimationRuntime } from "../animation";

export const LLAMA_COLOR = "#dffaff";
export const WINK_COLOR = "#ff8bd1";

/** Camera path followed while the llama is being drawn. */
const DRAW_CAMERA_KEYFRAMES = [
  { t: 0, distance: 5.8, azimuth: -0.7, elevation: 0.35 },
  { t: 0.15, distance: 4.8, azimuth: -0.9, elevation: 0.55 },
  { t: 0.32, distance: 3.7, azimuth: -0.25, elevation: 0.3 },
  { t: 0.5, distance: 3.5, azimuth: 0.55, elevation: 0.5 },
  { t: 0.68, distance: 4.3, azimuth: 1.1, elevation: 0.65 },
  { t: 0.82, distance: 5.2, azimuth: 0.5, elevation: 0.35 },
  { t: 1, distance: 1, azimuth: 0, elevation: 0 },
];

/** Camera path that pulls back from the head to frame the whole llama. */
const REVEAL_CAMERA_KEYFRAMES = [
  { t: 0, distance: 5.2, azimuth: 0.5, elevation: 0.35 },
  { t: 1, distance: 1, azimuth: 0, elevation: 0 },
];

/**
 * The opening scene:
 * 1. draw the llama while the camera flies along its body,
 * 2. pull back to frame the whole animal,
 * 3. wink,
 * 4. settle.
 */
export function createIntroRuntime(
  llamaCurve: THREE.CatmullRomCurve3,
  winkCurve: THREE.CatmullRomCurve3,
): AnimationRuntime {
  return new AnimationBuilder()
    .draw(llamaCurve, {
      duration: 12,
      easing: "smooth",
      color: LLAMA_COLOR,
      showMarker: true,
      camera: { keyframes: DRAW_CAMERA_KEYFRAMES },
    })
    .reveal({
      duration: 2.5,
      easing: "smooth",
      keyframes: REVEAL_CAMERA_KEYFRAMES,
    })
    .wait(0.5)
    .draw(winkCurve, {
      duration: 1,
      easing: "ease-in-out",
      color: WINK_COLOR,
      showMarker: true,
    })
    .wait(1.5)
    .run();
}
