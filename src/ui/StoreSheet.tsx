import { useEffect, useState } from 'react'
import { etaText, getStores, statusText, type Store } from '../data/stores'
import { useAppStore } from '../store/useAppStore'

/** Placeholder store detail that slides up from the bottom. */
export function StoreSheet() {
  const id = useAppStore((s) => s.selectedStoreId)
  const selectStore = useAppStore((s) => s.selectStore)
  const [store, setStore] = useState<Store | null>(null)

  useEffect(() => {
    if (!id) return
    getStores().then((all) => setStore(all.find((s) => s.id === id) ?? null))
  }, [id])

  if (!id || !store) return null

  return (
    <div className="sheet-backdrop" onClick={() => selectStore(null)}>
      <section className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={store.name}>
        <div className="sheet__grip" />
        <div className="card__pic sheet__pic" style={{ '--tint': store.tint } as React.CSSProperties}>
          <span className="card__icon">{store.icon}</span>
        </div>
        <h2 className="sheet__title">{store.name}</h2>
        <p className="card__location">
          {store.cuisine} in {store.location}
        </p>
        <p className="sheet__status">
          <span className={`status status--${store.status}`}>{statusText(store)}</span>
          {store.status !== 'closed' && <span className="card__eta">Delivery in {etaText(store)}</span>}
        </p>
        <p className="sheet__note">Menus are coming soon. For now, this is where you'll pick your food.</p>
        <button type="button" className="sheet__close" onClick={() => selectStore(null)}>
          Close
        </button>
      </section>
    </div>
  )
}
