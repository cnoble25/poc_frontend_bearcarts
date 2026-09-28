import { useEffect, useMemo } from 'react'
import {
  BODY_BOTTOM_Z,
  BODY_CENTER_Y,
  BODY_HEIGHT,
  BODY_LENGTH,
  BODY_WALL,
  COLORS,
  SHELL_RADIUS,
  SKIRT_HEIGHT,
} from './constants'
import { ShellMaterial, SkirtMaterial } from './materials'
import { roundedRing, roundedSlab } from './shapes'
import { useWidths } from './dims'

/**
 * Open-topped tub with rounded corners: glossy white shell with a charcoal
 * skirt band around the bottom edge. The white belly frames the home view.
 */
export function Body() {
  const upperHeight = BODY_HEIGHT - SKIRT_HEIGHT
  const { body: BODY_WIDTH } = useWidths()
  const geo = useMemo(
    () => ({
      belly: roundedSlab(BODY_WIDTH, BODY_LENGTH, SHELL_RADIUS, BODY_WALL, 0.04),
      skirt: roundedRing(BODY_WIDTH, BODY_LENGTH, SHELL_RADIUS, BODY_WALL, SKIRT_HEIGHT - BODY_WALL),
      upper: roundedRing(BODY_WIDTH, BODY_LENGTH, SHELL_RADIUS, BODY_WALL, upperHeight),
      floor: roundedSlab(BODY_WIDTH - BODY_WALL * 2, BODY_LENGTH - BODY_WALL * 2, SHELL_RADIUS - BODY_WALL, 0.01),
    }),
    [upperHeight, BODY_WIDTH],
  )
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo])
  const halfL = BODY_LENGTH / 2

  return (
    <group position={[0, BODY_CENTER_Y, 0]}>
      <mesh geometry={geo.belly} position={[0, 0, BODY_BOTTOM_Z - BODY_WALL]}>
        <ShellMaterial />
      </mesh>
      <mesh geometry={geo.skirt} position={[0, 0, BODY_BOTTOM_Z - SKIRT_HEIGHT]}>
        <SkirtMaterial />
      </mesh>
      <mesh geometry={geo.upper} position={[0, 0, BODY_BOTTOM_Z - BODY_HEIGHT]}>
        <ShellMaterial />
      </mesh>
      <mesh geometry={geo.floor} position={[0, 0, BODY_BOTTOM_Z - BODY_WALL - 0.012]}>
        <meshStandardMaterial color={COLORS.interior} roughness={0.9} />
      </mesh>

      {/* Light bars: white up front, red at the back */}
      {[1, -1].map((end) => (
        <mesh key={end} position={[0, end * (halfL + 0.005), BODY_BOTTOM_Z - SKIRT_HEIGHT - 0.35]}>
          <boxGeometry args={[BODY_WIDTH * 0.55, 0.03, 0.08]} />
          <meshStandardMaterial
            color={end > 0 ? '#ffffff' : '#ff3b30'}
            emissive={end > 0 ? '#ffffff' : '#ff2d20'}
            emissiveIntensity={end > 0 ? 2 : 1.2}
          />
        </mesh>
      ))}
    </group>
  )
}
