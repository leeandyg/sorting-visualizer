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

/**
 * Which track plays when this one finishes by itself: the same one on repeat, otherwise the
 * next on the album. null at the end of the album, where playback stops.
 */
export function upNextIndex(current: number, repeat: boolean, count = ALBUM.tracks.length): number | null {
  if (repeat) return current
  return current + 1 < count ? current + 1 : null
}
