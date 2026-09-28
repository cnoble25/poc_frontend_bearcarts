import { Vector3 } from 'three'
import {
  BODY_BOTTOM_Z,
  BODY_CENTER_Y,
  BODY_LENGTH,
  BODY_TOP_Z,
  BODY_WALL,
  BUMPER_FACE_Z,
  HOME_BOTTOM_Y,
  HOME_TOP_Y,
  LID_OPEN_ANGLE,
  LID_THICKNESS,
  PIVOT_Z,
} from '../robot/constants'
import { widthsFor } from '../robot/dims'
import { makePose, type Pose } from './rig'
import type { View } from '../store/useAppStore'

export type PoseName = View | 'lidOpen'

export const FOV = 35

/** Camera distance that fits a w×h rectangle in view, with a little margin. */
function fitDistance(w: number, h: number, aspect: number, margin = 1.06) {
  const t = Math.tan((FOV * Math.PI) / 360)
  return Math.max(h / 2 / t, w / 2 / (t * aspect)) * margin
}

/** World z of a robot-local z once the robot has rolled over (rotY = PI). */
const flipped = (z: number) => 2 * PIVOT_Z - z

export function poseFor(name: PoseName, aspect: number): Pose {
  const { body } = widthsFor(aspect)
  const top = flipped(BODY_TOP_Z - LID_THICKNESS)

  switch (name) {
    case 'home': {
      const cy = (HOME_TOP_Y + HOME_BOTTOM_Y) / 2
      const d = fitDistance(body, HOME_TOP_Y - HOME_BOTTOM_Y, aspect)
      return makePose(0, 0, new Vector3(0, cy, BUMPER_FACE_Z + d), new Vector3(0, cy, 0))
    }
    case 'orders': {
      // Whole top: lid plus the navbar deck at the rear.
      const d = fitDistance(body, BODY_LENGTH, aspect)
      return makePose(Math.PI, 0, new Vector3(0, BODY_CENTER_Y, top + d), new Vector3(0, BODY_CENTER_Y, top))
    }
    case 'lidOpen': {
      // Pulled back and tilted from the rear so the lid swinging up at the front reads.
      const d = fitDistance(body, BODY_LENGTH, aspect) * 1.25
      return makePose(
        Math.PI,
        LID_OPEN_ANGLE,
        new Vector3(0, BODY_CENTER_Y - 2.2, top + d),
        new Vector3(0, BODY_CENTER_Y + 0.6, top - 1),
      )
    }
    case 'settings': {
      // Straight down into the bay (the DOM settings panel needs a head-on view), deck navbar at the bottom.
      const floor = flipped(BODY_BOTTOM_Z - BODY_WALL)
      const d = fitDistance(body, BODY_LENGTH, aspect, 1.02)
      return makePose(
        Math.PI,
        LID_OPEN_ANGLE,
        new Vector3(0, BODY_CENTER_Y, top + d),
        new Vector3(0, BODY_CENTER_Y, (top + floor) / 2),
      )
    }
  }
}

/** Sequence of poses to pass through when moving between two views. */
export function route(from: View, to: View): PoseName[] {
  const key = `${from}>${to}`
  switch (key) {
    case 'home>orders':
      return ['orders']
    case 'home>settings':
      return ['orders', 'lidOpen', 'settings']
    case 'orders>home':
      return ['home']
    case 'orders>settings':
      return ['lidOpen', 'settings']
    case 'settings>orders':
      return ['lidOpen', 'orders']
    case 'settings>home':
      return ['lidOpen', 'orders', 'home']
    default:
      return [to]
  }
}
