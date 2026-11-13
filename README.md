# Sorting Visualizer

Two sites about how sorting algorithms work, built on one shared engine.

| | |
|---|---|
| **[Sorting Visualizer](apps/visualizer)** | Step-by-step animations with narration and highlighted code. Live at [sorting.andygl.com](https://sorting.andygl.com) |
| **[Sortify](apps/sortify)** | A music player for the same algorithms: an album of sorts, with the code as lyrics. Live at [sortify.andygl.com](https://sortify.andygl.com) |
| **[`@sortviz/core`](packages/core)** | The shared engine: algorithms, step recording, narration, code listings and sound. No UI |

## Running it

Requires Node 22.12 or newer.

```sh
npm install
npm run dev            # Sorting Visualizer at http://localhost:5173
npm run dev:sortify    # Sortify at http://localhost:5174
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
