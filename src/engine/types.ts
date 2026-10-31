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
  /** These positions now hold their final values. */
  | { type: 'markSorted'; indices: number[] }

/**
 * A yielded event plus where the algorithm was in its code. `line` is a key into the
 * algorithm's source listing; `vars` are the loop variables at that moment; `regions`
 * replaces the ranges drawn under the array. All three carry forward when omitted.
 */
export type Step = SortEvent & { line?: string; vars?: Vars; regions?: Region[] }

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
  /** null marks the gap left by a lifted element. */
  items: (Item | null)[]
  held: Item | null
  sorted: boolean[]
  regions: Region[]
  counters: Counters
  line: string | null
  vars: Vars
}

export type AlgorithmId = 'bubble' | 'insertion'

export interface SortAlgorithm {
  id: AlgorithmId
  name: string
  /** Sorts `a` in place, yielding a Step for everything it does. */
  run: (a: number[]) => Generator<Step, void, undefined>
}

export interface Trace {
  algorithmId: AlgorithmId
  input: number[]
  output: number[]
  frames: Frame[]
}
