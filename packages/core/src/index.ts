/**
 * @sortviz/core: everything about sorting that doesn't depend on how it's drawn.
 * Algorithms record their steps into traces, narration explains each step, and the code
 * listings and sound describe the same steps. Apps import from here and supply the UI.
 */

// Recording steps
export { record, MAX_SIZE } from './engine/record'
export type {
  AlgorithmId,
  AuxBuffer,
  AuxRef,
  CodeLine,
  Counters,
  Frame,
  Item,
  MarkKind,
  PointerDef,
  Region,
  SortAlgorithm,
  SortEvent,
  Step,
  Trace,
  Vars,
} from './engine/types'

// Algorithms and facts about them
export { algorithms, algorithmList, algorithmFamilies } from './algorithms'
export { info as algorithmInfo, type AlgorithmInfo } from './algorithms/info'

// Code listings' languages
export { LANGS, ident, literal, type Lang } from './engine/lang'

// Explaining steps
export { narrate, type Level, type Narration } from './narration'
export { duplicateTags, superscript } from './engine/tags'

// Input
export { generate, SHAPES, type Shape } from './input/generate'
export { parseArray, MAX_VALUE, type ParseResult } from './input/parseArray'

// Sound
export { playTones, playDone, tonesFor, valueToFrequency, NOTE_MS } from './sound/sound'
