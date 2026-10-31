import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { algorithmFamilies, algorithms } from './algorithms'
import { ArrayView } from './components/ArrayView'
import { CodePanel } from './components/CodePanel'
import { InfoCard } from './components/InfoCard'
import { HeapTree } from './components/HeapTree'
import { PlayerControls } from './components/PlayerControls'
import { MAX_SIZE, record } from './engine/record'
import { duplicateTags } from './engine/tags'
import type { AlgorithmId, MarkKind, SortEvent, Trace } from './engine/types'
import { generate, SHAPES, type Shape } from './input/generate'
import { parseArray } from './input/parseArray'
import { narrate, type Level } from './narration'
import { usePlayer, type Player } from './player/usePlayer'
import { readUrlState, urlFor } from './settings/urlState'
import { useStoredChoice } from './settings/useStoredChoice'
import { useTheme, type ThemeChoice } from './theme/theme'
import './App.css'

const DEFAULT_INPUT = [5, 2, 9, 1, 6, 3, 8, 4]
/** Algorithm, array and step from a shared link, read once on load. */
const fromUrl = readUrlState(window.location.search)

function App() {
  const [algorithmId, setAlgorithmId] = useState<AlgorithmId>(fromUrl.algorithm ?? 'bubble')
  const [input, setInput] = useState(fromUrl.input ?? DEFAULT_INPUT)
  const [text, setText] = useState(input.join(', '))
  const [size, setSize] = useState(Math.max(input.length, 2))
  const [shape, setShape] = useState<Shape>('random')
  // What Generate last produced, so its button can show whether pressing it would change anything.
  const [generated, setGenerated] = useState<{ values: number[]; size: number; shape: Shape } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shareNote, setShareNote] = useState<string | null>(null)
  const theme = useTheme()
  const [level, setLevel] = useStoredChoice<Level>('narration-level', ['beginner', 'expert'], 'beginner')

  const trace = useMemo(() => record(algorithms[algorithmId], input), [algorithmId, input])
  const player = usePlayer(trace.frames.length, fromUrl.step)
  const frame = trace.frames[player.index]
  const algorithm = algorithms[algorithmId]
  const narration = narrate(trace, player.index, level)
  const family = algorithmFamilies.find((f) => f.variants.includes(algorithm))!
  const tags = useMemo(() => duplicateTags(input), [input])
  const hasAux = useMemo(() => trace.frames.some((f) => f.aux.length > 0), [trace])
  const pointers = algorithm.pointers.flatMap((p) => {
    const index = p.at(frame.vars)
    return index !== undefined && index >= 0 && index < input.length ? [{ label: p.label, index }] : []
  })

  useKeyboardShortcuts(player, trace.frames.length)

  // Keep the address bar pointing at the current algorithm and array, so a refresh or a copied URL keeps them.
  useEffect(() => {
    window.history.replaceState(null, '', urlFor(window.location, { algorithm: algorithmId, input }))
  }, [algorithmId, input])

  const share = async () => {
    const url = urlFor(window.location, { algorithm: algorithmId, input, step: player.index })
    window.history.replaceState(null, '', url)
    try {
      await navigator.clipboard.writeText(url)
      setShareNote(`Link to step ${player.index} copied`)
    } catch {
      setShareNote('Copy the link from the address bar')
    }
    window.setTimeout(() => setShareNote(null), 2500)
  }

  // Generate always makes a fresh array; this only decides whether its button looks "ready" (something would change).
  const generateReady =
    !generated || generated.size !== size || generated.shape !== shape || generated.values.join() !== input.join()

  const run = (e: FormEvent) => {
    e.preventDefault()
    const parsed = parseArray(text)
    if (parsed.error !== undefined) {
      setError(parsed.error)
      return
    }
    setError(null)
    setInput(parsed.values)
    player.reset(true)
  }

  const randomize = () => {
    const values = generate(shape, size)
    setText(values.join(', '))
    setInput(values)
    setGenerated({ values, size, shape })
    setError(null)
    player.reset(false)
  }

  const chooseAlgorithm = (id: AlgorithmId) => {
    setAlgorithmId(id)
    player.reset(false)
  }

  // Slides take most of a step at slow speeds; past ~30 steps/s they'd only lag, so snap instead.
  const moveMs = player.speed >= 30 ? 0 : Math.min(350, 700 / player.speed)

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>Sorting Visualizer</h1>
          <p>Watch sorting algorithms work, one step at a time.</p>
        </div>
        <ThemeSwitcher choice={theme.choice} onChange={theme.setChoice} />
      </header>

      <form className="input-panel" onSubmit={run}>
        <label className="field">
          <span>Algorithm</span>
          <select
            value={family.id}
            onChange={(e) => chooseAlgorithm(algorithmFamilies.find((f) => f.id === e.target.value)!.variants[0].id)}
          >
            {algorithmFamilies.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>

        {family.variants.length > 1 && (
          <div className="field">
            <span>Partition</span>
            <div className="segmented variant-picker" role="group" aria-label="Partition scheme">
              {family.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  aria-pressed={variant.id === algorithmId}
                  onClick={() => chooseAlgorithm(variant.id)}
                >
                  {variant.family!.variant}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="field array-field">
          <span>Array</span>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            aria-invalid={error !== null}
            aria-describedby={error ? 'input-error' : undefined}
          />
        </label>

        <button type="submit" className="button primary">
          Run
        </button>

        <div className="field">
          <span>Generate array</span>
          <div className="random-group">
            <select
              className="shape-select"
              value={shape}
              onChange={(e) => setShape(e.target.value as Shape)}
              aria-label="Kind of array to generate"
            >
              {SHAPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              type="range"
              min={2}
              max={MAX_SIZE}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              aria-label="Generated array size"
            />
            <SizeInput size={size} onChange={setSize} />
            <button type="button" className={generateReady ? 'button small generate is-ready' : 'button small generate'} onClick={randomize}>
              Generate
            </button>
          </div>
        </div>

        {error && (
          <p id="input-error" className="input-error" role="alert">
            {error}
          </p>
        )}
      </form>

      <section className="stage">
        <div className="stage-top">
          <Legend trace={trace} />
          <div className="stage-actions">
            <div className="segmented" role="group" aria-label="Explanation detail">
              {(['beginner', 'expert'] as const).map((option) => (
                <button key={option} type="button" aria-pressed={level === option} onClick={() => setLevel(option)}>
                  {option === 'beginner' ? 'Beginner' : 'Expert'}
                </button>
              ))}
            </div>
            <button type="button" className="button small share-button" onClick={share} title="Copy a link to this exact step">
              Share
            </button>
            <span className="share-note" role="status">
              {shareNote}
            </span>
          </div>
        </div>

        <div className="stage-body">
          <div className="stage-main">
            <ArrayView
              frame={frame}
              maxValue={Math.max(...input, 1)}
              moveMs={moveMs}
              pointers={pointers}
              tags={tags}
              hasAux={hasAux}
            />

            {algorithm.treeView && (
              <div className="tree-section">
                <div className="panel-title">The heap as a tree</div>
                <HeapTree frame={frame} tags={tags} moveMs={moveMs} />
              </div>
            )}

            <div className={`narration level-${level}`} aria-live={player.playing ? 'off' : 'polite'}>
              {narration.phase && <p className="narration-phase">{narration.phase}</p>}
              <p className="narration-text">{narration.text}</p>
            </div>

            <dl className="counters">
              <div>
                <dt>Comparisons</dt>
                <dd>{frame.counters.comparisons}</dd>
              </div>
              <div>
                <dt>Swaps</dt>
                <dd>{frame.counters.swaps}</dd>
              </div>
              <div>
                <dt>Writes</dt>
                <dd>{frame.counters.writes}</dd>
              </div>
            </dl>
          </div>

          <CodePanel code={algorithm.code} frame={frame} prev={trace.frames[player.index - 1] ?? null} />
        </div>
      </section>

      <PlayerControls player={player} frameCount={trace.frames.length} />

      <InfoCard algorithm={algorithm} level={level} />
    </main>
  )
}

/** The random array size as text you can click and type into; applied (clamped to 2..MAX_SIZE) on Enter or blur. */
function SizeInput({ size, onChange }: { size: number; onChange: (size: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  // Escape blurs the field too; this tells the blur handler to discard the draft instead of applying it.
  const cancelled = useRef(false)
  const commit = () => {
    const typed = Number.parseInt(draft ?? '', 10)
    if (!cancelled.current && Number.isFinite(typed)) onChange(Math.min(Math.max(typed, 2), MAX_SIZE))
    cancelled.current = false
    setDraft(null)
  }
  return (
    <input
      className="size-input"
      type="text"
      inputMode="numeric"
      value={draft ?? String(size)}
      onMouseDown={(e) => {
        // The first click selects the whole number so typing replaces it. Letting the browser handle
        // that click would drop a caret on mouseup and undo the selection.
        if (document.activeElement !== e.currentTarget) {
          e.preventDefault()
          e.currentTarget.focus()
        }
      }}
      onFocus={(e) => {
        setDraft(String(size))
        e.target.select()
      }}
      onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
      onBlur={commit}
      onKeyDown={(e) => {
        // Enter applies the size instead of submitting the form (which would Run).
        if (e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        } else if (e.key === 'Escape') {
          cancelled.current = true
          e.currentTarget.blur()
        }
      }}
      aria-label="Generated array size"
      title="Click to type a size"
    />
  )
}

const LEGEND: { key: string; label: string; types: (SortEvent['type'] | MarkKind)[] }[] = [
  { key: 'compare', label: 'Comparing', types: ['compare', 'compareHeld', 'compareValue', 'compareAux'] },
  { key: 'swap', label: 'Swapping', types: ['swap'] },
  { key: 'write', label: 'Writing', types: ['shift', 'drop', 'writeFromAux'] },
  { key: 'held', label: 'Key (held)', types: ['lift'] },
  { key: 'mark', label: 'Pivot', types: ['pivot'] },
  { key: 'mark', label: 'Current minimum', types: ['min'] },
  { key: 'ghost', label: 'Old value (not yet overwritten)', types: ['copyOut'] },
  { key: 'sorted', label: 'Final position', types: ['markSorted'] },
]

/** Shows only the colors this algorithm actually uses. */
function Legend({ trace }: { trace: Trace }) {
  const used = new Set<string | undefined>(trace.frames.map((f) => f.step?.type))
  for (const f of trace.frames) for (const m of f.marks) used.add(m.kind)
  return (
    <ul className="legend">
      {LEGEND.filter((entry) => entry.types.some((t) => used.has(t))).map((entry) => (
        <li key={entry.label}>
          <span className={`swatch swatch-${entry.key}`} />
          {entry.label}
        </li>
      ))}
    </ul>
  )
}

const THEME_OPTIONS: { choice: ThemeChoice; label: string; icon: ReactNode }[] = [
  {
    choice: 'system',
    label: 'Match system theme',
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </g>
    ),
  },
  {
    choice: 'light',
    label: 'Light theme',
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </g>
    ),
  },
  {
    choice: 'dark',
    label: 'Dark theme',
    icon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor" />,
  },
]

function ThemeSwitcher({ choice, onChange }: { choice: ThemeChoice; onChange: (choice: ThemeChoice) => void }) {
  return (
    <div className="theme-switcher" role="group" aria-label="Theme">
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.choice}
          type="button"
          aria-pressed={choice === option.choice}
          aria-label={option.label}
          title={option.label}
          onClick={() => onChange(option.choice)}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            {option.icon}
          </svg>
        </button>
      ))}
    </div>
  )
}

/** Space: play/pause, ←/→: step, Home/End: jump. Ignored while typing in a field. */
function useKeyboardShortcuts(player: Player, frameCount: number) {
  useEffect(() => {
    const isField = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.matches('input:not([type=range]), select, textarea')

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isField(e.target)) return
      // Range inputs use the arrow keys themselves.
      const onSlider = e.target instanceof HTMLInputElement && e.target.type === 'range'
      switch (e.key) {
        case ' ':
          e.preventDefault()
          player.toggle()
          break
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'Home':
        case 'End':
          if (onSlider) return
          e.preventDefault()
          if (e.key === 'ArrowLeft') player.stepBack()
          else if (e.key === 'ArrowRight') player.stepForward()
          else player.seek(e.key === 'Home' ? 0 : frameCount - 1)
          break
      }
    }
    // A focused button would also "click" on Space keyup, toggling twice.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && !isField(e.target)) e.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [player, frameCount])
}

export default App
