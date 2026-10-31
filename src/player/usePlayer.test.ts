import { describe, expect, it } from 'vitest'
import { MAX_SPEED, MIN_SPEED, nextSpeed } from './usePlayer'

describe('nextSpeed', () => {
  it('steps through round speeds', () => {
    expect(nextSpeed(2, 1)).toBe(3)
    expect(nextSpeed(2, -1)).toBe(1.5)
  })

  it('snaps an in-between slider value to the next round speed in that direction', () => {
    expect(nextSpeed(2.4, 1)).toBe(3)
    expect(nextSpeed(2.4, -1)).toBe(2)
  })

  it('stops at the ends', () => {
    expect(nextSpeed(MAX_SPEED, 1)).toBe(MAX_SPEED)
    expect(nextSpeed(MIN_SPEED, -1)).toBe(MIN_SPEED)
  })
})
