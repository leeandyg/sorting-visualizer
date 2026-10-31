import type { Frame } from '@sortviz/core'

export type Role = 'compare' | 'swap' | 'write'

/** Which elements the current step acted on, keyed by item id. */
export function rolesById(frame: Frame): Map<number, Role> {
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
    case 'compareValue':
      mark(step.i, 'compare')
      break
    case 'compareAux':
      for (const ref of [step.a, step.b]) {
        const item = frame.aux[ref.buffer]?.items[ref.at]
        if (item) roles.set(item.id, 'compare')
      }
      break
    case 'swap':
      mark(step.i, 'swap')
      mark(step.j, 'swap')
      break
    case 'shift':
      mark(step.to, 'write')
      break
    case 'drop':
    case 'writeFromAux':
      mark(step.type === 'drop' ? step.i : step.to, 'write')
      break
  }
  return roles
}
