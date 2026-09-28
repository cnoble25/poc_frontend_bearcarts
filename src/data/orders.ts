export type OrderStage = 'placed' | 'preparing' | 'loading' | 'en-route' | 'delivered'

export interface Order {
  id: string
  storeName: string
  items: string[]
  total: number
  stage: OrderStage
  robotId: string
  etaMinutes?: number
  placedAt: string
}

export const ORDER_STAGES: OrderStage[] = ['placed', 'preparing', 'loading', 'en-route', 'delivered']

const ORDERS: Order[] = [
  { id: 'BC-4812', storeName: 'Delmar Noodle Co.', items: ['Tonkotsu Ramen', 'Gyoza ×6'], total: 21.4, stage: 'en-route', robotId: 'UNIT-07', etaMinutes: 8, placedAt: '12:14 PM' },
  { id: 'BC-4809', storeName: 'Gear & Crumb Café', items: ['Oat Latte', 'Almond Croissant'], total: 9.75, stage: 'preparing', robotId: 'UNIT-03', etaMinutes: 22, placedAt: '12:02 PM' },
  { id: 'BC-4771', storeName: "Bear's Den Grill", items: ['Den Burger', 'Fries'], total: 16.2, stage: 'delivered', robotId: 'UNIT-11', placedAt: 'Yesterday' },
  { id: 'BC-4705', storeName: 'Rivet Wings', items: ['10 pc Buffalo', 'Ranch'], total: 14.0, stage: 'delivered', robotId: 'UNIT-02', placedAt: 'Mon' },
]

export async function getOrders(): Promise<Order[]> {
  return ORDERS
}
