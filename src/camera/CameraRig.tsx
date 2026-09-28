import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera } from 'three'
import { useAppStore } from '../store/useAppStore'
import { makePose, rig, type Pose } from './rig'
import { FOV, poseFor, route, type PoseName } from './viewpoints'

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const easeOutBack = (t: number) => {
  const c = 1.4
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2
}

interface Step {
  name: PoseName
  from: Pose
  duration: number
  t: number
}

const clonePose = (p: Pose) => makePose(p.rotY, p.lid, p.cam.clone(), p.target.clone())

function durationFor(from: Pose, to: Pose) {
  if (Math.abs(from.rotY - to.rotY) > 0.1) return 1.35 // roll over
  if (Math.abs(from.lid - to.lid) > 0.1) return 0.75 // lid swing
  return 0.8 // dolly
}

/**
 * Drives the camera, robot roll and lid from the app's view state. View changes
 * play as a chain of poses (e.g. home → roll over → open lid → dolly inside).
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const aspect = useThree((s) => s.size.width / s.size.height)
  const view = useAppStore((s) => s.view)
  const settledView = useAppStore((s) => s.settledView)
  const reducedMotion = useAppStore((s) => s.settings.reducedMotion)
  const finishTransition = useAppStore((s) => s.finishTransition)
  const queue = useRef<Step[]>([])

  useEffect(() => {
    camera.fov = FOV
    camera.updateProjectionMatrix()
  }, [camera])

  // Snap to the settled view on load and when the viewport changes shape.
  useEffect(() => {
    if (queue.current.length) return
    Object.assign(rig, clonePose(poseFor(settledView, aspect)))
    rig.interior = settledView === 'settings' ? 1 : 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect])

  useEffect(() => {
    if (view === settledView) return
    queue.current = route(settledView, view).map((name) => ({ name, from: rig, duration: 0, t: 0 }))
    queue.current[0].from = clonePose(rig)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  useFrame((_, dt) => {
    const step = queue.current[0]
    if (step) {
      const to = poseFor(step.name, aspect)
      if (step.duration === 0) step.duration = durationFor(step.from, to) * (reducedMotion ? 0.3 : 1)
      step.t = Math.min(1, step.t + Math.min(dt, 0.05) / step.duration)

      const e = easeInOutCubic(step.t)
      const lidEase = to.lid > step.from.lid ? easeOutBack(step.t) : e
      rig.rotY = MathUtils.lerp(step.from.rotY, to.rotY, e)
      rig.lid = MathUtils.lerp(step.from.lid, to.lid, lidEase)
      rig.cam.lerpVectors(step.from.cam, to.cam, e)
      rig.target.lerpVectors(step.from.target, to.target, e)

      // Pull the camera back mid-roll so the whole robot stays in frame.
      if (step.from.rotY !== to.rotY && !reducedMotion) rig.cam.z += Math.sin(Math.PI * step.t) * 3.5

      // Settings only fade in near the end of the dolly into the bay, and vanish
      // as soon as any other step starts (e.g. the first step out of settings).
      rig.interior = step.name === 'settings' ? MathUtils.smoothstep(step.t, 0.65, 1) : 0

      if (step.t >= 1) {
        queue.current.shift()
        if (queue.current[0]) queue.current[0].from = clonePose(rig)
        else finishTransition(view)
      }
    }

    camera.position.copy(rig.cam)
    camera.lookAt(rig.target)
  })

  return null
}
