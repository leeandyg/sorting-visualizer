import type { Frame } from '../engine/types'

export type Level = 'beginner' | 'expert'

export interface Narration {
  /** What the algorithm is doing overall right now (e.g. which pass). Empty when there's nothing to say. */
  phase: string
  /** What this step did, and for beginners, why. */
  text: string
}

export interface StepContext {
  frame: Frame
  /** The frame before this one (the step's "before" state). */
  prev: Frame
  n: number
  level: Level
}

export interface Narrator {
  /** Shown on the initial frame, before anything has happened. */
  intro: Record<Level, string>
  phase: (frame: Frame, n: number, level: Level) => string
  step: (ctx: StepContext) => string
}

/** Value at index i in a frame (the gap reads as undefined). */
export const valueAt = (frame: Frame, i: number) => frame.items[i]?.value

/** "positions 0 to 5" for beginners, "a[0..5]" for experts. */
export function range(lo: number, hi: number, level: Level) {
  if (level === 'expert') return `a[${lo}..${hi}]`
  return lo === hi ? `position ${lo}` : `positions ${lo} to ${hi}`
}
