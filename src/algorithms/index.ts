import type { AlgorithmId, SortAlgorithm } from '../engine/types'
import { bubbleSort } from './bubble'
import { insertionSort } from './insertion'

export const algorithms: Record<AlgorithmId, SortAlgorithm> = {
  bubble: bubbleSort,
  insertion: insertionSort,
}

export const algorithmList: SortAlgorithm[] = Object.values(algorithms)
