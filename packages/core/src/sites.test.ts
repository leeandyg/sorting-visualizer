import { describe, expect, it } from 'vitest'
import { handoffUrl, readHandoff, sites } from './sites'

describe('switching sites', () => {
  const url = handoffUrl(sites.sortify.url, { algorithm: 'merge', input: [5, 2, 9], step: 12, speed: 3, playing: true, lang: 'java' })

  it('carries the algorithm, array, step, speed, code language and play state', () => {
    expect(url).toBe('https://sortify.andygl.com/?algo=merge&array=5,2,9&step=12&speed=3&lang=java&play=1&from=switch')
    expect(readHandoff(new URL(url).search, 0.5, 100)).toEqual({ arrived: true, speed: 3, lang: 'java', playing: true })
  })

  it('leaves play out when paused', () => {
    const paused = handoffUrl(sites.visualizer.url, { algorithm: 'heap', input: [1, 2], step: 0, speed: 2, playing: false, lang: 'python' })
    expect(paused).not.toContain('play=')
    expect(readHandoff(new URL(paused).search, 0.5, 100).playing).toBe(false)
  })

  it('never autoplays an ordinary link, and clamps odd speeds', () => {
    expect(readHandoff('?algo=merge&play=1', 0.5, 100)).toEqual({ arrived: false, speed: undefined, lang: undefined, playing: false })
    expect(readHandoff('?lang=cobol&from=switch', 0.5, 100).lang).toBeUndefined()
    expect(readHandoff('?speed=9000&from=switch', 0.5, 100).speed).toBe(100)
    expect(readHandoff('?speed=abc&from=switch', 0.5, 100).speed).toBeUndefined()
  })
})
