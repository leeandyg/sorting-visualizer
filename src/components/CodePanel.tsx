import type { ReactNode } from 'react'
import type { CodeLine, Frame, Vars } from '../engine/types'
import './CodePanel.css'

interface Props {
  code: CodeLine[]
  frame: Frame
  prev: Frame | null
}

/** The Python listing with the current step's line(s) highlighted, and the loop variables below it. */
export function CodePanel({ code, frame, prev }: Props) {
  const active = frame.step?.line
  return (
    <div className="code-panel">
      <div className="panel-title">Python</div>
      <pre className="code">
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
      <Variables vars={frame.vars} prev={prev?.vars ?? {}} />
    </div>
  )
}

function Variables({ vars, prev }: { vars: Vars; prev: Vars }) {
  const names = Object.keys(vars)
  if (names.length === 0) return <p className="vars-empty">None right now</p>
  return (
    <dl className="vars">
      {names.map((name) => (
        // Variables that this step changed are emphasised so the eye catches them.
        <div key={name} className={prev[name] !== vars[name] ? 'var is-changed' : 'var'}>
          <dt>{name}</dt>
          <dd>{formatPython(vars[name])}</dd>
        </div>
      ))}
    </dl>
  )
}

const formatPython = (value: number | boolean) => (typeof value === 'boolean' ? (value ? 'True' : 'False') : String(value))

const TOKEN = /\b(def|for|in|if|not|and|or|while|break|return|True|False)\b|\b(len|range)\b|\b(\d+)\b/g

/** Minimal Python highlighting: keywords, builtins and numbers. */
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
