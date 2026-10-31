import { range, valueAt, type Narrator } from './types'

export const heapNarrator: Narrator = {
  intro: {
    beginner:
      'Heap sort first rearranges the array into a max-heap: a binary tree (drawn below the bars) where every parent is at least as big as its children, ' +
      'so the largest value sits at the root, position 0. The children of position i are at 2i + 1 and 2i + 2. ' +
      'Then it repeatedly swaps the root to the end, shrinks the heap by one, and repairs the heap. Press play to start.',
    expert: 'Heap sort: bottom-up heapify, then n − 1 extract-max steps with sift-down. Θ(n log n) worst case, in place, not stable.',
  },

  phase(frame, _n, level) {
    const size = frame.vars.size
    const extracting = frame.sorted.some(Boolean)
    if (level === 'expert') return extracting && typeof size === 'number' ? `extract, heap size ${size}` : 'build heap'
    if (!extracting) return 'Phase 1: building a max-heap from the array, so every parent is at least as big as its children.'
    return typeof size === 'number'
      ? `Phase 2: the heap is ${range(0, size - 1, level)}. Each round moves its largest value, the root, to the end.`
      : ''
  },

  step({ frame, n, level }) {
    const step = frame.step!
    const beginner = level === 'beginner'
    const { size, root, child, start, end } = frame.vars as Record<string, number>
    switch (step.type) {
      case 'note':
        if (step.line === 'build') {
          return beginner
            ? `Fix the subtree rooted at position ${start} (value ${valueAt(frame, start)}). Work backwards from the last parent, so the subtrees below are already heaps.`
            : `sift_down(a, ${start}, ${n})`
        }
        return beginner
          ? `Position ${root} has no children inside the heap, so there is nothing below it to fix. This sift is done.`
          : `child ${2 * root + 1} >= size ${size}: return`
      case 'compare': {
        if (step.line === 'pickChild') {
          const [right, left] = [valueAt(frame, step.i)!, valueAt(frame, step.j)!]
          const chosen = right > left ? step.i : step.j
          return beginner
            ? `Position ${root} has two children: ${left} (position ${step.j}) and ${right} (position ${step.i}). Pick the bigger one, ${Math.max(left, right)}, to compare with the parent.`
            : `a[${step.i}]=${right} ${right > left ? '>' : '≤'} a[${step.j}]=${left} → child = ${chosen}`
        }
        const [r, c] = [valueAt(frame, step.i)!, valueAt(frame, step.j)!]
        if (!beginner) return `a[${root}]=${r} ${r >= c ? '≥' : '<'} a[${child}]=${c} → ${r >= c ? 'stop' : 'swap'}`
        const which = 2 * root + 2 >= size ? 'its only child' : 'its bigger child'
        const lead = `Compare the parent, ${r} (position ${root}), with ${which}, ${c}. `
        return r >= c
          ? lead + 'The parent is bigger or equal, so this part of the heap is in order. Stop.'
          : lead + 'The child is bigger, so they swap and the bigger value moves up.'
      }
      case 'swap': {
        if (step.line === 'extract') {
          return beginner
            ? `The root is the largest value in the heap. Swap it to position ${end}, the last spot in the heap.`
            : `swap a[0], a[${end}]`
        }
        const [big, small] = [valueAt(frame, step.i), valueAt(frame, step.j)]
        return beginner
          ? `Swap them: ${big} moves up to position ${step.i} and ${small} moves down to position ${step.j}. Keep sifting ${small} down from there.`
          : `swap a[${step.i}], a[${step.j}]; root = ${step.j}`
      }
      case 'markSorted': {
        const k = step.indices[0]
        if (typeof end !== 'number') {
          return beginner ? `Only the root is left in the heap, and it is the smallest value. Sorted!` : 'a[0] final; sorted'
        }
        return beginner
          ? `Position ${k} now holds ${valueAt(frame, k)} for good, so the heap shrinks to ${range(0, k - 1, level)}. The value now at the root is probably too small for it, so sift it down.`
          : `a[${k}]=${valueAt(frame, k)} final; heap size ${k}`
      }
      default:
        return ''
    }
  },
}
