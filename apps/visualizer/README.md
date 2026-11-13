# Sorting Visualizer

Step-by-step animations of common sorting algorithms, with plain-English narration and the matching
line of code highlighted in Python, JavaScript, Java or C++. Built to be a crash course for beginners
while staying accurate enough for experts.

Live at https://sorting.andygl.com.

Algorithms: bubble, selection, insertion, merge, quick (Lomuto and Hoare partitions), heap.

## How it works

Each algorithm runs once and records a trace: every comparison, swap and write as a step, along
with the line of code it ran and the loop variables at that moment. The site then plays that trace
back like a video, so pausing, stepping backward and scrubbing come for free. The engine checks
each step against its own copy of the array, so the animation can't drift from what the algorithm
actually did.

## Running it

From the repo root:

```sh
npm install
npm run dev    # http://localhost:5173
```
