import type { CSSProperties } from 'react'
import './Slider.css'

interface Props {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  label: string
  /** Spoken value, when the number alone wouldn't mean much (e.g. "Step 11 of 178"). */
  valueText?: string
  className?: string
}

/** A thin track that fills up to the thumb, like a music player's progress and volume bars. */
export function Slider({ value, min, max, step = 1, onChange, label, valueText, className }: Props) {
  const filled = max > min ? ((value - min) / (max - min)) * 100 : 0
  return (
    <input
      type="range"
      className={className ? `slider ${className}` : 'slider'}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
      aria-valuetext={valueText}
      title={valueText}
      style={{ '--filled': `${filled}%` } as CSSProperties}
    />
  )
}
