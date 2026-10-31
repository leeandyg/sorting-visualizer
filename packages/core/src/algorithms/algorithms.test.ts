import { describe, expect, it } from 'vitest'
import { LANGS, type Lang } from '../engine/lang'
import { record } from '../engine/record'
import { narrate } from '../narration'
import { algorithmList, algorithms } from '.'

/** Small seeded PRNG so failures are reproducible. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(42)
const randomArray = (n: number, maxValue: number) =>
  Array.from({ length: n }, () => Math.floor(rand() * maxValue))

const cases: number[][] = [
  [],
  [7],
  [2, 1],
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  [3, 3, 3, 3],
  [5, 1, 4, 1, 5, 9, 2, 6, 5, 3],
  ...Array.from({ length: 100 }, () => randomArray(1 + Math.floor(rand() * 40), 100)),
  // few unique values, to exercise duplicates
  ...Array.from({ length: 50 }, () => randomArray(1 + Math.floor(rand() * 40), 4)),
]

describe.each(algorithmList)('$name', (algorithm) => {
  it('sorts every case and the trace replays to the same result', () => {
    for (const input of cases) {
      const trace = record(algorithm, input)
      const expected = [...input].sort((x, y) => x - y)
      expect(trace.output).toEqual(expected)

      const last = trace.frames.at(-1)!
      expect(last.items.map((item) => item?.value)).toEqual(expected)
      expect(last.held).toBeNull()
      expect(last.sorted.every(Boolean)).toBe(true)
    }
  })

  it(algorithm.stable ? 'is stable: equal values keep their original order' : 'is unstable on some input', () => {
    const reordersEqualValues = (input: number[]) => {
      const items = record(algorithm, input).frames.at(-1)!.items.map((item) => item!)
      return items.some((item, k) => k > 0 && items[k - 1].value === item.value && items[k - 1].id > item.id)
    }
    const unstableCases = cases.filter(reordersEqualValues)
    if (algorithm.stable) expect(unstableCases).toEqual([])
    else expect(unstableCases.length).toBeGreaterThan(0)
  })

  it('only uses line keys that exist in its code listing, and uses every tag', () => {
    const tagged = new Set(algorithm.code.python.flatMap((line) => line.keys))
    const used = new Set<string>()
    for (const input of cases) {
      for (const frame of record(algorithm, input).frames) {
        if (frame.step?.line) used.add(frame.step.line)
      }
    }
    expect([...used].filter((key) => !tagged.has(key))).toEqual([])
    expect([...tagged].filter((key) => !used.has(key))).toEqual([])
  })

  it('tags every language the same way as Python', () => {
    const tagsOf = (lang: Lang) => [...new Set(algorithm.code[lang].flatMap((line) => line.keys))].sort()
    for (const { id } of LANGS) expect(tagsOf(id), id).toEqual(tagsOf('python'))
  })

  it('narrates every frame at both levels and in every code language without gaps or undefined values', () => {
    // Collect problems and assert once: an expect() per frame is far slower than the narration itself.
    const problems: string[] = []
    for (const input of cases) {
      const trace = record(algorithm, input)
      for (let k = 0; k < trace.frames.length; k++) {
        for (const level of ['beginner', 'expert'] as const) {
          for (const { id: lang } of LANGS) {
            const { phase, text } = narrate(trace, k, level, lang)
            if (text === '' || /undefined|NaN|null/.test(`${phase} ${text}`)) {
              problems.push(`[${input}] frame ${k} ${level}/${lang}: ${phase} | ${text}`)
            }
          }
        }
      }
    }
    expect(problems.slice(0, 5)).toEqual([])
  })

  it('never marks a position sorted before it holds its final value', () => {
    const problems: string[] = []
    for (const input of cases) {
      const trace = record(algorithm, input)
      trace.frames.forEach((frame, f) => {
        frame.sorted.forEach((isSorted, k) => {
          if (isSorted && frame.items[k]?.value !== trace.output[k]) problems.push(`[${input}] frame ${f} position ${k}`)
        })
      })
    }
    expect(problems.slice(0, 5)).toEqual([])
  })
})

const countersFor = (id: keyof typeof algorithms, input: number[]) =>
  record(algorithms[id], input).frames.at(-1)!.counters

describe('counters match the code', () => {
  it('bubble sort: reversed input does every comparison and swap', () => {
    expect(countersFor('bubble', [6, 5, 4, 3, 2, 1])).toEqual({ comparisons: 15, swaps: 15, writes: 30 })
  })

  it('bubble sort: sorted input stops after one pass', () => {
    expect(countersFor('bubble', [1, 2, 3, 4, 5, 6])).toEqual({ comparisons: 5, swaps: 0, writes: 0 })
  })

  it('insertion sort: sorted input does one comparison and one write per element', () => {
    expect(countersFor('insertion', [1, 2, 3, 4, 5, 6])).toEqual({ comparisons: 5, swaps: 0, writes: 5 })
  })

  it('selection sort: always n(n-1)/2 comparisons and n-1 swaps', () => {
    expect(countersFor('selection', [1, 2, 3, 4, 5, 6])).toEqual({ comparisons: 15, swaps: 5, writes: 10 })
  })

  it('merge sort: each of the log2(n) levels copies n values out and writes n back', () => {
    expect(countersFor('merge', [8, 7, 6, 5, 4, 3, 2, 1]).writes).toBe(3 * (8 + 8))
  })

  it('quick sort (Lomuto): sorted input is the worst case, n(n-1)/2 comparisons', () => {
    expect(countersFor('quick-lomuto', [1, 2, 3, 4, 5, 6]).comparisons).toBe(15)
  })

  it('insertion sort: reversed input shifts every pair, plus one write per key', () => {
    expect(countersFor('insertion', [6, 5, 4, 3, 2, 1])).toEqual({ comparisons: 15, swaps: 0, writes: 20 })
  })
})
