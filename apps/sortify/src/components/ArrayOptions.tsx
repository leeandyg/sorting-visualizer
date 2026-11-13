import { useRef, useState } from 'react'
import { MAX_SIZE, type Shape, SHAPES } from '@sortviz/core'
import { Icon } from './Icon'
import { Slider } from './Slider'
import './ArrayOptions.css'

export interface ShuffleSettings {
  shape: Shape
  size: number
  onShape: (shape: Shape) => void
  onSize: (size: number) => void
  /** Makes a fresh array from the settings and plays it. */
  onShuffle: () => void
  /** Arrays saved with the heart, newest first. */
  liked: number[][]
  onLoad: (values: number[]) => void
}

/** What Shuffle makes: the kind of array and how many values. Shown in a popover; `close` shuts it. */
export function ArrayOptions({ settings, close }: { settings: ShuffleSettings; close: () => void }) {
  const { shape, size, onShape, onSize, onShuffle, liked, onLoad } = settings
  return (
    <div className="array-options">
      <h3>Shuffle makes</h3>
      <div className="shape-chips" role="group" aria-label="Kind of array">
        {SHAPES.map((option) => (
          <button key={option.id} type="button" aria-pressed={option.id === shape} onClick={() => onShape(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
      <div className="size-row">
        <span>Values</span>
        <Slider value={size} min={2} max={MAX_SIZE} onChange={onSize} label="How many values" />
        <SizeInput size={size} onChange={onSize} />
      </div>
      <button
        type="button"
        className="pill accent shuffle-now"
        onClick={() => {
          onShuffle()
          close()
        }}
      >
        <Icon name="shuffle" size={16} />
        Shuffle and play
      </button>

      {liked.length > 0 && (
        <>
          <h3 className="liked-title">Liked arrays</h3>
          <div className="menu-list liked-list">
            {liked.map((values) => (
              <button
                key={values.join()}
                type="button"
                onClick={() => {
                  onLoad(values)
                  close()
                }}
              >
                <span className="liked-values">{values.join(', ')}</span>
                <small>{values.length} values</small>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** The array size as text you can click and type into; applied (clamped to 2..MAX_SIZE) on Enter or blur. */
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
        // Enter applies the size; Escape discards it. Neither should reach the popover or the page.
        if (e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        } else if (e.key === 'Escape') {
          e.stopPropagation()
          cancelled.current = true
          e.currentTarget.blur()
        }
      }}
      aria-label="How many values"
      title="Click to type a size"
    />
  )
}
