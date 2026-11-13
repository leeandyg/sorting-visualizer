import { useEffect, useRef } from 'react'
import { playDone, playTones, tonesFor, type Trace } from '@sortviz/core'

/** At most this many notes per second; faster playback plays the current step on each beat instead of every step. */
const MAX_NOTES_PER_SECOND = 14

/**
 * Plays the values each new step touched, pitched by size, and a chime when the sort finishes.
 * Notes sound the same at every speed (same length); when steps come faster than
 * MAX_NOTES_PER_SECOND, some are skipped rather than squeezed into short, buzzy blips.
 */
export function useStepSound(enabled: boolean, trace: Trace, index: number, maxValue: number) {
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
