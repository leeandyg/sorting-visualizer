import type { Frame, Item, SortAlgorithm, Step, Trace } from './types'

/** Largest array we record; bubble sort on this many is ~7.5k frames. */
export const MAX_SIZE = 100

/**
 * Runs the algorithm on a copy of `input` and records a Frame after every step.
 * The recorder keeps its own copy of the array and checks every event against it,
 * so a trace that disagrees with what the algorithm actually did throws instead
 * of silently animating something wrong.
 */
export function record(algorithm: SortAlgorithm, input: readonly number[]): Trace {
  if (input.length > MAX_SIZE) {
    throw new Error(`Arrays are limited to ${MAX_SIZE} elements`)
  }
  const work = [...input]
  let frame = initialFrame(input)
  const frames = [frame]
  for (const step of algorithm.run(work)) {
    frame = apply(frame, step)
    frames.push(frame)
  }

  const finalValues = frame.items.map((item) => item?.value)
  if (frame.held || finalValues.some((v, k) => v !== work[k])) {
    throw new Error(`${algorithm.name}: replayed trace does not match the algorithm's result`)
  }
  return { algorithmId: algorithm.id, input: [...input], output: work, frames }
}

function initialFrame(input: readonly number[]): Frame {
  return {
    step: null,
    items: input.map((value, id): Item => ({ id, value })),
    held: null,
    sorted: input.map(() => false),
    regions: [],
    counters: { comparisons: 0, swaps: 0, writes: 0 },
    line: null,
    vars: {},
  }
}

function apply(prev: Frame, step: Step): Frame {
  const items = [...prev.items]
  const counters = { ...prev.counters }
  let { held, sorted } = prev

  const at = (i: number): Item => {
    if (i < 0 || i >= items.length) throw new Error(`${step.type}: index ${i} out of range`)
    const item = items[i]
    if (!item) throw new Error(`${step.type}: index ${i} is the gap`)
    return item
  }
  const expectGap = (i: number) => {
    if (i < 0 || i >= items.length || items[i] !== null) {
      throw new Error(`${step.type}: index ${i} is not the gap`)
    }
  }

  switch (step.type) {
    case 'compare':
      at(step.i)
      at(step.j)
      counters.comparisons++
      break
    case 'compareHeld':
      if (!held) throw new Error('compareHeld: nothing is held')
      at(step.j)
      counters.comparisons++
      break
    case 'swap':
      ;[items[step.i], items[step.j]] = [at(step.j), at(step.i)]
      counters.swaps++
      counters.writes += 2
      break
    case 'lift':
      if (held) throw new Error('lift: already holding an element')
      held = at(step.i)
      items[step.i] = null
      break
    case 'shift':
      expectGap(step.to)
      items[step.to] = at(step.from)
      items[step.from] = null
      counters.writes++
      break
    case 'drop':
      if (!held) throw new Error('drop: nothing is held')
      expectGap(step.i)
      items[step.i] = held
      held = null
      counters.writes++
      break
    case 'markSorted':
      sorted = [...sorted]
      for (const i of step.indices) sorted[i] = true
      break
  }

  return {
    step,
    items,
    held,
    sorted,
    regions: step.regions ?? prev.regions,
    counters,
    line: step.line ?? prev.line,
    vars: step.vars ?? prev.vars,
  }
}
