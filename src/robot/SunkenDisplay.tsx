import { useEffect, useMemo, type ReactNode } from 'react'
import { COLORS } from './constants'
import { ShellMaterial } from './materials'
import { PrintedHtml } from './PrintedHtml'
import { pocketRing, roundedSlab, type Radii } from './shapes'

/** How far the glass sits below the housing surface. */
export const RECESS = 0.16
/** Dark seam between the pocket wall and the glass. */
const GASKET = 0.025
const DISPLAY_RADIUS = 0.32

interface SunkenDisplayProps {
  /** Housing footprint and corner radii. */
  width: number
  height: number
  radii: Radii
  /** Total housing depth below its surface. The group origin is the surface centre, facing +Z. */
  depth: number
  displayWidth: number
  displayHeight: number
  /**
   * Optional smaller footprint for the block beneath the lip, e.g. so the deck
   * can plug into the tub without its faces landing on the tub walls.
   */
  block?: { width: number; height: number; radii: Radii; offsetY: number }
  children: ReactNode
}

/**
 * White shell housing with a glass display sunk into a rounded pocket.
 * Used for the bumpers (search, navbar) and the top deck (navbar).
 */
export function SunkenDisplay({
  width,
  height,
  radii,
  depth,
  displayWidth,
  displayHeight,
  block,
  children,
}: SunkenDisplayProps) {
  const geo = useMemo(
    () => ({
      block: roundedSlab(block?.width ?? width, block?.height ?? height, block?.radii ?? radii, depth - RECESS, block ? 0 : 0.05),
      lip: pocketRing(width, height, radii, displayWidth, displayHeight, DISPLAY_RADIUS, RECESS),
      gasket: roundedSlab(displayWidth, displayHeight, DISPLAY_RADIUS, 0.01),
      glass: roundedSlab(displayWidth - GASKET * 2, displayHeight - GASKET * 2, DISPLAY_RADIUS - GASKET, 0.01),
    }),
    [width, height, radii, depth, displayWidth, displayHeight, block],
  )

  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo])

  return (
    <group>
      <mesh geometry={geo.block} position={[0, block?.offsetY ?? 0, -depth]}>
        <ShellMaterial />
      </mesh>
      <mesh geometry={geo.lip} position={[0, 0, -RECESS]}>
        <ShellMaterial />
      </mesh>
      <mesh geometry={geo.gasket} position={[0, 0, -RECESS - 0.004]}>
        <meshStandardMaterial color={COLORS.skirt} roughness={0.8} />
      </mesh>
      <mesh geometry={geo.glass} position={[0, 0, -RECESS]}>
        <meshPhysicalMaterial color={COLORS.glass} roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <PrintedHtml position={[0, 0, -RECESS + 0.015]} width={displayWidth - 0.08} height={displayHeight - 0.08}>
        {children}
      </PrintedHtml>
    </group>
  )
}
