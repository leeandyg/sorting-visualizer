import type { AuxRef, Frame } from '../engine/types'

/** Two octaves up from A3: low values sound low and high values high. */
export function valueToFrequency(value: number, maxValue: number): number {
  return 220 * 2 ** ((2 * value) / Math.max(maxValue, 1))
}

/** Frequencies for the values a step touched. Steps that only change bookkeeping are silent. */
export function tonesFor(frame: Frame, maxValue: number): number[] {
  const step = frame.step
  if (!step) return []
  const at = (i: number) => frame.items[i]?.value
  const aux = (ref: AuxRef) => frame.aux[ref.buffer]?.items[ref.at]?.value
  let values: (number | undefined)[]
  switch (step.type) {
    case 'compare':
    case 'swap':
      values = [at(step.i), at(step.j)]
      break
    case 'compareHeld':
      values = [frame.held?.value, at(step.j)]
      break
    case 'compareValue':
      values = [at(step.i), step.value]
      break
    case 'compareAux':
      values = [aux(step.a), aux(step.b)]
      break
    case 'lift':
      values = [frame.held?.value]
      break
    case 'shift':
    case 'writeFromAux':
      values = [at(step.to)]
      break
    case 'drop':
      values = [at(step.i)]
      break
    default:
      return []
  }
  return values.filter((v): v is number => v !== undefined).map((v) => valueToFrequency(v, maxValue))
}

/** Every note is the same length, whatever the playback speed, so it always sounds the same. */
export const NOTE_MS = 110

let context: AudioContext | null = null
let output: AudioNode | null = null
let master: GainNode | null = null
let volume = 1

/** Loudness of everything played from here on, from 0 (silent) to 1 (the default). */
export function setVolume(value: number) {
  volume = Math.min(Math.max(value, 0), 1)
  if (master) master.gain.value = volume
}

export function getVolume(): number {
  return volume
}

/**
 * Created on first use, which is always after a click or key press, as browsers require.
 * Notes go through a limiter so overlapping ones can't distort, then the volume.
 */
function audio(): { ctx: AudioContext; out: AudioNode } {
  if (!context || !output) {
    context = new AudioContext()
    const limiter = context.createDynamicsCompressor()
    limiter.threshold.value = -12
    limiter.ratio.value = 12
    master = context.createGain()
    master.gain.value = volume
    limiter.connect(master).connect(context.destination)
    output = limiter
  }
  if (context.state === 'suspended') void context.resume()
  return { ctx: context, out: output }
}

/** Quiet triangle-wave notes with a fast fade in and a smooth fade out (no clicks). */
export function playTones(frequencies: number[], ms = NOTE_MS, delayMs = 0) {
  if (frequencies.length === 0) return
  const { ctx, out } = audio()
  const start = ctx.currentTime + delayMs / 1000
  const end = start + ms / 1000
  for (const frequency of frequencies) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.12 / frequencies.length, start + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)
    osc.connect(gain).connect(out)
    osc.start(start)
    osc.stop(end + 0.02)
  }
}

/** A rising arpeggio (C E G C) for a finished sort. */
export function playDone() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((frequency, k) => playTones([frequency], 180, k * 80))
}
