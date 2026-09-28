import { useRef, type ReactNode } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Group, MathUtils, Quaternion, Vector3 } from 'three'
import { HTML_DISTANCE_FACTOR, PX_PER_UNIT } from './constants'

/**
 * Stable mount point for every printed panel. Without it, drei <Html> switches
 * targets once R3F connects its events, remounting each panel's React root
 * mid-render (and occasionally losing one). Assigned by App before the Canvas mounts.
 */
export const htmlPortal: { current: HTMLElement | null } = { current: null }

const worldPos = new Vector3()
const worldQuat = new Quaternion()
const normal = new Vector3()
const toCamera = new Vector3()

type PrintedHtmlProps = ThreeElements['group'] & {
  /** Panel size in world units; the DOM gets width * PX_PER_UNIT pixels. */
  width: number
  height: number
  className?: string
  /** Facing (dot of panel normal and view direction) where the fade starts / is complete. */
  fadeFrom?: number
  fadeTo?: number
  /** Extra 0..1 visibility multiplier evaluated every frame (e.g. "only while the lid is open"). */
  gate?: () => number
  children: ReactNode
}

/**
 * DOM "printed" onto a robot surface. The panel faces +Z of its parent group and
 * fades out (and stops taking input) as it turns away from the camera, so the
 * DOM overlay never shows through the back of the robot.
 */
export function PrintedHtml({
  width,
  height,
  className,
  fadeFrom = 0.2,
  fadeTo = 0.55,
  gate,
  children,
  ...groupProps
}: PrintedHtmlProps) {
  const group = useRef<Group>(null)
  const panel = useRef<HTMLDivElement>(null)
  const lastOpacity = useRef(-1)

  useFrame(({ camera }) => {
    if (!group.current || !panel.current) return
    group.current.getWorldPosition(worldPos)
    group.current.getWorldQuaternion(worldQuat)
    normal.set(0, 0, 1).applyQuaternion(worldQuat)
    toCamera.subVectors(camera.position, worldPos).normalize()
    const facing = normal.dot(toCamera)
    const visibility = MathUtils.smoothstep(facing, fadeFrom, fadeTo) * (gate ? gate() : 1)
    const opacity = Math.round(visibility * 100) / 100

    if (opacity === lastOpacity.current) return
    lastOpacity.current = opacity
    const style = panel.current.style
    style.opacity = String(opacity)
    style.visibility = opacity < 0.02 ? 'hidden' : 'visible'
    style.pointerEvents = opacity < 0.6 ? 'none' : 'auto'
  })

  return (
    <group ref={group} {...groupProps}>
      <Html
        transform
        portal={htmlPortal as React.RefObject<HTMLElement>}
        distanceFactor={HTML_DISTANCE_FACTOR}
        zIndexRange={[100, 0]}
        pointerEvents="none"
      >
        <div
          ref={panel}
          className={`printed ${className ?? ''}`}
          style={{ width: width * PX_PER_UNIT, height: height * PX_PER_UNIT }}
        >
          {children}
        </div>
      </Html>
    </group>
  )
}
