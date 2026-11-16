/**
 * Back/forward through the views, like a browser or a music app's ‹ › buttons: going somewhere new
 * drops whatever was ahead; going back and forward only moves the pointer.
 */
export interface History<T> {
  entries: T[]
  at: number
}

/** The longest trail kept; nobody pages back further, and it keeps the list from growing forever. */
const LIMIT = 50

export const startHistory = <T>(first: T): History<T> => ({ entries: [first], at: 0 })

export function visit<T>(history: History<T>, next: T): History<T> {
  if (history.entries[history.at] === next) return history
  const entries = [...history.entries.slice(0, history.at + 1), next].slice(-LIMIT)
  return { entries, at: entries.length - 1 }
}

export function step<T>(history: History<T>, by: -1 | 1): History<T> {
  const at = history.at + by
  return at < 0 || at >= history.entries.length ? history : { ...history, at }
}

export const current = <T>(history: History<T>): T => history.entries[history.at]
export const canGo = <T>(history: History<T>, by: -1 | 1) => history.at + by >= 0 && history.at + by < history.entries.length
