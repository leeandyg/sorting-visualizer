import { describe, expect, it } from 'vitest'
import { readUrlState, urlFor } from './urlState'

describe('url state', () => {
  it('round-trips algorithm, array and step', () => {
    const url = urlFor({ origin: 'http://x', pathname: '/' }, { algorithm: 'merge', input: [5, 2, 9], step: 12 })
    expect(url).toBe('http://x/?algo=merge&array=5,2,9&step=12')
    expect(readUrlState(new URL(url).search)).toEqual({ algorithm: 'merge', input: [5, 2, 9], step: 12 })
  })

  it('ignores unknown algorithms, bad arrays and bad steps', () => {
    expect(readUrlState('?algo=bogo&array=1,x&step=-3')).toEqual({})
  })
})
