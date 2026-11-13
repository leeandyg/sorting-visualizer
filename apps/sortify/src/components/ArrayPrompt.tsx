import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Icon } from './Icon'
import './ArrayPrompt.css'

/** Advance width of one monospace character as a fraction of the font size (SF Mono, Menlo). */
const MONO_CHAR_EM = 0.602
const FONT_PX = 15
/** Room taken inside the pill by the search icon on the left and the buttons on the right, in px. */
const PADDING_PX = 48 + 96
const TIP_SEEN_KEY = 'sortify-expand-tip-seen'

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
  /** What's wrong with the typed array, shown under the field. */
  error: string | null
  /** Sits at the right end of the pill, where a music app keeps its browse button. */
  children?: ReactNode
}

/**
 * The top bar's field: type an array and press Enter to play it. When the array is too long to
 * see at once, an expand button appears (hovering it shows the shortcut). The button, or
 * Shift+Enter anywhere (including in the field), opens a multi-line editor showing all of it.
 * Esc steps back out: editor → field → page.
 */
export function ArrayPrompt({ text, onChange, error, children }: Props) {
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
    const observer = new ResizeObserver(([entry]) => setWidth(entry.borderBoxSize[0].inlineSize))
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
      // Enter plays, same as in the one-line field.
      e.preventDefault()
      collapse(false)
      e.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <div className="array-prompt">
      <span className="prompt-icon">
        <Icon name="search" size={22} />
      </span>
      <input
        ref={setField}
        type="text"
        value={text}
        placeholder="What do you want to sort?"
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
        aria-label="Array to sort, as numbers separated by commas"
        aria-invalid={error !== null}
        aria-describedby={error ? 'prompt-error' : undefined}
      />
      <div className="prompt-end">
        {overflows && !expanded && (
          <button
            type="button"
            className={tipFromScroll ? 'icon-button expand-button show-tip' : 'icon-button expand-button'}
            onClick={expand}
            onMouseEnter={markTipSeen}
            aria-label="Expand (Shift+Enter)"
          >
            <Icon name="expand" size={16} />
            {/* Shown on hover, in place of a native tooltip. */}
            <span className="array-tip" aria-hidden="true">
              Click or <kbd>Shift</kbd>+<kbd>Enter</kbd> to expand
            </span>
          </button>
        )}
        {children}
      </div>
      {error && (
        <p id="prompt-error" className="prompt-error" role="alert">
          {error}
        </p>
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
            aria-label="Array to sort (expanded)"
            aria-invalid={error !== null}
            aria-describedby={error ? 'prompt-error' : undefined}
            rows={Math.min(8, Math.max(3, Math.ceil((text.length * MONO_CHAR_EM * FONT_PX) / Math.max(width - 32, 1)) + 1))}
          />
          <div className="array-editor-hint">
            <kbd>Enter</kbd> to play it, <kbd>Esc</kbd> to go back
          </div>
        </div>
      )}
    </div>
  )
}
