import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMemo, type RefObject } from "react";

type Props = {
  /** The DOM bubble that gets moved around. */
  bubbleRef: RefObject<HTMLDivElement | null>;
  /** The llama group the bubble points at. */
  anchorRef: RefObject<THREE.Group | null>;
  /** Shape of the llama, used to find its head. */
  curve: THREE.CatmullRomCurve3;
  /** No positioning needed while the intro is still playing. */
  visible: boolean;
};

const EDGE_MARGIN = 12;
const DESKTOP_MARGIN = 24;
const MOBILE_BREAKPOINT = 760;

/**
 * Projects the llama's head to screen space every frame and parks the speech
 * bubble next to it: on the right when there is room, otherwise above, and as
 * a last resort below. Visibility itself is handled by CSS through a data
 * attribute, so the entrance transition always plays.
 */
export default function BubbleAnchor({
  bubbleRef,
  anchorRef,
  curve,
  visible,
}: Props) {
  const headPoint = useMemo(() => {
    const points = curve.getPoints(200);

    return points.reduce(
      (head, point) => (point.x > head.x ? point.clone() : head),
      new THREE.Vector3(-Infinity, 0, 0),
    );
  }, [curve]);

  const projected = useMemo(() => new THREE.Vector3(), []);
  const worldHead = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, size }) => {
    const bubble = bubbleRef.current;
    const anchor = anchorRef.current;
    if (!visible || !bubble || !anchor) return;

    anchor.updateWorldMatrix(true, false);
    worldHead.copy(headPoint);
    anchor.localToWorld(worldHead);
    projected.copy(worldHead).project(camera);

    const headX = (projected.x * 0.5 + 0.5) * size.width;
    const headY = (-projected.y * 0.5 + 0.5) * size.height;
    const margin =
      size.width < MOBILE_BREAKPOINT ? EDGE_MARGIN : DESKTOP_MARGIN;
    const bubbleWidth = bubble.offsetWidth;
    const bubbleHeight = bubble.offsetHeight;

    const placeOnRight =
      headX + margin + bubbleWidth + EDGE_MARGIN <= size.width;
    const placeAbove =
      !placeOnRight && headY - bubbleHeight - margin >= EDGE_MARGIN;

    const alignedLeft = clamp(
      headX - bubbleWidth * 0.5,
      EDGE_MARGIN,
      size.width - bubbleWidth - EDGE_MARGIN,
    );

    let left: number;
    let top: number;

    if (placeOnRight) {
      left = headX + margin;
      top = clamp(
        headY - bubbleHeight * 0.45,
        EDGE_MARGIN,
        size.height - bubbleHeight - EDGE_MARGIN,
      );
    } else if (placeAbove) {
      left = alignedLeft;
      top = Math.max(EDGE_MARGIN, headY - bubbleHeight - margin);
    } else {
      left = alignedLeft;
      top = clamp(
        headY + margin,
        EDGE_MARGIN,
        size.height - bubbleHeight - EDGE_MARGIN,
      );
    }

    bubble.classList.toggle("llama-speech-bubble--left-tail", placeOnRight);
    bubble.classList.toggle("llama-speech-bubble--top-tail", placeAbove);
    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
  });

  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
