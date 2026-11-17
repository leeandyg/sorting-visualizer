import { useState, useSyncExternalStore } from 'react'
import { ALBUM, artistsOf } from '../library/catalog'
import { useStoredChoice } from '../settings/useStoredChoice'
import { AlbumArt, CoverArt } from './CoverArt'
import { Equalizer } from './Equalizer'
import { Icon } from './Icon'
import './Sidebar.css'

interface Props {
  /** Index of the loaded track. */
  current: number
  playing: boolean
  albumOpen: boolean
  onOpenAlbum: () => void
  onPlayTrack: (index: number) => void
}

type Filter = 'all' | 'albums' | 'songs'

/** Matches the width where Sidebar.css turns the library into a rail of covers. */
const RAIL = '(max-width: 1359px)'
const subscribeRail = (onChange: () => void) => {
  const query = window.matchMedia(RAIL)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
const isRail = () => window.matchMedia(RAIL).matches

const FILTERS: { id: Exclude<Filter, 'all'>; label: string }[] = [
  { id: 'albums', label: 'Albums' },
  { id: 'songs', label: 'Songs' },
]

/** The library: the album with its songs under it, always in reach so you can switch songs from the stage. */
export function Sidebar({ current, playing, albumOpen, onOpenAlbum, onPlayTrack }: Props) {
  const [expanded, setExpanded] = useStoredChoice<'open' | 'closed'>('sortify-library-album', ['open', 'closed'], 'open')
  const [chosen, setFilter] = useState<Filter>('all')
  // The rail has no room for the filter chips, so it always shows the whole library.
  const rail = useSyncExternalStore(subscribeRail, isRail)
  const filter = rail ? 'all' : chosen
  const showAlbum = filter !== 'songs'
  // Under "Songs" the songs stand on their own; otherwise they're the album's track list.
  const showSongs = filter === 'songs' || (filter === 'all' && expanded === 'open')
  const nested = filter === 'all'

  const songs = (
    <ul className={nested ? 'library-songs is-nested' : 'library-songs'} id="library-album-tracks">
      {ALBUM.tracks.map((track, k) => (
        <li key={track.id}>
          <button
            type="button"
            className={k === current ? 'library-row song-row is-loaded' : 'library-row song-row'}
            onClick={() => onPlayTrack(k)}
            title={`Play ${track.title}`}
          >
            <CoverArt track={track} />
            <span className="library-text">
              <strong>{track.title}</strong>
              <small>{nested ? artistsOf(track) : `Song • ${artistsOf(track)}`}</small>
            </span>
            {k === current && playing && <Equalizer />}
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <nav className="sidebar pane" aria-label="Your Library">
      <div className="sidebar-head">
        <Icon name="library" size={24} />
        <span className="sidebar-label">Your Library</span>
      </div>

      <div className="library-filters" role="group" aria-label="Show">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            className="filter-chip"
            aria-pressed={filter === option.id}
            // A second click on the lit chip clears it, as music apps do.
            onClick={() => setFilter(filter === option.id ? 'all' : option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <ul className="library-list">
        {showAlbum && (
          <li className={showSongs ? 'library-album is-open' : 'library-album'}>
            <div className="album-row-wrap">
              <button
                type="button"
                className="library-row"
                aria-current={albumOpen ? 'page' : undefined}
                onClick={onOpenAlbum}
                title={ALBUM.title}
              >
                <AlbumArt />
                <span className="library-text">
                  <strong>{ALBUM.title}</strong>
                  <small>Album • {ALBUM.artist}</small>
                </span>
              </button>
              {filter === 'all' && (
                <button
                  type="button"
                  className="icon-button album-toggle"
                  aria-expanded={expanded === 'open'}
                  aria-controls="library-album-tracks"
                  aria-label={expanded === 'open' ? 'Hide the songs' : 'Show the songs'}
                  title={expanded === 'open' ? 'Hide the songs' : 'Show the songs'}
                  onClick={() => setExpanded(expanded === 'open' ? 'closed' : 'open')}
                >
                  <Icon name="caret" size={16} />
                </button>
              )}
            </div>
            {nested && showSongs && songs}
          </li>
        )}
        {!nested && showSongs && <li>{songs}</li>}
      </ul>

    </nav>
  )
}
