import { sites } from '@sortviz/core'
import { leaveWithFade } from '../settings/siteSwitch'
import { Icon } from './Icon'
import { Logo, VisualizerLogo } from './Logo'
import { Popover } from './Popover'
import './SiteSwitcher.css'

/**
 * The logo and name, as a menu for moving between the two sites. The other site is a real link
 * (so it can be opened in a new tab) that carries the current song, array, step and speed.
 */
export function SiteSwitcher({ href }: { href: string }) {
  return (
    <Popover
      button={
        <>
          <Logo />
          <span className="site-name">{sites.sortify.name}</span>
          <Icon name="chevronDown" size={16} />
        </>
      }
      label="Switch site"
      buttonClass="site-button"
      placement="below-start"
    >
      <div className="site-menu">
        <div className="site-option is-current" aria-current="page">
          <Logo size={32} />
          <span>
            <strong>{sites.sortify.name}</strong>
            <small>{sites.sortify.blurb}</small>
          </span>
          <Icon name="check" size={18} />
        </div>
        <a className="site-option" href={href} onClick={leaveWithFade}>
          <VisualizerLogo size={32} />
          <span>
            <strong>{sites.visualizer.name}</strong>
            <small>{sites.visualizer.blurb}</small>
          </span>
        </a>
      </div>
    </Popover>
  )
}
