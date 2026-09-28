import { etaText, statusText, type Store } from '../data/stores'
import { CARD_HEIGHT, PX_PER_UNIT } from './constants'

/** Texture pixels per CSS px of card layout. */
const TEX_SCALE = 2.2
const MAX_TEX_W = 1800

/**
 * Card texture size for a given card width. Layout is written in CSS px of a
 * card at PX_PER_UNIT (cssW × cssH), then scaled up by `scale` into the texture.
 */
export interface CardLayout {
  texW: number
  texH: number
  scale: number
  cssW: number
  cssH: number
}

export function cardLayout(cardWidth: number): CardLayout {
  const cssW = cardWidth * PX_PER_UNIT
  const cssH = CARD_HEIGHT * PX_PER_UNIT
  const scale = Math.min(TEX_SCALE, MAX_TEX_W / cssW)
  return { texW: Math.round(cssW * scale), texH: Math.round(cssH * scale), scale, cssW, cssH }
}

const FONT = 'Rubik, system-ui, sans-serif'
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
const INK = '#22262c'
const INK_SOFT = '#5f6873'
const STATUS_COLOR: Record<Store['status'], string> = {
  open: '#1f9d55',
  closing: '#c77700',
  closed: '#8a939e',
}

export type CardContent = Store | 'no-results' | null

/** Fonts must be ready before drawing, or the canvas silently falls back. */
export const cardFontsReady = () =>
  Promise.all([document.fonts.load(`600 24px ${FONT}`), document.fonts.load(`400 15px ${FONT}`), document.fonts.load(`500 15px ${FONT}`)])

function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1)
  return `${t.trimEnd()}…`
}

function cardShape(ctx: CanvasRenderingContext2D, { cssW, cssH }: CardLayout) {
  ctx.beginPath()
  ctx.roundRect(0, 0, cssW, cssH, 28)
}

function drawStore(ctx: CanvasRenderingContext2D, store: Store, layout: CardLayout) {
  const { cssW: w, cssH, scale } = layout
  const bodyH = 84
  const picH = cssH - bodyH

  ctx.save()
  cardShape(ctx, layout)
  ctx.clip()
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, cssH)

  // Picture: tinted plate with a soft highlight and the food icon
  ctx.fillStyle = store.tint
  ctx.fillRect(0, 0, w, picH)
  const glow = ctx.createRadialGradient(w / 2, picH * 0.6, 0, w / 2, picH * 0.6, Math.min(w * 0.45, picH * 1.2))
  glow.addColorStop(0, 'rgba(255,255,255,0.28)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, picH)

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.22)'
  ctx.shadowBlur = 6 * scale
  ctx.shadowOffsetY = 6 * scale
  ctx.font = `84px ${EMOJI_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(store.icon, w / 2, picH / 2 + 4)
  ctx.restore()

  // Name
  const pad = 20
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = INK
  ctx.font = `600 24px ${FONT}`
  ctx.fillText(ellipsize(ctx, store.name, w - pad * 2), pad, picH + 38)

  // Meta row: location on the left, status + ETA on the right
  const baseline = picH + 64
  let right = w - pad
  ctx.textAlign = 'right'
  if (store.status !== 'closed') {
    ctx.font = `500 15px ${FONT}`
    ctx.fillStyle = INK
    const eta = etaText(store)
    ctx.fillText(eta, right, baseline)
    right -= ctx.measureText(eta).width + 12
  }
  ctx.font = `500 14px ${FONT}`
  ctx.fillStyle = STATUS_COLOR[store.status]
  const status = statusText(store)
  ctx.fillText(status, right, baseline)
  right -= ctx.measureText(status).width + 7
  ctx.beginPath()
  ctx.arc(right - 4, baseline - 5, 4, 0, Math.PI * 2)
  ctx.fill()
  right -= 20

  ctx.textAlign = 'left'
  ctx.font = `400 15px ${FONT}`
  ctx.fillStyle = INK_SOFT
  ctx.fillText(ellipsize(ctx, `${store.cuisine} in ${store.location}`, right - pad), pad, baseline)
  ctx.restore()
}

function drawNoResults(ctx: CanvasRenderingContext2D, layout: CardLayout) {
  const { cssW: w, cssH } = layout
  cardShape(ctx, layout)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.textAlign = 'center'
  ctx.fillStyle = INK
  ctx.font = `600 24px ${FONT}`
  ctx.fillText('No matches', w / 2, cssH / 2 - 6)
  ctx.fillStyle = INK_SOFT
  ctx.font = `400 15px ${FONT}`
  ctx.fillText('Try a restaurant name or a food, like “tacos”.', w / 2, cssH / 2 + 22)
}

/** Paint one card (or leave it transparent for bare tread) into `ctx`. */
export function drawCard(ctx: CanvasRenderingContext2D, content: CardContent, layout: CardLayout) {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, layout.texW, layout.texH)
  if (!content) return
  ctx.setTransform(layout.scale, 0, 0, layout.scale, 0, 0)
  if (content === 'no-results') drawNoResults(ctx, layout)
  else drawStore(ctx, content, layout)
}
