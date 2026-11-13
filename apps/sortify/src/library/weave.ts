import { type AlgorithmId, algorithms, type Frame, record } from '@sortviz/core'

/** The same fixed, shuffled input for every cover, so covers differ only by how the algorithm moves things. */
const COVER_INPUT = [9, 3, 12, 6, 14, 1, 10, 4, 13, 7, 2, 11, 5, 8]
/** How many moments of the run a cover samples, left (shuffled) to right (sorted). */
const SAMPLES = 22

export interface WeaveLine {
  value: number
  /** The value's position in the array at each sampled moment. */
  path: number[]
}

/** Where every element sits in a frame, by item id, including ones lifted out or copied to a temporary array. */
function positions(frame: Frame): Map<number, number> {
  const at = new Map<number, number>()
  frame.items.forEach((item, k) => {
    if (item) at.set(item.id, k)
  })
  if (frame.held) at.set(frame.held.id, frame.items.indexOf(null))
  for (const buffer of frame.aux) {
    buffer.items.forEach((item, k) => {
      if (item) at.set(item.id, buffer.lo + k)
    })
  }
  return at
}

const cache = new Map<AlgorithmId, WeaveLine[]>()

/**
 * An algorithm's cover art as data: the route each value takes from its shuffled place to its
 * sorted place. Bubble sort drifts, merge sort moves in blocks, quick sort leaps, so every
 * algorithm draws a different pattern.
 */
export function weave(id: AlgorithmId): WeaveLine[] {
  const cached = cache.get(id)
  if (cached) return cached
  const { frames } = record(algorithms[id], COVER_INPUT)
  const sampled = Array.from({ length: SAMPLES }, (_, s) =>
    positions(frames[Math.round((s / (SAMPLES - 1)) * (frames.length - 1))]),
  )
  const lines = frames[0].items.map((item, start) => ({
    value: item!.value,
    // An element is always somewhere; the fallback only guards against a frame that lost track of it.
    path: sampled.map((at) => at.get(item!.id) ?? start),
  }))
  cache.set(id, lines)
  return lines
}
