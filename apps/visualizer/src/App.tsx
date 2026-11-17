import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { algorithmFamilies, type AlgorithmId, algorithms, duplicateTags, generate, handoffUrl, ident, type Lang, LANGS, type Level, type MarkKind, MAX_SIZE, narrate, parseArray, playDone, playTones, readHandoff, record, type Shape, SHAPES, type SortEvent, sites, tonesFor, type Trace } from '@sortviz/core'
import { ArrayInput } from './components/ArrayInput'
import { ArrayView } from './components/ArrayView'
import { CodePanel } from './components/CodePanel'
import { InfoCard } from './components/InfoCard'
import { HeapTree } from './components/HeapTree'
import { PlayerControls } from './components/PlayerControls'
import { SiteSwitcher } from './components/SiteSwitcher'
import { MAX_SPEED, MIN_SPEED, nextSpeed, usePlayer, type Player } from './player/usePlayer'
import { initSiteSwitch } from './settings/siteSwitch'
import { readUrlState, urlFor } from './settings/urlState'
import { useStoredChoice } from './settings/useStoredChoice'
import { useTheme, type ThemeChoice } from './theme/theme'
import './App.css'

const DEFAULT_INPUT = [5, 2, 9, 1, 6, 3, 8, 4]
/** Algorithm, array and step from a shared link, read once on load. */
const fromUrl = readUrlState(window.location.search)
/** Speed and play state, when the link came from Sortify's site switcher. */
const handoff = readHandoff(window.location.search, MIN_SPEED, MAX_SPEED)
initSiteSwitch(handoff.arrived, handoff.lang && ['code-lang', handoff.lang])

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
  const [sound, setSound] = useStoredChoice<'on' | 'off'>('sound', ['on', 'off'], 'off')
  const [lang, setLang] = useStoredChoice<Lang>(
    'code-lang',
    LANGS.map((l) => l.id),
    'python',
  )

  const trace = useMemo(() => record(algorithms[algorithmId], input), [algorithmId, input])
  const player = usePlayer(trace.frames.length, fromUrl.step, handoff.speed, handoff.playing)
  const frame = trace.frames[player.index]
  const algorithm = algorithms[algorithmId]
  const narration = narrate(trace, player.index, level, lang)
  const family = algorithmFamilies.find((f) => f.variants.includes(algorithm))!
  const tags = useMemo(() => duplicateTags(input), [input])
  const hasAux = useMemo(() => trace.frames.some((f) => f.aux.length > 0), [trace])
  const hasLift = useMemo(() => trace.frames.some((f) => f.step?.type === 'lift'), [trace])
  const pointers = algorithm.pointers.flatMap((p) => {
    const index = p.at(frame.vars)
    return index !== undefined && index >= 0 && index < input.length ? [{ label: ident(p.label, lang), index }] : []
  })


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

  const showAbout = () => {
    const card = document.getElementById('info-title')
    card?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    card?.focus({ preventScroll: true })
  }

  // Generate always makes a fresh array; this only decides whether its button looks "ready" (something would change).
  const generateReady =
    !generated || generated.size !== size || generated.shape !== shape || generated.values.join() !== input.join()

  const run = (e?: FormEvent) => {
    e?.preventDefault()
    // Leave the text field, so Space pauses instead of typing a space into the array.
    if (document.activeElement instanceof HTMLInputElement && document.activeElement.type === 'text') {
      document.activeElement.blur()
    }
    const parsed = parseArray(text)
    if (parsed.error !== undefined) {
      setError(parsed.error)
      return
    }
    setError(null)
    setInput(parsed.values)
    player.reset(true)
  }

  const toggleSound = () => {
    const next = sound === 'on' ? 'off' : 'on'
    setSound(next)
    // A soft blip confirms sound works (and starts audio, which needs a click or key press).
    if (next === 'on') playTones([440], 90)
  }

  useKeyboardShortcuts(player, trace.frames.length, run, toggleSound)
  useStepSound(sound === 'on', trace, player.index, Math.max(...input, 1))

  const randomize = () => {
    const values = generate(shape, size)
    setText(values.join(', '))
    setInput(values)
    setGenerated({ values, size, shape })
    setError(null)
    player.reset(false)
  }

  /** Back to the array the site starts with. */
  const atDefault = input.join() === DEFAULT_INPUT.join()
  const resetArray = () => {
    setText(DEFAULT_INPUT.join(', '))
    setInput(DEFAULT_INPUT)
    setSize(DEFAULT_INPUT.length)
    setGenerated(null)
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
        <SiteSwitcher
          href={handoffUrl(sites.sortify.url, {
            algorithm: algorithmId,
            input,
            step: player.index,
            speed: player.speed,
            playing: player.playing,
            lang,
          })}
        />
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

        <div className="field array-field">
          <span>Array</span>
          <ArrayInput
            text={text}
            onChange={setText}
            invalid={error !== null}
            describedBy={error ? 'input-error' : undefined}
          />
        </div>

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
            <button
              type="button"
              className="reset-array"
              onClick={resetArray}
              disabled={atDefault}
              aria-label="Back to the starting array"
              title={atDefault ? 'This is the starting array' : 'Back to the starting array'}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M5.5 12a6.5 6.5 0 1 0 2-4.7M4.5 4.5v4h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
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
          <div className="stage-title">
            <div className="stage-title-line">
              <h2>{family.name}</h2>
              <button
                type="button"
                className="about-button"
                onClick={showAbout}
                aria-label={`About ${family.name.toLowerCase()}`}
                title={`About ${family.name.toLowerCase()}`}
              >
                ?
              </button>
            </div>
            {/* Under the name, so the "?" clearly belongs to the algorithm rather than the variant. */}
            {family.variants.length > 1 && (
              <span className="stage-variant" tabIndex={0} aria-describedby="variant-tip">
                {algorithm.family!.variant}
                <span id="variant-tip" role="tooltip" className="variant-tip">
                  Lomuto and Hoare are two partition schemes: two ways to do quick sort's splitting step.
                </span>
              </span>
            )}
          </div>
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
              hasLift={hasLift}
            />

            <div className={`narration level-${level}`} aria-live={player.playing ? 'off' : 'polite'}>
              {narration.phase && <p className="narration-phase">{narration.phase}</p>}
              <p className="narration-text">{narration.text}</p>
            </div>

            {algorithm.treeView && (
              <div className="tree-section">
                <div className="panel-title">The heap as a tree</div>
                <HeapTree frame={frame} tags={tags} moveMs={moveMs} />
              </div>
            )}
          </div>

          <div className="stage-side">
            <CodePanel
              code={algorithm.code[lang]}
              lang={lang}
              onLangChange={setLang}
              frame={frame}
              prev={trace.frames[player.index - 1] ?? null}
            />
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
        </div>
      </section>

      <PlayerControls player={player} frameCount={trace.frames.length} sound={sound === 'on'} onToggleSound={toggleSound} />

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

/** Space: play/pause, Enter: run, ←/→: step (Shift: 5 steps), Q: start, E: end, −/=: slower/faster, M: sound. Ignored while typing in a field. */
function useKeyboardShortcuts(player: Player, frameCount: number, run: () => void, toggleSound: () => void) {
  // Which element got focus from a click: the last interaction before the focus change was a
  // pointer press rather than a key (like Tab). Browsers mark even clicked buttons :focus-visible
  // once a key is pressed, so track it here. Refs, because the listeners are re-attached every render.
  const lastInput = useRef<'pointer' | 'key'>('key')
  const clickFocused = useRef<EventTarget | null>(null)

  useEffect(() => {
    const onPointerDown = () => {
      lastInput.current = 'pointer'
    }
    const onAnyKey = () => {
      lastInput.current = 'key'
    }
    const onFocusIn = (e: FocusEvent) => {
      clickFocused.current = lastInput.current === 'pointer' ? e.target : null
    }

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
        case 'Enter': {
          // Shift+Enter expands the array editor (ArrayInput). A button reached with the keyboard
          // (Tab) keeps Enter for itself; one that only has focus because it was clicked doesn't.
          const keyboardFocused =
            e.target instanceof HTMLElement && e.target.matches('button, a') && e.target !== clickFocused.current
          if (e.shiftKey || keyboardFocused) return
          e.preventDefault()
          run()
          break
        }
        case 'ArrowLeft':
        case 'ArrowRight': {
          if (onSlider) return
          e.preventDefault()
          // Shift skips 5 steps at a time.
          const by = (e.key === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 5 : 1)
          player.seek(player.index + by)
          break
        }
        case 'q':
        case 'Q':
          e.preventDefault()
          player.seek(0)
          break
        case 'e':
        case 'E':
          e.preventDefault()
          player.seek(frameCount - 1)
          break
        case 'm':
        case 'M':
          e.preventDefault()
          toggleSound()
          break
        case '-':
        case '_':
        case '=':
        case '+':
          e.preventDefault()
          player.setSpeed(nextSpeed(player.speed, e.key === '=' || e.key === '+' ? 1 : -1))
          break
      }
    }
    // A focused button would also "click" on Space keyup, toggling twice.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && !isField(e.target)) e.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onAnyKey, true)
    window.addEventListener('focusin', onFocusIn)
    return () => {
      window.removeEventListener('keydown', onAnyKey, true)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('focusin', onFocusIn)
    }
  }, [player, frameCount, run, toggleSound])
}

/** At most this many notes per second; faster playback plays the current step on each beat instead of every step. */
const MAX_NOTES_PER_SECOND = 14

/**
 * Plays the values each new step touched, pitched by size, and a chime when the sort finishes.
 * Notes sound the same at every speed (same length); when steps come faster than
 * MAX_NOTES_PER_SECOND, some are skipped rather than squeezed into short, buzzy blips.
 */
function useStepSound(enabled: boolean, trace: Trace, index: number, maxValue: number) {
  const lastIndex = useRef(index)
  const lastTone = useRef(0)
  useEffect(() => {
    // Only react to the step changing (not to sound being switched on, or a new trace loading).
    if (lastIndex.current === index) return
    lastIndex.current = index
    if (!enabled || index === 0) return
    const frame = trace.frames[index]
    if (index === trace.frames.length - 1 && frame.sorted.every(Boolean)) {
      playDone()
      return
    }
    const now = performance.now()
    if (now - lastTone.current < 1000 / MAX_NOTES_PER_SECOND) return
    lastTone.current = now
    playTones(tonesFor(frame, maxValue))
  }, [enabled, trace, index, maxValue])
}

export default App
