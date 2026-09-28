import { FlagMark } from './icons'

export function Header() {
  return (
    <header className="header">
      <h1 className="wordmark">
        <FlagMark size={30} />
        BearCarts
      </h1>
      <p className="header__dest">
        Delivering to <strong>South 40</strong>
      </p>
    </header>
  )
}
