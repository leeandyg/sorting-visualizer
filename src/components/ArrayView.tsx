import { useEffect, useLayoutEffect, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import type { Frame, Item } from '../engine/types'
import { rolesById } from './roles'
import './ArrayView.css'

/** How far a held element (e.g. insertion sort's key) floats above its gap, in px. */
const LIFT = 56
/** Approximate rendered width of one digit, in px, for value (15px) and index (12px) labels. */
const VALUE_DIGIT_PX = 9
const INDEX_DIGIT_PX = 7
/** Room the "index" caption takes at the start of the index row, in px. */
const CAPTION_PX = 40
/** Approximate width of one character of a region label (12px), in px. */
const REGION_CHAR_PX = 6.5

interface Props {
  frame: Frame
  maxValue: number
  /** Duration of slide animations; 0 snaps straight to the new state. */
  moveMs: number
  /** Index variables to mark under the array, e.g. `j` and `j+1`. */
  pointers: { label: string; index: number }[]
  /** Letters telling equal values apart, by item id. */
  tags: Map<number, string>
  /** Reserve the second row for temporary arrays (merge sort), even while it's empty. */
  hasAux: boolean
}

type Row = 'main' | 'held' | 'aux'

export function ArrayView({ frame, maxValue, moveMs, pointers, tags, hasAux }: Props) {
  const n = frame.items.length
  const roles = rolesById(frame)
  const marks = new Map(frame.marks.map((m) => [m.id, m.kind]))
  const [laneRef, lanePx, laneEl] = useWidth()
  const { inspectedIndex, setRoot, onPointer, onPointerLeave } = useInspect(n, laneEl)

  // Values and indices are each drawn whenever they fit. Otherwise, inspecting (hovering or
  // touching) a bar reveals its hidden labels in the same places: value above, index below.
  const slotPx = lanePx / Math.max(n, 1)
  const showValues = slotPx >= String(maxValue).length * VALUE_DIGIT_PX + 6
  const showIndices = slotPx >= String(Math.max(n - 1, 0)).length * INDEX_DIGIT_PX + 4
  const inspected = inspectedIndex !== null && inspectedIndex < n ? inspectedIndex : null
  // Once everything is sorted there's no current call, so nothing is dimmed.
  const focus = frame.sorted.every(Boolean) ? null : frame.focus

  // Render in id order so each element keeps its DOM node and can slide between positions,
  // including between the main row and the temporary-array row.
  const placed: { item: Item; index: number; row: Row }[] = []
  frame.items.forEach((item, index) => {
    if (item) placed.push({ item, index, row: 'main' })
  })
  const heldAt = frame.held ? frame.items.indexOf(null) : -1
  if (frame.held) placed.push({ item: frame.held, index: heldAt, row: 'held' })
  for (const buffer of frame.aux) {
    buffer.items.forEach((item, at) => {
      if (item) placed.push({ item, index: buffer.lo + at, row: 'aux' })
    })
  }
  placed.sort((a, b) => a.item.id - b.item.id)

  const width = `${100 / Math.max(n, 1)}%`
  const height = (value: number) => `calc((100% - 24px) * ${maxValue > 0 ? value / maxValue : 0})`
  const label = (item: Item): ReactNode => {
    const tag = tags.get(item.id)
    return tag ? (
      <>
        {item.value}
        <sup>{tag}</sup>
      </>
    ) : (
      item.value
    )
  }
  const offsetY = (row: Row) => (row === 'held' ? `${-LIFT}px` : row === 'aux' ? 'calc(100% + var(--aux-gap))' : '0px')

  // While a bar is inspected, an "index" caption sits at the left end of the index row,
  // moving to the right end if the revealed index would land on top of it.
  const revealHalfPx = (String(inspected ?? 0).length * INDEX_DIGIT_PX) / 2 + 4
  const captionOnRight = inspected !== null && (inspected + 0.5) * slotPx - revealHalfPx < CAPTION_PX

  // The drawing itself is hidden from screen readers; this describes the same state in words.
  const spoken = (item: Item | null, k: number) => {
    if (!item) return frame.ghosts[k] !== null ? `old ${frame.ghosts[k]}` : 'gap'
    const tag = tags.get(item.id)
    return tag ? `${item.value} (${tag})` : String(item.value)
  }
  const description = [
    `Array: ${frame.items.map(spoken).join(', ')}.`,
    frame.held && `Holding key ${frame.held.value}.`,
    ...frame.aux.map((b) => `${b.label}: ${b.items.flatMap((it) => (it ? [it.value] : [])).join(', ') || 'empty'}.`),
    `${frame.sorted.filter(Boolean).length} of ${n} in final position.`,
  ]
    .filter(Boolean)
    .join(' ')

  const classes = ['array-view']
  if (!showValues) classes.push('compact')
  if (hasAux) classes.push('has-aux')

  return (
    <div
      ref={setRoot}
      role="img"
      aria-label={description}
      className={classes.join(' ')}
      style={{ '--move-ms': `${moveMs}ms` } as CSSProperties}
      onPointerDown={onPointer}
      onPointerMove={onPointer}
      onPointerLeave={onPointerLeave}
    >
      <div className="array-lane" ref={laneRef}>
        {/* Empty positions: a dashed outline where a held element came from, or the faded old
            value merge sort's copy left behind (a still holds it until it's overwritten). */}
        {frame.items.map((item, index) => {
          if (item) return null
          const ghost = frame.ghosts[index]
          if (ghost === null && index !== heldAt) return null
          return (
            <div
              key={`gap-${index}`}
              className={ghost !== null ? 'slot ghost' : 'slot gap'}
              style={{
                width,
                transform: `translateX(${index * 100}%)`,
                '--bar-height': height(ghost ?? frame.held!.value),
              } as CSSProperties}
            >
              {ghost !== null && <span className="value">{ghost}</span>}
              <div className="bar" />
            </div>
          )
        })}
        {placed.map(({ item, index, row }) => {
          const slotClasses = ['slot']
          if (row === 'held') slotClasses.push('is-held')
          else if (row === 'main' && frame.sorted[index]) slotClasses.push('is-sorted')
          const mark = marks.get(item.id)
          if (mark) slotClasses.push(`is-${mark}`)
          const role = roles.get(item.id)
          if (role) slotClasses.push(`is-${role}`)
          if (row === 'main' && index === inspected) slotClasses.push('is-inspected')
          if (row === 'main' && focus && (index < focus.lo || index > focus.hi)) slotClasses.push('is-outside')
          return (
            <div
              key={item.id}
              className={slotClasses.join(' ')}
              style={{
                width,
                transform: `translate(${index * 100}%, ${offsetY(row)})`,
                '--bar-height': height(item.value),
              } as CSSProperties}
            >
              <span className="value">{label(item)}</span>
              <div className="bar" />
            </div>
          )
        })}
      </div>

      <div className="array-indices" aria-hidden="true">
        {showIndices
          ? frame.items.map((_, index) => (
              <span key={index} style={{ width }}>
                {index}
              </span>
            ))
          : inspected !== null && (
              <>
                {/* Says what the revealed number is, since the row's other numbers are hidden. */}
                <span className={captionOnRight ? 'index-caption on-right' : 'index-caption'}>index</span>
                <span className="index-reveal" style={{ left: `${((inspected + 0.5) / n) * 100}%` }}>
                  {inspected}
                </span>
              </>
            )}
      </div>

      <div className="array-pointers" aria-hidden="true">
        {/* Pointers at the same index share one marker, e.g. "j, min_idx". */}
        {groupByIndex(pointers).map(({ index, labels }) => (
          <span key={labels[0]} className="pointer" style={{ left: `${((index + 0.5) / n) * 100}%` }}>
            {labels.join(', ')}
          </span>
        ))}
      </div>

      <div className="array-regions">
        {frame.regions.map((region) => {
          const span = region.hi - region.lo + 1
          // Labels that don't fit under their bracket are left off (still available as a tooltip).
          const fits = span * slotPx >= region.label.length * REGION_CHAR_PX + 8
          return (
            <div
              key={`${region.lo}-${region.label}`}
              className="region"
              title={region.label}
              style={{ left: `${(region.lo / n) * 100}%`, width: `${(span / n) * 100}%` }}
            >
              {fits && <span>{region.label}</span>}
            </div>
          )
        })}
      </div>

      {hasAux && (
        <div className="aux-area" aria-hidden="true">
          {frame.aux.map((buffer) => (
            <div
              key={buffer.label}
              className="aux-buffer"
              style={{ left: `${(buffer.lo / n) * 100}%`, width: `${(buffer.items.length / n) * 100}%` }}
            >
              <span>{buffer.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function groupByIndex(pointers: { label: string; index: number }[]) {
  const groups: { index: number; labels: string[] }[] = []
  for (const { label, index } of pointers) {
    const group = groups.find((g) => g.index === index)
    if (group) group.labels.push(label)
    else groups.push({ index, labels: [label] })
  }
  return groups
}

/** Tracks an element's width in px. Returns a callback ref to attach, the width, and the element. */
function useWidth() {
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  const [px, setPx] = useState(0)
  useLayoutEffect(() => {
    if (!el) return
    // Observers report the current size as soon as they start, so this also covers the first render.
    const observer = new ResizeObserver(([entry]) => setPx(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [el])
  return [setEl, px, el] as const
}

/**
 * Which position the pointer is over, measured by x alone so the whole column (and the index
 * row beneath it) counts. A mouse clears it on leaving; a finger can drag across the bars, and
 * the last one touched stays inspected until the next touch outside the array.
 */
function useInspect(n: number, lane: HTMLElement | null) {
  const [index, setIndex] = useState<number | null>(null)
  const [root, setRoot] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const clearOnOutsideTouch = (e: globalThis.PointerEvent) => {
      if (!root?.contains(e.target as Node)) setIndex(null)
    }
    document.addEventListener('pointerdown', clearOnOutsideTouch)
    return () => document.removeEventListener('pointerdown', clearOnOutsideTouch)
  }, [root])

  return {
    inspectedIndex: index,
    setRoot,
    onPointer: (e: PointerEvent) => {
      if (!lane || n === 0) return
      const rect = lane.getBoundingClientRect()
      const at = Math.floor(((e.clientX - rect.left) / rect.width) * n)
      setIndex(Math.min(Math.max(at, 0), n - 1))
    },
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType === 'mouse') setIndex(null)
    },
  }
}
