import { listing, pointer } from '../engine/listing'
import type { Region, SortAlgorithm, Step } from '../engine/types'

const nonEmpty = (regions: Region[]) => regions.filter((r) => r.lo <= r.hi)

export const quickSortLomuto: SortAlgorithm = {
  id: 'quick-lomuto',
  name: 'Quick sort (Lomuto)',
  family: { id: 'quick', name: 'Quick sort', variant: 'Lomuto' },
  stable: false,
  code: listing(`
def quick_sort(a, lo, hi):
    if lo < hi:                                 #@ check
        p = partition(a, lo, hi)
        quick_sort(a, lo, p - 1)
        quick_sort(a, p + 1, hi)

def partition(a, lo, hi):
    pivot = a[hi]                               #@ pivot
    i = lo - 1                                  #@ pivot
    for j in range(lo, hi):
        if a[j] <= pivot:                       #@ compare
            i += 1                              #@ swap
            a[i], a[j] = a[j], a[i]             #@ swap
    a[i + 1], a[hi] = a[hi], a[i + 1]           #@ place
    return i + 1                                #@ place
`),
  pointers: [pointer('i'), pointer('j')],
  *run(a: number[]): Generator<Step, void, undefined> {
    function* sort(lo: number, hi: number): Generator<Step, void, undefined> {
      // Empty ranges (lo > hi) return immediately; they're skipped to keep the trace readable.
      if (lo > hi) return
      const focus = { lo, hi }
      if (lo === hi) {
        yield { type: 'markSorted', indices: [lo], line: 'check', vars: { lo, hi }, focus, regions: [], marks: [] }
        return
      }
      yield { type: 'note', line: 'check', vars: { lo, hi }, focus, regions: [], marks: [] }

      const pivot = a[hi]
      let i = lo - 1
      const regions = (j: number) =>
        nonEmpty([
          { lo, hi: i, label: '≤ pivot' },
          { lo: i + 1, hi: j - 1, label: '> pivot' },
        ])
      yield { type: 'note', line: 'pivot', vars: { lo, hi, pivot, i }, marks: [{ i: hi, kind: 'pivot' }] }
      for (let j = lo; j < hi; j++) {
        yield { type: 'compareValue', i: j, name: 'pivot', value: pivot, line: 'compare', vars: { lo, hi, pivot, i, j }, regions: regions(j) }
        if (a[j] <= pivot) {
          i++
          ;[a[i], a[j]] = [a[j], a[i]]
          yield { type: 'swap', i, j, line: 'swap', vars: { lo, hi, pivot, i, j }, regions: regions(j + 1) }
        }
      }
      const p = i + 1
      ;[a[p], a[hi]] = [a[hi], a[p]]
      yield {
        type: 'swap',
        i: p,
        j: hi,
        line: 'place',
        vars: { lo, hi, pivot, i, p },
        regions: nonEmpty([
          { lo, hi: p - 1, label: '≤ pivot' },
          { lo: p + 1, hi, label: '> pivot' },
        ]),
      }
      // Everything left of the pivot is ≤ it and everything right is >, so it never moves again.
      yield { type: 'markSorted', indices: [p], line: 'place', vars: { lo, hi, pivot, p }, marks: [] }
      yield* sort(lo, p - 1)
      yield* sort(p + 1, hi)
    }

    yield* sort(0, a.length - 1)
  },
}

export const quickSortHoare: SortAlgorithm = {
  id: 'quick-hoare',
  name: 'Quick sort (Hoare)',
  family: { id: 'quick', name: 'Quick sort', variant: 'Hoare' },
  stable: false,
  code: listing(`
def quick_sort(a, lo, hi):
    if lo < hi:                                 #@ check
        p = partition(a, lo, hi)
        quick_sort(a, lo, p)
        quick_sort(a, p + 1, hi)

def partition(a, lo, hi):
    pivot = a[(lo + hi) // 2]                   #@ pivot
    i = lo - 1                                  #@ pivot
    j = hi + 1                                  #@ pivot
    while True:
        i += 1
        while a[i] < pivot:                     #@ scanI
            i += 1
        j -= 1
        while a[j] > pivot:                     #@ scanJ
            j -= 1
        if i >= j:                              #@ done
            return j                            #@ done
        a[i], a[j] = a[j], a[i]                 #@ swap
`),
  pointers: [pointer('i'), pointer('j')],
  *run(a: number[]): Generator<Step, void, undefined> {
    function* sort(lo: number, hi: number): Generator<Step, void, undefined> {
      const focus = { lo, hi }
      if (lo === hi) {
        yield { type: 'markSorted', indices: [lo], line: 'check', vars: { lo, hi }, focus, regions: [], marks: [] }
        return
      }
      yield { type: 'note', line: 'check', vars: { lo, hi }, focus, regions: [], marks: [] }

      const mid = Math.floor((lo + hi) / 2)
      const pivot = a[mid]
      let i = lo - 1
      let j = hi + 1
      const regions = () =>
        nonEmpty([
          { lo, hi: i - 1, label: '≤ pivot' },
          { lo: j + 1, hi, label: '≥ pivot' },
        ])
      yield { type: 'note', line: 'pivot', vars: { lo, hi, pivot, i, j }, marks: [{ i: mid, kind: 'pivot' }] }
      for (;;) {
        i++
        for (;;) {
          yield { type: 'compareValue', i, name: 'pivot', value: pivot, line: 'scanI', vars: { lo, hi, pivot, i, j }, regions: regions() }
          if (!(a[i] < pivot)) break
          i++
        }
        j--
        for (;;) {
          yield { type: 'compareValue', i: j, name: 'pivot', value: pivot, line: 'scanJ', vars: { lo, hi, pivot, i, j }, regions: regions() }
          if (!(a[j] > pivot)) break
          j--
        }
        if (i >= j) {
          yield {
            type: 'note',
            line: 'done',
            vars: { lo, hi, pivot, i, j, p: j },
            regions: nonEmpty([
              { lo, hi: j, label: '≤ pivot' },
              { lo: j + 1, hi, label: '≥ pivot' },
            ]),
            marks: [],
          }
          yield* sort(lo, j)
          yield* sort(j + 1, hi)
          return
        }
        ;[a[i], a[j]] = [a[j], a[i]]
        yield { type: 'swap', i, j, line: 'swap', vars: { lo, hi, pivot, i, j }, regions: regions() }
      }
    }

    if (a.length > 0) yield* sort(0, a.length - 1)
  },
}
