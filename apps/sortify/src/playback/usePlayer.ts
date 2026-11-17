import { useCallback, useEffect, useRef, useState } from 'react'

export const MIN_SPEED = 0.5
export const MAX_SPEED = 100
/** Round speeds the − / = keys step through: about ×1.4 apart, so evenly spaced on the log slider. */
export const SPEED_STEPS = [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 25, 35, 50, 75, 100]

/** The next round speed above (or below) the current one, which may be an in-between slider value. */
export function nextSpeed(speed: number, direction: 1 | -1): number {
  if (direction === 1) return SPEED_STEPS.find((s) => s > speed + 1e-9) ?? MAX_SPEED
  return [...SPEED_STEPS].reverse().find((s) => s < speed - 1e-9) ?? MIN_SPEED
}

/**
 * Steps through `frameCount` frames like a music player. Speed is in steps per second;
 * at high speeds several frames are advanced per animation frame.
 */
export function usePlayer(frameCount: number, initialIndex = 0, initialSpeed = 4, autoplay = false) {
  const last = Math.max(frameCount - 1, 0)
  const [index, setIndex] = useState(() => Math.min(initialIndex, last))
  // Arriving from the other site mid-song carries on playing (unless it had already finished).
  const [playing, setPlaying] = useState(autoplay && initialIndex < last)
  const [speed, setSpeed] = useState(initialSpeed)
  // True only when playback ran to the last frame on its own and nothing has been touched since.
  // That is the one moment the next track may start by itself.
  const [ended, setEnded] = useState(false)

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
          setEnded(true)
          return
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, speed, last, goTo])

  const play = useCallback(() => {
    setEnded(false)
    if (indexRef.current >= last) goTo(0)
    setPlaying(true)
  }, [last, goTo])

  const pause = useCallback(() => {
    setEnded(false)
    setPlaying(false)
  }, [])

  return {
    index: Math.min(index, last),
    playing,
    ended,
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
      setEnded(false)
      goTo(0)
      setPlaying(autoplay)
    },
    /** Stay on the finished frame instead of moving on to the next track. */
    stay: () => setEnded(false),
  }
}

export type Player = ReturnType<typeof usePlayer>
