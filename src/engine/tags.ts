/**
 * Letters that tell equal values apart (5ᵃ, 5ᵇ), assigned in original order. Item ids are input
 * positions, so the map is keyed by id. Values that appear once get no tag.
 */
export function duplicateTags(input: readonly number[]): Map<number, string> {
  const idsByValue = new Map<number, number[]>()
  input.forEach((value, id) => idsByValue.set(value, [...(idsByValue.get(value) ?? []), id]))
  const tags = new Map<number, string>()
  for (const ids of idsByValue.values()) {
    if (ids.length > 1) ids.forEach((id, k) => tags.set(id, k < 26 ? String.fromCharCode(97 + k) : String(k + 1)))
  }
  return tags
}

const SUPERSCRIPT: Record<string, string> = Object.fromEntries(
  [...'abcdefghijklmnopqrstuvwxyz'].map((c, k) => [c, 'ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ'[k] ?? c]),
)

/** A tag as superscript text, for places that can't use <sup> (narration). */
export const superscript = (tag: string) => [...tag].map((c) => SUPERSCRIPT[c] ?? c).join('')
