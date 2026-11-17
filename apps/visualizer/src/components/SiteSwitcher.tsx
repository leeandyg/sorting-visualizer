import { useEffect, useState } from 'react'
import { sites } from '@sortviz/core'
import { leaveWithFade } from '../settings/siteSwitch'
import './SiteSwitcher.css'

/** This site's mark (the favicon): four rising bars. */
function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <g fill="var(--accent)">
        <rect x="3" y="20" width="5" height="9" rx="1" />
        <rect x="10" y="14" width="5" height="15" rx="1" />
        <rect x="17" y="9" width="5" height="20" rx="1" />
        <rect x="24" y="3" width="5" height="26" rx="1" />
      </g>
    </svg>
  )
}

/** Sortify's mark: three sorted bars in a blue disc (its own blue, not this site's accent). */
function SortifyLogo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#4b9bff" />
      <g fill="#000">
        <rect x="8" y="16.5" width="4" height="7.5" rx="2" />
        <rect x="14" y="12" width="4" height="12" rx="2" />
        <rect x="20" y="7.5" width="4" height="16.5" rx="2" />
      </g>
    </svg>
  )
}

/**
 * The page title, as a menu for moving between the two sites. The other site is a real link
 * (so it can be opened in a new tab) that carries the current algorithm, array, step and speed.
 */
export function SiteSwitcher({ href }: { href: string }) {
  const [open, setOpen] = useState(false)
  const [root, setRoot] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open || !root) return
    const onPointerDown = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, root])

  return (
    <div className="site-switcher" ref={setRoot}>
      <h1>
        <button type="button" aria-haspopup="true" aria-expanded={open} title={open ? undefined : 'Switch site'} onClick={() => setOpen(!open)}>
          <Logo />
          {sites.visualizer.name}
          <svg className="site-caret" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </h1>
      {open && (
        <div className="site-menu">
          <div className="site-option is-current" aria-current="page">
            <Logo />
            <span>
              <strong>{sites.visualizer.name}</strong>
              <small>{sites.visualizer.blurb}</small>
            </span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <a className="site-option" href={href} onClick={leaveWithFade}>
            <SortifyLogo />
            <span>
              <strong>{sites.sortify.name}</strong>
              <small>{sites.sortify.blurb}</small>
            </span>
          </a>
        </div>
      )}
    </div>
  )
}
