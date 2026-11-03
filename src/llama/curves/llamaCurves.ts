import { createCurve, cubicPoints, linePoints, type Point } from "./pathPoints";

/** The llama illustration lives in its own drawing space. */
const DRAWING_WIDTH = 8;
const DRAWING_UNITS = 323;
const CENTER_X = 210;
const CENTER_Y = 203;

const FRAME = {
  scale: DRAWING_WIDTH / DRAWING_UNITS,
  centerX: CENTER_X,
  centerY: CENTER_Y,
};

const BODY_START: Point = [85, 185];

type Segment =
  | { kind: "line"; to: Point; count?: number }
  | {
      kind: "curve";
      control1: Point;
      control2: Point;
      to: Point;
      count?: number;
    };

/**
 * The llama outline, written the way you would draw it: start at the tail,
 * then follow the back, the neck, the ears, the muzzle, the chest and the legs.
 * Each segment starts where the previous one ended.
 */
const BODY_SEGMENTS: Segment[] = [
  { kind: "line", to: [110, 205], count: 8 }, // rump
  {
    kind: "curve",
    control1: [150, 195],
    control2: [220, 195],
    to: [255, 205],
    count: 30,
  }, // back
  {
    kind: "curve",
    control1: [265, 170],
    control2: [270, 130],
    to: [280, 95],
    count: 24,
  }, // neck
  { kind: "line", to: [284, 72], count: 6 },
  { kind: "line", to: [280, 42], count: 6 }, // ear up
  { kind: "line", to: [294, 66], count: 6 }, // ear down
  { kind: "line", to: [312, 72], count: 6 },
  {
    kind: "curve",
    control1: [325, 74],
    control2: [335, 80],
    to: [336, 90],
    count: 16,
  }, // forehead
  { kind: "line", to: [322, 98], count: 5 },
  { kind: "line", to: [300, 100], count: 5 }, // muzzle
  {
    kind: "curve",
    control1: [305, 140],
    control2: [312, 180],
    to: [318, 215],
    count: 24,
  }, // chest
  {
    kind: "curve",
    control1: [322, 240],
    control2: [305, 262],
    to: [290, 270],
    count: 20,
  },
  { kind: "line", to: [292, 365], count: 18 }, // front leg
  { kind: "line", to: [276, 365], count: 4 }, // hoof
  { kind: "line", to: [270, 285], count: 18 },
  {
    kind: "curve",
    control1: [250, 292],
    control2: [170, 292],
    to: [150, 285],
    count: 28,
  }, // belly
  { kind: "line", to: [148, 365], count: 18 }, // back leg
  { kind: "line", to: [130, 365], count: 4 }, // hoof
  { kind: "line", to: [122, 280], count: 18 },
  {
    kind: "curve",
    control1: [105, 260],
    control2: [100, 230],
    to: [110, 205],
    count: 24,
  }, // tail
];

/** The wink: a short arc over where the eye sits. */
const WINK_START: Point = [291, 82];
const WINK_SEGMENTS: Segment[] = [
  {
    kind: "curve",
    control1: [295.392, 75.3333],
    control2: [300.059, 75.3333],
    to: [305, 82],
    count: 32,
  },
];

function followSegments(start: Point, segments: Segment[]): Point[] {
  const points: Point[] = [start];
  let cursor = start;

  for (const segment of segments) {
    const samples =
      segment.kind === "line"
        ? linePoints(cursor, segment.to, segment.count)
        : cubicPoints(
            cursor,
            segment.control1,
            segment.control2,
            segment.to,
            segment.count,
          );

    points.push(...samples);
    cursor = segment.to;
  }

  return points;
}

export function createLlamaCurve() {
  return createCurve(followSegments(BODY_START, BODY_SEGMENTS), FRAME);
}

export function createWinkCurve() {
  return createCurve(followSegments(WINK_START, WINK_SEGMENTS), FRAME);
}
