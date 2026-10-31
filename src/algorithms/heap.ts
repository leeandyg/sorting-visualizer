import { listing, pointer } from '../engine/listing'
import type { SortAlgorithm, Step } from '../engine/types'

export const heapSort: SortAlgorithm = {
  id: 'heap',
  name: 'Heap sort',
  stable: false,
  treeView: true,
  code: listing(`
def heap_sort(a):
    n = len(a)
    for start in range(n // 2 - 1, -1, -1):     #@ build
        sift_down(a, start, n)                  #@ build
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]             #@ extract
        sift_down(a, 0, end)

def sift_down(a, root, size):
    while True:
        child = 2 * root + 1
        if child >= size:                       #@ leaf
            return                              #@ leaf
        right = child + 1
        if right < size and a[right] > a[child]:  #@ pickChild
            child = right                       #@ pickChild
        if a[root] >= a[child]:                 #@ compareRoot
            return
        a[root], a[child] = a[child], a[root]   #@ swap
        root = child                            #@ swap
`),
  pointers: [pointer('root'), pointer('child')],
  *run(a: number[]): Generator<Step, void, undefined> {
    const n = a.length
    const heap = (size: number) => (size > 0 ? [{ lo: 0, hi: size - 1, label: 'heap' }] : [])

    function* siftDown(root: number, size: number): Generator<Step, void, undefined> {
      for (;;) {
        let child = 2 * root + 1
        if (child >= size) {
          yield { type: 'note', line: 'leaf', vars: { size, root } }
          return
        }
        const right = child + 1
        if (right < size) {
          yield { type: 'compare', i: right, j: child, line: 'pickChild', vars: { size, root, child, right } }
          if (a[right] > a[child]) child = right
        }
        yield { type: 'compare', i: root, j: child, line: 'compareRoot', vars: { size, root, child } }
        if (a[root] >= a[child]) return
        ;[a[root], a[child]] = [a[child], a[root]]
        yield { type: 'swap', i: root, j: child, line: 'swap', vars: { size, root, child } }
        root = child
      }
    }

    for (let start = Math.floor(n / 2) - 1; start >= 0; start--) {
      yield { type: 'note', line: 'build', vars: { size: n, start }, regions: heap(n) }
      yield* siftDown(start, n)
    }
    for (let end = n - 1; end > 0; end--) {
      ;[a[0], a[end]] = [a[end], a[0]]
      yield { type: 'swap', i: 0, j: end, line: 'extract', vars: { size: end + 1, end } }
      // The max of the heap just moved to `end`, behind the heap, where it stays.
      yield { type: 'markSorted', indices: [end], line: 'extract', vars: { size: end, end }, regions: heap(end) }
      yield* siftDown(0, end)
    }
    if (n > 0) yield { type: 'markSorted', indices: [0], line: 'extract', vars: {}, regions: [] }
  },
}
