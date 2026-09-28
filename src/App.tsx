import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { NeutralToneMapping } from 'three'
import { useGesture } from '@use-gesture/react'
import { belt, snap, stepBelt } from './robot/belt'
import { htmlPortal } from './robot/PrintedHtml'
import { Scene } from './Scene'
import { useAppStore } from './store/useAppStore'
import { StoreList } from './ui/StoreList'
import { StoreSheet } from './ui/StoreSheet'

const beltActive = () => {
  const { settledView, transitioning, selectedStoreId } = useAppStore.getState()
  return settledView === 'home' && !transitioning && !selectedStoreId
}

/** Belt scrolling: drag / flick on touch, wheel on desktop, arrow keys. */
function useBeltControls(target: React.RefObject<HTMLDivElement | null>) {
  useGesture(
    {
      onDrag: ({ first, last, movement: [, my], velocity: [, vy], direction: [, dy], event, cancel, memo }) => {
        if (first) {
          belt.suppressClick = false
          const el = event.target as HTMLElement
          if (!beltActive() || el.closest('input, button, .nav')) {
            cancel()
            return
          }
          belt.dragging = true
          memo = belt.s
        }
        if (memo === undefined) return
        belt.s = memo + my / belt.pxPerPlate
        if (Math.abs(my) > 6) belt.suppressClick = true
        if (last) {
          belt.dragging = false
          const fling = (vy * dy * 220) / belt.pxPerPlate
          belt.target = snap(belt.s + fling)
        }
        return memo
      },
      onWheel: ({ delta: [, wy], last }) => {
        if (!beltActive()) return
        belt.dragging = !last
        belt.s -= wy / belt.pxPerPlate
        if (last) belt.target = snap(belt.s)
      },
    },
    { target, drag: { pointer: { capture: false }, filterTaps: false }, eventOptions: { passive: false } },
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!beltActive() || (e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'ArrowDown') stepBelt(-1)
      if (e.key === 'ArrowUp') stepBelt(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export function App() {
  const stage = useRef<HTMLDivElement>(null)
  const setAspect = useAppStore((s) => s.setAspect)
  useBeltControls(stage)

  // The robot's width follows the screen shape (e.g. folding / unfolding a Fold).
  useEffect(() => {
    const onResize = () => setAspect(window.innerWidth / window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setAspect])

  return (
    <div ref={stage} className="stage">
      <div
        className="printed-layer"
        ref={(el) => {
          htmlPortal.current = el
        }}
      />
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true, toneMapping: NeutralToneMapping }} camera={{ fov: 35, position: [0, 0, 14] }}>
        <Scene />
      </Canvas>
      <StoreList />
      <StoreSheet />
    </div>
  )
}
