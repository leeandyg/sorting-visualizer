import { info } from '../algorithms/info'
import type { SortAlgorithm } from '../engine/types'
import type { Level } from '../narration'
import './InfoCard.css'

/** Facts about the selected algorithm: complexity, properties, and where it's used. */
export function InfoCard({ algorithm, level }: { algorithm: SortAlgorithm; level: Level }) {
  const facts = info[algorithm.id]
  const name = algorithm.family ? `${algorithm.family.name} (${algorithm.family.variant} partition)` : algorithm.name
  const yesNo = (value: boolean) => (value ? 'Yes' : 'No')
  return (
    <section className="info-card" aria-labelledby="info-title">
      <h2 id="info-title" tabIndex={-1}>
        About {name}
      </h2>
      <p className="info-idea">{facts.idea}</p>

      <dl className="info-stats">
        <div>
          <dt>Best</dt>
          <dd>{facts.time.best}</dd>
        </div>
        <div>
          <dt>Average</dt>
          <dd>{facts.time.average}</dd>
        </div>
        <div>
          <dt>Worst</dt>
          <dd>{facts.time.worst}</dd>
        </div>
        <div>
          <dt>Extra space</dt>
          <dd>{facts.space}</dd>
        </div>
        <div>
          <dt>Stable</dt>
          <dd>{yesNo(algorithm.stable)}</dd>
        </div>
        <div>
          <dt>In place</dt>
          <dd>{yesNo(facts.inPlace)}</dd>
        </div>
        <div>
          <dt>Adaptive</dt>
          <dd>{yesNo(facts.adaptive)}</dd>
        </div>
      </dl>

      <p>
        <strong>Best and worst cases.</strong> {facts.cases}
      </p>
      <p>
        <strong>Where it's used.</strong> {facts.usedFor}
      </p>

      {level === 'beginner' && (
        <p className="info-glossary">
          <strong>Reading the table.</strong> O(…) describes how the work grows as the array gets bigger: with O(n²),
          doubling the array roughly quadruples the work; with O(n log n), it only a little more than doubles.{' '}
          <em>Stable</em> means equal values keep their original order. <em>In place</em> means it needs no extra array.{' '}
          <em>Adaptive</em> means it speeds up when the input is already partly sorted.
        </p>
      )}
    </section>
  )
}
