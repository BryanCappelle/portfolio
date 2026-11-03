import * as THREE from "three";

const STROKE_SAMPLES = 1200;
const STROKE_RADIUS = 0.012;
const RADIAL_SEGMENTS = 8;

/** A tube mesh that can be revealed gradually with `setStrokeProgress`. */
export function createStrokeMesh(curve: THREE.CatmullRomCurve3, color: string) {
  const geometry = new THREE.TubeGeometry(
    curve,
    STROKE_SAMPLES,
    STROKE_RADIUS,
    RADIAL_SEGMENTS,
    false,
  );

  geometry.setDrawRange(0, 0);

  const material = new THREE.MeshBasicMaterial({
    color,
    toneMapped: false,
  });

  return new THREE.Mesh(geometry, material);
}

/** 0 hides the stroke entirely, 1 shows all of it. */
export function setStrokeProgress(mesh: THREE.Mesh, progress: number) {
  const segments = Math.floor(progress * STROKE_SAMPLES);
  mesh.geometry.setDrawRange(0, segments * RADIAL_SEGMENTS * 6);
}
