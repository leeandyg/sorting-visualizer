import { artistsOf, type Track } from '../library/catalog'
import { formatSpeed, formatTime } from '../library/format'
import { MAX_SPEED, MIN_SPEED, type Player, SPEED_STEPS } from '../playback/usePlayer'
import { CoverArt } from './CoverArt'
import { Icon, type IconName } from './Icon'
import { Popover } from './Popover'
import { Slider } from './Slider'
import './PlaybackBar.css'

interface Props {
  track: Track
  player: Player
  frameCount: number
  onPreviousTrack: () => void
  onNextTrack: () => void
  onShuffle: () => void
  /** What Shuffle makes right now, for its tooltip (e.g. "random, 16 values"). */
  shuffleMakes: string
  repeat: boolean
  onToggleRepeat: () => void
  liked: boolean
  onToggleLiked: () => void
  sound: boolean
  onToggleSound: () => void
  volume: number
  onVolume: (volume: number) => void
  onStage: boolean
  onToggleStage: () => void
}

// The speed slider is logarithmic so slow speeds get as much travel as fast ones.
const SPEED_RATIO = MAX_SPEED / MIN_SPEED
const sliderToSpeed = (s: number) => MIN_SPEED * SPEED_RATIO ** (s / 100)
const speedToSlider = (speed: number) => (Math.log(speed / MIN_SPEED) / Math.log(SPEED_RATIO)) * 100
/** The speeds offered as one-click choices; the slider and the − / = keys reach the rest. */
const SPEED_CHOICES = SPEED_STEPS.filter((s) => [0.5, 1, 2, 4, 8, 16, 50, 100].includes(s))

/** The bar along the bottom: what's playing, the transport and progress, and speed and volume. */
export function PlaybackBar(props: Props) {
  const { track, player, frameCount } = props
  const last = Math.max(frameCount - 1, 0)
  return (
    <footer className="playback-bar" aria-label="Player controls">
      <div className="bar-song">
        <button
          type="button"
          className="bar-cover"
          onClick={props.onToggleStage}
          aria-label={props.onStage ? 'Back to the album' : 'Open the stage'}
          title={props.onStage ? 'Back to the album' : 'Open the stage'}
        >
          <CoverArt track={track} />
        </button>
        <div className="bar-song-text">
          <strong>{track.title}</strong>
          <span>{artistsOf(track)}</span>
        </div>
        <button
          type="button"
          className={props.liked ? 'icon-button like is-on' : 'icon-button like'}
          onClick={props.onToggleLiked}
          aria-pressed={props.liked}
          aria-label={props.liked ? 'Remove this array from your liked arrays' : 'Save this array to your liked arrays'}
          title={props.liked ? 'Remove this array from your liked arrays' : 'Save this array to your liked arrays'}
        >
          <Icon name={props.liked ? 'heartFilled' : 'heart'} />
        </button>
      </div>

      <div className="bar-center">
        <div className="transport">
          <Control icon="shuffle" label={`Shuffle: play a new array (${props.shuffleMakes})`} onClick={props.onShuffle} />
          <Control icon="previous" label="Previous song" onClick={props.onPreviousTrack} />
          <Control icon="stepBack" label="Step back (←, Shift+← for 5)" onClick={player.stepBack} />
          <button
            type="button"
            className="play-button"
            onClick={player.toggle}
            aria-label={player.playing ? 'Pause (Space)' : 'Play (Space)'}
            title={player.playing ? 'Pause (Space)' : 'Play (Space)'}
          >
            <Icon name={player.playing ? 'pause' : 'play'} size={18} />
          </button>
          <Control icon="stepForward" label="Step forward (→, Shift+→ for 5)" onClick={player.stepForward} />
          <Control icon="next" label="Next song" onClick={props.onNextTrack} />
          <button
            type="button"
            className={props.repeat ? 'icon-button has-dot is-on' : 'icon-button has-dot'}
            onClick={props.onToggleRepeat}
            aria-pressed={props.repeat}
            aria-label="Repeat this song"
            title={props.repeat ? 'Repeat is on: this song loops' : 'Repeat this song'}
          >
            <Icon name="repeat" />
          </button>
        </div>
        <div className="scrub">
          <span className="time" title={`Step ${player.index} of ${last}`}>
            {formatTime(player.index)}
          </span>
          <Slider
            value={player.index}
            min={0}
            max={last}
            onChange={player.seek}
            label="Progress"
            valueText={`Step ${player.index} of ${last}`}
          />
          <span className="time" title={`${last} steps`}>
            {formatTime(last)}
          </span>
        </div>
      </div>

      <div className="bar-end">
        <Popover
          button={formatSpeed(player.speed)}
          label="Playback speed (− and = keys)"
          buttonClass="speed-button"
          placement="above-end"
        >
          <h3>Playback speed</h3>
          <div className="speed-slider">
            <Slider
              value={Math.round(speedToSlider(player.speed))}
              min={0}
              max={100}
              onChange={(s) => player.setSpeed(sliderToSpeed(s))}
              label="Playback speed"
              valueText={`${formatSpeed(player.speed)}, ${player.speed < 10 ? player.speed.toFixed(1) : Math.round(player.speed)} steps per second`}
            />
          </div>
          <div className="speed-choices">
            {SPEED_CHOICES.map((choice) => (
              <button key={choice} type="button" aria-pressed={player.speed === choice} onClick={() => player.setSpeed(choice)}>
                {formatSpeed(choice)}
              </button>
            ))}
          </div>
          <p className="speed-note">1× plays one step a second.</p>
        </Popover>
        <button
          type="button"
          className={props.sound ? 'icon-button' : 'icon-button is-muted'}
          onClick={props.onToggleSound}
          aria-pressed={props.sound}
          aria-label={props.sound ? 'Sound on (M)' : 'Sound off (M)'}
          title={props.sound ? 'Mute (M)' : 'Unmute (M)'}
        >
          <Icon name={props.sound ? 'volume' : 'muted'} />
        </button>
        <Slider
          className="volume"
          value={props.sound ? Math.round(props.volume * 100) : 0}
          min={0}
          max={100}
          onChange={(v) => props.onVolume(v / 100)}
          label="Volume"
        />
        <Control icon="expand" label={props.onStage ? 'Back to the album' : 'Open the stage'} onClick={props.onToggleStage} />
      </div>
    </footer>
  )
}

function Control({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button type="button" className="icon-button" onClick={onClick} aria-label={label} title={label}>
      <Icon name={icon} />
    </button>
  )
}
