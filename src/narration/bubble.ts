import { range, valueAt, type Narrator } from './types'

export const bubbleNarrator: Narrator = {
  intro: {
    beginner:
      'Bubble sort walks through the array comparing each pair of neighbours, and swaps them if they are in the wrong order. ' +
      'Each pass carries the largest value that is not yet in place all the way to the end, like a bubble rising. Press play to start.',
    expert: 'Bubble sort: repeated adjacent compare-and-swap passes, with early exit when a pass makes no swaps.',
  },

  phase(frame, n, level) {
    const i = frame.vars.i
    if (typeof i !== 'number') return ''
    const end = n - 1 - i
    return level === 'beginner'
      ? `Pass ${i + 1} of at most ${n - 1}: moving the largest value in ${range(0, end, level)} to position ${end}.`
      : `pass ${i + 1}/${n - 1}, unsorted ${range(0, end, level)}`
  },

  step({ frame, prev, n, level }) {
    const step = frame.step!
    const beginner = level === 'beginner'
    switch (step.type) {
      case 'compare': {
        const [x, y] = [valueAt(frame, step.i)!, valueAt(frame, step.j)!]
        if (!beginner) return `a[${step.i}]=${x} ${x > y ? '>' : '≤'} a[${step.j}]=${y} → ${x > y ? 'swap' : 'no swap'}`
        const lead = `Compare ${x} (position ${step.i}) with its right neighbour ${y} (position ${step.j}). `
        if (x > y) return lead + `${x} is bigger, so they are in the wrong order and need to swap.`
        if (x === y)
          return lead + `They are equal, so leave them. Never swapping equal values is what makes bubble sort stable.`
        return lead + `${x} is smaller, so they are already in order. Leave them and move on.`
      }
      case 'swap': {
        const [y, x] = [valueAt(frame, step.i)!, valueAt(frame, step.j)!]
        if (!beginner) return `swap a[${step.i}], a[${step.j}]; swapped = True`
        const firstSwap = prev.vars.swapped !== true
        return (
          `Swap them: ${x} moves right to position ${step.j} and ${y} moves left to position ${step.i}.` +
          (firstSwap ? ' This pass made a swap, so swapped is now True: the array might not be sorted yet.' : '')
        )
      }
      case 'markSorted': {
        if (step.line === 'checkSwapped') {
          const k = step.indices[0]
          const v = valueAt(frame, k)
          const swapped = frame.vars.swapped === true
          if (!beginner) return `pass done: a[${k}]=${v} final${swapped ? '' : '; no swaps → break'}`
          return (
            `End of pass. ${v} has bubbled up to position ${k}, which is its final spot. ` +
            (swapped
              ? 'This pass made at least one swap, so the rest might still be out of order. Start another pass.'
              : 'This pass made no swaps at all, so every neighbouring pair is already in order.')
          )
        }
        if (step.line === 'break') {
          const hi = step.indices.at(-1)!
          if (!beginner) return `early exit: ${range(0, hi, level)} final`
          return (
            `No swaps means the whole array is sorted, so stop early instead of doing the remaining passes. ` +
            `This shortcut is why bubble sort needs only ${n - 1} comparisons on an already sorted array.`
          )
        }
        if (!beginner) return 'a[0] final; sorted'
        return `All ${n - 1} passes are done. The only value left, ${valueAt(frame, 0)}, must be the smallest, so it is already in place. Sorted!`
      }
      default:
        return ''
    }
  },
}
