import { describe, expect, it } from 'vitest'
import { generate, SHAPES } from './generate'

const sortedAsc = (a: number[]) => a.every((v, k) => k === 0 || a[k - 1] <= v)
const inversions = (a: number[]) => a.reduce((count, v, k) => count + a.slice(k + 1).filter((w) => w < v).length, 0)

describe('generate', () => {
  it('produces the requested size with values from 1 to 99 for every shape', () => {
    for (const { id } of SHAPES) {
      const values = generate(id, 50)
      expect(values).toHaveLength(50)
      expect(values.every((v) => Number.isInteger(v) && v >= 1 && v <= 99)).toBe(true)
    }
  })

  it('shapes the data as described', () => {
    expect(sortedAsc(generate('sorted', 40))).toBe(true)
    expect(sortedAsc(generate('reversed', 40).reverse())).toBe(true)
    expect(new Set(generate('few-unique', 60)).size).toBeLessThanOrEqual(4)
    // Nearly sorted: only a handful of out-of-order pairs.
    expect(inversions(generate('nearly-sorted', 50))).toBeLessThanOrEqual(5)
  })
})
