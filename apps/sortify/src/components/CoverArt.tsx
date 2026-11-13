import type { AlgorithmId } from '@sortviz/core'
import { ALBUM, type Track } from '../library/catalog'
import { weave } from '../library/weave'
import './CoverArt.css'

interface Box {
  x: number
  y: number
  w: number
  h: number
}

/** One algorithm's weave drawn into a box: time runs left to right, small values sit at the bottom. */
function Weave({ id, hue, box }: { id: AlgorithmId; hue: number; box: Box }) {
  const lines = weave(id)
  const n = lines.length
  const row = box.h / n
  const y = (position: number) => box.y + box.h - (position + 0.5) * row
  return (
    <g fill="none" strokeLinecap="round" strokeWidth={row * 0.52}>
      {lines.map((line, k) => {
        const dx = box.w / (line.path.length - 1)
        let d = `M${box.x} ${y(line.path[0])}`
        line.path.slice(1).forEach((position, s) => {
          const [x0, x1] = [box.x + s * dx, box.x + (s + 1) * dx]
          const [y0, y1] = [y(line.path[s]), y(position)]
          // Level stretches stay straight; moves ease out and in, so crossings read as threads.
          d += y0 === y1 ? `H${x1}` : `C${x0 + dx / 2} ${y0} ${x0 + dx / 2} ${y1} ${x1} ${y1}`
        })
        // Bigger values are brighter, so the sorted side ends as a clean gradient.
        const lightness = 34 + (line.value / n) * 50
        return <path key={k} d={d} stroke={`hsl(${hue} 78% ${lightness}%)`} />
      })}
    </g>
  )
}

/** A song's cover: its algorithm sorting the same fixed input, drawn as threads. */
export function CoverArt({ track }: { track: Track }) {
  return (
    <svg className="cover" viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" fill={`hsl(${track.hue} 50% 11%)`} />
      <Weave id={track.id} hue={track.hue} box={{ x: 9, y: 9, w: 82, h: 82 }} />
    </svg>
  )
}

/** The album's cover: every song's weave as one band, top to bottom in track order. */
export function AlbumArt() {
  const band = 100 / ALBUM.tracks.length
  return (
    <svg className="cover" viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" fill={`hsl(${ALBUM.hue} 45% 8%)`} />
      {ALBUM.tracks.map((track, k) => (
        <Weave key={track.id} id={track.id} hue={track.hue} box={{ x: 0, y: k * band + 0.8, w: 100, h: band - 1.6 }} />
      ))}
    </svg>
  )
}
