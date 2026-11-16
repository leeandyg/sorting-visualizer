import { useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { algorithmInfo } from '@sortviz/core'
import type { Track } from '../library/catalog'
import { artistPhotos, photoUrl } from '../library/photos'
import { CoverArt } from './CoverArt'
import { Icon } from './Icon'
import type { Credit } from './PanelCredits'

/** A link out to Wikipedia, in the outline-pill style a music app uses for "Follow". */
export function WikiPill({ href, label = 'Wikipedia' }: { href: string; label?: string }) {
  return (
    <a className="outline-pill" href={href} target="_blank" rel="noreferrer">
      {label} <span aria-hidden="true">↗</span>
    </a>
  )
}

/**
 * About the artist: a photo of each billed person (the song's cover where there's no free one),
 * then each person with a real fact where the listener count would be, and the credits note as the bio.
 * The parent keys this card by song, so the gallery starts at the first artist on every song.
 */
export function PanelArtist({ track, credits }: { track: Track; credits: Credit[] }) {
  const { note } = algorithmInfo[track.id].credits
  const [open, setOpen] = useState(false)
  const [clamped, setClamped] = useState(false)
  const [shown, setShown] = useState(0)
  const prevButton = useRef<HTMLButtonElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const gallery = credits.length > 1

  // Offer "Show more" only when the bio really overflows its three lines. Measured on mount (the
  // parent keys this card by song) and again once the web font is in, as the fallback wraps differently.
  const measure = useCallback((el: HTMLParagraphElement | null) => {
    if (!el) return
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1)
    check()
    void document.fonts.ready.then(check)
  }, [])

  // The arrow at an end disappears, so focus moves to the other one rather than falling to the page.
  // The render is flushed first, as a hidden button can't take focus.
  const go = (to: number) => {
    const focused = document.activeElement
    flushSync(() => setShown(to))
    if (focused instanceof HTMLButtonElement && focused.hidden) {
      const other = focused === prevButton.current ? nextButton.current : prevButton.current
      other?.focus()
    }
  }

  return (
    <section className={gallery ? 'card artist is-gallery' : 'card artist'} aria-labelledby="artist-title">
      <div className="artist-art">
        {credits.map((credit, k) => (
          <ArtistSlide key={credit.name} track={track} credit={credit} shown={k === shown} labelled={gallery} />
        ))}
        <h3 id="artist-title">About the artist</h3>
        {gallery && (
          <>
            {/* No ←/→ here: those keys step the song everywhere in the app. */}
            <button
              ref={prevButton}
              type="button"
              className="gallery-arrow is-prev"
              hidden={shown === 0}
              onClick={() => go(shown - 1)}
              aria-label={`Show ${credits[Math.max(shown - 1, 0)].name}`}
            >
              <Icon name="chevronLeft" size={18} />
            </button>
            <button
              ref={nextButton}
              type="button"
              className="gallery-arrow is-next"
              hidden={shown === credits.length - 1}
              onClick={() => go(shown + 1)}
              aria-label={`Show ${credits[Math.min(shown + 1, credits.length - 1)].name}`}
            >
              <Icon name="chevronRight" size={18} />
            </button>
            <span className="gallery-dots" aria-hidden="true">
              {credits.map((credit, k) => (
                <i key={credit.name} className={k === shown ? 'is-shown' : undefined} />
              ))}
            </span>
          </>
        )}
      </div>
      <div className="artist-body">
        {credits.map((credit, k) => (
          <div key={credit.name} className={gallery && k === shown ? 'artist-row is-shown' : 'artist-row'}>
            <div className="artist-name">
              <strong>{credit.name}</strong>
              <span>{credit.fact}</span>
            </div>
            {credit.href && <WikiPill href={credit.href} />}
          </div>
        ))}
        <p ref={measure} className={open ? 'artist-bio is-open' : 'artist-bio'}>
          {note}
        </p>
        {(clamped || open) && (
          <button type="button" className="text-link" onClick={() => setOpen(!open)} aria-expanded={open}>
            {open ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </section>
  )
}

/**
 * One person's picture with its credit. All slides stay mounted and cross-fade, so the next photo
 * is already loaded when the arrow is pressed.
 */
function ArtistSlide({ track, credit, shown, labelled }: { track: Track; credit: Credit; shown: boolean; labelled: boolean }) {
  const photo = artistPhotos[credit.name]
  return (
    <figure className={shown ? 'artist-slide is-shown' : 'artist-slide'} aria-hidden={!shown}>
      {photo ? (
        <img src={photoUrl(photo)} alt={photo.alt} style={{ objectPosition: photo.position }} />
      ) : (
        <CoverArt track={track} />
      )}
      {photo ? (
        // The licences ask for the author and licence; the credit links to the file's source page.
        <figcaption>
          <a href={photo.source} target="_blank" rel="noreferrer" tabIndex={shown ? undefined : -1}>
            Photo: {photo.author}
          </a>
          ,{' '}
          <a href={photo.licenceUrl} target="_blank" rel="noreferrer" tabIndex={shown ? undefined : -1}>
            {photo.licence}
          </a>
        </figcaption>
      ) : (
        // In a gallery, the cover alone wouldn't say whose slide this is.
        labelled && <figcaption className="is-name">{credit.name}</figcaption>
      )}
    </figure>
  )
}
