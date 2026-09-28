export type StoreStatus = 'open' | 'closing' | 'closed'

export interface Store {
  id: string
  name: string
  cuisine: string
  location: string
  status: StoreStatus
  etaMinutes: [number, number]
  /** Placeholder "photo": an emoji on a tinted plate until real imagery exists. */
  icon: string
  tint: string
}

const STORES = ([
  { id: 'bd', name: "Bear's Den Grill", cuisine: 'Burgers', location: 'South 40', status: 'open', etaMinutes: [15, 25], icon: '🍔', tint: '#c8553d' },
  { id: 'dn', name: 'Delmar Noodle Co.', cuisine: 'Ramen', location: 'Delmar Loop', status: 'open', etaMinutes: [20, 30], icon: '🍜', tint: '#b5651d' },
  { id: 'ff', name: 'Forsyth Falafel', cuisine: 'Mediterranean', location: 'Forsyth Blvd', status: 'closing', etaMinutes: [10, 20], icon: '🧆', tint: '#6b8f3a' },
  { id: 'bk', name: 'Brookings Bakehouse', cuisine: 'Bakery', location: 'Brookings Quad', status: 'open', etaMinutes: [10, 15], icon: '🥐', tint: '#d49a4a' },
  { id: 'ct', name: 'Clayton Taqueria', cuisine: 'Mexican', location: 'Clayton', status: 'open', etaMinutes: [20, 35], icon: '🌮', tint: '#d4a017' },
  { id: 'lp', name: 'Loop Pizza Works', cuisine: 'Pizza', location: 'Delmar Loop', status: 'open', etaMinutes: [25, 40], icon: '🍕', tint: '#a63d2f' },
  { id: 'ms', name: 'Mudd Street Sushi', cuisine: 'Japanese', location: 'DUC', status: 'closed', etaMinutes: [30, 45], icon: '🍣', tint: '#3d6f8f' },
  { id: 'gc', name: 'Gear & Crumb Café', cuisine: 'Coffee', location: 'Danforth', status: 'open', etaMinutes: [5, 15], icon: '☕', tint: '#6f4e37' },
  { id: 'rw', name: 'Rivet Wings', cuisine: 'Wings', location: 'Skinker Blvd', status: 'open', etaMinutes: [20, 30], icon: '🍗', tint: '#b8470f' },
  { id: 'sb', name: 'Steelyard Bowls', cuisine: 'Poke', location: 'East End', status: 'open', etaMinutes: [15, 25], icon: '🥗', tint: '#2f7f6f' },
  { id: 'tt', name: 'Tread Thai Kitchen', cuisine: 'Thai', location: 'Delmar Loop', status: 'closing', etaMinutes: [25, 35], icon: '🍛', tint: '#8f3d6f' },
  { id: 'wd', name: 'Wrench Dumpling Bar', cuisine: 'Chinese', location: 'Olive Blvd', status: 'open', etaMinutes: [20, 30], icon: '🥟', tint: '#7a5c2e' },
] satisfies Store[]).sort((a, b) => a.name.localeCompare(b.name)) as Store[]

/**
 * Store lookup, sorted A→Z. Async so a real GrubHub-backed call can drop in
 * without touching any of the 3D code.
 */
export async function getStores(query = ''): Promise<Store[]> {
  const q = query.trim().toLowerCase()
  if (!q) return STORES
  return STORES.filter((s) =>
    [s.name, s.cuisine, s.location].some((field) => field.toLowerCase().includes(q)),
  )
}

export function statusText(store: Store): string {
  if (store.status === 'closed') return 'Closed until 11 AM'
  if (store.status === 'closing') return 'Closes soon'
  return 'Open'
}

export function etaText(store: Store): string {
  return `${store.etaMinutes[0]}–${store.etaMinutes[1]} min`
}
