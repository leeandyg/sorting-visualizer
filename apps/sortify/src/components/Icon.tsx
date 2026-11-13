import type { ReactNode } from 'react'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const solid = { fill: 'currentColor' } as const

/** The "1" inside the step buttons, which borrow the look of a podcast player's skip-back / skip-ahead. */
const one = (
  <text x="12" y="16.4" textAnchor="middle" fontSize="8" fontWeight="800" fill="currentColor" stroke="none">
    1
  </text>
)

const HEART = 'M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z'
const SPEAKER = 'M3 9h4l5-4v14l-5-4H3z'

const ICONS = {
  play: <path d="M7 4.5v15l13-7.5z" {...solid} />,
  pause: <path d="M6 5h4.5v14H6zM13.5 5H18v14h-4.5z" {...solid} />,
  previous: <path d="M5 5h2.5v14H5zM20 5v14L9 12z" {...solid} />,
  next: <path d="M16.5 5H19v14h-2.5zM4 5v14l11-7z" {...solid} />,
  stepBack: (
    <>
      <path d="M12 6a7 7 0 1 1-6.7 5" {...stroke} />
      <path d="M12.5 2.5v7L7.5 6z" {...solid} />
      {one}
    </>
  ),
  stepForward: (
    <>
      <path d="M12 6a7 7 0 1 0 6.7 5" {...stroke} />
      <path d="M11.5 2.5v7l5-3.5z" {...solid} />
      {one}
    </>
  ),
  shuffle: (
    <path
      d="M3 7h3c2 0 3.3 1 4.3 2.6l3.4 4.8c1 1.6 2.3 2.6 4.3 2.6h3M18 14l3 3-3 3M3 17h3c1.3 0 2.3-.4 3.1-1.2M14.9 8.2c.8-.8 1.8-1.2 3.1-1.2h3M18 4l3 3-3 3"
      {...stroke}
    />
  ),
  repeat: <path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4" {...stroke} />,
  volume: (
    <>
      <path d={SPEAKER} {...solid} />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" {...stroke} />
    </>
  ),
  muted: (
    <>
      <path d={SPEAKER} {...solid} />
      <path d="M16 9.5l5 5M21 9.5l-5 5" {...stroke} />
    </>
  ),
  heart: <path d={HEART} {...stroke} />,
  heartFilled: <path d={HEART} {...stroke} fill="currentColor" />,
  home: <path d="M4 10.5L12 4l8 6.5V20h-5.5v-6h-5v6H4z" {...solid} />,
  search: <path d="M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM20 20l-4.8-4.8" {...stroke} />,
  sliders: (
    <path d="M4 7h8M18 7h2M4 17h2M12 17h8M12 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0M6 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0" {...stroke} />
  ),
  chevronDown: <path d="M5 9l7 7 7-7" {...stroke} />,
  link: (
    <path
      d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"
      {...stroke}
    />
  ),
  keyboard: <path d="M3 6.5h18v11H3zM7 10.5h.01M11 10.5h.01M15 10.5h.01M7.5 14h9" {...stroke} />,
  clock: <path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM12 8v4.5l3 1.5" {...stroke} />,
  external: <path d="M14 5h5v5M19 5l-8 8M11 7H6v11h11v-5" {...stroke} />,
  expand: <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" {...stroke} />,
  library: <path d="M5 4v16M10 4v16M15 5l4 15" {...stroke} />,
  tree: (
    <path
      d="M12 7v3M12 10l-5 4M12 10l5 4M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4M7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4M17 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
      {...stroke}
    />
  ),
  bars: <path d="M6 20v-6M12 20V9M18 20V4" {...stroke} strokeWidth={3} />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof ICONS

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}
