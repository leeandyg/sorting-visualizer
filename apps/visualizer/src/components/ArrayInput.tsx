import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import './ArrayInput.css'

/** Advance width of one monospace character as a fraction of the font size (SF Mono, Menlo). */
const MONO_CHAR_EM = 0.602
const FONT_PX = 15
/** Horizontal padding inside the field, in px. */
const PADDING_PX = 20
const TIP_SEEN_KEY = 'expand-tip-seen'

function readTipSeen() {
  try {
    return localStorage.getItem(TIP_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

interface Props {
  text: string
  onChange: (text: string) => void
  invalid: boolean
  describedBy?: string
}

/**
 * The array field. When the array is too long to see at once, an expand button appears (hovering it
 * shows the shortcut). The button, or Shift+Enter anywhere (including in the field), opens a
 * multi-line editor showing all of it. Enter runs. Esc steps back out: editor → field → page.
 */
export function ArrayInput({ text, onChange, invalid, describedBy }: Props) {
  const [expanded, setExpanded] = useState(false)
  // Scrolling through a long array in the one-line field briefly shows the expand tip, but only
  // until the tip has been seen once (by scrolling or by hovering the button). Hovering always shows it.
  const [tipFromScroll, setTipFromScroll] = useState(false)
  const tipTimer = useRef(0)
  const tipSeen = useRef(readTipSeen())
  const markTipSeen = () => {
    if (tipSeen.current) return
    tipSeen.current = true
    try {
      localStorage.setItem(TIP_SEEN_KEY, '1')
    } catch {
      // Not remembered across visits; still only shown once this visit.
    }
  }
  const [width, setWidth] = useState(0)
  const [field, setField] = useState<HTMLInputElement | null>(null)
  const editor = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    if (!field) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(field)
    return () => observer.disconnect()
  }, [field])

  // The font is monospace, so the text's width follows from its length.
  const overflows = width > 0 && text.length * MONO_CHAR_EM * FONT_PX > width - PADDING_PX

  const expand = () => {
    setExpanded(true)
    // Wait for the editor to mount, then focus it with the caret at the end.
    requestAnimationFrame(() => {
      const el = editor.current
      if (!el) return
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    })
  }
  const collapse = (refocus: boolean) => {
    setExpanded(false)
    if (refocus) requestAnimationFrame(() => field?.focus())
  }

  // Shift+Enter opens the editor from anywhere on the page, including the field itself,
  // but not while typing in some other field.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Enter' || !e.shiftKey || expanded) return
      const target = e.target as HTMLElement | null
      if (target !== field && target?.matches('input:not([type=range]), textarea, select, [contenteditable]')) return
      e.preventDefault()
      expand()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onEditorKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      collapse(true)
    } else if (e.key === 'Enter') {
      // Enter runs, same as in the one-line field.
      e.preventDefault()
      collapse(false)
      e.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <div className="array-input">
      <input
        ref={setField}
        type="text"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Esc leaves the field (from the expanded editor, the first Esc comes back here).
          if (e.key === 'Escape') e.currentTarget.blur()
        }}
        onScroll={() => {
          if (!overflows || tipSeen.current) return
          markTipSeen()
          setTipFromScroll(true)
          window.clearTimeout(tipTimer.current)
          tipTimer.current = window.setTimeout(() => setTipFromScroll(false), 2000)
        }}
        spellCheck={false}
        aria-label="Array"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={overflows ? 'has-expand' : undefined}
      />
      {overflows && !expanded && (
        <button
          type="button"
          className={tipFromScroll ? 'expand-button show-tip' : 'expand-button'}
          onClick={expand}
          onMouseEnter={markTipSeen}
          aria-label="Expand (Shift+Enter)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {/* Shown on hover, in place of a native tooltip. */}
          <span className="array-tip" aria-hidden="true">
            Click or <kbd>Shift</kbd>+<kbd>Enter</kbd> to expand
          </span>
        </button>
      )}
      {expanded && (
        <div className="array-editor">
          <textarea
            ref={editor}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onEditorKey}
            onBlur={() => collapse(false)}
            spellCheck={false}
            aria-label="Array (expanded)"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            rows={Math.min(8, Math.max(3, Math.ceil((text.length * MONO_CHAR_EM * FONT_PX) / Math.max(width, 1)) + 1))}
          />
          <div className="array-editor-hint">
            <kbd>Enter</kbd> to run · <kbd>Esc</kbd> to go back
          </div>
        </div>
      )}
    </div>
  )
}
