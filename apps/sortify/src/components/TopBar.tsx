import type { FormEvent } from 'react'
import { ArrayOptions, type ShuffleSettings } from './ArrayOptions'
import { ArrayPrompt } from './ArrayPrompt'
import { Icon } from './Icon'
import { Popover } from './Popover'
import './TopBar.css'

interface Props {
  text: string
  onText: (text: string) => void
  error: string | null
  /** Plays the array typed in the field. */
  onSubmit: (e?: FormEvent) => void
  onHome: () => void
  atHome: boolean
  settings: ShuffleSettings
}

const SHORTCUTS: [keys: string[], does: string][] = [
  [['Space'], 'Play or pause'],
  [['←', '→'], 'Step back or forward'],
  [['Shift', '←', '→'], 'Jump 5 steps'],
  [['Q', 'E'], 'Start or end of the song'],
  [['−', '='], 'Slower or faster'],
  [['M'], 'Sound on or off'],
  [['Enter'], 'Play the array in the top bar'],
  [['Shift', 'Enter'], 'Expand the array field'],
]

/** Sortify's mark: three sorted bars in a disc. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} role="img" aria-label="Sortify">
      <circle cx="16" cy="16" r="16" fill="var(--accent)" />
      <g fill="var(--shell)">
        <rect x="8" y="16.5" width="4" height="7.5" rx="2" />
        <rect x="14" y="12" width="4" height="12" rx="2" />
        <rect x="20" y="7.5" width="4" height="16.5" rx="2" />
      </g>
    </svg>
  )
}

export function TopBar({ text, onText, error, onSubmit, onHome, atHome, settings }: Props) {
  return (
    <header className="top-bar">
      <button type="button" className="logo-button" onClick={onHome} aria-label="Sortify home">
        <Logo />
      </button>

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
            <Popover button={<Icon name="sliders" />} label="Shuffle settings" buttonClass="icon-button">
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
