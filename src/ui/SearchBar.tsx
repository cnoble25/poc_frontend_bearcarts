import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { SearchIcon } from './icons'

export function SearchBar() {
  const setQuery = useAppStore((s) => s.setQuery)
  const [value, setValue] = useState('')

  // Debounce so the belt doesn't spin on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => setQuery(value), 350)
    return () => clearTimeout(id)
  }, [value, setQuery])

  return (
    <label className="search">
      <span className="search__icon">
        <SearchIcon />
      </span>
      <input
        className="search__input"
        type="search"
        placeholder="Search restaurants or food"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search restaurants or food"
      />
      {value && (
        <button className="search__clear" type="button" onClick={() => setValue('')} aria-label="Clear search">
          ×
        </button>
      )}
    </label>
  )
}
