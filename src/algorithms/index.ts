import type { AlgorithmId, SortAlgorithm } from '../engine/types'
import { bubbleSort } from './bubble'
import { heapSort } from './heap'
import { insertionSort } from './insertion'
import { mergeSort } from './merge'
import { quickSortHoare, quickSortLomuto } from './quick'
import { selectionSort } from './selection'

export const algorithms: Record<AlgorithmId, SortAlgorithm> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
  'quick-lomuto': quickSortLomuto,
  'quick-hoare': quickSortHoare,
  heap: heapSort,
}

export const algorithmList: SortAlgorithm[] = Object.values(algorithms)

/** One entry per algorithm family for the picker; the first variant is the default. */
export const algorithmFamilies: { id: string; name: string; variants: SortAlgorithm[] }[] = []
for (const algorithm of algorithmList) {
  const id = algorithm.family?.id ?? algorithm.id
  const existing = algorithmFamilies.find((f) => f.id === id)
  if (existing) existing.variants.push(algorithm)
  else algorithmFamilies.push({ id, name: algorithm.family?.name ?? algorithm.name, variants: [algorithm] })
}
