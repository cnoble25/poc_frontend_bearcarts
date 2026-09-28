import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { rig } from '../camera/rig'
import { BeltSurface } from './BeltSurface'
import { Body } from './Body'
import { FrontBumper, RearBumper } from './Bumpers'
import { PIVOT_Z } from './constants'
import { Interior } from './Interior'
import { Lid } from './Lid'
import { Tread } from './Tread'
import { Flag } from './Flag'
import { TopDeck } from './TopDeck'

/** The delivery robot. Rolls over about its middle so either the belly (home) or lid faces the camera. */
export function Robot() {
  const roll = useRef<Group>(null)

  useFrame(() => {
    if (roll.current) roll.current.rotation.y = rig.rotY
  })

  return (
    <group ref={roll} position={[0, 0, PIVOT_Z]}>
      <group position={[0, 0, -PIVOT_Z]}>
        <Body />
        <Tread />
        <BeltSurface />
        <FrontBumper />
        <RearBumper />
        <Lid />
        <TopDeck />
        <Flag />
        <Interior />
      </group>
    </group>
  )
}
