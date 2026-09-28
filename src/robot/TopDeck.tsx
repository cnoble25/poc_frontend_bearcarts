import { useMemo } from 'react'
import { NavBar } from '../ui/NavBar'
import {
  BODY_REAR_Y,
  BODY_TOP_Z,
  BODY_WALL,
  DECK_LENGTH,
  LID_THICKNESS,
  REAR_BUMPER_HEIGHT,
  SHELL_RADIUS,
} from './constants'
import { useWidths } from './dims'
import { RECESS, SunkenDisplay } from './SunkenDisplay'

/** Tight corners where the deck meets the lid. */
const SEAM_RADIUS = 0.08
const DECK_RADII: [number, number, number, number] = [SEAM_RADIUS, SEAM_RADIUS, SHELL_RADIUS, SHELL_RADIUS]
/** How far the plug under the lip reaches down into the tub. */
const PLUG_DEPTH = 0.4
/** Plug clearance inside the tub walls, so no faces coincide. */
const PLUG_INSET = BODY_WALL + 0.01

/**
 * Rear strip of the robot's top, never covered by the lid, with the navbar sunk
 * into it. This is the navbar you see once the robot has rolled over. The lip
 * rests on the tub walls; the plug below it sits just inside them.
 */
export function TopDeck() {
  const { body, display } = useWidths()
  const plug = useMemo(
    () => ({
      width: body - PLUG_INSET * 2,
      height: DECK_LENGTH - PLUG_INSET,
      radii: [0.01, 0.01, SHELL_RADIUS - PLUG_INSET, SHELL_RADIUS - PLUG_INSET] as [number, number, number, number],
      offsetY: PLUG_INSET / 2,
    }),
    [body],
  )

  return (
    <group position={[0, BODY_REAR_Y + DECK_LENGTH / 2, BODY_TOP_Z - LID_THICKNESS]} rotation={[0, Math.PI, 0]}>
      <SunkenDisplay
        width={body}
        height={DECK_LENGTH}
        radii={DECK_RADII}
        depth={RECESS + PLUG_DEPTH}
        displayWidth={display}
        displayHeight={REAR_BUMPER_HEIGHT}
        block={plug}
      >
        <div className="display display--rear">
          <NavBar />
        </div>
      </SunkenDisplay>
    </group>
  )
}
