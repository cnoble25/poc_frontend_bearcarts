import { useEffect, useState } from 'react'
import { getOrders, ORDER_STAGES, type Order } from '../data/orders'

const STAGE_TEXT: Record<Order['stage'], string> = {
  placed: 'Order placed',
  preparing: 'Being prepared',
  loading: 'Loading into the robot',
  'en-route': 'On the way',
  delivered: 'Delivered',
}

function ActiveOrder({ order }: { order: Order }) {
  const stageIndex = ORDER_STAGES.indexOf(order.stage)
  const progress = stageIndex / (ORDER_STAGES.length - 1)
  return (
    <article className="order">
      <div className="order__row">
        <h3 className="order__store">{order.storeName}</h3>
        <span className="order__eta">{order.etaMinutes} min</span>
      </div>
      <p className="order__stage">{STAGE_TEXT[order.stage]}</p>
      <div className="track" role="progressbar" aria-valuenow={stageIndex + 1} aria-valuemax={ORDER_STAGES.length}>
        <span className="track__fill" style={{ width: `${progress * 100}%` }} />
        {ORDER_STAGES.map((stage, i) => (
          <span key={stage} className={`track__stop ${i <= stageIndex ? 'track__stop--done' : ''}`} style={{ left: `${(i / (ORDER_STAGES.length - 1)) * 100}%` }} />
        ))}
      </div>
      <p className="order__items">{order.items.join(', ')}</p>
    </article>
  )
}

/** Orders, printed straight onto the robot's white lid. */
export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  useEffect(() => {
    getOrders().then(setOrders)
  }, [])

  const active = orders.filter((o) => o.stage !== 'delivered')
  const past = orders.filter((o) => o.stage === 'delivered')

  return (
    <div className="decal">
      <h2 className="decal__title">Your orders</h2>

      {active.length === 0 ? (
        <p className="decal__empty">Nothing on the way. Pick a restaurant from Home to start an order.</p>
      ) : (
        active.map((o) => <ActiveOrder key={o.id} order={o} />)
      )}

      <h3 className="decal__heading">Past orders</h3>
      <ul className="history">
        {past.map((o) => (
          <li key={o.id} className="history__row">
            <span className="history__store">{o.storeName}</span>
            <span className="history__when">{o.placedAt}</span>
            <span className="history__total">${o.total.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
