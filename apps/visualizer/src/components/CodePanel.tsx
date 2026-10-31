import { useEffect, useRef, type ReactNode } from 'react'
import { type CodeLine, type Frame, ident, type Lang, LANGS, literal, type Vars } from '@sortviz/core'
import './CodePanel.css'

interface Props {
  /** The listing in `lang`. */
  code: CodeLine[]
  lang: Lang
  onLangChange: (lang: Lang) => void
  frame: Frame
  prev: Frame | null
}

/** The listing with the current step's line(s) highlighted, language tabs, and the variables below it. */
export function CodePanel({ code, lang, onLangChange, frame, prev }: Props) {
  const active = frame.step?.line
  const codeRef = useRef<HTMLPreElement>(null)

  // Long listings scroll inside the panel; keep the highlighted lines in view as the step changes.
  useEffect(() => {
    const box = codeRef.current
    const lines = box?.querySelectorAll<HTMLElement>('.code-line.is-active')
    if (!box || !lines?.length) return
    const top = lines[0].offsetTop
    const bottom = lines[lines.length - 1].offsetTop + lines[lines.length - 1].offsetHeight
    if (top < box.scrollTop || bottom > box.scrollTop + box.clientHeight) {
      box.scrollTop = Math.max(0, (top + bottom) / 2 - box.clientHeight / 2)
    }
  }, [active, code])

  return (
    <div className="code-panel">
      <div className="code-tabs" role="tablist" aria-label="Code language">
        {LANGS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={option.id === lang}
            onClick={() => onLangChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <pre className="code" ref={codeRef}>
        <code>
          {code.map((line, k) => (
            <div key={k} className={active && line.keys.includes(active) ? 'code-line is-active' : 'code-line'}>
              <span className="line-number" aria-hidden="true">
                {k + 1}
              </span>
              <span>{highlight(line.text)}</span>
            </div>
          ))}
        </code>
      </pre>

      <div className="panel-title">Variables</div>
      <Variables vars={frame.vars} prev={prev?.vars ?? {}} lang={lang} />
    </div>
  )
}

function Variables({ vars, prev, lang }: { vars: Vars; prev: Vars; lang: Lang }) {
  const names = Object.keys(vars)
  if (names.length === 0) return <p className="vars-empty">None right now</p>
  return (
    <dl className="vars">
      {names.map((name) => (
        // Variables that this step changed are emphasised so the eye catches them.
        <div key={name} className={prev[name] !== vars[name] ? 'var is-changed' : 'var'}>
          <dt>{ident(name, lang)}</dt>
          <dd>{literal(vars[name], lang)}</dd>
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
