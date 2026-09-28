import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import { rig } from '../camera/rig'
import { OrdersPanel } from '../ui/OrdersPanel'
import { BODY_FRONT_Y, BODY_TOP_Z, COLORS, LID_LENGTH, LID_THICKNESS, SHELL_RADIUS } from './constants'
import { useWidths } from './dims'
import { ShellMaterial } from './materials'
import { PrintedHtml } from './PrintedHtml'
import { roundedRing, roundedSlab } from './shapes'

/** Tight corners where the lid meets the top deck. */
const SEAM_RADIUS = 0.08

/** Orders fade out as soon as the lid starts to lift, rather than riding it to steep angles. */
const lidClosedGate = () => 1 - MathUtils.smoothstep(rig.lid, 0.05, 0.35)

/**
 * Domed white lid covering all of the top except the rear deck. Hinged along
 * the front edge, so it swings up toward the top of the screen and never hides
 * the deck's navbar. Orders are printed on top.
 */
export function Lid() {
  const hinge = useRef<Group>(null)
  const { body } = useWidths()
  const lidW = body + 0.04
  const lidL = LID_LENGTH + 0.02
  const r = SHELL_RADIUS + 0.02
  const geometry = useMemo(
    () => roundedSlab(lidW, lidL, [r, r, SEAM_RADIUS, SEAM_RADIUS], LID_THICKNESS, 0.07),
    [lidW, lidL, r],
  )
  // Thin rubber gasket ring that seats on the tub walls.
  const seal = useMemo(() => roundedRing(lidW - 0.16, lidL - 0.16, [r - 0.08, r - 0.08, 0.02, 0.02], 0.06, 0.012), [lidW, lidL, r])

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => seal.dispose(), [seal])

  useFrame(() => {
    if (hinge.current) hinge.current.rotation.x = rig.lid
  })

  return (
    <group ref={hinge} position={[0, BODY_FRONT_Y + 0.02, BODY_TOP_Z]}>
      <mesh geometry={geometry} position={[0, -lidL / 2, -LID_THICKNESS]}>
        <ShellMaterial />
      </mesh>

      {/* Gasket on the underside, just clear of the lid so the faces don't z-fight */}
      <mesh geometry={seal} position={[0, -lidL / 2, 0.002]}>
        <meshStandardMaterial color={COLORS.skirt} roughness={0.8} />
      </mesh>

      <group position={[0, -lidL / 2, -LID_THICKNESS - 0.01]} rotation={[0, Math.PI, 0]}>
        <PrintedHtml width={lidW - 0.5} height={lidL - 0.5} gate={lidClosedGate}>
          <OrdersPanel />
        </PrintedHtml>
      </group>
    </group>
  )
}
