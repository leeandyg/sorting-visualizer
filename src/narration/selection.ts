import { range, valueAt, type Narrator } from './types'

export const selectionNarrator: Narrator = {
  intro: {
    beginner:
      'Selection sort repeatedly finds the smallest value in the unsorted part of the array and swaps it to the front of that part. ' +
      'After each pass, one more position at the start holds its final value. Press play to start.',
    expert: 'Selection sort: scan the unsorted suffix for its minimum and swap it into position i. Always Θ(n²) comparisons, at most n − 1 swaps. Not stable.',
  },

  phase(frame, n, level) {
    const i = frame.vars.i
    if (typeof i !== 'number') return ''
    return level === 'beginner'
      ? `Pass ${i + 1} of ${n - 1}: finding the smallest value in ${range(i, n - 1, level)} to put at position ${i}.`
      : `i = ${i}: min of ${range(i, n - 1, level)} → a[${i}]`
  },

  step({ frame, n, level }) {
    const step = frame.step!
    const beginner = level === 'beginner'
    const i = frame.vars.i as number
    const minIdx = frame.vars.min_idx as number
    switch (step.type) {
      case 'note': {
        const v = valueAt(frame, minIdx)
        if (step.line === 'outer') {
          return beginner
            ? `Start by assuming the first unsorted value, ${v} at position ${i}, is the smallest. min_idx = ${i}.`
            : `min_idx = ${i} (${v})`
        }
        return beginner ? `min_idx = ${minIdx}: ${v} is now the smallest value found in this pass.` : `min_idx = ${minIdx}`
      }
      case 'compare': {
        const [x, m] = [valueAt(frame, step.i)!, valueAt(frame, step.j)!]
        if (!beginner) return `a[${step.i}]=${x} ${x < m ? '<' : '≥'} a[${step.j}]=${m}${x < m ? ` → min_idx = ${step.i}` : ''}`
        const lead = `Compare ${x} (position ${step.i}) with the smallest so far, ${m} (position ${step.j}). `
        if (x < m) return lead + `${x} is smaller, so it becomes the new smallest.`
        if (x === m) return lead + `They are equal. Only a strictly smaller value replaces the smallest, so keep position ${step.j}.`
        return lead + `${x} is bigger, so the smallest is still ${m}.`
      }
      case 'swap': {
        const v = valueAt(frame, step.i)
        if (step.i === step.j) {
          return beginner
            ? `The smallest value, ${v}, is already at position ${step.i}. The code still runs the swap, but swapping a position with itself changes nothing.`
            : `swap a[${step.i}], a[${step.j}] (no-op)`
        }
        const w = valueAt(frame, step.j)
        return beginner
          ? `Swap the smallest value, ${v}, into position ${step.i}. ${w} moves to position ${step.j} to make room. A long jump like this can carry a value past an equal one, which is why selection sort is not stable.`
          : `swap a[${step.i}], a[${step.j}]`
      }
      case 'markSorted': {
        const k = step.indices[0]
        const v = valueAt(frame, k)
        if (k === n - 1) {
          return beginner
            ? `Only position ${k} is left, so it must hold the largest value, ${v}. Sorted!`
            : `a[${k}]=${v} final; sorted`
        }
        return beginner
          ? `Position ${k} now holds ${v}, the smallest of what was left, so it is final.`
          : `a[${k}]=${v} final`
      }
      default:
        return ''
    }
  },
}
