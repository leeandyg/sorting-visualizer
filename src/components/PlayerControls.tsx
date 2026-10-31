import { MAX_SPEED, MIN_SPEED, type Player } from '../player/usePlayer'
import './PlayerControls.css'

interface Props {
  player: Player
  frameCount: number
}

// The speed slider is logarithmic so slow speeds get as much travel as fast ones.
const SPEED_RATIO = MAX_SPEED / MIN_SPEED
const sliderToSpeed = (s: number) => MIN_SPEED * SPEED_RATIO ** (s / 100)
const speedToSlider = (speed: number) => (Math.log(speed / MIN_SPEED) / Math.log(SPEED_RATIO)) * 100
const formatSpeed = (speed: number) => (speed < 10 ? speed.toFixed(1) : Math.round(speed).toString())

export function PlayerControls({ player, frameCount }: Props) {
  const last = Math.max(frameCount - 1, 0)
  return (
    <div className="player-controls">
      <div className="transport">
        <IconButton label="Go to start (Home)" onClick={() => player.seek(0)} icon="start" />
        <IconButton label="Step back (←)" onClick={player.stepBack} icon="back" />
        <IconButton
          label={player.playing ? 'Pause (Space)' : 'Play (Space)'}
          onClick={player.toggle}
          icon={player.playing ? 'pause' : 'play'}
          primary
        />
        <IconButton label="Step forward (→)" onClick={player.stepForward} icon="forward" />
        <IconButton label="Go to end (End)" onClick={() => player.seek(last)} icon="end" />
      </div>

      <div className="scrub">
        <input
          type="range"
          min={0}
          max={last}
          value={player.index}
          onChange={(e) => player.seek(Number(e.target.value))}
          aria-label="Step"
        />
        <span className="step-count">
          Step {player.index} / {last}
        </span>
      </div>

      <label className="speed">
        <span>Speed</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={speedToSlider(player.speed)}
          onChange={(e) => player.setSpeed(sliderToSpeed(Number(e.target.value)))}
        />
        <span className="speed-value">{formatSpeed(player.speed)} steps/s</span>
      </label>
    </div>
  )
}

type Icon = 'start' | 'back' | 'play' | 'pause' | 'forward' | 'end'

const ICON_PATHS: Record<Icon, string> = {
  start: 'M6 5h2v14H6zM19 5v14L9 12z',
  back: 'M17 5v14L6 12z',
  play: 'M7 5v14l12-7z',
  pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  forward: 'M7 5v14l11-7z',
  end: 'M16 5h2v14h-2zM5 5v14l10-7z',
}

function IconButton({ label, onClick, icon, primary }: { label: string; onClick: () => void; icon: Icon; primary?: boolean }) {
  return (
    <button type="button" className={primary ? 'icon-button primary' : 'icon-button'} onClick={onClick} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d={ICON_PATHS[icon]} fill="currentColor" />
      </svg>
    </button>
  )
}
