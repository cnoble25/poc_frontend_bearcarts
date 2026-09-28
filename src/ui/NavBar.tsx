import { useAppStore, type View } from '../store/useAppStore'
import { BayIcon, HomeIcon, SlidersIcon } from './icons'

const ITEMS: { view: View; label: string; Icon: () => React.JSX.Element }[] = [
  { view: 'settings', label: 'Settings', Icon: SlidersIcon },
  { view: 'home', label: 'Home', Icon: HomeIcon },
  { view: 'orders', label: 'Orders', Icon: BayIcon },
]

/** Three-section navbar, printed twice: on the rear bumper (belly side) and the top deck. */
export function NavBar() {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)

  return (
    <nav className="nav">
      {ITEMS.map(({ view: target, label, Icon }) => (
        <button
          key={target}
          type="button"
          className={`nav__item ${view === target ? 'nav__item--active' : ''}`}
          onClick={() => setView(target)}
          aria-current={view === target ? 'page' : undefined}
        >
          <Icon />
          <span className="nav__label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
