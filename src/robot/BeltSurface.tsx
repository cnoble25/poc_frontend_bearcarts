import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import {
  BufferGeometry,
  Color,
  DataArrayTexture,
  DoubleSide,
  Float32BufferAttribute,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  PerspectiveCamera,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { getStores } from '../data/stores'
import { useAppStore } from '../store/useAppStore'
import { belt, stepBelt, updateBelt } from './belt'
import { pathAt } from './beltPath'
import {
  BELT_LENGTH,
  BELT_THICKNESS,
  CARD_HEIGHT,
  COLORS,
  DRUM_RADIUS,
  PLATE_COUNT,
  PLATE_PITCH,
} from './constants'
import { cardFontsReady, cardLayout, drawCard, type CardContent } from './cardTexture'
import { useWidths } from './dims'

/** Samples along the loop; enough for the drum curves to look smooth. */
const SAMPLES = 256
/** Slots that can be (at least partly) in view at once: the front run plus both drum wraps. */
const VISIBLE_SLOTS = 4
/** Plate slot (in plate units along the path) of the upper card on the front run. */
const TOP_SLOT = 2.5
/** Card inset within its plate along the belt, as a fraction of the plate. */
const GAP_V = (PLATE_PITCH - CARD_HEIGHT) / (2 * PLATE_PITCH)

const mod = (n: number, m: number) => ((n % m) + m) % m

/**
 * Sequence number of the card on plate k. It stays fixed while the plate
 * travels round the loop and advances by PLATE_COUNT each lap. The lap rolls
 * over at the middle of the hidden back run, so plates pick up their next card
 * just before they come round a drum into view.
 */
const cardNumber = (k: number, s: number) => k - PLATE_COUNT * Math.floor((k + s) / PLATE_COUNT)

/** Card number of the plate that will sit in the top slot once the belt reaches `s`. */
const topCardNumber = (s: number) => cardNumber(mod(Math.round(TOP_SLOT - s), PLATE_COUNT), s)

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2DArray uCards;
  uniform float uOffset;
  uniform vec3 uRubber;
  /** Card inset across the belt (u) and along it (v), as fractions of the plate. */
  uniform vec2 uGap;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    // Belt coordinate of this fragment, so the cards travel with the belt.
    float b = vUv.y * ${BELT_LENGTH.toFixed(4)} - uOffset;
    float t = b / ${PLATE_PITCH.toFixed(4)} + 0.5;
    float slot = mod(floor(t), ${PLATE_COUNT.toFixed(1)});
    vec2 plate = vec2(vUv.x, fract(t));

    // Rubber with fine moulded ribs between the cards.
    vec3 color = uRubber * (0.85 + 0.15 * step(0.5, fract(b * 6.0)));

    vec2 cardUv = (plate - uGap) / (1.0 - 2.0 * uGap);
    if (all(greaterThanEqual(cardUv, vec2(0.0))) && all(lessThanEqual(cardUv, vec2(1.0)))) {
      vec4 card = texture(uCards, vec3(cardUv, slot));
      color = mix(color, card.rgb, card.a);
    }

    // Soft key light from above the camera, so the wrap round each drum shades naturally.
    float light = 0.5 + 0.52 * max(dot(normalize(vNormal), normalize(vec3(-0.15, 0.45, 1.0))), 0.0);
    gl_FragColor = vec4(color * light, 1.0);
    #include <colorspace_fragment>
  }
`

function buildBeltGeometry(beltWidth: number) {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const index: number[] = []
  const radius = DRUM_RADIUS + BELT_THICKNESS + 0.006

  for (let i = 0; i <= SAMPLES; i++) {
    const v = i / SAMPLES
    const p = pathAt(v * BELT_LENGTH, radius)
    const ny = -Math.sin(p.angle)
    const nz = Math.cos(p.angle)
    for (const u of [0, 1]) {
      positions.push((u - 0.5) * beltWidth, p.y, p.z)
      normals.push(0, ny, nz)
      uvs.push(u, v)
    }
    if (i < SAMPLES) {
      const a = i * 2
      index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(index)
  return geometry
}

const beltCenter = new Vector3()

/** The tread's outer surface, with the store cards printed on it as a moving texture. */
export function BeltSurface() {
  const query = useAppStore((s) => s.query)
  const setStores = useAppStore((s) => s.setStores)
  const selectStore = useAppStore((s) => s.selectStore)
  const mesh = useRef<Mesh>(null)
  /** Card number that maps to the first result. */
  const base = useRef(0)
  const fontsReady = useRef(false)
  /** What each texture layer currently shows. */
  const layerKeys = useRef<string[]>([])
  const widths = useWidths()
  const gapU = (widths.belt - widths.card) / (2 * widths.belt)

  // Rebuilt when the robot's width changes (e.g. unfolding a Fold).
  const { geometry, material, texture, ctx, layout } = useMemo(() => {
    const layout = cardLayout(widths.card)
    const data = new Uint8Array(layout.texW * layout.texH * 4 * PLATE_COUNT)
    const texture = new DataArrayTexture(data, layout.texW, layout.texH, PLATE_COUNT)
    texture.colorSpace = SRGBColorSpace
    texture.minFilter = LinearMipmapLinearFilter
    texture.magFilter = LinearFilter
    texture.generateMipmaps = true
    texture.anisotropy = 4
    texture.needsUpdate = true

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      toneMapped: false,
      uniforms: {
        uCards: { value: texture },
        uOffset: { value: 0 },
        uRubber: { value: new Color(COLORS.rubber) },
        uGap: { value: [gapU, GAP_V] },
      },
    })

    const canvas = document.createElement('canvas')
    canvas.width = layout.texW
    canvas.height = layout.texH
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    layerKeys.current = []
    return { geometry: buildBeltGeometry(widths.belt), material, texture, ctx, layout }
  }, [widths.belt, widths.card, gapU])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      texture.dispose()
    },
    [geometry, material, texture],
  )

  useEffect(() => {
    cardFontsReady().then(() => {
      fontsReady.current = true
      layerKeys.current = []
    })
  }, [])

  useEffect(() => {
    let live = true
    getStores(query).then((result) => {
      if (!live) return
      // Spin a full lap while the new results load, landing on the first one.
      stepBelt(-PLATE_COUNT)
      base.current = topCardNumber(belt.target)
      setStores(result)
    })
    return () => {
      live = false
    }
  }, [query, setStores])

  /** Which card belongs on plate k right now. Short lists are padded with bare tread. */
  const contentFor = (k: number): CardContent => {
    const stores = useAppStore.getState().stores
    const period = Math.max(stores.length, VISIBLE_SLOTS)
    const i = mod(cardNumber(k, belt.s) - base.current, period)
    if (stores.length === 0) return i === 0 ? 'no-results' : null
    return i < stores.length ? stores[i] : null
  }

  useFrame(({ camera, size }, dt) => {
    updateBelt(Math.min(dt, 0.1))
    material.uniforms.uOffset.value = belt.s * PLATE_PITCH

    // Screen pixels per plate, for 1:1 drag tracking.
    const cam = camera as PerspectiveCamera
    mesh.current?.getWorldPosition(beltCenter)
    const visibleHeight = 2 * cam.position.distanceTo(beltCenter) * Math.tan((cam.fov * Math.PI) / 360)
    belt.pxPerPlate = (size.height / visibleHeight) * PLATE_PITCH

    if (!fontsReady.current) return
    let dirty = false
    for (let k = 0; k < PLATE_COUNT; k++) {
      const content = contentFor(k)
      const key = content === null ? 'bare' : content === 'no-results' ? 'none' : content.id
      if (layerKeys.current[k] === key) continue
      layerKeys.current[k] = key
      drawCard(ctx, content, layout)
      const pixels = ctx.getImageData(0, 0, layout.texW, layout.texH).data
      texture.image.data!.set(pixels, k * layout.texW * layout.texH * 4)
      texture.addLayerUpdate(k)
      dirty = true
    }
    if (dirty) texture.needsUpdate = true
  })

  const cardAt = (e: ThreeEvent<MouseEvent | PointerEvent>) => {
    if (!e.uv) return null
    const t = (e.uv.y * BELT_LENGTH - belt.s * PLATE_PITCH) / PLATE_PITCH + 0.5
    const pv = t - Math.floor(t)
    const inCard = e.uv.x > gapU && e.uv.x < 1 - gapU && pv > GAP_V && pv < 1 - GAP_V
    if (!inCard) return null
    const content = contentFor(mod(Math.floor(t), PLATE_COUNT))
    return content && content !== 'no-results' ? content : null
  }

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      onClick={(e) => {
        e.stopPropagation()
        const store = cardAt(e)
        if (store && !belt.suppressClick && useAppStore.getState().settledView === 'home') selectStore(store.id)
      }}
      onPointerMove={(e) => {
        document.body.style.cursor = cardAt(e) ? 'pointer' : ''
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    />
  )
}
