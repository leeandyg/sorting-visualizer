import type { AlgorithmId } from '../engine/types'

export interface AlgorithmInfo {
  /** One or two sentences on the idea, in plain language. */
  idea: string
  time: { best: string; average: string; worst: string }
  space: string
  inPlace: boolean
  /** Gets faster when the input is already partly sorted. */
  adaptive: boolean
  /** When the best and worst cases happen. */
  cases: string
  /** Where you'd meet it in practice. */
  usedFor: string
  /** Who it's credited to. `by` is empty when nobody is (the simple sorts are older than their names). */
  credits: { by: string[]; year?: number; note: string }
}

export const info: Record<AlgorithmId, AlgorithmInfo> = {
  bubble: {
    idea: 'Walk through the array swapping neighbours that are out of order. Each pass carries the largest remaining value to the end.',
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    inPlace: true,
    adaptive: true,
    cases: 'Best case is already sorted input: one pass with no swaps, then it stops. Worst case is reversed input, where every pair gets swapped.',
    usedFor: 'Mostly teaching. It is simple to write but does far more swaps than insertion sort, so real code rarely uses it.',
    credits: {
      by: [],
      note: 'Nobody is credited with inventing it. It was analyzed as early as 1956, and the name "bubble sort" first appeared in print in 1962, in a book by Kenneth Iverson.',
    },
  },
  selection: {
    idea: 'Find the smallest value in the unsorted part and swap it to the front of that part. Repeat.',
    time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    inPlace: true,
    adaptive: false,
    cases: 'Every case does the same n(n − 1)/2 comparisons, because it always scans the whole unsorted part. It never does more than n − 1 swaps.',
    usedFor: 'Situations where writes are very expensive (like some flash memory), since it does the fewest swaps of the simple sorts.',
    credits: {
      by: [],
      note: 'Nobody is credited with inventing it. It is one of the oldest and most obvious ways to sort: keep picking the smallest thing left.',
    },
  },
  insertion: {
    idea: 'Grow a sorted section at the front, one element at a time: take the next value, slide bigger values right, and drop it into the gap.',
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    inPlace: true,
    adaptive: true,
    cases: 'Best case is already sorted input: each value is compared once and stays put. Worst case is reversed input, where every value slides all the way to the front.',
    usedFor: 'Small or nearly sorted arrays. Fast library sorts like Timsort (Python, Java) and introsort (C++) switch to insertion sort for small pieces.',
    credits: {
      by: [],
      note: 'Nobody is credited with inventing it. It is how most people sort a hand of playing cards.',
    },
  },
  merge: {
    idea: 'Split the array in half, sort each half the same way, then merge the two sorted halves by repeatedly taking the smaller front value.',
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(n)',
    inPlace: false,
    adaptive: false,
    cases: 'Always splits evenly, so every input takes about n log n steps. The cost is the extra memory for the temporary copies.',
    usedFor: 'When you need a guaranteed O(n log n) and a stable sort. Timsort, used by Python and Java for objects, is built on merging. Also used for sorting data too big for memory.',
    credits: {
      by: ['John von Neumann'],
      year: 1945,
      note: 'Invented by John von Neumann in 1945, which makes it one of the first sorting algorithms designed for a computer.',
    },
  },
  'quick-lomuto': {
    idea: 'Pick a pivot, move smaller values to its left and bigger ones to its right, then sort each side the same way. Lomuto uses the last element as the pivot.',
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    space: 'O(log n)',
    inPlace: true,
    adaptive: false,
    cases: 'Fast when pivots split the array roughly in half. With the last element as pivot, already sorted input is the worst case: every partition peels off just one element. Try the "Sorted" preset. The O(log n) extra space is the recursion stack (on average; O(n) in the worst case).',
    usedFor: 'Quicksort is the basis of many standard library sorts (like C++ std::sort, via introsort). Real implementations pick pivots more carefully, such as median-of-three or random.',
    credits: {
      by: ['Tony Hoare', 'Nico Lomuto'],
      note: "Quicksort is Tony Hoare's (developed in 1959, published in 1961). This simpler way to partition is attributed to Nico Lomuto and was popularized by Jon Bentley's book Programming Pearls and the textbook Introduction to Algorithms.",
    },
  },
  'quick-hoare': {
    idea: "Pick a pivot, then scan from both ends toward the middle, swapping pairs that are on the wrong side. Sort each part the same way. Hoare's scheme uses the middle element's value as the pivot.",
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    space: 'O(log n)',
    inPlace: true,
    adaptive: false,
    cases: 'Fast when pivots split the array roughly in half. The middle pivot handles sorted input well, but carefully crafted inputs can still force O(n²). It does about three times fewer swaps than Lomuto on average. The O(log n) extra space is the recursion stack (on average).',
    usedFor: "Hoare's original 1961 scheme. Production quicksorts use a refined version of this two-pointer partition.",
    credits: {
      by: ['Tony Hoare'],
      year: 1961,
      note: 'Developed by Tony Hoare in 1959 and published in 1961. This two-pointer partition is his original scheme.',
    },
  },
  heap: {
    idea: 'Arrange the array into a max-heap (a tree where every parent is at least as big as its children), then repeatedly move the root, the biggest value, to the end.',
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(1)',
    inPlace: true,
    adaptive: false,
    cases: 'Every input takes about n log n steps, with no bad cases and no extra memory. In practice it is slower than quicksort because it jumps around memory a lot.',
    usedFor: 'A safety net: introsort (C++ std::sort) switches to heap sort if quicksort is going badly. Heaps themselves power priority queues, like Python\'s heapq.',
    credits: {
      by: ['J. W. J. Williams'],
      year: 1964,
      note: 'Published by J. W. J. Williams in 1964, in the paper that also introduced the binary heap. Robert Floyd improved it the same year so it could sort in place.',
    },
  },
}
