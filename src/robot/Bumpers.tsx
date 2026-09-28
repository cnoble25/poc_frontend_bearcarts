import { Header } from '../ui/Header'
import { NavBar } from '../ui/NavBar'
import { SearchBar } from '../ui/SearchBar'
import {
  BUMPER_DEPTH,
  BUMPER_FACE_Z,
  FRONT_BUMPER_HEIGHT,
  FRONT_BUMPER_Y,
  REAR_BUMPER_HEIGHT,
  REAR_BUMPER_Y,
} from './constants'
import { useWidths } from './dims'
import { SunkenDisplay } from './SunkenDisplay'

const HOUSING_RADIUS = 0.4

/** Housing on the belly, flush with the body sides, face level with the cards. */
function Bumper({ y, height, children }: { y: number; height: number; children: React.ReactNode }) {
  const { housing, display } = useWidths()
  const rim = (housing - display) / 2
  return (
    <group position={[0, y, BUMPER_FACE_Z]}>
      <SunkenDisplay
        width={housing}
        height={height + rim * 2}
        radii={HOUSING_RADIUS}
        depth={BUMPER_DEPTH}
        displayWidth={display}
        displayHeight={height}
      >
        {children}
      </SunkenDisplay>
    </group>
  )
}

/** Top piece of the home screen: header + search, sunk into the robot's front. */
export function FrontBumper() {
  return (
    <Bumper y={FRONT_BUMPER_Y} height={FRONT_BUMPER_HEIGHT}>
      <div className="display display--front">
        <Header />
        <SearchBar />
      </div>
    </Bumper>
  )
}

/** Bottom piece of the home screen: the navbar, sunk into the robot's rear. */
export function RearBumper() {
  return (
    <Bumper y={REAR_BUMPER_Y} height={REAR_BUMPER_HEIGHT}>
      <div className="display display--rear">
        <NavBar />
      </div>
    </Bumper>
  )
}
