import { describe, expect, it } from 'vitest'
import { algorithmList, algorithms } from '@sortviz/core'
import { ALBUM, albumYears, artistsOf, complexityBadge, TRADITIONAL, upNextIndex } from './catalog'
import { weave } from './weave'
import { formatLength, formatSpeed, formatTime } from './format'

describe('the album', () => {
  it('has one track for every algorithm in the core, each exactly once', () => {
    const ids = ALBUM.tracks.map((track) => track.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort()).toEqual(algorithmList.map((a) => a.id).sort())
    for (const id of ids) expect(algorithms[id]).toBeDefined()
  })

  it('bills credited songs to their inventors and the rest as traditional', () => {
    const artist = (id: string) => artistsOf(ALBUM.tracks.find((track) => track.id === id)!)
    expect(artist('bubble')).toBe(TRADITIONAL)
    expect(artist('merge')).toBe('John von Neumann')
    expect(artist('quick-lomuto')).toBe('Tony Hoare, Nico Lomuto')
  })

  it('puts the original quick sort before its remix', () => {
    const ids = ALBUM.tracks.map((track) => track.id)
    expect(ids.indexOf('quick-hoare')).toBeLessThan(ids.indexOf('quick-lomuto'))
  })

  it('spans the years of its credited songs', () => {
    expect(albumYears()).toBe('1945–1964')
  })

  it('badges each song with its average growth', () => {
    const badge = (id: string) => complexityBadge(ALBUM.tracks.find((track) => track.id === id)!)
    expect(badge('bubble')).toBe('n²')
    expect(badge('heap')).toBe('n log n')
  })
})

describe('what plays next', () => {
  it('moves down the album and stops after the last track', () => {
    expect(upNextIndex(0, false, 7)).toBe(1)
    expect(upNextIndex(6, false, 7)).toBeNull()
  })

  it('stays on the same track with repeat on', () => {
    expect(upNextIndex(6, true, 7)).toBe(6)
  })
})

describe('formatting', () => {
  it('shows steps as minutes and seconds', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(11)).toBe('0:11')
    expect(formatTime(178)).toBe('2:58')
    expect(formatTime(3600)).toBe('60:00')
  })

  it('writes the album length out', () => {
    expect(formatLength(45)).toBe('45 sec')
    expect(formatLength(760)).toBe('12 min 40 sec')
    expect(formatLength(3725)).toBe('1 hr 2 min')
  })

  it('shows speed as a multiplier', () => {
    expect(formatSpeed(0.5)).toBe('0.5×')
    expect(formatSpeed(4)).toBe('4×')
    expect(formatSpeed(2.44)).toBe('2.4×')
    expect(formatSpeed(35.3)).toBe('35×')
  })
})

describe('cover art', () => {
  it('follows every value from its starting place to its sorted place', () => {
    for (const track of ALBUM.tracks) {
      const lines = weave(track.id)
      const n = lines.length
      expect(n, track.id).toBeGreaterThan(8)
      // Each position is used exactly once at the start and at the end.
      expect(lines.map((l) => l.path[0]).sort((a, b) => a - b), track.id).toEqual(Array.from({ length: n }, (_, k) => k))
      const end = lines.map((l) => l.path.at(-1)!)
      expect([...end].sort((a, b) => a - b), track.id).toEqual(Array.from({ length: n }, (_, k) => k))
      // At the end, a higher place means a value at least as big.
      const byPlace = [...lines].sort((a, b) => a.path.at(-1)! - b.path.at(-1)!)
      for (let k = 1; k < n; k++) expect(byPlace[k].value, track.id).toBeGreaterThanOrEqual(byPlace[k - 1].value)
    }
  })
})
