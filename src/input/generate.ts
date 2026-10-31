export type Shape = 'random' | 'nearly-sorted' | 'reversed' | 'few-unique' | 'sorted'

export const SHAPES: { id: Shape; label: string }[] = [
  { id: 'random', label: 'Random' },
  { id: 'nearly-sorted', label: 'Nearly sorted' },
  { id: 'reversed', label: 'Reversed' },
  { id: 'few-unique', label: 'Few unique' },
  { id: 'sorted', label: 'Sorted' },
]

const randomValue = (random: () => number) => 1 + Math.floor(random() * 99)

/**
 * An array of `size` values from 1 to 99 with the given shape. The shapes are the classic
 * inputs that make algorithms behave differently: insertion sort flies through nearly sorted
 * data, Lomuto quicksort crawls on sorted data, and few unique values exercise stability.
 */
export function generate(shape: Shape, size: number, random: () => number = Math.random): number[] {
  const values = Array.from({ length: size }, () => randomValue(random))
  switch (shape) {
    case 'random':
      return values
    case 'sorted':
      return values.sort((x, y) => x - y)
    case 'reversed':
      return values.sort((x, y) => y - x)
    case 'nearly-sorted': {
      values.sort((x, y) => x - y)
      // Swap a few neighbouring pairs (about 1 in 10, at least one) out of order.
      const swaps = Math.max(1, Math.round(size / 10))
      for (let k = 0; k < swaps && size > 1; k++) {
        const i = Math.floor(random() * (size - 1))
        ;[values[i], values[i + 1]] = [values[i + 1], values[i]]
      }
      return values
    }
    case 'few-unique': {
      const distinct = Array.from({ length: Math.min(4, size) }, () => randomValue(random))
      return values.map(() => distinct[Math.floor(random() * distinct.length)])
    }
  }
}
