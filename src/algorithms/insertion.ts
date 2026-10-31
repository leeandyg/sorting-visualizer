import { listing, pointer } from '../engine/listing'
import type { SortAlgorithm, Step } from '../engine/types'

export const insertionSort: SortAlgorithm = {
  id: 'insertion',
  name: 'Insertion sort',
  code: listing(`
def insertion_sort(a):
    for i in range(1, len(a)):                  #@ outer
        key = a[i]                              #@ key
        j = i - 1                               #@ key
        while j >= 0 and a[j] > key:            #@ while
            a[j + 1] = a[j]                     #@ shift
            j -= 1                              #@ shift
        a[j + 1] = key                          #@ drop
`),
  pointers: [pointer('i'), pointer('j')],
  *run(a: number[]): Generator<Step, void, undefined> {
    const n = a.length
    for (let i = 1; i < n; i++) {
      const key = a[i]
      let j = i - 1
      yield {
        type: 'lift',
        i,
        line: 'key',
        vars: { i, key, j },
        regions: [{ lo: 0, hi: i - 1, label: 'sorted so far' }],
      }
      while (j >= 0) {
        yield { type: 'compareHeld', j, line: 'while', vars: { i, key, j } }
        if (!(a[j] > key)) break
        a[j + 1] = a[j]
        j--
        // Vars are shown after both highlighted lines run, so j has already moved left.
        yield { type: 'shift', from: j + 1, to: j + 2, line: 'shift', vars: { i, key, j } }
      }
      a[j + 1] = key
      yield { type: 'drop', i: j + 1, line: 'drop', vars: { i, key, j } }
    }
    // Elements only reach their final positions once every element has been inserted.
    if (n > 0) {
      const all = Array.from({ length: n }, (_, k) => k)
      yield { type: 'markSorted', indices: all, line: 'outer', vars: {}, regions: [] }
    }
  },
}
