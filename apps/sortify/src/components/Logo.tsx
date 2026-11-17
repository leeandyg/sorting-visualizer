/** Sortify's mark: three sorted bars in a disc. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} role="img" aria-label="Sortify">
      <circle cx="16" cy="16" r="16" fill="var(--accent)" />
      <g fill="var(--shell)">
        <rect x="8" y="16.5" width="4" height="7.5" rx="2" />
        <rect x="14" y="12" width="4" height="12" rx="2" />
        <rect x="20" y="7.5" width="4" height="16.5" rx="2" />
      </g>
    </svg>
  )
}

/** The Sorting Visualizer's mark (its favicon): four rising bars, in that site's own blue. */
export function VisualizerLogo({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} role="img" aria-label="Sorting Visualizer">
      <g fill="#7b9ef0">
        <rect x="3" y="20" width="5" height="9" rx="1" />
        <rect x="10" y="14" width="5" height="15" rx="1" />
        <rect x="17" y="9" width="5" height="20" rx="1" />
        <rect x="24" y="3" width="5" height="26" rx="1" />
      </g>
    </svg>
  )
}
