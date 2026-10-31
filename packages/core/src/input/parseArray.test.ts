import { describe, expect, it } from 'vitest'
import { parseArray } from './parseArray'

describe('parseArray', () => {
  it('accepts commas, spaces, or both', () => {
    expect(parseArray('5, 2,9 1')).toEqual({ values: [5, 2, 9, 1] })
  })

  it('rejects empty input', () => {
    expect(parseArray('  , ').error).toMatch(/at least one number/)
  })

  it('rejects negatives, decimals, words and values over the max', () => {
    for (const bad of ['-3', '2.5', 'abc', '1000']) {
      expect(parseArray(`1, ${bad}`).error).toContain(`"${bad}"`)
    }
  })

  it('rejects arrays over the size limit', () => {
    expect(parseArray(Array(101).fill(1).join(',')).error).toMatch(/limit is 100/)
  })
})
