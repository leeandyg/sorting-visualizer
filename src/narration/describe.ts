import type { Frame } from '../engine/types'

/**
 * A one-line, code-level description of a step. Placeholder until the full
 * beginner/expert narration lands in phase 2.
 */
export function describeStep(frame: Frame): string {
  const step = frame.step
  const value = (i: number) => frame.items[i]?.value
  if (!step) return 'Initial array. Press play to start.'
  switch (step.type) {
    case 'compare':
      return `Compare a[${step.i}] = ${value(step.i)} with a[${step.j}] = ${value(step.j)}`
    case 'compareHeld':
      return `Compare key = ${frame.held?.value} with a[${step.j}] = ${value(step.j)}`
    case 'swap':
      return `Swap a[${step.i}] and a[${step.j}]`
    case 'lift':
      return `Take key = ${frame.held?.value} out of a[${step.i}]`
    case 'shift':
      return `Shift ${value(step.to)} right: a[${step.to}] = a[${step.from}]`
    case 'drop':
      return `Place key = ${value(step.i)} at a[${step.i}]`
    case 'markSorted':
      if (frame.sorted.every(Boolean)) return 'Sorted! Every element is in its final position.'
      return step.indices.length === 1
        ? `a[${step.indices[0]}] = ${value(step.indices[0])} is in its final position`
        : `a[${step.indices[0]}..${step.indices.at(-1)}] are in their final positions`
  }
}
