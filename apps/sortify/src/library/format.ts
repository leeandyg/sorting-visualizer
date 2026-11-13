/**
 * Sortify shows steps as time: one step is one "second", so a 178-step sort is a 2:58 song.
 * That keeps a track's length the same at every playback speed, like a podcast's.
 */
export function formatTime(steps: number): string {
  const whole = Math.max(0, Math.floor(steps))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

/** "12 min 40 sec" for the album header; hours appear only when needed. */
export function formatLength(steps: number): string {
  const whole = Math.max(0, Math.floor(steps))
  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const seconds = whole % 60
  if (hours > 0) return `${hours} hr ${minutes} min`
  if (minutes === 0) return `${seconds} sec`
  return `${minutes} min ${seconds} sec`
}

/** Speed as a multiplier, as podcast players show it: 0.5×, 1.5×, 4×, 25×. */
export function formatSpeed(speed: number): string {
  const rounded = speed < 10 ? Math.round(speed * 10) / 10 : Math.round(speed)
  return `${rounded}×`
}

/** 1,234 */
export function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}
