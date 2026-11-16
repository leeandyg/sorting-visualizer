import { describe, expect, it } from 'vitest'
import { canGo, current, startHistory, step, visit } from './history'

describe('view history', () => {
  it('goes back and forward through visited views', () => {
    let h = visit(visit(startHistory('album'), 'stage'), 'lyrics')
    h = step(h, -1)
    expect(current(h)).toBe('stage')
    h = step(h, -1)
    expect(current(h)).toBe('album')
    expect(canGo(h, -1)).toBe(false)
    h = step(h, 1)
    expect(current(h)).toBe('stage')
  })

  it('drops the forward trail when going somewhere new', () => {
    let h = step(visit(visit(startHistory('album'), 'stage'), 'lyrics'), -1)
    h = visit(h, 'album')
    expect(h.entries).toEqual(['album', 'stage', 'album'])
    expect(canGo(h, 1)).toBe(false)
  })

  it('ignores visiting the view already showing', () => {
    const h = startHistory('album')
    expect(visit(h, 'album')).toBe(h)
  })

  it('stays put at either end', () => {
    const h = startHistory('album')
    expect(step(h, -1)).toBe(h)
    expect(step(h, 1)).toBe(h)
  })
})
