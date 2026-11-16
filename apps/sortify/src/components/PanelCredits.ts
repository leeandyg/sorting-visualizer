import { type AlgorithmId, algorithmInfo, peopleLinks } from '@sortviz/core'
import { TRADITIONAL } from '../library/catalog'

/** One person (or "Traditional") as the panel bills them, in music-credit terms. */
export interface Credit {
  name: string
  /** The credit line under the name, e.g. "Remixer • Partition (Lomuto scheme)". */
  role: string
  /** A short real fact for the artist card, where a music app puts the listener count. */
  fact: string
  /** Their Wikipedia page, when they have one. "Traditional" is nobody, so it has none. */
  href?: string
  /** Mentioned in the history but not billed on the song: shown only under "Show all". */
  extra?: boolean
}

const year = (id: AlgorithmId) => algorithmInfo[id].credits.year
const released = (id: AlgorithmId) => `Released ${year(id)}`

/**
 * Sortify's billing for each song. The roles are the music metaphor, but every one maps to
 * something in the credits note: Lomuto's scheme is a later rework of Hoare's quicksort (a remix),
 * Floyd improved Williams's heapsort the same year, and Iverson first printed the name "bubble sort".
 */
const BILLING: Record<AlgorithmId, Omit<Credit, 'href'>[]> = {
  bubble: [
    { name: TRADITIONAL, role: 'Main artist • Public domain', fact: 'Author unknown' },
    { name: 'Kenneth Iverson', role: 'Liner notes • Named it in print, 1962', fact: '', extra: true },
  ],
  selection: [{ name: TRADITIONAL, role: 'Main artist • Public domain', fact: 'Author unknown' }],
  insertion: [{ name: TRADITIONAL, role: 'Main artist • Public domain', fact: 'Author unknown' }],
  merge: [{ name: 'John von Neumann', role: 'Main artist • Composer', fact: released('merge') }],
  'quick-hoare': [
    { name: 'Tony Hoare', role: 'Original composer • Partition (Hoare scheme)', fact: released('quick-hoare') },
  ],
  'quick-lomuto': [
    { name: 'Tony Hoare', role: 'Original composer • Quicksort', fact: `Original release ${year('quick-hoare')}` },
    { name: 'Nico Lomuto', role: 'Remixer • Partition (Lomuto scheme)', fact: 'Remix, undated' },
  ],
  heap: [
    { name: 'J. W. J. Williams', role: 'Main artist • Composer', fact: released('heap') },
    { name: 'Robert Floyd', role: 'Additional production • Made it in place, 1964', fact: '', extra: true },
  ],
}

/** The song's credits, with a Wikipedia link for each person who has an article. */
export function creditsFor(id: AlgorithmId): Credit[] {
  return BILLING[id].map((credit) => ({ ...credit, href: peopleLinks[credit.name] }))
}
