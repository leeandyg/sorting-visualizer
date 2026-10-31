import type { SortAlgorithm, Step } from '../engine/types'

/*
Line keys refer to this listing (shown in the code panel):

def insertion_sort(a):
    for i in range(1, len(a)):                  # outer
        key = a[i]                              # key
        j = i - 1
        while j >= 0 and a[j] > key:            # while
            a[j + 1] = a[j]                     # shift
            j -= 1
        a[j + 1] = key                          # drop
*/
export const insertionSort: SortAlgorithm = {
  id: 'insertion',
  name: 'Insertion sort',
  *run(a: number[]): Generator<Step, void, undefined> {
    const n = a.length
    for (let i = 1; i < n; i++) {
      const key = a[i]
      yield {
        type: 'lift',
        i,
        line: 'key',
        vars: { i, key },
        regions: [{ lo: 0, hi: i - 1, label: 'sorted so far' }],
      }
      let j = i - 1
      while (j >= 0) {
        yield { type: 'compareHeld', j, line: 'while', vars: { i, key, j } }
        if (!(a[j] > key)) break
        a[j + 1] = a[j]
        yield { type: 'shift', from: j, to: j + 1, line: 'shift', vars: { i, key, j } }
        j--
      }
      a[j + 1] = key
      yield { type: 'drop', i: j + 1, line: 'drop', vars: { i, key, j } }
    }
    // Elements only reach their final positions once every element has been inserted.
    if (n > 0) {
      const all = Array.from({ length: n }, (_, k) => k)
      yield { type: 'markSorted', indices: all, line: 'outer', regions: [] }
    }
  },
}
