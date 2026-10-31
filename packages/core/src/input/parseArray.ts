import { MAX_SIZE } from '../engine/record'

export const MAX_VALUE = 999

export type ParseResult = { values: number[]; error?: undefined } | { values?: undefined; error: string }

/** Parses user input like "5, 2, 9 1" into numbers, with a friendly message when it can't. */
export function parseArray(text: string): ParseResult {
  const tokens = text.split(/[\s,]+/).filter(Boolean)
  if (tokens.length === 0) {
    return { error: 'Enter at least one number, e.g. 5, 2, 9, 1' }
  }
  for (const token of tokens) {
    if (!/^\d+$/.test(token) || Number(token) > MAX_VALUE) {
      return { error: `"${token}" isn't allowed. Use whole numbers from 0 to ${MAX_VALUE}.` }
    }
  }
  if (tokens.length > MAX_SIZE) {
    return { error: `That's ${tokens.length} numbers; the limit is ${MAX_SIZE}.` }
  }
  return { values: tokens.map(Number) }
}
