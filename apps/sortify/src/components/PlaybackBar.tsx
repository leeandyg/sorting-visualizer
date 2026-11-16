import { artistsOf, type Track } from '../library/catalog'
import { formatSpeed, formatSpeedValue, formatTime } from '../library/format'
import { type Player, SPEED_STEPS } from '../playback/usePlayer'
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
  /** The full-screen lyrics view is open in the main area. */
  lyricsOpen?: boolean
  onToggleLyrics?: () => void
}

/** The speeds in the menu: roughly doubling, so eight rows span the whole range.
 *  The − / = keys also reach the in-between steps (1.5×, 3×, 6×…). */
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
          {/* Hangs off the left of the transport rather than sitting in it, so the play button stays
              dead centre under the timeline whatever width the speed label has. */}
          <div className="bar-speed">
            <Popover
              button={
                <>
                  {formatSpeedValue(player.speed)}
                  <small>×</small>
                </>
              }
              label={`Playback speed: ${formatSpeed(player.speed)} (− and = keys)`}
              buttonClass="speed-button"
              placement="above-center"
            >
              {(close) => (
                <>
                  <h3>Playback speed</h3>
                  <div className="menu-list speed-list">
                    {SPEED_CHOICES.map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        aria-pressed={player.speed === choice}
                        onClick={() => {
                          player.setSpeed(choice)
                          close()
                        }}
                      >
                        {formatSpeed(choice)}
                        {player.speed === choice && <Icon name="check" size={16} />}
                      </button>
                    ))}
                  </div>
                  <p className="speed-note">1× plays one step a second.</p>
                </>
              )}
            </Popover>
          </div>
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
            <Icon name={player.playing ? 'pause' : 'play'} size={16} />
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
        {props.onToggleLyrics && (
          <button
            type="button"
            className={props.lyricsOpen ? 'icon-button has-dot is-on' : 'icon-button has-dot'}
            onClick={props.onToggleLyrics}
            aria-pressed={props.lyricsOpen ?? false}
            aria-label="Lyrics"
            title={props.lyricsOpen ? 'Close the lyrics' : 'Lyrics'}
          >
            <Icon name="lyrics" />
          </button>
        )}
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
        {/* Full screen in, minimise out: the stage is this app's full-screen player. */}
        <Control
          icon={props.onStage ? 'exitFullscreen' : 'fullscreen'}
          label={props.onStage ? 'Leave the stage (Esc)' : 'Open the stage'}
          onClick={props.onToggleStage}
        />
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
