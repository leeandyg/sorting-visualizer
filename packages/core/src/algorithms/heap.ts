import { listing, pointer } from '../engine/listing'
import type { SortAlgorithm, Step } from '../engine/types'

export const heapSort: SortAlgorithm = {
  id: 'heap',
  name: 'Heap sort',
  stable: false,
  treeView: true,
  code: {
    python: listing(`
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
    javascript: listing(`
function heapSort(a) {
  const n = a.length;
  for (let start = Math.floor(n / 2) - 1;    #@ build
       start >= 0; start--) {                #@ build
    siftDown(a, start, n);                   #@ build
  }
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];         #@ extract
    siftDown(a, 0, end);
  }
}

function siftDown(a, root, size) {
  while (true) {
    let child = 2 * root + 1;
    if (child >= size) {                     #@ leaf
      return;                                #@ leaf
    }
    const right = child + 1;
    if (right < size && a[right] > a[child]) { #@ pickChild
      child = right;                         #@ pickChild
    }
    if (a[root] >= a[child]) {               #@ compareRoot
      return;
    }
    [a[root], a[child]] = [a[child], a[root]]; #@ swap
    root = child;                            #@ swap
  }
}
`),
    java: listing(`
void heapSort(int[] a) {
  int n = a.length;
  for (int start = n / 2 - 1; start >= 0;    #@ build
       start--) {                            #@ build
    siftDown(a, start, n);                   #@ build
  }
  for (int end = n - 1; end > 0; end--) {
    swap(a, 0, end);                         #@ extract
    siftDown(a, 0, end);
  }
}

void siftDown(int[] a, int root, int size) {
  while (true) {
    int child = 2 * root + 1;
    if (child >= size) {                     #@ leaf
      return;                                #@ leaf
    }
    int right = child + 1;
    if (right < size && a[right] > a[child]) { #@ pickChild
      child = right;                         #@ pickChild
    }
    if (a[root] >= a[child]) {               #@ compareRoot
      return;
    }
    swap(a, root, child);                    #@ swap
    root = child;                            #@ swap
  }
}

void swap(int[] a, int i, int j) {
  int t = a[i]; a[i] = a[j]; a[j] = t;
}
`),
    cpp: listing(`
using Vec = std::vector<int>;
void sift_down(Vec& a, int root, int size);

void heap_sort(Vec& a) {
  int n = a.size();
  for (int start = n / 2 - 1; start >= 0;    #@ build
       start--) {                            #@ build
    sift_down(a, start, n);                  #@ build
  }
  for (int end = n - 1; end > 0; end--) {
    std::swap(a[0], a[end]);                 #@ extract
    sift_down(a, 0, end);
  }
}

void sift_down(Vec& a, int root, int size) {
  while (true) {
    int child = 2 * root + 1;
    if (child >= size) {                     #@ leaf
      return;                                #@ leaf
    }
    int right = child + 1;
    if (right < size && a[right] > a[child]) { #@ pickChild
      child = right;                         #@ pickChild
    }
    if (a[root] >= a[child]) {               #@ compareRoot
      return;
    }
    std::swap(a[root], a[child]);            #@ swap
    root = child;                            #@ swap
  }
}
`),
  },
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
