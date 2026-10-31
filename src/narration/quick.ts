import { range, valueAt, type Level, type Narrator, type StepContext } from './types'

type Scheme = 'lomuto' | 'hoare'

const intros: Record<Scheme, Record<Level, string>> = {
  lomuto: {
    beginner:
      'Quick sort picks a pivot, then partitions: everything smaller than or equal to the pivot moves to its left, and everything bigger to its right. ' +
      'The pivot is then in its final position, and each side is sorted the same way. This version (Lomuto) uses the last element as the pivot. Press play to start.',
    expert: 'Quicksort, Lomuto partition: pivot = a[hi], one forward scan. Average Θ(n log n); worst Θ(n²), e.g. on already sorted input. Not stable.',
  },
  hoare: {
    beginner:
      'Quick sort picks a pivot, then partitions the array into a part with values ≤ the pivot and a part with values ≥ it, and sorts each part the same way. ' +
      "This version (Hoare) uses the middle element's value as the pivot and scans from both ends toward the middle, swapping pairs that are on the wrong side. " +
      'It does fewer swaps than Lomuto. Press play to start.',
    expert: 'Quicksort, Hoare partition: pivot = a[(lo+hi)//2] by value, two converging scans, recurse on [lo, p] and [p+1, hi]. Fewer swaps than Lomuto. Not stable.',
  },
}

export function quickNarrator(scheme: Scheme): Narrator {
  return {
    intro: intros[scheme],

    phase(frame, _n, level) {
      const { lo, hi, pivot } = frame.vars
      if (typeof lo !== 'number' || typeof hi !== 'number') return ''
      if (level === 'expert') return `quick_sort(a, ${lo}, ${hi})${typeof pivot === 'number' ? `, pivot = ${pivot}` : ''}`
      return typeof pivot === 'number'
        ? `Partitioning ${range(lo, hi, level)} around the pivot, ${pivot}.`
        : `Sorting ${range(lo, hi, level)}.`
    },

    step(ctx) {
      const step = ctx.frame.step!
      if (step.type === 'markSorted' && step.line === 'check') {
        const k = step.indices[0]
        return ctx.level === 'beginner'
          ? `Position ${k} is a range of just one element. Everything to its left is no bigger and everything to its right is no smaller, so it is already in its final place.`
          : `lo == hi: a[${k}] final`
      }
      if (step.type === 'note' && step.line === 'check') {
        const { lo, hi } = ctx.frame.vars as Record<string, number>
        return ctx.level === 'beginner'
          ? `Sort ${range(lo, hi, ctx.level)}. It has more than one element, so partition it.`
          : `lo < hi: partition(a, ${lo}, ${hi})`
      }
      return scheme === 'lomuto' ? lomutoStep(ctx) : hoareStep(ctx)
    },
  }
}

function lomutoStep({ frame, level }: StepContext): string {
  const step = frame.step!
  const beginner = level === 'beginner'
  const { lo, hi, pivot, i, j, p } = frame.vars as Record<string, number>
  switch (step.type) {
    case 'note':
      return beginner
        ? `Choose the last element, ${pivot} (position ${hi}), as the pivot. i = ${lo - 1} marks the end of the "≤ pivot" section, which starts out empty.`
        : `pivot = a[${hi}] = ${pivot}; i = ${lo - 1}`
    case 'compareValue': {
      const x = valueAt(frame, step.i)!
      if (!beginner) return `a[${j}]=${x} ${x <= pivot ? '≤' : '>'} pivot=${pivot} → ${x <= pivot ? 'i += 1, swap' : 'skip'}`
      return x <= pivot
        ? `Compare ${x} (position ${j}) with the pivot, ${pivot}. It is smaller or equal, so it belongs in the "≤ pivot" section.`
        : `Compare ${x} (position ${j}) with the pivot, ${pivot}. It is bigger, so leave it where it is, in the "> pivot" section.`
    }
    case 'swap': {
      if (step.line === 'place') {
        return beginner
          ? `Every value has been checked. Swap the pivot into position ${p}, right after the "≤ pivot" section.`
          : `swap a[${p}], a[${hi}]; return p = ${p}`
      }
      const v = valueAt(frame, i)
      if (!beginner) return `i = ${i}; swap a[${i}], a[${j}]`
      if (i === j) return `Grow the "≤ pivot" section by one: i = ${i}. ${v} is already at position ${i}, so the swap leaves it in place.`
      return `Grow the "≤ pivot" section by one (i = ${i}) and swap ${v} into it. ${valueAt(frame, j)}, which is bigger than the pivot, moves to position ${j}.`
    }
    case 'markSorted':
      return beginner
        ? `The pivot, ${pivot}, is now in its final position: everything to its left is ≤ ${pivot} and everything to its right is bigger. Next, sort each side.`
        : `a[${p}]=${pivot} final; recurse on [${lo}, ${p - 1}] and [${p + 1}, ${hi}]`
    default:
      return ''
  }
}

function hoareStep({ frame, level }: StepContext): string {
  const step = frame.step!
  const beginner = level === 'beginner'
  const { lo, hi, pivot, i, j } = frame.vars as Record<string, number>
  switch (step.type) {
    case 'note': {
      if (step.line === 'pivot') {
        const mid = Math.floor((lo + hi) / 2)
        return beginner
          ? `Choose the middle element's value, ${pivot} (position ${mid}), as the pivot. i starts just left of the range and j just right of it; they will scan toward each other.`
          : `pivot = a[${mid}] = ${pivot}; i = ${lo - 1}; j = ${hi + 1}`
      }
      return beginner
        ? `i (${i}) and j (${j}) have met or crossed, so the partition is done: ${range(lo, j, level)} hold values ≤ ${pivot} and ${range(j + 1, hi, level)} hold values ≥ ${pivot}. Sort each part. Unlike Lomuto, the pivot is not necessarily in its final spot yet.`
        : `i >= j: return p = ${j}; recurse on [${lo}, ${j}] and [${j + 1}, ${hi}]`
    }
    case 'compareValue': {
      const x = valueAt(frame, step.i)!
      if (step.line === 'scanI') {
        if (!beginner) return `a[${i}]=${x} ${x < pivot ? '<' : '≥'} pivot=${pivot} → ${x < pivot ? 'i += 1' : 'stop i'}`
        return x < pivot
          ? `i scans right: ${x} at position ${i} is smaller than the pivot (${pivot}), so it is already on the correct side. Keep going.`
          : `i stops at position ${i}: ${x} is not smaller than the pivot (${pivot}), so it may belong on the right side.`
      }
      if (!beginner) return `a[${j}]=${x} ${x > pivot ? '>' : '≤'} pivot=${pivot} → ${x > pivot ? 'j -= 1' : 'stop j'}`
      return x > pivot
        ? `j scans left: ${x} at position ${j} is bigger than the pivot (${pivot}), so it is already on the correct side. Keep going.`
        : `j stops at position ${j}: ${x} is not bigger than the pivot (${pivot}), so it may belong on the left side.`
    }
    case 'swap':
      return beginner
        ? `i and j have not crossed, so swap the two values that are on the wrong sides: ${valueAt(frame, i)} goes left to position ${i} and ${valueAt(frame, j)} goes right to position ${j}.`
        : `swap a[${i}], a[${j}]`
    default:
      return ''
  }
}
