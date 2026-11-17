import { type AlgorithmId, algorithmInfo } from '@sortviz/core'

/** One song: an algorithm from the core under its Sortify title. */
export interface Track {
  id: AlgorithmId
  title: string
  /** Colour of the song's cover and of the stage while it plays, as a CSS hue angle. */
  hue: number
}

/**
 * The album, in play order. Titles are Sortify's own: Hoare's partition is the 1961 original,
 * so it is plain "Quick Sort", and Lomuto's later scheme is billed as the remix.
 */
export const ALBUM = {
  title: 'Sorting Algorithms',
  artist: 'Various Artists',
  hue: 216,
  tracks: [
    { id: 'bubble', title: 'Bubble Sort', hue: 204 },
    { id: 'selection', title: 'Selection Sort', hue: 172 },
    { id: 'insertion', title: 'Insertion Sort', hue: 42 },
    { id: 'merge', title: 'Merge Sort', hue: 268 },
    { id: 'quick-hoare', title: 'Quick Sort', hue: 12 },
    { id: 'quick-lomuto', title: 'Quick Sort (Lomuto Remix)', hue: 326 },
    { id: 'heap', title: 'Heap Sort', hue: 140 },
  ] satisfies Track[] as Track[],
}

/** Songs nobody is credited with are billed like folk songs. */
export const TRADITIONAL = 'Traditional'

export function artistsOf(track: Track): string {
  const { by } = algorithmInfo[track.id].credits
  return by.length > 0 ? by.join(', ') : TRADITIONAL
}

/** "1945–1964": the span of the years the credited songs came out. */
export function albumYears(): string {
  const years = ALBUM.tracks.flatMap((track) => algorithmInfo[track.id].credits.year ?? [])
  return `${Math.min(...years)}–${Math.max(...years)}`
}

/** The badge beside the artist, where a music app flags explicit lyrics: how the work grows on average. */
export function complexityBadge(track: Track): string {
  return algorithmInfo[track.id].time.average.replace(/^O\((.*)\)$/, '$1')
}

/** The album's own order, used while shuffle is off. */
export const IN_ORDER = ALBUM.tracks.map((_, k) => k)

/**
 * A play order for shuffle: every track once, in random order, starting with the one that's
 * loaded so turning shuffle on never interrupts it.
 */
export function shuffledOrder(current: number, count = ALBUM.tracks.length, random: () => number = Math.random): number[] {
  const rest = Array.from({ length: count }, (_, k) => k).filter((k) => k !== current)
  // Fisher-Yates.
  for (let k = rest.length - 1; k > 0; k--) {
    const pick = Math.floor(random() * (k + 1))
    ;[rest[k], rest[pick]] = [rest[pick], rest[k]]
  }
  return [current, ...rest]
}

/** The track after (`by` 1) or before (-1) `current` in the play order; null past either end. */
export function neighbour(order: number[], current: number, by: 1 | -1): number | null {
  return order[order.indexOf(current) + by] ?? null
}

/**
 * Which track plays when this one finishes by itself: the same one on repeat, otherwise the
 * next in the play order. null at the end of the order, where playback stops.
 */
export function upNextIndex(current: number, repeat: boolean, order: number[] = IN_ORDER): number | null {
  return repeat ? current : neighbour(order, current, 1)
}
