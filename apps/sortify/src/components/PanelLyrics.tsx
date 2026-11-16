import { type CSSProperties, useLayoutEffect, useMemo, useRef } from 'react'
import { type CodeLine, type Lang, LANGS } from '@sortviz/core'

interface Props {
  code: CodeLine[]
  /** The tag of the line(s) being run, from the current step. */
  active: string | undefined
  lang: Lang
  onLang: (lang: Lang) => void
  /** Opens the full lyrics; without it the card is just a preview. */
  onOpen?: () => void
}

/** Leading spaces, so indentation can be drawn as a margin instead of eating the big type's width. */
const indentOf = (text: string) => text.length - text.trimStart().length

/**
 * Spaces inside brackets become non-breaking, so a wrapped line breaks between expressions
 * (`a[i], a[j] =` / `a[j], a[i]`) and never inside one (`a[i +` / `1]`).
 */
function keepBracketsTogether(text: string): string {
  let depth = 0
  let out = ''
  for (const ch of text) {
    if ('([{'.includes(ch)) depth++
    if (')]}'.includes(ch)) depth = Math.max(0, depth - 1)
    out += ch === ' ' && depth > 0 ? '\u00a0' : ch
  }
  return out
}

/**
 * A lyrics preview in the song's colour, like a music app's: the line being run sits at the top in
 * big bright type, the next lines wait below it in dark type and fade out.
 */
export function PanelLyrics({ code, active, lang, onLang, onOpen }: Props) {
  const track = useRef<HTMLSpanElement>(null)

  // Python indents by 4 and the others by 2; the smallest indent in the listing is one level.
  const unit = useMemo(() => Math.min(...code.map((line) => indentOf(line.text)).filter((n) => n > 0), Infinity), [code])

  // Slide the listing so the first lit line sits at the top of the window. Done on the element
  // directly: it's pure presentation and shouldn't re-render the panel.
  useLayoutEffect(() => {
    const el = track.current
    if (!el) return
    const lit = el.querySelector<HTMLElement>('.preview-line.is-active')
    el.style.transform = `translateY(${-(lit?.offsetTop ?? 0)}px)`
  }, [active, code])

  return (
    <section className="card lyrics-preview" aria-labelledby="lyrics-preview-title">
      <header>
        <h3 id="lyrics-preview-title">Lyrics preview</h3>
        <div className="lang-tabs" role="tablist" aria-label="Code language">
          {LANGS.map((option) => (
            <button key={option.id} type="button" role="tab" aria-selected={option.id === lang} onClick={() => onLang(option.id)}>
              {option.label}
            </button>
          ))}
        </div>
      </header>
      {/* The whole window opens the lyrics for the mouse; the pill below is the keyboard way in. */}
      <div className={onOpen ? 'preview-window is-link' : 'preview-window'} onClick={onOpen}>
        <span className="preview-track" ref={track}>
          {code.map((line, k) => {
            const text = keepBracketsTogether(line.text.trim())
            const lit = active !== undefined && line.keys.includes(active)
            const level = unit === Infinity ? 0 : Math.round(indentOf(line.text) / unit)
            return (
              <span
                key={k}
                className={`preview-line${lit ? ' is-active' : ''}${text ? '' : ' is-blank'}`}
                style={{ '--level': level } as CSSProperties}
              >
                {text}
              </span>
            )
          })}
        </span>
      </div>
      {onOpen && (
        <button type="button" className="pill lyrics-open" onClick={onOpen}>
          Show lyrics
        </button>
      )}
    </section>
  )
}
