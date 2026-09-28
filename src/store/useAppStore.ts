import { create } from 'zustand'
import type { Store } from '../data/stores'

export type View = 'home' | 'orders' | 'settings'

export interface Settings {
  notifications: boolean
  handoffPin: boolean
  reducedMotion: boolean
  units: 'mi' | 'km'
}

interface AppState {
  /** View the user asked for. */
  view: View
  /** View the robot has finished animating to (lags `view` during transitions). */
  settledView: View
  transitioning: boolean
  query: string
  /** Screen width / height, rounded to 0.02. Drives the robot's widths. */
  aspect: number
  /** Current search results, A→Z. */
  stores: Store[]
  selectedStoreId: string | null
  settings: Settings
  setView: (view: View) => void
  finishTransition: (view: View) => void
  setQuery: (query: string) => void
  setAspect: (aspect: number) => void
  setStores: (stores: Store[]) => void
  selectStore: (id: string | null) => void
  updateSettings: (patch: Partial<Settings>) => void
}

const roundAspect = (a: number) => Math.round(a * 50) / 50

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const useAppStore = create<AppState>((set, get) => ({
  view: 'home',
  settledView: 'home',
  transitioning: false,
  query: '',
  aspect: roundAspect(typeof window === 'undefined' ? 0.46 : window.innerWidth / window.innerHeight),
  stores: [],
  selectedStoreId: null,
  settings: { notifications: true, handoffPin: true, reducedMotion: prefersReducedMotion, units: 'mi' },
  setView: (view) => {
    const { transitioning, settledView } = get()
    if (transitioning || view === settledView) return
    set({ view, transitioning: true, selectedStoreId: null })
  },
  finishTransition: (view) => set({ settledView: view, transitioning: false }),
  setQuery: (query) => set({ query }),
  setAspect: (aspect) => set({ aspect: roundAspect(aspect) }),
  setStores: (stores) => set({ stores }),
  selectStore: (selectedStoreId) => set({ selectedStoreId }),
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
}))
