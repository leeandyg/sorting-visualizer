import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { algorithmList, algorithms } from './algorithms'
import { ArrayView } from './components/ArrayView'
import { PlayerControls } from './components/PlayerControls'
import { MAX_SIZE, record } from './engine/record'
import type { AlgorithmId, SortEvent, Trace } from './engine/types'
import { parseArray, randomArray } from './input/parseArray'
import { describeStep } from './narration/describe'
import { usePlayer, type Player } from './player/usePlayer'
import { useTheme, type ThemeChoice } from './theme/theme'
import './App.css'

const DEFAULT_INPUT = [5, 2, 9, 1, 6, 3, 8, 4]

function App() {
  const [algorithmId, setAlgorithmId] = useState<AlgorithmId>('bubble')
  const [input, setInput] = useState(DEFAULT_INPUT)
  const [text, setText] = useState(DEFAULT_INPUT.join(', '))
  const [size, setSize] = useState(DEFAULT_INPUT.length)
  const [error, setError] = useState<string | null>(null)
  const theme = useTheme()

  const trace = useMemo(() => record(algorithms[algorithmId], input), [algorithmId, input])
  const player = usePlayer(trace.frames.length)
  const frame = trace.frames[player.index]

  useKeyboardShortcuts(player, trace.frames.length)

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
    const values = randomArray(size)
    setText(values.join(', '))
    setInput(values)
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
          <select value={algorithmId} onChange={(e) => chooseAlgorithm(e.target.value as AlgorithmId)}>
            {algorithmList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

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

        <div className="random-group">
          <label className="field">
            <span>Size: {size}</span>
            <input type="range" min={2} max={MAX_SIZE} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          </label>
          <button type="button" className="button" onClick={randomize}>
            Random
          </button>
        </div>

        {error && (
          <p id="input-error" className="input-error" role="alert">
            {error}
          </p>
        )}
      </form>

      <section className="stage">
        <Legend trace={trace} />

        <ArrayView frame={frame} maxValue={Math.max(...input, 1)} moveMs={moveMs} />

        <p className="step-text" aria-live={player.playing ? 'off' : 'polite'}>
          {describeStep(frame)}
        </p>

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
      </section>

      <PlayerControls player={player} frameCount={trace.frames.length} />
    </main>
  )
}

const LEGEND: { key: string; label: string; types: SortEvent['type'][] }[] = [
  { key: 'compare', label: 'Comparing', types: ['compare', 'compareHeld'] },
  { key: 'swap', label: 'Swapping', types: ['swap'] },
  { key: 'write', label: 'Writing', types: ['shift', 'drop'] },
  { key: 'held', label: 'Key (held)', types: ['lift'] },
  { key: 'sorted', label: 'Final position', types: ['markSorted'] },
]

/** Shows only the colors this algorithm actually uses. */
function Legend({ trace }: { trace: Trace }) {
  const used = new Set(trace.frames.map((f) => f.step?.type))
  return (
    <ul className="legend">
      {LEGEND.filter((entry) => entry.types.some((t) => used.has(t))).map((entry) => (
        <li key={entry.key}>
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
