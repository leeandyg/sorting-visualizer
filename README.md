# Sorting Visualizer

Step-by-step animations of common sorting algorithms, with plain-English narration and the matching
line of code highlighted in Python, JavaScript, Java or C++. Built to be a crash course for beginners
while staying accurate enough for experts.

This repo holds two sites that share one sorting engine:

| | What it is |
|---|---|
| **[`apps/visualizer`](apps/visualizer)** | The visualizer: bars, narration, code panel, variables, info cards |
| **[`apps/sortify`](apps/sortify)** | A music-player-style take on the same idea (early work in progress) |
| **[`packages/core`](packages/core)** | `@sortviz/core`: the algorithms, step recording, narration, code listings and sound. No UI |

## How it works

Each algorithm runs once and records a trace: every comparison, swap and write as a step, along
with the line of code it ran and the loop variables at that moment. The apps then play that trace
back like a video, so pausing, stepping backward and scrubbing come for free. The engine checks
each step against its own copy of the array, so the animation can't drift from what the algorithm
actually did.

Algorithms: bubble, selection, insertion, merge, quick (Lomuto and Hoare partitions), heap.

## Running it

Requires Node 22.12 or newer.

```sh
npm install
npm run dev            # visualizer at http://localhost:5173
npm run dev:sortify    # sortify at http://localhost:5174
```

| Command | Does |
|---|---|
| `npm test` | Runs every package's tests (Vitest) |
| `npm run typecheck` | Type-checks the core and both apps |
| `npm run lint` | Lints everything (oxlint) |
| `npm run build` | Builds both apps into their `dist/` folders |

## Layout

Both apps import the engine as `@sortviz/core`, linked through npm workspaces. The core has no build
step; the apps compile its TypeScript source directly, so a change there shows up in both apps right
away. UI code stays in each app.
