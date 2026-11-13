import type { CSSProperties } from 'react'
import { ALBUM, albumYears, artistsOf, complexityBadge } from '../library/catalog'
import { formatCount, formatLength, formatTime } from '../library/format'
import { AlbumArt } from './CoverArt'
import { Equalizer } from './Equalizer'
import { Icon } from './Icon'
import './AlbumView.css'

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
}

/** The album page: cover, title, the big play button, and the songs with how each does on the current array. */
export function AlbumView({ stats, current, playing, arraySize, onTogglePlay, onPlayTrack, onShuffle }: Props) {
  const total = stats.reduce((sum, s) => sum + s.steps, 0)
  return (
    <section className="album pane" style={{ '--hue': ALBUM.hue } as CSSProperties} aria-label={`${ALBUM.title}, album`}>
      <header className="album-head">
        <AlbumArt />
        <div className="album-heading">
          <span className="album-kind">Album</span>
          <h1>{ALBUM.title}</h1>
          <p className="album-meta">
            <strong>{ALBUM.artist}</strong> • {albumYears()} • {ALBUM.tracks.length} songs, {formatLength(total)}
          </p>
        </div>
      </header>

      <div className="album-actions">
        <button
          type="button"
          className="big-play"
          onClick={onTogglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          title={playing ? 'Pause' : 'Play'}
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
                    {artistsOf(track)}
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
