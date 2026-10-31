export type Lang = 'python' | 'javascript' | 'java' | 'cpp'

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
]

/**
 * An identifier as each language's listings spell it. Algorithms and vars use Python's
 * snake_case names; JavaScript and Java use camelCase, and C++ keeps snake_case.
 */
export function ident(name: string, lang: Lang): string {
  return lang === 'javascript' || lang === 'java' ? name.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()) : name
}

/** A var's value as a literal in the language (True/False in Python, true/false elsewhere). */
export function literal(value: number | boolean, lang: Lang): string {
  if (typeof value === 'number') return String(value)
  if (lang === 'python') return value ? 'True' : 'False'
  return value ? 'true' : 'false'
}
