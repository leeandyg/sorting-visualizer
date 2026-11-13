import { useMemo, useState, type CSSProperties } from 'react'
import { duplicateTags, ident, type Lang, type Level, type MarkKind, narrate, type SortAlgorithm, type SortEvent, type Trace } from '@sortviz/core'
import { artistsOf, type Track } from '../library/catalog'
import { ArrayView } from './ArrayView'
import { HeapTree } from './HeapTree'
import { Icon } from './Icon'
import { Popover } from './Popover'
import './StageView.css'

export type Captions = 'off' | Level

interface Props {
  track: Track
  algorithm: SortAlgorithm
  trace: Trace
  /** The step being shown. */
  index: number
  playing: boolean
  /** Duration of slide animations; 0 snaps. */
  moveMs: number
  lang: Lang
  captions: Captions
  onCaptions: (captions: Captions) => void
  onBack: () => void
  onShare: () => void
}

const CAPTION_OPTIONS: { id: Captions; label: string; hint: string }[] = [
  { id: 'beginner', label: 'Beginner', hint: 'Full sentences that say why' },
  { id: 'expert', label: 'Expert', hint: 'Short notes' },
  { id: 'off', label: 'Off', hint: 'Just watch' },
]

/** The song on stage: the array as bars, with captions saying what each step does. */
export function StageView({ track, algorithm, trace, index, playing, moveMs, lang, captions, onCaptions, onBack, onShare }: Props) {
  const frame = trace.frames[index]
  const tags = useMemo(() => duplicateTags(trace.input), [trace])
  const hasAux = useMemo(() => trace.frames.some((f) => f.aux.length > 0), [trace])
  const hasLift = useMemo(() => trace.frames.some((f) => f.step?.type === 'lift'), [trace])
  const maxValue = Math.max(...trace.input, 1)
  const pointers = algorithm.pointers.flatMap((p) => {
    const at = p.at(frame.vars)
    return at !== undefined && at >= 0 && at < trace.input.length ? [{ label: ident(p.label, lang), index: at }] : []
  })
  // On short windows the bars and the heap's tree take turns; taller ones show both.
  const [showTree, setShowTree] = useState(false)
  const narration = captions === 'off' ? null : narrate(trace, index, captions, lang)

  const classes = ['stage', 'pane']
  if (algorithm.treeView) classes.push(showTree ? 'has-tree show-tree' : 'has-tree')

  return (
    <section className={classes.join(' ')} style={{ '--hue': track.hue } as CSSProperties} aria-label={`${track.title}, now playing`}>
      <header className="stage-head">
        <button type="button" className="icon-button stage-back" onClick={onBack} aria-label="Back to the album" title="Back to the album">
          <Icon name="chevronDown" size={24} />
        </button>
        <div className="stage-title">
          <h1>{track.title}</h1>
          <p>{artistsOf(track)}</p>
        </div>
        <div className="stage-actions">
          {algorithm.treeView && (
            <button type="button" className="pill tree-switch" onClick={() => setShowTree(!showTree)}>
              <Icon name={showTree ? 'bars' : 'tree'} size={16} />
              {showTree ? 'Switch to bars' : 'Switch to tree'}
            </button>
          )}
          <Popover
            button="CC"
            label="Captions"
            buttonClass={captions === 'off' ? 'cc-button' : 'cc-button is-on'}
            placement="below-end"
          >
            {(close) => (
              <div className="menu-list" role="radiogroup" aria-label="Captions">
                {CAPTION_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={captions === option.id}
                    onClick={() => {
                      onCaptions(option.id)
                      close()
                    }}
                  >
                    {option.label}
                    <small>{option.hint}</small>
                  </button>
                ))}
              </div>
            )}
          </Popover>
          <button type="button" className="pill" onClick={onShare} title="Copy a link to this exact step">
            <Icon name="link" size={16} />
            Share
          </button>
        </div>
      </header>

      <Legend trace={trace} />

      <div className="stage-bars">
        <ArrayView
          frame={frame}
          maxValue={maxValue}
          moveMs={moveMs}
          pointers={pointers}
          tags={tags}
          hasAux={hasAux}
          hasLift={hasLift}
        />
      </div>

      {algorithm.treeView && (
        <div className="stage-tree">
          <HeapTree frame={frame} tags={tags} moveMs={moveMs} />
        </div>
      )}

      {narration && (
        <div className={`captions level-${captions}`} aria-live={playing ? 'off' : 'polite'}>
          {narration.phase && <p className="caption-phase">{narration.phase}</p>}
          <p className="caption-text">{narration.text}</p>
        </div>
      )}
    </section>
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

/** Shows only the colors this song actually uses. */
function Legend({ trace }: { trace: Trace }) {
  const used = useMemo(() => {
    const seen = new Set<string | undefined>(trace.frames.map((f) => f.step?.type))
    for (const f of trace.frames) for (const m of f.marks) seen.add(m.kind)
    return seen
  }, [trace])
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
