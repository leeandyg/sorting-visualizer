import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'
import './CoverLightbox.css'

interface Props {
  /** The cover itself (CoverArt or AlbumArt). */
  art: ReactNode
  title: string
  subtitle: string
  onClose: () => void
}

/**
 * A cover shown big over a dark backdrop. A modal <dialog> does the hard parts: it keeps focus
 * inside, Esc closes it (as a "cancel", which never reaches the page's shortcut keys as a
 * shortcut), and focus goes back to whatever opened it. Space still plays and pauses underneath.
 */
export function CoverLightbox({ art, title, subtitle, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    // The browser would hand focus back on close(), but React removes the dialog first, so do it here.
    const opener = document.activeElement
    el.showModal()
    return () => {
      el.close()
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label={`${title}, cover`}
      onCancel={(e) => {
        // Let React unmount it rather than the browser closing it under React's feet.
        e.preventDefault()
        onClose()
      }}
      // Only the backdrop area is the dialog itself; clicks on the art or text land on its children.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button type="button" className="icon-button lightbox-close" onClick={onClose} aria-label="Close" title="Close (Esc)">
        <Icon name="close" size={22} />
      </button>
      <figure className="lightbox-figure">
        {art}
        <figcaption>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </figcaption>
      </figure>
    </dialog>
  )
}
