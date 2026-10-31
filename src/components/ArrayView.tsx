import { useEffect, useLayoutEffect, useState, type CSSProperties, type PointerEvent } from 'react'
import type { Frame, Item } from '../engine/types'
import './ArrayView.css'

type Role = 'compare' | 'swap' | 'write'

/** How far a held element (e.g. insertion sort's key) floats above its gap, in px. */
const LIFT = 56
/** Approximate rendered width of one digit, in px, for value (15px) and index (12px) labels. */
const VALUE_DIGIT_PX = 9
const INDEX_DIGIT_PX = 7
/** Room the "index" caption takes at the start of the index row, in px. */
const CAPTION_PX = 40

interface Props {
  frame: Frame
  maxValue: number
  /** Duration of slide animations; 0 snaps straight to the new state. */
  moveMs: number
  /** Index variables to mark under the array, e.g. `j` and `j+1`. */
  pointers: { label: string; index: number }[]
}

export function ArrayView({ frame, maxValue, moveMs, pointers }: Props) {
  const n = frame.items.length
  const gap = frame.held ? frame.items.indexOf(null) : -1
  const roles = rolesById(frame)
  const [laneRef, lanePx, laneEl] = useWidth()
  const { inspectedIndex, setRoot, onPointer, onPointerLeave } = useInspect(n, laneEl)

  // Values and indices are each drawn whenever they fit. Otherwise, inspecting (hovering or
  // touching) a bar reveals its hidden labels in the same places: value above, index below.
  const slotPx = lanePx / Math.max(n, 1)
  const showValues = slotPx >= String(maxValue).length * VALUE_DIGIT_PX + 6
  const showIndices = slotPx >= String(Math.max(n - 1, 0)).length * INDEX_DIGIT_PX + 4
  const inspected = inspectedIndex !== null && inspectedIndex < n ? inspectedIndex : null

  // Render in id order so each element keeps its DOM node and can slide between positions.
  const placed: { item: Item; index: number; lifted: boolean }[] = []
  frame.items.forEach((item, index) => {
    if (item) placed.push({ item, index, lifted: false })
  })
  if (frame.held) placed.push({ item: frame.held, index: gap, lifted: true })
  placed.sort((a, b) => a.item.id - b.item.id)

  const width = `${100 / Math.max(n, 1)}%`
  const height = (value: number) => `calc((100% - 24px) * ${maxValue > 0 ? value / maxValue : 0})`

  // While a bar is inspected, an "index" caption sits at the left end of the index row,
  // moving to the right end if the revealed index would land on top of it.
  const revealHalfPx = (String(inspected ?? 0).length * INDEX_DIGIT_PX) / 2 + 4
  const captionOnRight = inspected !== null && (inspected + 0.5) * slotPx - revealHalfPx < CAPTION_PX

  const classes = ['array-view']
  if (!showValues) classes.push('compact')

  return (
    <div
      ref={setRoot}
      className={classes.join(' ')}
      style={{ '--move-ms': `${moveMs}ms` } as CSSProperties}
      onPointerDown={onPointer}
      onPointerMove={onPointer}
      onPointerLeave={onPointerLeave}
    >
      <div className="array-lane" ref={laneRef}>
        {frame.held && (
          <div
            className="slot gap"
            style={{
              width,
              transform: `translateX(${gap * 100}%)`,
              '--bar-height': height(frame.held.value),
            } as CSSProperties}
          >
            <div className="bar" />
          </div>
        )}
        {placed.map(({ item, index, lifted }) => {
          const slotClasses = ['slot']
          if (lifted) slotClasses.push('is-held')
          else if (frame.sorted[index]) slotClasses.push('is-sorted')
          const role = roles.get(item.id)
          if (role) slotClasses.push(`is-${role}`)
          const isInspected = index === inspected
          if (isInspected) slotClasses.push('is-inspected')
          return (
            <div
              key={item.id}
              className={slotClasses.join(' ')}
              style={{
                width,
                transform: `translate(${index * 100}%, ${lifted ? -LIFT : 0}px)`,
                '--bar-height': height(item.value),
              } as CSSProperties}
            >
              <span className="value">{item.value}</span>
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
        {pointers.map((pointer, k) => {
          // Pointers at the same index stack downwards instead of overlapping.
          const stack = pointers.slice(0, k).filter((other) => other.index === pointer.index).length
          return (
            <span
              key={pointer.label}
              className="pointer"
              style={{ left: `${((pointer.index + 0.5) / n) * 100}%`, top: stack * 16 }}
            >
              {pointer.label}
            </span>
          )
        })}
      </div>

      <div className="array-regions">
        {frame.regions.map((region) => (
          <div
            key={`${region.lo}-${region.label}`}
            className="region"
            style={{ left: `${(region.lo / n) * 100}%`, width: `${((region.hi - region.lo + 1) / n) * 100}%` }}
          >
            <span>{region.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
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

/** Which elements the current step acted on, keyed by item id. */
function rolesById(frame: Frame): Map<number, Role> {
  const roles = new Map<number, Role>()
  const mark = (index: number, role: Role) => {
    const item = frame.items[index]
    if (item) roles.set(item.id, role)
  }
  const step = frame.step
  switch (step?.type) {
    case 'compare':
      mark(step.i, 'compare')
      mark(step.j, 'compare')
      break
    case 'compareHeld':
      mark(step.j, 'compare')
      if (frame.held) roles.set(frame.held.id, 'compare')
      break
    case 'swap':
      mark(step.i, 'swap')
      mark(step.j, 'swap')
      break
    case 'shift':
      mark(step.to, 'write')
      break
    case 'drop':
      mark(step.i, 'write')
      break
  }
  return roles
}
