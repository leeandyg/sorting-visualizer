import { useEffect, useRef } from 'react'
import { nextSpeed, type Player } from './usePlayer'

/**
 * The same keys as the Sorting Visualizer. Space: play/pause, Enter: play the array in the field,
 * ←/→: step (Shift: 5 steps), Q: start, E: end, −/=: slower/faster, M: sound. Ignored while typing in a field.
 */
export function useKeyboardShortcuts(player: Player, frameCount: number, run: () => void, toggleSound: () => void) {
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
          // Shift+Enter expands the array editor (ArrayPrompt). A button reached with the keyboard
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
