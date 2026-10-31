import { describe, expect, it } from 'vitest'
import { record } from './record'
import type { SortAlgorithm, Step } from './types'

const fake = (steps: Step[], sortsFor = false): SortAlgorithm => ({
  id: 'bubble',
  name: 'Fake',
  stable: true,
  code: { python: [], javascript: [], java: [], cpp: [] },
  pointers: [],
  *run(a) {
    if (sortsFor) a.sort((x, y) => x - y)
    yield* steps
  },
})

describe('record', () => {
  it('starts with an initial frame holding the input', () => {
    const trace = record(fake([]), [3, 1, 2])
    expect(trace.frames).toHaveLength(1)
    expect(trace.frames[0].step).toBeNull()
    expect(trace.frames[0].items).toEqual([
      { id: 0, value: 3 },
      { id: 1, value: 1 },
      { id: 2, value: 2 },
    ])
  })

  it('rejects a trace that does not match what the algorithm did', () => {
    // Claims nothing happened, but actually sorted the array.
    expect(() => record(fake([], true), [2, 1])).toThrow(/does not match/)
  })

  it('rejects writing into a position that is not the gap', () => {
    expect(() => record(fake([{ type: 'lift', i: 0 }, { type: 'drop', i: 1 }]), [1, 2])).toThrow(/not the gap/)
  })

  it('rejects ending with an element still held', () => {
    expect(() => record(fake([{ type: 'lift', i: 0 }]), [1, 2])).toThrow(/does not match/)
  })

  it('rejects out-of-range indices', () => {
    expect(() => record(fake([{ type: 'compare', i: 0, j: 5 }]), [1, 2])).toThrow(/out of range/)
  })

  it('carries line, vars and regions forward until replaced', () => {
    const trace = record(
      fake([
        { type: 'compare', i: 0, j: 1, line: 'a', vars: { i: 0 }, regions: [{ lo: 0, hi: 1, label: 'r' }] },
        { type: 'compare', i: 0, j: 1 },
      ]),
      [1, 2],
    )
    const last = trace.frames.at(-1)!
    expect(last.line).toBe('a')
    expect(last.vars).toEqual({ i: 0 })
    expect(last.regions).toEqual([{ lo: 0, hi: 1, label: 'r' }])
  })
})
