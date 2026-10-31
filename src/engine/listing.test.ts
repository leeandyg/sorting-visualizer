import { describe, expect, it } from 'vitest'
import { listing, pointer } from './listing'

describe('listing', () => {
  it('strips #@ tags into keys and drops surrounding blank lines', () => {
    expect(
      listing(`
for x in a:      #@ loop
    print(x)     #@ body other
`),
    ).toEqual([
      { text: 'for x in a:', keys: ['loop'] },
      { text: '    print(x)', keys: ['body', 'other'] },
    ])
  })
})

describe('pointer', () => {
  it('reads a numeric var with an optional offset', () => {
    expect(pointer('j', 1).at({ j: 2 })).toBe(3)
    expect(pointer('j', 1).label).toBe('j+1')
    expect(pointer('j').at({ i: 0 })).toBeUndefined()
  })
})
