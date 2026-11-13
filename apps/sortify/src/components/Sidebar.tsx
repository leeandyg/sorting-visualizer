import { ALBUM, artistsOf } from '../library/catalog'
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

/** The library: the album and its songs, always in reach so you can switch songs from the stage. */
export function Sidebar({ current, playing, albumOpen, onOpenAlbum, onPlayTrack }: Props) {
  return (
    <nav className="sidebar pane" aria-label="Your Library">
      <div className="sidebar-head">
        <Icon name="library" size={24} />
        <span className="sidebar-label">Your Library</span>
      </div>

      <ul className="library-list">
        <li>
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
        </li>
        {ALBUM.tracks.map((track, k) => (
          <li key={track.id}>
            <button
              type="button"
              className={k === current ? 'library-row is-loaded' : 'library-row'}
              onClick={() => onPlayTrack(k)}
              title={`Play ${track.title}`}
            >
              <CoverArt track={track} />
              <span className="library-text">
                <strong>{track.title}</strong>
                <small>Song • {artistsOf(track)}</small>
              </span>
              {k === current && playing && <Equalizer />}
            </button>
          </li>
        ))}
      </ul>

      <div className="sidebar-foot">
        <a href="https://sorting.andygl.com" target="_blank" rel="noreferrer" title="Sorting Visualizer: the step-by-step version">
          <Icon name="external" size={16} />
          <span className="sidebar-label">Sorting Visualizer</span>
        </a>
        <small className="sidebar-label">The step-by-step version of this site</small>
      </div>
    </nav>
  )
}
