import { describe, expect, it } from 'vitest'
import { algorithms } from '../algorithms'
import { record } from './record'
import { stepForLine } from './seek'

const { frames } = record(algorithms.bubble, [3, 1, 2])
const linesOf = (key: string) => frames.flatMap((f, k) => (f.step?.line === key ? [k] : []))
const someKey = frames.find((f) => f.step?.line)!.step!.line!
const hits = linesOf(someKey)

describe('stepForLine', () => {
  it('finds the next step running the line when looking forward', () => {
    expect(stepForLine(frames, [someKey], hits[0], 'forward')).toBe(hits[1])
  })

  it('finds the previous step when looking backward', () => {
    expect(stepForLine(frames, [someKey], hits[1], 'backward')).toBe(hits[0])
  })

  it('falls back to the other direction when the preferred one has nothing', () => {
    const lastHit = hits[hits.length - 1]
    expect(stepForLine(frames, [someKey], lastHit, 'forward')).toBe(hits[hits.length - 2])
    expect(stepForLine(frames, [someKey], 0, 'backward')).toBe(hits[0])
  })

  it('returns null for a line no step runs', () => {
    expect(stepForLine(frames, ['no-such-tag'], 0, 'forward')).toBeNull()
  })
})
