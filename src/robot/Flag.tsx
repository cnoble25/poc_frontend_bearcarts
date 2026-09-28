import { useMemo } from 'react'
import { DoubleSide, Shape, ShapeGeometry } from 'three'
import { BODY_REAR_Y, BODY_TOP_Z, COLORS, LID_THICKNESS } from './constants'
import { useWidths } from './dims'

const POLE = 1.6

/** Whip antenna with the orange safety flag, raked back from the deck's rear corner. */
export function Flag() {
  const { body } = useWidths()
  const pennant = useMemo(() => {
    const s = new Shape()
    s.moveTo(0, 0)
    s.lineTo(0.55, -0.16)
    s.lineTo(0, -0.34)
    s.closePath()
    return new ShapeGeometry(s)
  }, [])

  return (
    <group
      position={[body / 2 - 0.12, BODY_REAR_Y + 0.12, BODY_TOP_Z - LID_THICKNESS]}
      rotation={[-(165 * Math.PI) / 180, 0, 0]}
    >
      <mesh position={[0, POLE / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.025, POLE, 8]} />
        <meshStandardMaterial color={COLORS.skirt} />
      </mesh>
      <mesh geometry={pennant} position={[0, POLE, 0]}>
        <meshStandardMaterial color={COLORS.flag} emissive={COLORS.flag} emissiveIntensity={0.25} side={DoubleSide} />
      </mesh>
    </group>
  )
}
