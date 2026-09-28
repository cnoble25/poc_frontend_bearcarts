import { rig } from '../camera/rig'
import { SettingsPanel } from '../ui/SettingsPanel'
import { BODY_BOTTOM_Z, BODY_FRONT_Y, BODY_REAR_Y, BODY_WALL, DECK_LENGTH } from './constants'
import { useWidths } from './dims'
import { PrintedHtml } from './PrintedHtml'

/** The transition decides when the panel may show; see rig.interior. */
const settingsGate = () => rig.interior

/** The part of the floor you can see through the lid opening (in front of the deck). */
const OPEN_REAR = BODY_REAR_Y + DECK_LENGTH
const OPEN_FRONT = BODY_FRONT_Y - BODY_WALL

/** Settings, printed on the inside floor of the cargo bay. */
export function Interior() {
  const { body } = useWidths()
  return (
    <group position={[0, (OPEN_REAR + OPEN_FRONT) / 2, BODY_BOTTOM_Z - BODY_WALL - 0.01]} rotation={[0, Math.PI, 0]}>
      <PrintedHtml width={body - BODY_WALL * 2 - 0.2} height={OPEN_FRONT - OPEN_REAR - 0.2} gate={settingsGate}>
        <SettingsPanel />
      </PrintedHtml>
    </group>
  )
}
