import type { Frame } from './types'

/**
 * The step to jump to when someone picks a line of code: the nearest step that runs it, looking
 * in the preferred direction first (forward for a line below the current one, backward for one
 * above) and the other way only if that finds nothing. `keys` are the line's `#@` tags.
 * null when no step of this run touches the line (a signature, a blank line, an unused branch).
 */
export function stepForLine(frames: Frame[], keys: string[], from: number, prefer: 'forward' | 'backward'): number | null {
  const runs = (k: number) => {
    const line = frames[k].step?.line
    return line !== undefined && keys.includes(line)
  }
  const forward = () => {
    for (let k = from + 1; k < frames.length; k++) if (runs(k)) return k
    return null
  }
  const backward = () => {
    for (let k = from - 1; k >= 0; k--) if (runs(k)) return k
    return null
  }
  return prefer === 'forward' ? (forward() ?? backward()) : (backward() ?? forward())
}
