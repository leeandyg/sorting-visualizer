import { listing, pointer } from '../engine/listing'
import type { SortAlgorithm, Step } from '../engine/types'

export const selectionSort: SortAlgorithm = {
  id: 'selection',
  name: 'Selection sort',
  stable: false,
  code: {
    python: listing(`
def selection_sort(a):
    n = len(a)
    for i in range(n - 1):                      #@ outer
        min_idx = i                             #@ outer
        for j in range(i + 1, n):
            if a[j] < a[min_idx]:               #@ compare
                min_idx = j                     #@ newMin
        a[i], a[min_idx] = a[min_idx], a[i]     #@ swap
`),
    javascript: listing(`
function selectionSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {          #@ outer
    let minIdx = i;                          #@ outer
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[minIdx]) {                #@ compare
        minIdx = j;                          #@ newMin
      }
    }
    [a[i], a[minIdx]] = [a[minIdx], a[i]];   #@ swap
  }
}
`),
    java: listing(`
void selectionSort(int[] a) {
  int n = a.length;
  for (int i = 0; i < n - 1; i++) {          #@ outer
    int minIdx = i;                          #@ outer
    for (int j = i + 1; j < n; j++) {
      if (a[j] < a[minIdx]) {                #@ compare
        minIdx = j;                          #@ newMin
      }
    }
    swap(a, i, minIdx);                      #@ swap
  }
}

void swap(int[] a, int i, int j) {
  int t = a[i]; a[i] = a[j]; a[j] = t;
}
`),
    cpp: listing(`
using Vec = std::vector<int>;

void selection_sort(Vec& a) {
  int n = a.size();
  for (int i = 0; i < n - 1; i++) {          #@ outer
    int min_idx = i;                         #@ outer
    for (int j = i + 1; j < n; j++) {
      if (a[j] < a[min_idx]) {               #@ compare
        min_idx = j;                         #@ newMin
      }
    }
    std::swap(a[i], a[min_idx]);             #@ swap
  }
}
`),
  },
  pointers: [pointer('i'), pointer('j'), pointer('min_idx')],
  *run(a: number[]): Generator<Step, void, undefined> {
    const n = a.length
    const unsorted = (i: number) => [{ lo: i, hi: n - 1, label: 'unsorted' }]
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i
      yield {
        type: 'note',
        line: 'outer',
        vars: { i, min_idx: minIdx },
        regions: unsorted(i),
        marks: [{ i: minIdx, kind: 'min' }],
      }
      for (let j = i + 1; j < n; j++) {
        yield { type: 'compare', i: j, j: minIdx, line: 'compare', vars: { i, j, min_idx: minIdx } }
        if (a[j] < a[minIdx]) {
          minIdx = j
          yield { type: 'note', line: 'newMin', vars: { i, j, min_idx: minIdx }, marks: [{ i: minIdx, kind: 'min' }] }
        }
      }
      ;[a[i], a[minIdx]] = [a[minIdx], a[i]]
      yield { type: 'swap', i, j: minIdx, line: 'swap', vars: { i, min_idx: minIdx }, marks: [] }
      // The smallest remaining value is now at i, and nothing later will move it.
      yield { type: 'markSorted', indices: [i], line: 'swap', vars: { i, min_idx: minIdx } }
    }
    // Once the first n - 1 positions hold the smallest values, the last one must be the largest.
    if (n > 0) yield { type: 'markSorted', indices: [n - 1], line: 'outer', vars: {}, regions: [] }
  },
}
