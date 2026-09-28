import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, InstancedMesh, Object3D } from 'three'
import { belt } from './belt'
import { pathAt } from './beltPath'
import { useWidths } from './dims'
import {
  BELT_LENGTH,
  BELT_SEGMENTS,
  BELT_STRAIGHT,
  BELT_THICKNESS,
  BODY_BOTTOM_Z,
  CARD_HEIGHT,
  COLORS,
  PLATE_COUNT,
  DRUM_RADIUS,
  PLATE_PITCH,
} from './constants'

const SEGMENT_LENGTH = (BELT_LENGTH / BELT_SEGMENTS) * 0.88
const dummy = new Object3D()

// Raised tread on the outer face. Cards sit recessed between these lugs.
const LUG_HEIGHT = 0.07
const LUG_RADIUS = DRUM_RADIUS + BELT_THICKNESS + LUG_HEIGHT / 2
/** Bar across the gap between two cards. */
const BAR_LENGTH = (PLATE_PITCH - CARD_HEIGHT) * 0.6
/** Chevron lugs down each shoulder, outside the cards. */
const SHOULDER_LUGS_PER_PLATE = 8
const SHOULDER_LUG_COUNT = PLATE_COUNT * SHOULDER_LUGS_PER_PLATE
const SHOULDER_YAW = 0.45

function Drum({ y, spin, beltWidth }: { y: number; spin: React.RefObject<Group | null>; beltWidth: number }) {
  return (
    <group position={[0, y, 0]}>
      <group ref={spin}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[DRUM_RADIUS - 0.01, DRUM_RADIUS - 0.01, beltWidth * 0.96, 32]} />
          <meshStandardMaterial color={COLORS.skirt} roughness={0.6} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (beltWidth / 2 + 0.03), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[DRUM_RADIUS * 0.7, DRUM_RADIUS * 0.7, 0.06, 32]} />
            <meshStandardMaterial color={COLORS.hub} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * Tread body: drums, side rails, the belt's link segments and the raised lugs
 * that frame each card. The printed surface itself is BeltSurface.
 */
export function Tread() {
  const segments = useRef<InstancedMesh>(null)
  const bars = useRef<InstancedMesh>(null)
  const shoulders = useRef<InstancedMesh>(null)
  const frontDrum = useRef<Group>(null)
  const rearDrum = useRef<Group>(null)
  const lastS = useRef(Number.NaN)
  const { belt: BELT_WIDTH, card: CARD_WIDTH } = useWidths()
  const SHOULDER_WIDTH = (BELT_WIDTH - CARD_WIDTH) / 2

  const layout = (s: number) => {
    const offset = s * PLATE_PITCH
    for (let i = 0; i < BELT_SEGMENTS; i++) {
      const d = offset + (i * BELT_LENGTH) / BELT_SEGMENTS
      // Sit the flat links a little low so their corners never poke through the curved surface.
      const p = pathAt(d, DRUM_RADIUS + BELT_THICKNESS * 0.35)
      dummy.position.set(0, p.y, p.z)
      dummy.rotation.set(p.angle, 0, 0)
      dummy.updateMatrix()
      segments.current!.setMatrixAt(i, dummy.matrix)
    }
    segments.current!.instanceMatrix.needsUpdate = true

    // Lug bars sit on the plate boundaries, halfway between card centres.
    for (let k = 0; k < PLATE_COUNT; k++) {
      const p = pathAt((k + s + 0.5) * PLATE_PITCH, LUG_RADIUS)
      dummy.position.set(0, p.y, p.z)
      dummy.rotation.set(p.angle, 0, 0)
      dummy.updateMatrix()
      bars.current!.setMatrixAt(k, dummy.matrix)
    }
    bars.current!.instanceMatrix.needsUpdate = true

    // Chevrons: angled lugs on both shoulders, mirrored so they point the same way.
    const pitch = PLATE_PITCH / SHOULDER_LUGS_PER_PLATE
    const x = CARD_WIDTH / 2 + SHOULDER_WIDTH / 2
    for (let i = 0; i < SHOULDER_LUG_COUNT; i++) {
      const p = pathAt(offset + (i + 0.5) * pitch, LUG_RADIUS)
      for (const side of [-1, 1]) {
        dummy.position.set(side * x, p.y, p.z)
        dummy.rotation.set(p.angle, 0, side * SHOULDER_YAW)
        dummy.updateMatrix()
        shoulders.current!.setMatrixAt(i * 2 + (side > 0 ? 1 : 0), dummy.matrix)
      }
    }
    shoulders.current!.instanceMatrix.needsUpdate = true
    const spin = offset / DRUM_RADIUS
    frontDrum.current!.rotation.x = spin
    rearDrum.current!.rotation.x = spin
  }

  // Re-lay out the lugs when the width changes.
  useLayoutEffect(() => layout(belt.s), [BELT_WIDTH, CARD_WIDTH])

  useFrame(() => {
    if (belt.s === lastS.current) return
    lastS.current = belt.s
    layout(belt.s)
  })

  const railX = BELT_WIDTH / 2 + 0.06
  const railDepth = -BODY_BOTTOM_Z - 0.05

  return (
    <group>
      <instancedMesh ref={segments} args={[undefined, undefined, BELT_SEGMENTS]}>
        <boxGeometry args={[BELT_WIDTH * 0.98, SEGMENT_LENGTH, BELT_THICKNESS * 0.7]} />
        <meshStandardMaterial color={COLORS.rubber} roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={bars} args={[undefined, undefined, PLATE_COUNT]}>
        <boxGeometry args={[CARD_WIDTH + 0.02, BAR_LENGTH, LUG_HEIGHT]} />
        <meshStandardMaterial color={COLORS.tread} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={shoulders} args={[undefined, undefined, SHOULDER_LUG_COUNT * 2]}>
        <boxGeometry args={[SHOULDER_WIDTH * 0.8, (PLATE_PITCH / SHOULDER_LUGS_PER_PLATE) * 0.45, LUG_HEIGHT]} />
        <meshStandardMaterial color={COLORS.tread} roughness={0.9} />
      </instancedMesh>

      <Drum y={BELT_STRAIGHT / 2} spin={frontDrum} beltWidth={BELT_WIDTH} />
      <Drum y={-BELT_STRAIGHT / 2} spin={rearDrum} beltWidth={BELT_WIDTH} />

      {/* Side frame rails tie the drums to the belly */}
      {[-railX, railX].map((x) => (
        <mesh key={x} position={[x, 0, BODY_BOTTOM_Z / 2 - 0.05]}>
          <boxGeometry args={[0.06, BELT_STRAIGHT + 0.3, railDepth]} />
          <meshStandardMaterial color={COLORS.skirt} roughness={0.75} />
        </mesh>
      ))}
    </group>
  )
}
