import type { CodeLine, PointerDef, Vars } from './types'

/**
 * Parses a code listing where lines can end in `#@ key1 key2` to tag them with step line keys.
 * The tags are stripped from the displayed text. Leading and trailing blank lines are dropped.
 */
export function listing(source: string): CodeLine[] {
  return source
    .replace(/^\s*\n/, '')
    .trimEnd()
    .split('\n')
    .map((raw) => {
      const tagged = raw.match(/^(.*?)\s*#@\s*(.+)$/)
      return tagged
        ? { text: tagged[1].trimEnd(), keys: tagged[2].trim().split(/\s+/) }
        : { text: raw.trimEnd(), keys: [] }
    })
}

/** A pointer at the index held in a numeric var, offset by `plus` (e.g. `j + 1`). */
export function pointer(name: string, plus = 0): PointerDef {
  return {
    label: plus ? `${name}+${plus}` : name,
    at: (vars: Vars) => (typeof vars[name] === 'number' ? (vars[name] as number) + plus : undefined),
  }
}
