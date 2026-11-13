import { describe, expect, it } from 'vitest'
import { record } from '../engine/record'
import { algorithms } from '../algorithms'
import { getVolume, setVolume, tonesFor, valueToFrequency } from './sound'

describe('sound', () => {
  it('maps values onto two octaves, rising with the value', () => {
    expect(valueToFrequency(0, 100)).toBeCloseTo(220)
    expect(valueToFrequency(50, 100)).toBeCloseTo(440)
    expect(valueToFrequency(100, 100)).toBeCloseTo(880)
  })

  it('plays the two compared values, and nothing for bookkeeping steps', () => {
    const trace = record(algorithms.bubble, [3, 1, 2])
    const compare = trace.frames[1]
    expect(compare.step?.type).toBe('compare')
    expect(tonesFor(compare, 3)).toEqual([valueToFrequency(3, 3), valueToFrequency(1, 3)])
    const sorted = trace.frames.find((f) => f.step?.type === 'markSorted')!
    expect(tonesFor(sorted, 3)).toEqual([])
  })

  it('starts at full volume and keeps it between 0 and 1', () => {
    expect(getVolume()).toBe(1)
    setVolume(0.4)
    expect(getVolume()).toBe(0.4)
    setVolume(3)
    expect(getVolume()).toBe(1)
    setVolume(-1)
    expect(getVolume()).toBe(0)
    setVolume(1)
  })
})
