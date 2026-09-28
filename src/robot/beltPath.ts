import { BELT_LENGTH, BELT_STRAIGHT, DRUM_RADIUS } from './constants'

export interface PathPoint {
  y: number
  z: number
  /** Rotation about X that turns a +Z-facing plane to face outward from the belt. */
  angle: number
}

const S = BELT_STRAIGHT
const R = DRUM_RADIUS
const ARC = Math.PI * R

/**
 * Stadium-shaped belt loop in the robot's Y/Z plane, parameterised by arc length.
 *
 * d = 0 is the middle of the back run (hidden against the chassis). Increasing d
 * travels up the back run, over the front drum, DOWN the front run (toward the
 * camera in the home view), around the rear drum, and back to the start.
 */
export function pathAt(distance: number, radius = R): PathPoint {
  let d = ((distance % BELT_LENGTH) + BELT_LENGTH) % BELT_LENGTH

  if (d < S / 2) return { y: d, z: -radius, angle: Math.PI }
  d -= S / 2

  if (d < ARC) {
    const t = d / R
    return { y: S / 2 + radius * Math.sin(t), z: -radius * Math.cos(t), angle: Math.PI + t }
  }
  d -= ARC

  if (d < S) return { y: S / 2 - d, z: radius, angle: 0 }
  d -= S

  if (d < ARC) {
    const t = d / R
    return { y: -S / 2 - radius * Math.sin(t), z: radius * Math.cos(t), angle: t }
  }
  d -= ARC

  return { y: -S / 2 + d, z: -radius, angle: Math.PI }
}

/** Distance along the path where the front run starts (top of the screen). */
export const FRONT_RUN_START = S / 2 + ARC
