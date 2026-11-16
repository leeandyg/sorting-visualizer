import { useEffect, useState, type CSSProperties } from 'react'
import { algorithmInfo, peopleLinks } from '@sortviz/core'
import { ALBUM, albumYears, complexityBadge, TRADITIONAL } from '../library/catalog'
import { formatCount, formatLength, formatTime } from '../library/format'
import { ArtistLinks } from './ArtistLinks'
import { AlbumArt } from './CoverArt'
import { Equalizer } from './Equalizer'
import { Icon } from './Icon'
import { Popover } from './Popover'
import './AlbumView.css'

/** Height of the bar that pins to the top of the album page once its header scrolls away. */
const STICKY_BAR = 64

/** How one song goes on the current array. */
export interface TrackStats {
  steps: number
  comparisons: number
  writes: number
}

interface Props {
  /** One entry per track, in album order. */
  stats: TrackStats[]
  current: number
  playing: boolean
  arraySize: number
  onTogglePlay: () => void
  onPlayTrack: (index: number) => void
  onShuffle: () => void
  /** Shows the album cover enlarged. */
  onOpenCover: () => void
}

/** The album page: cover, title, the big play button, and the songs with how each does on the current array. */
export function AlbumView({ stats, current, playing, arraySize, onTogglePlay, onPlayTrack, onShuffle, onOpenCover }: Props) {
  const total = stats.reduce((sum, s) => sum + s.steps, 0)
  // Once the track list's header reaches the top, a slim bar with the title and play button takes over
  // and the column labels stay pinned under it, as on a music app's album page.
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null)
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    if (!sentinel) return
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      root: sentinel.closest('.album'),
      rootMargin: `-${STICKY_BAR}px 0px 0px 0px`,
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinel])
  const playLabel = playing ? 'Pause' : 'Play'
  return (
    <section
      className={stuck ? 'album pane is-stuck' : 'album pane'}
      style={{ '--hue': ALBUM.hue, '--sticky-bar': `${STICKY_BAR}px` } as CSSProperties}
      aria-label={`${ALBUM.title}, album`}
    >
      <div className="album-sticky" aria-hidden={!stuck}>
        <div className="album-sticky-bar">
          <button type="button" className="big-play is-small" onClick={onTogglePlay} aria-label={playLabel} title={playLabel} tabIndex={stuck ? 0 : -1}>
            <Icon name={playing ? 'pause' : 'play'} size={18} />
          </button>
          <strong>{ALBUM.title}</strong>
        </div>
      </div>

      <header className="album-head">
        <button type="button" className="album-cover-button" onClick={onOpenCover} aria-label="Show the album cover" title="Show the album cover">
          <AlbumArt />
        </button>
        <div className="album-heading">
          <span className="album-kind">Album</span>
          <h1>{ALBUM.title}</h1>
          <div className="album-meta">
            <span className="album-avatar">
              <AlbumArt />
            </span>
            <ArtistsMenu /> • {albumYears()} • {ALBUM.tracks.length} songs, {formatLength(total)}
          </div>
        </div>
      </header>

      <div className="album-actions">
        <button
          type="button"
          className="big-play"
          onClick={onTogglePlay}
          aria-label={playLabel}
          title={playLabel}
        >
          <Icon name={playing ? 'pause' : 'play'} size={26} />
        </button>
        <button
          type="button"
          className="icon-button album-shuffle"
          onClick={onShuffle}
          aria-label="Shuffle: play a new array"
          title="Shuffle: play a new array"
        >
          <Icon name="shuffle" size={30} />
        </button>
        <p className="album-note">
          Every song is playing the same {arraySize} values. Shuffle them, or type your own in the bar at the top.
        </p>
      </div>

      <div className="tracks-sentinel" ref={setSentinel} />
      <table className="tracks">
        <thead>
          <tr>
            <th className="col-number">#</th>
            <th>Title</th>
            <th className="col-count">Comparisons</th>
            <th className="col-count">Writes</th>
            <th className="col-time">
              <span className="sr-only">Length</span>
              <Icon name="clock" size={16} />
            </th>
          </tr>
        </thead>
        <tbody>
          {ALBUM.tracks.map((track, k) => {
            const isCurrent = k === current
            return (
              <tr key={track.id} className={isCurrent ? 'is-current' : undefined} onClick={() => onPlayTrack(k)}>
                <td className="col-number">
                  {isCurrent && playing ? <Equalizer /> : <span className="track-number">{k + 1}</span>}
                  <span className="track-play">
                    <Icon name="play" size={16} />
                  </span>
                </td>
                <td>
                  {/* The row is clickable with a mouse; this button is the same action for the keyboard. */}
                  <button
                    type="button"
                    className="track-title"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPlayTrack(k)
                    }}
                  >
                    {track.title}
                  </button>
                  <span className="track-artist">
                    <span className="badge" title={`Work grows like ${complexityBadge(track)} on average`}>
                      {complexityBadge(track)}
                    </span>
                    <ArtistLinks track={track} />
                  </span>
                </td>
                <td className="col-count">{formatCount(stats[k].comparisons)}</td>
                <td className="col-count">{formatCount(stats[k].writes)}</td>
                <td className="col-time" title={`${formatCount(stats[k].steps)} steps`}>
                  {formatTime(stats[k].steps)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <footer className="album-foot">
        <p>One step of a sort is one second of a song.</p>
        <p>℗ {albumYears()} {ALBUM.artist}</p>
        <p>
          Not affiliated with Spotify. Want the step-by-step version?{' '}
          <a href="https://sorting.andygl.com" target="_blank" rel="noreferrer">
            Sorting Visualizer
          </a>
        </p>
      </footer>
    </section>
  )
}

/**
 * "Various Artists" opens a list of who's on the album, each linked to their Wikipedia page where
 * they have one, standing in for the artist pages a music app would link to.
 */
function ArtistsMenu() {
  const people = [...new Set(ALBUM.tracks.flatMap((track) => algorithmInfo[track.id].credits.by))]
  const songsBy = (name: string) => ALBUM.tracks.filter((track) => algorithmInfo[track.id].credits.by.includes(name))
  const traditional = ALBUM.tracks.filter((track) => algorithmInfo[track.id].credits.by.length === 0)
  return (
    <Popover button={ALBUM.artist} label="Artists on this album" buttonClass="album-artist-button" placement="below-start">
      <h3>Artists on this album</h3>
      <ul className="artists-menu">
        {people.map((name) => (
          <li key={name}>
            {peopleLinks[name] ? (
              <a href={peopleLinks[name]} target="_blank" rel="noreferrer" title={`${name} on Wikipedia`}>
                {name}
                <Icon name="external" size={14} />
              </a>
            ) : (
              <span>{name}</span>
            )}
            <small>{songsBy(name).map((track) => track.title).join(', ')}</small>
          </li>
        ))}
        <li>
          <span>{TRADITIONAL}</span>
          <small>{traditional.map((track) => track.title).join(', ')}</small>
        </li>
      </ul>
    </Popover>
  )
}
