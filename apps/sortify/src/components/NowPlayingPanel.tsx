import { type CSSProperties, useState } from 'react'
import { algorithmInfo, type Frame, ident, type Lang, type Level, literal, type SortAlgorithm } from '@sortviz/core'
import { ALBUM, artistsOf, type Track } from '../library/catalog'
import { formatCount } from '../library/format'
import { CoverArt } from './CoverArt'
import { Icon } from './Icon'
import { PanelArtist, WikiPill } from './PanelArtist'
import { type Credit, creditsFor } from './PanelCredits'
import { PanelLyrics } from './PanelLyrics'
import { rolesById } from './roles'
import './NowPlayingPanel.css'

interface Props {
  track: Track
  algorithm: SortAlgorithm
  frame: Frame
  prev: Frame | null
  maxValue: number
  lang: Lang
  onLang: (lang: Lang) => void
  level: Level
  /** The bars are on the main stage, so the panel shows the cover instead of a second copy of them. */
  onStage: boolean
  onOpenStage: () => void
  /** The song after this one, if any. */
  next: Track | null
  onPlayNext: () => void
  /** Opens the full-screen lyrics view in the main area. */
  onOpenLyrics?: () => void
  /** Shows the song's cover art enlarged. */
  onOpenCover?: () => void
  /** The full lyrics fill the main area, so the preview card would only repeat them. */
  lyricsOpen?: boolean
}

/** The right-hand panel: what's playing, its code as lyrics, and everything about the song. */
export function NowPlayingPanel(props: Props) {
  const { track, algorithm, frame, prev, maxValue, lang, onLang, level, onStage, onOpenStage, next, onPlayNext } = props
  const { onOpenLyrics, onOpenCover, lyricsOpen } = props
  const artists = artistsOf(track)
  const credits = creditsFor(track.id)
  return (
    <aside className="now-panel pane" style={{ '--hue': track.hue } as CSSProperties} aria-label="Now playing">
      <h2 className="panel-context">{ALBUM.title}</h2>

      {onStage ? (
        <div className="panel-song is-compact">
          {onOpenCover ? (
            <button type="button" className="panel-cover" onClick={onOpenCover} aria-label={`Show the cover of ${track.title}`}>
              <CoverArt track={track} />
            </button>
          ) : (
            <CoverArt track={track} />
          )}
          <div className="panel-song-text">
            <strong>{track.title}</strong>
            <span>{artists}</span>
          </div>
        </div>
      ) : (
        <>
          <button type="button" className="mini-stage" onClick={onOpenStage} aria-label={`Open ${track.title} on the stage`}>
            <MiniBars frame={frame} maxValue={maxValue} />
            <span className="pill mini-stage-open">
              <Icon name="expand" size={14} />
              Open the stage
            </span>
          </button>
          <div className="panel-song">
            <div className="panel-song-text">
              <strong>{track.title}</strong>
              <span>{artists}</span>
            </div>
          </div>
        </>
      )}

      {!lyricsOpen && (
        <PanelLyrics code={algorithm.code[lang]} active={frame.step?.line} lang={lang} onLang={onLang} onOpen={onOpenLyrics} />
      )}

      <section className="card panel-live" aria-labelledby="live-title">
        <h3 id="live-title">Variables</h3>
        <Variables frame={frame} prev={prev} lang={lang} />
        <dl className="counters">
          <div>
            <dt>Comparisons</dt>
            <dd>{formatCount(frame.counters.comparisons)}</dd>
          </div>
          <div>
            <dt>Swaps</dt>
            <dd>{formatCount(frame.counters.swaps)}</dd>
          </div>
          <div>
            <dt>Writes</dt>
            <dd>{formatCount(frame.counters.writes)}</dd>
          </div>
        </dl>
      </section>

      {/* Keyed by song so the bio's "Show more" closes and re-measures on a new song. */}
      <PanelArtist key={track.id} track={track} credits={credits.filter((credit) => !credit.extra)} />

      <AboutSong track={track} algorithm={algorithm} level={level} />

      <CreditsCard key={`credits-${track.id}`} track={track} credits={credits} />

      {next && (
        <section className="card queue" aria-labelledby="queue-title">
          <header className="card-head">
            <h3 id="queue-title">Next in queue</h3>
            <button type="button" className="text-link" onClick={onPlayNext}>
              Play now
            </button>
          </header>
          <button type="button" className="queue-row" onClick={onPlayNext} title={`Play ${next.title}`}>
            <CoverArt track={next} />
            <span className="panel-song-text">
              <strong>{next.title}</strong>
              <span>{artistsOf(next)}</span>
            </span>
          </button>
        </section>
      )}
    </aside>
  )
}

/** The facts: idea, complexity, cases and uses, plus a key to the table for beginners. */
function AboutSong({ track, algorithm, level }: { track: Track; algorithm: SortAlgorithm; level: Level }) {
  const facts = algorithmInfo[track.id]
  const yesNo = (value: boolean) => (value ? 'Yes' : 'No')
  const stats: [string, string][] = [
    ['Best', facts.time.best],
    ['Average', facts.time.average],
    ['Worst', facts.time.worst],
    ['Extra space', facts.space],
    ['Stable', yesNo(algorithm.stable)],
    ['In place', yesNo(facts.inPlace)],
    ['Adaptive', yesNo(facts.adaptive)],
  ]
  return (
    <section className="card about" aria-labelledby="about-title">
      <h3 id="about-title">About the song</h3>
      <p className="about-idea">{facts.idea}</p>
      {algorithm.family && (
        <p>
          Lomuto and Hoare are two partition schemes: two ways to do quick sort's splitting step. This song uses{' '}
          {algorithm.family.variant}'s.
        </p>
      )}
      <dl className="about-stats">
        {stats.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p>
        <strong>Best and worst cases.</strong> {facts.cases}
      </p>
      <p>
        <strong>Where it's used.</strong> {facts.usedFor}
      </p>
      {level === 'beginner' && (
        <p className="about-glossary">
          <strong>Reading the table.</strong> O(…) describes how the work grows as the array gets bigger: with O(n²),
          doubling the array roughly quadruples the work; with O(n log n), it only a little more than doubles.{' '}
          <em>Stable</em> means equal values keep their original order. <em>In place</em> means it needs no extra array.{' '}
          <em>Adaptive</em> means it speeds up when the input is already partly sorted.
        </p>
      )}
      <div className="about-more">
        <WikiPill href={facts.wikipedia} label="Read on Wikipedia" />
      </div>
    </section>
  )
}

/** Credits rows like a music app's, names without links; "Show all" adds anyone else the history names, the year and the full note. */
function CreditsCard({ track, credits }: { track: Track; credits: Credit[] }) {
  const [all, setAll] = useState(false)
  const { year, note } = algorithmInfo[track.id].credits
  const shown = all ? credits : credits.filter((credit) => !credit.extra)
  return (
    <section className="card credits" aria-labelledby="credits-title">
      <header className="card-head">
        <h3 id="credits-title">Credits</h3>
        <button type="button" className="text-link" onClick={() => setAll(!all)} aria-expanded={all}>
          {all ? 'Show less' : 'Show all'}
        </button>
      </header>
      <ul className="credit-rows">
        {/* Plain names: the artist card and About the song already link out, once each. */}
        {shown.map((credit) => (
          <li key={credit.name}>
            <span className="credit-name">{credit.name}</span>
            <span className="credit-role">{credit.role}</span>
          </li>
        ))}
      </ul>
      {all && (
        <div className="credits-more">
          {year !== undefined && <p>Released {year}.</p>}
          <p>{note}</p>
        </div>
      )}
    </section>
  )
}

/** A small, label-free copy of the bars for the panel, so a song can be watched while browsing the album. */
function MiniBars({ frame, maxValue }: { frame: Frame; maxValue: number }) {
  const roles = rolesById(frame)
  return (
    <span className="mini-bars" aria-hidden="true">
      {frame.items.map((item, k) => {
        // A lifted key is drawn back in its gap here; there's no room to float it.
        const shown = item ?? (frame.ghosts[k] === null ? frame.held : null)
        if (!shown) return <i key={k} className="is-empty" />
        const role = roles.get(shown.id)
        const state = role ? `is-${role}` : frame.sorted[k] && item ? 'is-sorted' : ''
        return <i key={k} className={state} style={{ height: `${Math.max((shown.value / maxValue) * 100, 3)}%` }} />
      })}
    </span>
  )
}

function Variables({ frame, prev, lang }: { frame: Frame; prev: Frame | null; lang: Lang }) {
  const names = Object.keys(frame.vars)
  const before = prev?.vars ?? {}
  if (names.length === 0) return <p className="vars-empty">No variables yet</p>
  return (
    <dl className="vars">
      {names.map((name) => (
        // Variables that this step changed are emphasised so the eye catches them.
        <div key={name} className={before[name] !== frame.vars[name] ? 'var is-changed' : 'var'}>
          <dt>{ident(name, lang)}</dt>
          <dd>{literal(frame.vars[name], lang)}</dd>
        </div>
      ))}
    </dl>
  )
}
