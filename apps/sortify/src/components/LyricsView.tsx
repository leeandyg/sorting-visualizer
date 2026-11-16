import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { type CodeLine, type Frame, type Lang, LANGS, stepForLine } from '@sortviz/core'
import type { Track } from '../library/catalog'
import { Icon } from './Icon'
import './LyricsView.css'

interface Props {
  track: Track
  code: CodeLine[]
  /** The tag of the line the current step runs (`frame.step?.line`). */
  active: string | undefined
  /** The song has played to its last step: every line has been "sung". */
  finished: boolean
  lang: Lang
  onLang: (lang: Lang) => void
  onClose: () => void
  /** The run's frames and the one showing, so a picked line can jump to a step that runs it. */
  frames: Frame[]
  index: number
  onSeek: (index: number) => void
}

/**
 * The code as full-screen lyrics, like a music app's lyrics page: the main area takes the song's
 * colour, the line being run is white, lines above it are faded and lines still to come are dark.
 */
export function LyricsView({ track, code, active, finished, lang, onLang, onClose, frames, index, onSeek }: Props) {
  const box = useRef<HTMLElement>(null)

  // Lines tagged with the active key are lit; everything before the first of them counts as sung.
  const lit = code.flatMap((line, k) => (active && line.keys.includes(active) ? [k] : []))
  const first = lit.length > 0 ? lit[0] : finished ? code.length : -1
  const last = lit.length > 0 ? lit[lit.length - 1] : first

  // Only lines some step of this run actually reaches can be picked; the rest (signatures, else
  // branches never taken) have nowhere to jump to.
  const reached = useMemo(() => new Set(frames.flatMap((f) => f.step?.line ?? [])), [frames])

  /** A line below the lit one most likely means "skip ahead to there", one above means "go back to it". */
  const jump = (k: number) => {
    const target = stepForLine(frames, code[k].keys, index, k < first ? 'backward' : 'forward')
    if (target !== null) onSeek(target)
  }

  // Keep the lit line in the upper middle of the view, where the eye rests when reading lyrics.
  useEffect(() => {
    const el = box.current
    const line = el?.querySelector<HTMLElement>('.lyrics-line.is-active')
    if (!el || !line) return
    el.scrollTo({ top: Math.max(0, line.offsetTop - el.clientHeight * 0.32), behavior: 'smooth' })
  }, [active, code])

  return (
    <section className="lyrics-view pane" ref={box} style={{ '--hue': track.hue } as CSSProperties} aria-label={`${track.title}, lyrics`}>
      <header className="lyrics-view-head">
        <div className="lang-chips" role="tablist" aria-label="Code language">
          {LANGS.map((option) => (
            <button key={option.id} type="button" role="tab" aria-selected={option.id === lang} onClick={() => onLang(option.id)}>
              {option.label}
            </button>
          ))}
        </div>
        <button type="button" className="icon-button lyrics-view-close" onClick={onClose} aria-label="Close lyrics" title="Close lyrics">
          <Icon name="close" size={20} />
        </button>
      </header>

      <ol className="lyrics-lines" aria-label={`${track.title} in ${LANGS.find((l) => l.id === lang)?.label}`}>
        {code.map((line, k) => {
          const text = line.text.trimStart()
          const state = k < first ? 'is-past' : k <= last && lit.includes(k) ? 'is-active' : k <= last ? 'is-past' : 'is-future'
          // Indentation is meaning in code, so it survives as a left offset (the font isn't monospaced).
          const indent = line.text.length - text.length
          const pickable = line.keys.some((key) => reached.has(key))
          return (
            <li
              key={k}
              className={`lyrics-line ${state}${text === '' ? ' is-blank' : ''}`}
              style={{ '--indent': indent } as CSSProperties}
              aria-current={state === 'is-active' ? 'true' : undefined}
            >
              {pickable ? (
                <button type="button" className="lyrics-jump" onClick={() => jump(k)} title="Jump to this line">
                  {text}
                </button>
              ) : (
                text
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
