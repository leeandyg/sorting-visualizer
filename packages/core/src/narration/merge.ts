import type { AuxRef, Frame } from '../engine/types'
import { ident } from '../engine/lang'
import { range, valueAt, type Narrator } from './types'

const auxValue = (frame: Frame, ref: AuxRef) => frame.aux[ref.buffer]?.items[ref.at]?.value
const MERGE_LINES = ['merge', 'copyLeft', 'copyRight', 'compare', 'takeLeft', 'takeRight', 'restLeft', 'restRight']

export const mergeNarrator: Narrator = {
  intro: {
    beginner:
      'Merge sort splits the array in half, sorts each half (by splitting those in half too, all the way down to single elements), ' +
      'then merges the sorted halves back together. Merging uses temporary copies, shown in the row underneath, so merge sort needs extra memory. Press play to start.',
    expert: 'Top-down merge sort: recursive halving, stable merge through temporary left/right copies. Θ(n log n) time in every case, Θ(n) extra space.',
  },

  phase(frame, _n, level, lang) {
    const { lo, mid, hi } = frame.vars
    if (typeof lo !== 'number' || typeof hi !== 'number') return ''
    const beginner = level === 'beginner'
    if (MERGE_LINES.includes(frame.line ?? '') && typeof mid === 'number') {
      return beginner
        ? `Merging the sorted halves ${range(lo, mid, level)} and ${range(mid + 1, hi, level)}.`
        : `merge(a, ${lo}, ${mid}, ${hi})`
    }
    const call = `${ident('merge_sort', lang)}(a, ${lo}, ${hi})`
    if (lo >= hi) return beginner ? `Sorting ${range(lo, lo, level)}: a single element.` : call
    return beginner ? `Sorting ${range(lo, hi, level)}: split it in half first.` : call
  },

  step({ frame, level }) {
    const step = frame.step!
    const beginner = level === 'beginner'
    const { lo, mid, hi, k } = frame.vars as Record<string, number>
    switch (step.type) {
      case 'note':
        if (step.line === 'call') {
          return beginner
            ? `To sort ${range(lo, hi, level)}, split it at mid = ${mid} into a left half (${range(lo, mid, level)}) and a right half (${range(mid + 1, hi, level)}), and sort each half first.`
            : `mid = ${mid}; recurse on [${lo}, ${mid}] and [${mid + 1}, ${hi}]`
        }
        if (step.line === 'base') {
          return beginner
            ? `A range with one element (position ${lo}) is already sorted, so this call returns right away. This is where the splitting stops.`
            : `lo >= hi: return`
        }
        return beginner
          ? 'Both halves are now sorted. Merge them by repeatedly taking the smaller front value from either half.'
          : `merge [${lo}..${mid}] + [${mid + 1}..${hi}]`
      case 'copyOut':
        if (step.label === 'left') {
          return beginner
            ? `Copy the left half into a temporary array called left. The values also stay in the array (shown faded) until they get overwritten.`
            : `left = copy of a[${step.lo}..${step.hi}]`
        }
        return beginner
          ? `Copy the right half into right. Now ${range(lo, hi, level)} can be overwritten in sorted order.`
          : `right = copy of a[${step.lo}..${step.hi}]`
      case 'compareAux': {
        const [l, r] = [auxValue(frame, step.a)!, auxValue(frame, step.b)!]
        if (!beginner) return `left[${step.a.at}]=${l} ${l <= r ? '≤' : '>'} right[${step.b.at}]=${r} → take ${l <= r ? 'left' : 'right'}`
        const lead = `Compare the front of left, ${l}, with the front of right, ${r}. `
        if (l === r)
          return lead + 'They are equal, so take the one from left first. Preferring left on ties keeps equal values in their original order, which makes merge sort stable.'
        return lead + `${Math.min(l, r)} is smaller, so it goes next.`
      }
      case 'writeFromAux': {
        const v = valueAt(frame, step.to)
        const name = step.from.buffer === 0 ? 'left' : 'right'
        if (!beginner) return `a[${step.to}] = ${name}[${step.from.at}] (${v}); k = ${k}`
        if (step.line === 'restLeft' || step.line === 'restRight') {
          const other = name === 'left' ? 'right' : 'left'
          return `${other} is used up, so the rest of ${name} is already in order: copy ${v} straight across to position ${step.to}.`
        }
        return `Write ${v} into position ${step.to}.`
      }
      case 'markSorted':
        return beginner
          ? 'The last merge combined the two sorted halves of the whole array, so everything is in its final place. Sorted!'
          : 'sorted'
      default:
        return ''
    }
  },
}
