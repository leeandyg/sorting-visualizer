import { useState } from 'react'

function read<T>(key: string, parse: (raw: unknown) => T | undefined, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return (stored === null ? undefined : parse(JSON.parse(stored))) ?? fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Not persisted; the value still applies for this visit.
  }
}

/** A number remembered per browser, kept between min and max. */
export function useStoredNumber(key: string, fallback: number, min: number, max: number) {
  const clamp = (n: number) => Math.min(Math.max(n, min), max)
  const [value, setValue] = useState(() =>
    read(key, (raw) => (typeof raw === 'number' && Number.isFinite(raw) ? clamp(raw) : undefined), fallback),
  )
  const update = (next: number) => {
    setValue(clamp(next))
    write(key, clamp(next))
  }
  return [value, update] as const
}

/** The most arrays the heart keeps; the oldest drop off. */
const MAX_LIKED = 12

const isArrayOfNumbers = (raw: unknown): raw is number[] => Array.isArray(raw) && raw.every((v) => typeof v === 'number')

/** Arrays saved with the heart, newest first, remembered per browser. */
export function useLikedArrays() {
  const [liked, setLiked] = useState(() =>
    read<number[][]>('sortify-liked', (raw) => (Array.isArray(raw) ? raw.filter(isArrayOfNumbers) : undefined), []),
  )
  const same = (a: number[], b: number[]) => a.length === b.length && a.every((v, k) => v === b[k])
  return {
    liked,
    isLiked: (values: number[]) => liked.some((entry) => same(entry, values)),
    toggle: (values: number[]) => {
      const without = liked.filter((entry) => !same(entry, values))
      const next = without.length < liked.length ? without : [values, ...liked].slice(0, MAX_LIKED)
      setLiked(next)
      write('sortify-liked', next)
    },
  }
}
