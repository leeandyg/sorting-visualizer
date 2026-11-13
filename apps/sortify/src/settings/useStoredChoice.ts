import { useState } from 'react'

/** A string setting remembered in localStorage per browser; falls back quietly when storage is unavailable. */
export function useStoredChoice<T extends string>(key: string, allowed: readonly T[], fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return allowed.includes(stored as T) ? (stored as T) : fallback
    } catch {
      return fallback
    }
  })

  const update = (next: T) => {
    setValue(next)
    try {
      localStorage.setItem(key, next)
    } catch {
      // Not persisted; the choice still applies for this visit.
    }
  }

  return [value, update] as const
}
