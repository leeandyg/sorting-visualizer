import { listing, pointer } from '../engine/listing'
import type { SortAlgorithm, Step } from '../engine/types'

export const bubbleSort: SortAlgorithm = {
  id: 'bubble',
  name: 'Bubble sort',
  stable: true,
  code: listing(`
def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):                      #@ outer
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:                 #@ compare
                a[j], a[j + 1] = a[j + 1], a[j] #@ swap
                swapped = True                  #@ swap
        if not swapped:                         #@ checkSwapped
            break                               #@ break
`),
  pointers: [pointer('j'), pointer('j', 1)],
  *run(a: number[]): Generator<Step, void, undefined> {
    const n = a.length
    for (let i = 0; i < n - 1; i++) {
      let swapped = false
      for (let j = 0; j < n - 1 - i; j++) {
        yield { type: 'compare', i: j, j: j + 1, line: 'compare', vars: { i, j, swapped } }
        if (a[j] > a[j + 1]) {
          ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
          swapped = true
          yield { type: 'swap', i: j, j: j + 1, line: 'swap', vars: { i, j, swapped } }
        }
      }
      // Each pass carries the largest remaining value to the end of the unsorted part.
      yield { type: 'markSorted', indices: [n - 1 - i], line: 'checkSwapped', vars: { i, swapped } }
      if (!swapped) {
        const rest = Array.from({ length: n - 1 - i }, (_, k) => k)
        yield { type: 'markSorted', indices: rest, line: 'break', vars: { i, swapped } }
        return
      }
    }
    // After n - 1 passes the only element left, a[0], is the smallest.
    if (n > 0) yield { type: 'markSorted', indices: [0], line: 'outer', vars: {} }
  },
}
