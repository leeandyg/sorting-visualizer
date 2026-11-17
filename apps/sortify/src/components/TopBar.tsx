import type { FormEvent } from 'react'
import { ArrayOptions, type ArraySettings } from './ArrayOptions'
import { ArrayPrompt } from './ArrayPrompt'
import { Icon } from './Icon'
import { Popover } from './Popover'
import { SiteSwitcher } from './SiteSwitcher'
import './TopBar.css'

interface Props {
  text: string
  onText: (text: string) => void
  error: string | null
  /** Plays the array typed in the field. */
  onSubmit: (e?: FormEvent) => void
  onHome: () => void
  atHome: boolean
  settings: ArraySettings
  /** What a new array would be, for the die's tooltip (e.g. "random, 16 values"). */
  newArrayMakes: string
  /** Link to the other site, carrying the current state. */
  switchHref: string
}

const SHORTCUTS: [keys: string[], does: string][] = [
  [['Space'], 'Play or pause'],
  [['←', '→'], 'Step back or forward'],
  [['Shift', '←', '→'], 'Jump 5 steps'],
  [['Q', 'E'], 'Start or end of the song'],
  [['−', '='], 'Slower or faster'],
  [['M'], 'Sound on or off'],
  [['Esc'], 'Leave the stage or lyrics'],
  [['Enter'], 'Play the array in the top bar'],
  [['Shift', 'Enter'], 'Expand the array field'],
]

export function TopBar({ text, onText, error, onSubmit, onHome, atHome, settings, newArrayMakes, switchHref }: Props) {
  return (
    <header className="top-bar">
      <SiteSwitcher href={switchHref} />

      <div className="top-center">
        <button
          type="button"
          className={atHome ? 'home-button is-current' : 'home-button'}
          onClick={onHome}
          aria-label="Home"
          title="Home"
        >
          <Icon name="home" size={24} />
        </button>
        <form className="prompt-form" onSubmit={onSubmit}>
          <ArrayPrompt text={text} onChange={onText} error={error}>
            <button
              type="button"
              className="icon-button"
              onClick={settings.onNewArray}
              aria-label={`New array (${newArrayMakes})`}
              title={`New array (${newArrayMakes})`}
            >
              <Icon name="dice" />
            </button>
            <Popover button={<Icon name="sliders" />} label="New array settings" buttonClass="icon-button">
              {(close) => <ArrayOptions settings={settings} close={close} />}
            </Popover>
          </ArrayPrompt>
        </form>
      </div>

      <div className="top-end">
        <Popover button={<Icon name="keyboard" />} label="Keyboard shortcuts" buttonClass="icon-button">
          <h3>Keyboard shortcuts</h3>
          <dl className="shortcuts">
            {SHORTCUTS.map(([keys, does]) => (
              <div key={does}>
                <dt>
                  {keys.map((key) => (
                    <kbd key={key}>{key}</kbd>
                  ))}
                </dt>
                <dd>{does}</dd>
              </div>
            ))}
          </dl>
        </Popover>
      </div>
    </header>
  )
}
