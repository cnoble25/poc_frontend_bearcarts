import { ExtrudeGeometry, Path, Shape } from 'three'

/** Corner radii: a single value, or [frontLeft, frontRight, rearRight, rearLeft] (+Y is front). */
export type Radii = number | [number, number, number, number]

function traceRoundedRect<T extends Path>(path: T, w: number, h: number, radii: Radii, inset = 0): T {
  const [fl, fr, rr, rl] = (typeof radii === 'number' ? [radii, radii, radii, radii] : radii).map((r) =>
    Math.max(0.01, r - inset),
  )
  const x = -w / 2
  const y = -h / 2
  path.moveTo(x + rl, y)
  path.lineTo(x + w - rr, y)
  path.quadraticCurveTo(x + w, y, x + w, y + rr)
  path.lineTo(x + w, y + h - fr)
  path.quadraticCurveTo(x + w, y + h, x + w - fr, y + h)
  path.lineTo(x + fl, y + h)
  path.quadraticCurveTo(x, y + h, x, y + h - fl)
  path.lineTo(x, y + rl)
  path.quadraticCurveTo(x, y, x + rl, y)
  return path
}

const bevel = (size: number) => ({
  bevelEnabled: size > 0,
  bevelSize: size,
  bevelThickness: size,
  bevelSegments: 4,
  curveSegments: 12,
})

/** Rounded-rectangle slab in the XY plane, extruded `depth` along +Z. */
export function roundedSlab(w: number, h: number, r: Radii, depth: number, bevelSize = 0) {
  const shape = traceRoundedRect(new Shape(), w - bevelSize * 2, h - bevelSize * 2, r, bevelSize)
  return new ExtrudeGeometry(shape, { depth: depth - bevelSize * 2, ...bevel(bevelSize) }).translate(0, 0, bevelSize)
}

/** Rounded-rectangle ring (a tub wall), extruded `depth` along +Z. */
export function roundedRing(w: number, h: number, r: Radii, wall: number, depth: number) {
  const shape = traceRoundedRect(new Shape(), w, h, r)
  shape.holes.push(traceRoundedRect(new Path(), w - wall * 2, h - wall * 2, r, wall))
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 12 })
}

/** Plate with a rounded pocket cut through it (the lip around a sunken display). */
export function pocketRing(w: number, h: number, r: Radii, holeW: number, holeH: number, holeR: number, depth: number) {
  const shape = traceRoundedRect(new Shape(), w, h, r)
  shape.holes.push(traceRoundedRect(new Path(), holeW, holeH, holeR))
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 12 })
}
