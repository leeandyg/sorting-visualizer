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
  mic: <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" {...stroke} />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" {...stroke} />,
  close: <path d="M6 6l12 12M18 6L6 18" {...stroke} />,
  chevronRight: <path d="M9 5l7 7-7 7" {...stroke} />,
  chevronLeft: <path d="M15 5l-7 7 7 7" {...stroke} />,
  /** A filled triangle that points right when closed; rotate it 90° for open, like a music app's folder toggle. */
  caret: <path d="M9 6.5v11l8-5.5z" {...solid} />,
  /** A handheld mic held at an angle: the round head up and right, the handle down to the left. */
  lyrics: (
    <>
      <circle cx="15.5" cy="8.5" r="4.5" {...stroke} />
      {/* A wide collar under the head and a handle tapering to the tip: a magnifier's is a thin bar. */}
      <path d="M10.3 10.3L13.7 13.7M10.3 10.3L4.8 17.4a1.3 1.3 0 0 0 1.8 1.8L13.7 13.7" {...stroke} />
    </>
  ),
  /** Four corners pointing out (open the stage) and in (leave it). */
  fullscreen: <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" {...stroke} />,
  exitFullscreen: <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" {...stroke} />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof ICONS

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}
