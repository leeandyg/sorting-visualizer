import { algorithms } from '../algorithms'
import type { Lang } from '../engine/lang'
import { duplicateTags, superscript } from '../engine/tags'
import type { AlgorithmId, Frame, Trace } from '../engine/types'
import { bubbleNarrator } from './bubble'
import { heapNarrator } from './heap'
import { insertionNarrator } from './insertion'
import { mergeNarrator } from './merge'
import { quickNarrator } from './quick'
import { selectionNarrator } from './selection'
import type { Level, Narration, Narrator } from './types'

const narrators: Record<AlgorithmId, Narrator> = {
  bubble: bubbleNarrator,
  selection: selectionNarrator,
  insertion: insertionNarrator,
  merge: mergeNarrator,
  'quick-lomuto': quickNarrator('lomuto'),
  'quick-hoare': quickNarrator('hoare'),
  heap: heapNarrator,
}

export function narrate(trace: Trace, index: number, level: Level, lang: Lang = 'python'): Narration {
  const narrator = narrators[trace.algorithmId]
  const frame = trace.frames[index]
  const n = trace.input.length
  if (n < 2) return { phase: '', text: 'An array with fewer than two elements is already sorted.' }
  if (!frame.step) return { phase: '', text: narrator.intro[level] }

  const text = narrator.step({ frame, prev: trace.frames[index - 1], n, level, lang })
  const done = frame.sorted.every(Boolean)
  if (!done) return { phase: narrator.phase(frame, n, level, lang), text }

  const { comparisons, swaps, writes } = frame.counters
  const totals =
    level === 'beginner'
      ? `Finished with ${comparisons} comparisons, ${swaps} swaps and ${writes} writes.`
      : `${comparisons} comparisons, ${swaps} swaps, ${writes} writes`
  return { phase: totals + stabilityNote(trace, frame, level), text }
}

/** When the input has duplicates, says whether this run kept equal values in their original order. */
function stabilityNote(trace: Trace, frame: Frame, level: Level): string {
  const tags = duplicateTags(trace.input)
  if (tags.size === 0) return ''
  const items = frame.items.map((item) => item!)
  for (let k = 1; k < items.length; k++) {
    const [x, y] = [items[k - 1], items[k]]
    if (x.value === y.value && x.id > y.id) {
      const [early, late] = [`${y.value}${superscript(tags.get(y.id)!)}`, `${x.value}${superscript(tags.get(x.id)!)}`]
      return level === 'beginner'
        ? ` Equal values changed order (${late} now comes before ${early}), so this run was not stable.`
        : `; not stable (${late} before ${early})`
    }
  }
  const algorithm = algorithms[trace.algorithmId]
  if (!algorithm.stable) {
    // A lucky run isn't a guarantee; don't let it suggest the algorithm is stable.
    const name = (algorithm.family?.name ?? algorithm.name).toLowerCase()
    return level === 'beginner'
      ? ` Equal values happened to keep their original order this time (see the small letters), but ${name} is not stable in general.`
      : '; order of equal values preserved this run (not guaranteed)'
  }
  return level === 'beginner' ? ' Equal values kept their original order (see the small letters), so this run was stable.' : '; stable'
}

export type { Level, Narration } from './types'
