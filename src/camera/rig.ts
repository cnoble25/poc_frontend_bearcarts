import { Vector3 } from 'three'

export interface Pose {
  /** Robot roll about world Y: 0 = belly (home) toward camera, PI = lid toward camera. */
  rotY: number
  /** Lid hinge angle in radians (0 = closed). */
  lid: number
  cam: Vector3
  target: Vector3
}

export const makePose = (rotY: number, lid: number, cam: Vector3, target: Vector3): Pose => ({
  rotY,
  lid,
  cam,
  target,
})

/** The live pose, written by CameraRig each frame and read by the robot parts. */
export const rig: Pose & {
  /**
   * 0..1 visibility of the settings panel inside the bay. Driven by the
   * transition itself (only during the final dolly in, or once settled there),
   * since the panel is DOM and would otherwise show through the lid and walls.
   */
  interior: number
} = { ...makePose(0, 0, new Vector3(0, 0, 14), new Vector3()), interior: 0 }
