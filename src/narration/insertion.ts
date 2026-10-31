import { range, valueAt, type Narrator } from './types'

export const insertionNarrator: Narrator = {
  intro: {
    beginner:
      'Insertion sort builds a sorted section at the start of the array, one element at a time, like sorting playing cards in your hand. ' +
      'It takes the next element (the key), slides bigger elements one step right to open a gap, then drops the key into the gap. Press play to start.',
    expert: 'Insertion sort: grow a sorted prefix by shifting larger elements right and inserting each key into the gap.',
  },

  phase(frame, n, level) {
    const { i, key } = frame.vars
    if (typeof i !== 'number' || typeof key !== 'number') return ''
    return level === 'beginner'
      ? `Inserting ${key} (from position ${i}) into the sorted part, ${range(0, i - 1, level)}.`
      : `i = ${i}/${n - 1}: insert ${key} into ${range(0, i - 1, level)}`
  },

  step({ frame, level, n }) {
    const step = frame.step!
    const beginner = level === 'beginner'
    const key = frame.vars.key as number
    switch (step.type) {
      case 'lift': {
        if (!beginner) return `key = a[${step.i}] = ${key}; j = ${step.i - 1}`
        const sorted =
          step.i === 1
            ? 'A single element on its own is always sorted, so position 0 counts as the sorted part.'
            : `Everything to its left, ${range(0, step.i - 1, level)}, is already sorted.`
        return `Pick up ${key} as the key, leaving a gap at position ${step.i}. ${sorted} Now find where ${key} belongs in it.`
      }
      case 'compareHeld': {
        const x = valueAt(frame, step.j)!
        if (!beginner) return `a[${step.j}]=${x} ${x > key ? '>' : '≤'} key=${key} → ${x > key ? 'shift' : 'stop'}`
        const lead = `Compare the key, ${key}, with ${x} at position ${step.j}. `
        if (x > key) return lead + `${x} is bigger, so it has to move right to make room.`
        if (x === key)
          return lead + `They are equal, so stop here. Not moving past equal values keeps them in their original order, which is what makes insertion sort stable.`
        return lead + `${x} is smaller, so the key belongs right after it, at position ${step.j + 1}. Stop looking.`
      }
      case 'shift': {
        const x = valueAt(frame, step.to)!
        if (!beginner) return `a[${step.to}] = a[${step.from}] (${x}); j = ${step.from - 1}`
        return `Shift ${x} one step right, from position ${step.from} to ${step.to}. The gap moves left to position ${step.from}.`
      }
      case 'drop': {
        const i = frame.vars.i as number
        const j = frame.vars.j as number
        if (!beginner) return `a[${step.i}] = key (${key})${j < 0 ? '; j = -1, front of array' : ''}`
        const nowSorted = i === n - 1 ? '' : ` Now ${range(0, i, level)} is sorted.`
        if (step.i === i) return `The key, ${key}, was already in the right place. Put it back at position ${i}.${nowSorted}`
        if (j < 0)
          return `j reached -1: ${key} is smaller than everything in the sorted part, so it goes at the very front, position 0.${nowSorted}`
        return `Drop the key, ${key}, into the gap at position ${step.i}.${nowSorted}`
      }
      case 'markSorted':
        if (!beginner) return 'sorted'
        return 'Every element has been inserted into the sorted part, so the whole array is sorted!'
      default:
        return ''
    }
  },
}
