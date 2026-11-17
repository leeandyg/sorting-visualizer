import { type Lang, LANGS } from './engine/lang'
import type { AlgorithmId } from './engine/types'

export type SiteId = 'visualizer' | 'sortify'

/** The two sites built on this engine, for the switcher each one shows. */
export const sites: Record<SiteId, { name: string; url: string; blurb: string }> = {
  visualizer: { name: 'Sorting Visualizer', url: 'https://sorting.andygl.com/', blurb: 'Learn sorting step by step' },
  sortify: { name: 'Sortify', url: 'https://sortify.andygl.com/', blurb: 'Experience the sort' },
}

/** Everything one site hands the other so it can pick up where this one was. */
export interface Handoff {
  algorithm: AlgorithmId
  input: number[]
  step: number
  /** Steps per second. */
  speed: number
  playing: boolean
  /** The language the code is shown in. */
  lang: Lang
}

/**
 * A link into the other site (`base` is its address) that carries the current state. `algo`,
 * `array` and `step` are the same parameters as a share link; `speed`, `lang`, `play` and `from`
 * only travel between the sites.
 */
export function handoffUrl(base: string, state: Handoff): string {
  const params = new URLSearchParams({
    algo: state.algorithm,
    array: state.input.join(','),
    step: String(state.step),
    speed: String(Math.round(state.speed * 100) / 100),
    lang: state.lang,
  })
  if (state.playing) params.set('play', '1')
  params.set('from', 'switch')
  // Keep commas readable instead of %2C.
  return `${base}?${params.toString().replaceAll('%2C', ',')}`
}

/** The switch-only part of a handoff link; `arrived` is false for ordinary and shared links. */
export function readHandoff(
  search: string,
  minSpeed: number,
  maxSpeed: number,
): { arrived: boolean; speed?: number; lang?: Lang; playing: boolean } {
  const params = new URLSearchParams(search)
  const arrived = params.get('from') === 'switch'
  const speed = Number(params.get('speed'))
  const lang = LANGS.find((l) => l.id === params.get('lang'))?.id
  return {
    arrived,
    speed: params.has('speed') && Number.isFinite(speed) && speed > 0 ? Math.min(Math.max(speed, minSpeed), maxSpeed) : undefined,
    lang,
    playing: arrived && params.get('play') === '1',
  }
}
