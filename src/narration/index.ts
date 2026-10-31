import type { AlgorithmId, Trace } from '../engine/types'
import { bubbleNarrator } from './bubble'
import { insertionNarrator } from './insertion'
import type { Level, Narration, Narrator } from './types'

const narrators: Record<AlgorithmId, Narrator> = {
  bubble: bubbleNarrator,
  insertion: insertionNarrator,
}

export function narrate(trace: Trace, index: number, level: Level): Narration {
  const narrator = narrators[trace.algorithmId]
  const frame = trace.frames[index]
  const n = trace.input.length
  if (n < 2) return { phase: '', text: 'An array with fewer than two elements is already sorted.' }
  if (!frame.step) return { phase: '', text: narrator.intro[level] }

  const text = narrator.step({ frame, prev: trace.frames[index - 1], n, level })
  const done = frame.sorted.every(Boolean)
  if (!done) return { phase: narrator.phase(frame, n, level), text }

  const { comparisons, swaps, writes } = frame.counters
  const totals =
    level === 'beginner'
      ? `Finished with ${comparisons} comparisons, ${swaps} swaps and ${writes} writes.`
      : `${comparisons} comparisons, ${swaps} swaps, ${writes} writes`
  return { phase: totals, text }
}

export type { Level, Narration } from './types'
