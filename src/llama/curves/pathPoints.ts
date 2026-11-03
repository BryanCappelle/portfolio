import * as THREE from "three";

/** A point in the original 2D drawing space of the llama illustration. */
export type Point = [number, number];

export const CURVE_TENSION = 0.12;
export const CURVE_DEPTH_Y = 0.16;

/** Straight line sampled from `start` to `end` (the start point is excluded). */
export function linePoints(start: Point, end: Point, count = 10): Point[] {
  const points: Point[] = [];

  for (let index = 1; index <= count; index++) {
    const t = index / count;
    points.push([
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
    ]);
  }

  return points;
}

/** Cubic Bézier sampled from `start` to `end` (the start point is excluded). */
export function cubicPoints(
  start: Point,
  control1: Point,
  control2: Point,
  end: Point,
  count = 24,
): Point[] {
  const points: Point[] = [];

  for (let index = 1; index <= count; index++) {
    const t = index / count;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;

    points.push([
      mt2 * mt * start[0] +
        3 * mt2 * t * control1[0] +
        3 * mt * t2 * control2[0] +
        t2 * t * end[0],
      mt2 * mt * start[1] +
        3 * mt2 * t * control1[1] +
        3 * mt * t2 * control2[1] +
        t2 * t * end[1],
    ]);
  }

  return points;
}

export type CurveFrame = {
  /** Drawing units → three.js units. */
  scale: number;
  centerX: number;
  centerY: number;
};

/**
 * Converts flat illustration points into a 3D curve.
 * A slight `z` wave is added so the line catches the light like a ribbon.
 */
export function createCurve(points: Point[], frame: CurveFrame) {
  return new THREE.CatmullRomCurve3(
    points.map(([x, y]) => {
      const dx = x - frame.centerX;
      const dy = y - frame.centerY;
      const z =
        Math.sin(dx * 0.025) * CURVE_TENSION +
        Math.sin(dy * 0.035) * CURVE_DEPTH_Y;

      return new THREE.Vector3(dx * frame.scale, -dy * frame.scale, z);
    }),
    false,
    "centripetal",
  );
}
