import { algorithmFamilies, record } from '@sortviz/core'

const SAMPLE = [5, 2, 9, 1, 6, 3, 8, 4]

/** Placeholder until the real Sortify UI exists: shows the shared core working from a second app. */
function App() {
  return (
    <main className="placeholder">
      <h1>Sortify</h1>
      <p>Coming soon. The tracks below come straight from the shared sorting core.</p>
      <ol>
        {algorithmFamilies.map((family) => (
          <li key={family.id}>
            {family.name} <span>· {record(family.variants[0], SAMPLE).frames.length - 1} steps</span>
          </li>
        ))}
      </ol>
    </main>
  )
}

export default App
