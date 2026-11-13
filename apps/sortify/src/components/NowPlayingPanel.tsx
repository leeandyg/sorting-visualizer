import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { algorithmInfo, type CodeLine, type Frame, ident, type Lang, LANGS, type Level, literal, type SortAlgorithm } from '@sortviz/core'
import { ALBUM, artistsOf, type Track } from '../library/catalog'
import { formatCount } from '../library/format'
import { CoverArt } from './CoverArt'
import { Icon } from './Icon'
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
}

/** The right-hand panel: what's playing, its code as lyrics, and everything about the song. */
export function NowPlayingPanel({ track, algorithm, frame, prev, maxValue, lang, onLang, level, onStage, onOpenStage, next, onPlayNext }: Props) {
  const facts = algorithmInfo[track.id]
  const artists = artistsOf(track)
  const yesNo = (value: boolean) => (value ? 'Yes' : 'No')
  return (
    <aside className="now-panel pane" style={{ '--hue': track.hue } as CSSProperties} aria-label="Now playing">
      <h2 className="panel-context">{ALBUM.title}</h2>

      {onStage ? (
        <div className="panel-song is-compact">
          <CoverArt track={track} />
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

      <section className="lyrics card" aria-label="Lyrics: the code">
        <header>
          <h3>Lyrics</h3>
          <div className="lang-tabs" role="tablist" aria-label="Code language">
            {LANGS.map((option) => (
              <button key={option.id} type="button" role="tab" aria-selected={option.id === lang} onClick={() => onLang(option.id)}>
                {option.label}
              </button>
            ))}
          </div>
        </header>
        <Lyrics code={algorithm.code[lang]} active={frame.step?.line} />
      </section>

      <section className="panel-live" aria-label="Variables and counters">
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
          <div>
            <dt>Best</dt>
            <dd>{facts.time.best}</dd>
          </div>
          <div>
            <dt>Average</dt>
            <dd>{facts.time.average}</dd>
          </div>
          <div>
            <dt>Worst</dt>
            <dd>{facts.time.worst}</dd>
          </div>
          <div>
            <dt>Extra space</dt>
            <dd>{facts.space}</dd>
          </div>
          <div>
            <dt>Stable</dt>
            <dd>{yesNo(algorithm.stable)}</dd>
          </div>
          <div>
            <dt>In place</dt>
            <dd>{yesNo(facts.inPlace)}</dd>
          </div>
          <div>
            <dt>Adaptive</dt>
            <dd>{yesNo(facts.adaptive)}</dd>
          </div>
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
      </section>

      <section className="card credits" aria-labelledby="credits-title">
        <h3 id="credits-title">Credits</h3>
        <dl>
          <div>
            <dt>{artists}</dt>
            <dd>{facts.credits.by.length > 0 ? 'Written by' : 'No known author'}</dd>
          </div>
          {facts.credits.year !== undefined && (
            <div>
              <dt>{facts.credits.year}</dt>
              <dd>Released</dd>
            </div>
          )}
        </dl>
        <p>{facts.credits.note}</p>
      </section>

      {next && (
        <section className="card queue" aria-labelledby="queue-title">
          <h3 id="queue-title">Next in queue</h3>
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

/** The listing as lyrics: the line being run is lit, the rest is dimmed, and it scrolls to follow along. */
function Lyrics({ code, active }: { code: CodeLine[]; active: string | undefined }) {
  const box = useRef<HTMLPreElement>(null)

  // Long listings scroll inside the card; keep the lit lines in view as the step changes.
  useEffect(() => {
    const el = box.current
    const lines = el?.querySelectorAll<HTMLElement>('.lyric.is-active')
    if (!el || !lines?.length) return
    const top = lines[0].offsetTop
    const bottom = lines[lines.length - 1].offsetTop + lines[lines.length - 1].offsetHeight
    if (top < el.scrollTop || bottom > el.scrollTop + el.clientHeight) {
      el.scrollTop = Math.max(0, (top + bottom) / 2 - el.clientHeight / 2)
    }
  }, [active, code])

  return (
    <pre className="lyrics-code" ref={box}>
      <code>
        {code.map((line, k) => (
          <div key={k} className={active && line.keys.includes(active) ? 'lyric is-active' : 'lyric'}>
            {highlight(line.text)}
          </div>
        ))}
      </code>
    </pre>
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

// Keywords across the four languages (none of them are identifiers in the listings), then
// library names, then numbers.
const TOKEN =
  /\b(def|for|in|if|not|and|or|while|break|return|True|False|true|false|function|const|let|do|else|void|int|bool|boolean|using|static)\b|\b(len|range|Math|Arrays|std|Vec|swap|slice|copyOfRange|floor|size|length|begin|vector)\b|\b(\d+)\b/g

/** Minimal highlighting: keywords, library names and numbers. */
function highlight(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(TOKEN)) {
    const at = match.index
    if (at > last) parts.push(text.slice(last, at))
    const kind = match[1] ? 'tok-keyword' : match[2] ? 'tok-builtin' : 'tok-number'
    parts.push(
      <span key={at} className={kind}>
        {match[0]}
      </span>,
    )
    last = at + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
