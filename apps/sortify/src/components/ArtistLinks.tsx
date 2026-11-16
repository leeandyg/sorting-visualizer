import { Fragment } from 'react'
import { algorithmInfo, peopleLinks } from '@sortviz/core'
import { TRADITIONAL, type Track } from '../library/catalog'

/**
 * A song's artists, each linked to their Wikipedia page when they have one (not everyone does),
 * the way a music app links an artist name to the artist's page. "Traditional" stays plain text.
 */
export function ArtistLinks({ track }: { track: Track }) {
  const { by } = algorithmInfo[track.id].credits
  if (by.length === 0) return <span>{TRADITIONAL}</span>
  return (
    <span>
      {by.map((name, k) => {
        const href = peopleLinks[name]
        return (
          <Fragment key={name}>
            {k > 0 && ', '}
            {href ? (
              <a
                className="artist-link"
                href={href}
                target="_blank"
                rel="noreferrer"
                title={`${name} on Wikipedia`}
                // Inside a clickable track row, opening the artist shouldn't also start the song.
                onClick={(e) => e.stopPropagation()}
              >
                {name}
              </a>
            ) : (
              name
            )}
          </Fragment>
        )
      })}
    </span>
  )
}
