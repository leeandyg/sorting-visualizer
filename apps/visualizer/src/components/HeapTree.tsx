import type { CSSProperties } from 'react'
import type { Frame } from '@sortviz/core'
import { rolesById } from './roles'
import './HeapTree.css'

/** Beyond this, the bottom level gets too crowded to read (32+ nodes across). */
export const TREE_MAX = 31
const LEVEL_PX = 64

interface Props {
  frame: Frame
  tags: Map<number, string>
  moveMs: number
}

/**
 * The array drawn as the binary tree a heap really is: position i's children are 2i + 1 and
 * 2i + 2. Sorted positions (already moved out of the heap) stay as faded leaves.
 */
export function HeapTree({ frame, tags, moveMs }: Props) {
  const n = frame.items.length
  if (n > TREE_MAX) {
    return <p className="tree-note">The tree view is shown for arrays of {TREE_MAX} or fewer elements.</p>
  }
  const depth = (k: number) => Math.floor(Math.log2(k + 1))
  const levels = n > 0 ? depth(n - 1) + 1 : 0
  const widest = 2 ** (levels - 1)
  const x = (k: number) => ((k - (2 ** depth(k) - 1) + 0.5) / 2 ** depth(k)) * 100
  const y = (k: number) => depth(k) * LEVEL_PX + 20
  const roles = rolesById(frame)

  return (
    <div
      className={widest >= 16 ? 'heap-tree dense' : 'heap-tree'}
      style={{ height: levels * LEVEL_PX, '--move-ms': `${moveMs}ms`, '--node-size': `min(36px, ${88 / widest}%)` } as CSSProperties}
      aria-hidden="true"
    >
      <svg className="tree-edges">
        {frame.items.map((_, k) =>
          k === 0 ? null : (
            <line
              key={k}
              className={frame.sorted[k] ? 'out' : undefined}
              x1={`${x(Math.floor((k - 1) / 2))}%`}
              y1={y(Math.floor((k - 1) / 2))}
              x2={`${x(k)}%`}
              y2={y(k)}
            />
          ),
        )}
      </svg>
      {frame.items.map((item, k) => {
        if (!item) return null
        const classes = ['tree-node']
        if (frame.sorted[k]) classes.push('is-sorted')
        const role = roles.get(item.id)
        if (role) classes.push(`is-${role}`)
        const tag = tags.get(item.id)
        return (
          <div key={item.id} className={classes.join(' ')} style={{ left: `${x(k)}%`, top: y(k) }}>
            {item.value}
            {tag && <sup>{tag}</sup>}
          </div>
        )
      })}
      {widest < 16 &&
        frame.items.map((_, k) => (
          <span key={`i${k}`} className="tree-index" style={{ left: `${x(k)}%`, top: y(k) + 20 }}>
            {k}
          </span>
        ))}
    </div>
  )
}
