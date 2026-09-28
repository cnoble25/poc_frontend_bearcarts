import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { HOME_BOTTOM_Y, HOME_TOP_Y } from './constants'

/** Robot widths that stretch with the screen; heights and depths stay fixed. */
export interface Widths {
  body: number
  /** Belt spans nearly the whole underside. */
  belt: number
  /** Cards leave room for the chevron shoulders either side. */
  card: number
  /** Glass displays set into the bumper housings and the top deck. */
  display: number
  /** Bumper housings sit flush with the body sides. */
  housing: number
}

const MIN_BODY_WIDTH = 3.2
const MAX_BODY_WIDTH = 8.4
/** Share of the screen width the body fills in the home view. */
const FILL = 0.92
/** Must match the home framing margin in viewpoints.ts. */
const HOME_MARGIN = 1.06

/**
 * Body width that fills the screen at this aspect ratio. Home is framed by
 * height, so a wider screen (e.g. an unfolded Fold) shows more world width,
 * which the body grows into.
 */
export function widthsFor(aspect: number): Widths {
  const visibleWidth = (HOME_TOP_Y - HOME_BOTTOM_Y) * HOME_MARGIN * aspect
  const body = Math.min(MAX_BODY_WIDTH, Math.max(MIN_BODY_WIDTH, visibleWidth * FILL))
  const belt = body - 0.3
  return { body, belt, card: belt - 0.6, display: body - 0.2, housing: body - 0.04 }
}

/** Current widths. Aspect is rounded so resizing doesn't rebuild geometry every pixel. */
export function useWidths(): Widths {
  const aspect = useAppStore((s) => s.aspect)
  return useMemo(() => widthsFor(aspect), [aspect])
}
