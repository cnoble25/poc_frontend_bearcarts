import { MathUtils } from 'three'

/**
 * Mutable belt scroll state, shared by the gesture handlers and the per-frame
 * animation. Kept outside React so dragging never triggers re-renders.
 *
 * `s` is measured in plates. Card k sits at path distance (k + s) * PLATE_PITCH;
 * half-integer values of `s` put exactly two cards square on the front run.
 */
export const belt = {
  s: 0.5,
  target: 0.5,
  dragging: false,
  /** Screen pixels covered by one plate, refreshed every frame. */
  pxPerPlate: 200,
  /** Set when a pointer gesture moved far enough that the trailing click should be ignored. */
  suppressClick: false,
}

export const snap = (s: number) => Math.round(s - 0.5) + 0.5

/** Advance the belt by whole plates. Negative rolls cards upward (forward through A→Z). */
export function stepBelt(plates: number) {
  belt.target = snap(belt.target) + plates
}

export function updateBelt(dt: number) {
  if (!belt.dragging) belt.s = MathUtils.damp(belt.s, belt.target, 7, dt)
}
