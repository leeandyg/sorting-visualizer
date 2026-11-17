
# <img width="32" height="32" alt="favicon" src="./public/favicon.svg" /> Sorting Visualizer

Step-by-step animations of common sorting algorithms, with plain-English narration and the matching
line of code highlighted in Python, JavaScript, Java or C++. Built to be a crash course for beginners
while staying accurate enough for experts.

Live at https://sorting.andygl.com.

<img width="1208" height="822" alt="Screenshot 2026-11-16 at 4 07 07 PM" src="https://github.com/user-attachments/assets/e3f796f9-a3a5-4c0c-a7da-20357c137912" />

Algorithms: bubble, selection, insertion, merge, quick (Lomuto and Hoare partitions), heap.

The title in the top left opens a menu to switch to [Sortify](../sortify), the music-player version,
which picks up with the same algorithm, array, step, speed and code language.

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
