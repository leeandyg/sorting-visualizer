import { listing, pointer } from '../engine/listing'
import type { SortAlgorithm, Step } from '../engine/types'

export const mergeSort: SortAlgorithm = {
  id: 'merge',
  name: 'Merge sort',
  stable: true,
  code: listing(`
def merge_sort(a, lo, hi):
    if lo >= hi:                                #@ base
        return                                  #@ base
    mid = (lo + hi) // 2                        #@ call
    merge_sort(a, lo, mid)                      #@ call
    merge_sort(a, mid + 1, hi)                  #@ call
    merge(a, lo, mid, hi)                       #@ merge

def merge(a, lo, mid, hi):
    left = a[lo:mid + 1]                        #@ copyLeft
    right = a[mid + 1:hi + 1]                   #@ copyRight
    i = j = 0
    k = lo
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:                 #@ compare
            a[k] = left[i]                      #@ takeLeft
            i += 1                              #@ takeLeft
        else:
            a[k] = right[j]                     #@ takeRight
            j += 1                              #@ takeRight
        k += 1                                  #@ takeLeft takeRight
    while i < len(left):
        a[k] = left[i]                          #@ restLeft
        i += 1                                  #@ restLeft
        k += 1                                  #@ restLeft
    while j < len(right):
        a[k] = right[j]                         #@ restRight
        j += 1                                  #@ restRight
        k += 1                                  #@ restRight
`),
  pointers: [pointer('k')],
  *run(a: number[]): Generator<Step, void, undefined> {
    const n = a.length
    if (n === 0) return

    function* sort(lo: number, hi: number): Generator<Step, void, undefined> {
      const focus = { lo, hi }
      if (lo >= hi) {
        yield { type: 'note', line: 'base', vars: { lo, hi }, focus, regions: [] }
        return
      }
      const mid = Math.floor((lo + hi) / 2)
      yield {
        type: 'note',
        line: 'call',
        vars: { lo, mid, hi },
        focus,
        regions: [
          { lo, hi: mid, label: 'left half' },
          { lo: mid + 1, hi, label: 'right half' },
        ],
      }
      yield* sort(lo, mid)
      yield* sort(mid + 1, hi)
      yield* merge(lo, mid, hi)
    }

    function* merge(lo: number, mid: number, hi: number): Generator<Step, void, undefined> {
      const focus = { lo, hi }
      yield { type: 'note', line: 'merge', vars: { lo, mid, hi }, focus, regions: [] }
      const left = a.slice(lo, mid + 1)
      const right = a.slice(mid + 1, hi + 1)
      yield { type: 'copyOut', lo, hi: mid, label: 'left', line: 'copyLeft', vars: { lo, mid, hi } }
      yield { type: 'copyOut', lo: mid + 1, hi, label: 'right', line: 'copyRight', vars: { lo, mid, hi } }
      let i = 0
      let j = 0
      let k = lo
      const vars = () => ({ lo, mid, hi, i, j, k })
      while (i < left.length && j < right.length) {
        yield { type: 'compareAux', a: { buffer: 0, at: i }, b: { buffer: 1, at: j }, line: 'compare', vars: vars() }
        if (left[i] <= right[j]) {
          a[k] = left[i]
          const from = { buffer: 0, at: i }
          const to = k
          i++
          k++
          yield { type: 'writeFromAux', from, to, line: 'takeLeft', vars: vars() }
        } else {
          a[k] = right[j]
          const from = { buffer: 1, at: j }
          const to = k
          j++
          k++
          yield { type: 'writeFromAux', from, to, line: 'takeRight', vars: vars() }
        }
      }
      while (i < left.length) {
        a[k] = left[i]
        const from = { buffer: 0, at: i }
        const to = k
        i++
        k++
        yield { type: 'writeFromAux', from, to, line: 'restLeft', vars: vars() }
      }
      while (j < right.length) {
        a[k] = right[j]
        const from = { buffer: 1, at: j }
        const to = k
        j++
        k++
        yield { type: 'writeFromAux', from, to, line: 'restRight', vars: vars() }
      }
    }

    yield* sort(0, n - 1)
    // Only the top-level merge puts values in their final places, so everything finishes together.
    yield {
      type: 'markSorted',
      indices: Array.from({ length: n }, (_, k) => k),
      line: n === 1 ? 'base' : 'merge',
      vars: {},
      focus: null,
      regions: [],
    }
  },
}
