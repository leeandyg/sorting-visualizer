import { algorithms } from '../algorithms'
import type { AlgorithmId } from '../engine/types'
import { parseArray } from '../input/parseArray'

export interface UrlState {
  algorithm?: AlgorithmId
  input?: number[]
  step?: number
}

/** Reads ?algo=merge&array=5,2,9&step=12, ignoring anything missing or invalid. */
export function readUrlState(search: string): UrlState {
  const params = new URLSearchParams(search)
  const state: UrlState = {}
  const algo = params.get('algo')
  if (algo && algo in algorithms) state.algorithm = algo as AlgorithmId
  const array = params.get('array')
  if (array) {
    const parsed = parseArray(array)
    if (parsed.values) state.input = parsed.values
  }
  const step = Number(params.get('step'))
  if (params.has('step') && Number.isInteger(step) && step >= 0) state.step = step
  return state
}

export function urlFor(location: { origin: string; pathname: string }, state: Required<Omit<UrlState, 'step'>> & { step?: number }) {
  const params = new URLSearchParams({ algo: state.algorithm, array: state.input.join(',') })
  if (state.step !== undefined) params.set('step', String(state.step))
  // Keep commas readable instead of %2C.
  return `${location.origin}${location.pathname}?${params.toString().replaceAll('%2C', ',')}`
}
