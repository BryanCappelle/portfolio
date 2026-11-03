import type { EasingName } from "./types";

/** Maps a 0 → 1 progress through the named easing curve. */
export function easing(name: EasingName, value: number) {
  const t = Math.max(0, Math.min(1, value));

  switch (name) {
    case "smooth":
      return t * t * (3 - 2 * t);
    case "smooth-in":
      return t * t;
    case "smooth-out":
      return 1 - (1 - t) * (1 - t);
    case "ease-in-out":
      return -(Math.cos(Math.PI * t) - 1) / 2;
    default:
      return t;
  }
}
