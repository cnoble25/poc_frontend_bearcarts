import { etaText, statusText } from '../data/stores'
import { useAppStore } from '../store/useAppStore'

/**
 * The belt cards are pixels in a texture, so mirror them as real buttons for
 * keyboard and screen-reader users. Visually hidden until focused.
 */
export function StoreList() {
  const stores = useAppStore((s) => s.stores)
  const selectStore = useAppStore((s) => s.selectStore)
  const settledView = useAppStore((s) => s.settledView)
  if (settledView !== 'home') return null

  return (
    <ul className="sr-list" aria-label="Restaurants">
      {stores.map((store) => (
        <li key={store.id}>
          <button type="button" onClick={() => selectStore(store.id)}>
            {store.name}, {store.cuisine} in {store.location}. {statusText(store)}
            {store.status !== 'closed' && `, ${etaText(store)}`}
          </button>
        </li>
      ))}
    </ul>
  )
}
