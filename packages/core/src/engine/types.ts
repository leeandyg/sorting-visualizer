import type { Lang } from './lang'

/** One array element. `id` stays with the value as it moves, so the UI can animate it and tell duplicates apart. */
export interface Item {
  id: number
  value: number
}

/** A labelled, inclusive index range drawn under the array (e.g. "sorted so far"). */
export interface Region {
  lo: number
  hi: number
  label: string
}

export type Vars = Record<string, number | boolean>

/** What a marked element is, e.g. quicksort's pivot or selection sort's current minimum. */
export type MarkKind = 'pivot' | 'min'

/** A position in merge sort's temporary arrays: `buffer` 0 is `left`, 1 is `right`. */
export interface AuxRef {
  buffer: number
  at: number
}

/** A temporary array drawn in a second row, under positions lo.. of the main array. */
export interface AuxBuffer {
  lo: number
  label: string
  /** null once an element has been written back to the main array. */
  items: (Item | null)[]
}

/**
 * What an algorithm did at one step. Algorithms yield these as they run;
 * the recorder applies them to a visual state to build the trace.
 */
export type SortEvent =
  /** Compared a[i] with a[j]. */
  | { type: 'compare'; i: number; j: number }
  /** Compared the held element (e.g. insertion sort's `key`) with a[j]. */
  | { type: 'compareHeld'; j: number }
  | { type: 'swap'; i: number; j: number }
  /** Copied a[i] into a temporary (the held element), leaving a gap at i. */
  | { type: 'lift'; i: number }
  /** a[to] = a[from]; `to` must be the gap, and `from` becomes the new gap. */
  | { type: 'shift'; from: number; to: number }
  /** Wrote the held element into the gap at i. */
  | { type: 'drop'; i: number }
  /** Compared a[i] with a value held in a variable, e.g. quicksort's `pivot`. */
  | { type: 'compareValue'; i: number; name: string; value: number }
  /** Copied a[lo..hi] into a new temporary array. a keeps its old values (ghosts) until overwritten. */
  | { type: 'copyOut'; lo: number; hi: number; label: string }
  /** Compared two elements of the temporary arrays. */
  | { type: 'compareAux'; a: AuxRef; b: AuxRef }
  /** a[to] = a temporary array element. */
  | { type: 'writeFromAux'; from: AuxRef; to: number }
  /** These positions now hold their final values. */
  | { type: 'markSorted'; indices: number[] }
  /** Nothing in the array changed: a function call, a return, or a variable update worth showing. */
  | { type: 'note' }

/**
 * A yielded event plus where the algorithm was in its code. `line` is a key into the
 * algorithm's source listing; `vars` are the loop variables at that moment; `regions`
 * replaces the ranges drawn under the array; `focus` is the subarray the current call
 * works on (the rest is dimmed); `marks` tag elements by their current index, and the tag
 * then follows the element as it moves. All of these carry forward when omitted.
 */
export type Step = SortEvent & {
  line?: string
  vars?: Vars
  regions?: Region[]
  focus?: { lo: number; hi: number } | null
  marks?: { i: number; kind: MarkKind }[]
}

export interface Counters {
  comparisons: number
  swaps: number
  /** Individual array element writes, as the code performs them (a swap is 2). */
  writes: number
}

/** The complete visual state after one step. */
export interface Frame {
  /** The step that produced this frame; null for the initial frame. */
  step: Step | null
  /** null marks a gap: left by a lifted element, or copied out by merge sort (see ghosts). */
  items: (Item | null)[]
  /** For merge sort's copied-out positions: the stale value a still holds there, drawn faded. */
  ghosts: (number | null)[]
  aux: AuxBuffer[]
  held: Item | null
  sorted: boolean[]
  regions: Region[]
  focus: { lo: number; hi: number } | null
  /** Marks by item id, so they stay on the element as it moves. */
  marks: { id: number; kind: MarkKind }[]
  counters: Counters
  line: string | null
  vars: Vars
}

export type AlgorithmId = 'bubble' | 'insertion' | 'selection' | 'merge' | 'quick-lomuto' | 'quick-hoare' | 'heap'

/** One line of an algorithm's Python listing, tagged with the step `line` keys that highlight it. */
export interface CodeLine {
  text: string
  keys: string[]
}

/** A labelled marker drawn under the array at an index taken from the current vars (e.g. `j`). */
export interface PointerDef {
  label: string
  at: (vars: Vars) => number | undefined
}

export interface SortAlgorithm {
  id: AlgorithmId
  name: string
  /** Variants of one algorithm (e.g. quicksort's partition schemes) share a family and differ by variant name. */
  family?: { id: string; name: string; variant: string }
  /** Whether equal values always keep their original order. */
  stable: boolean
  /** Draw the array as a binary tree too (heap sort). */
  treeView?: boolean
  /** Sorts `a` in place, yielding a Step for everything it does. */
  run: (a: number[]) => Generator<Step, void, undefined>
  /** The listing in each language shown in the code panel; Step `line` keys refer to its tags. */
  code: Record<Lang, CodeLine[]>
  pointers: PointerDef[]
}

export interface Trace {
  algorithmId: AlgorithmId
  input: number[]
  output: number[]
  frames: Frame[]
}
