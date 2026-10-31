import { useCallback, useEffect, useRef, useState } from 'react'

export const MIN_SPEED = 0.5
export const MAX_SPEED = 100

/**
 * Steps through `frameCount` frames like a video player. Speed is in steps per second;
 * at high speeds several frames are advanced per animation frame.
 */
export function usePlayer(frameCount: number, initialIndex = 0) {
  const last = Math.max(frameCount - 1, 0)
  const [index, setIndex] = useState(() => Math.min(initialIndex, last))
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(2)

  // The animation loop needs the current index without restarting on every step.
  const indexRef = useRef(Math.min(initialIndex, last))
  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.min(Math.max(i, 0), last)
      indexRef.current = clamped
      setIndex(clamped)
    },
    [last],
  )

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let prev = performance.now()
    let pending = 0
    const tick = (now: number) => {
      pending += ((now - prev) / 1000) * speed
      prev = now
      const advance = Math.floor(pending)
      if (advance > 0) {
        pending -= advance
        const next = Math.min(indexRef.current + advance, last)
        goTo(next)
        if (next === last) {
          setPlaying(false)
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, last, goTo])

  const play = useCallback(() => {
    if (indexRef.current >= last) goTo(0)
    setPlaying(true)
  }, [last, goTo])

  const pause = useCallback(() => setPlaying(false), [])

  return {
    index: Math.min(index, last),
    playing,
    speed,
    setSpeed,
    play,
    pause,
    toggle: () => (playing ? pause() : play()),
    stepForward: () => {
      pause()
      goTo(indexRef.current + 1)
    },
    stepBack: () => {
      pause()
      goTo(indexRef.current - 1)
    },
    seek: (i: number) => {
      pause()
      goTo(i)
    },
    /** Rewind to the first frame, optionally playing straight away (used when a new trace loads). */
    reset: (autoplay: boolean) => {
      goTo(0)
      setPlaying(autoplay)
    },
  }
}

export type Player = ReturnType<typeof usePlayer>
