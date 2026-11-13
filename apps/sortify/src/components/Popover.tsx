import { useEffect, useState, type ReactNode } from 'react'
import './Popover.css'

interface Props {
  /** What the button shows. */
  button: ReactNode
  /** Spoken name and tooltip of the button, and the name of the panel it opens. */
  label: string
  buttonClass?: string
  /** Which way the panel opens from the button. */
  placement?: 'below-end' | 'below-start' | 'above-end' | 'above-center'
  /** The panel's content; given a function to close the panel after a choice. */
  children: ReactNode | ((close: () => void) => ReactNode)
}

/** A button that opens a small panel next to it. Clicking elsewhere or pressing Esc closes it. */
export function Popover({ button, label, buttonClass, placement = 'below-end', children }: Props) {
  const [open, setOpen] = useState(false)
  const [root, setRoot] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open || !root) return
    const onPointerDown = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, root])

  return (
    <div className="popover-anchor" ref={setRoot}>
      <button
        type="button"
        className={buttonClass}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        title={open ? undefined : label}
        onClick={() => setOpen(!open)}
      >
        {button}
      </button>
      {open && (
        <div className={`popover ${placement}`} role="dialog" aria-label={label}>
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  )
}
