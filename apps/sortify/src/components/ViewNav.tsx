import { Icon } from './Icon'
import './ViewNav.css'

interface Props {
  canBack: boolean
  canForward: boolean
  onBack: () => void
  onForward: () => void
}

/** The ‹ › pair in the main area's corner: back and forward through the views you've visited. */
export function ViewNav({ canBack, canForward, onBack, onForward }: Props) {
  return (
    <nav className="view-nav" aria-label="History">
      <button type="button" onClick={onBack} disabled={!canBack} aria-label="Go back" title="Go back">
        <Icon name="chevronLeft" size={18} />
      </button>
      <button type="button" onClick={onForward} disabled={!canForward} aria-label="Go forward" title="Go forward">
        <Icon name="chevronRight" size={18} />
      </button>
    </nav>
  )
}
