const base = {
  width: 26,
  height: 26,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const SearchIcon = () => (
  <svg {...base} width={20} height={20}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
)

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M4 11.5 12 5l8 6.5" />
    <path d="M6.5 10v9h11v-9" />
  </svg>
)

export const SlidersIcon = () => (
  <svg {...base}>
    <path d="M5 7h9M18 7h1M5 17h1M10 17h9" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </svg>
)

/** Orders: the robot's cargo bay, seen as a lidded box. */
export const BayIcon = () => (
  <svg {...base}>
    <rect x="4.5" y="9" width="15" height="10" rx="3" />
    <path d="M4.5 9 7 5.5h10L19.5 9M10 13h4" />
  </svg>
)

/** The orange safety flag that tops every robot. */
export const FlagMark = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path d="M6 22V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 3.5 19 8 7 12.5Z" fill="var(--flag)" />
  </svg>
)
