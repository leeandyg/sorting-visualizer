import type { MouseEvent } from 'react'

/**
 * The two sites are different addresses, so the browser can't animate between them. Instead the
 * page fades out before a plain click leaves, and fades in when it arrives from the other site.
 */
const LEAVE_MS = 180

/** For the link to the other site. Middle-click, Cmd/Ctrl-click and the like stay the browser's (new tab). */
export function leaveWithFade(e: MouseEvent<HTMLAnchorElement>) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  const { href } = e.currentTarget
  document.documentElement.classList.add('is-leaving')
  window.setTimeout(() => window.location.assign(href), LEAVE_MS)
}

/**
 * Call once on load, before the app renders. `arrived` is true when the link came from the other
 * site's switcher; `setting` is a stored choice it carried (the code language), written to this
 * site's storage key so the app starts with it and keeps it.
 */
export function initSiteSwitch(arrived: boolean, setting?: [key: string, value: string]) {
  if (arrived) document.documentElement.classList.add('is-arriving')
  if (setting) {
    try {
      localStorage.setItem(...setting)
    } catch {
      // Storage unavailable: the app falls back to its default language.
    }
  }
  // Coming back with the browser's Back button restores the page as it was left: faded out.
  window.addEventListener('pageshow', () => document.documentElement.classList.remove('is-leaving'))
}
