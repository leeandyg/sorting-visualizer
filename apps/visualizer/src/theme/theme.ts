import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
/** "system" follows the OS setting; "light"/"dark" are remembered and ignore it. */
export type ThemeChoice = 'system' | Theme

/** Also read by the inline script in index.html, which applies the theme before first paint. */
const STORAGE_KEY = 'theme'

export function resolveTheme(choice: ThemeChoice, system: Theme): Theme {
  return choice === 'system' ? system : choice
}

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)')
const systemTheme = (): Theme => (darkQuery().matches ? 'dark' : 'light')

function readChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

function writeChoice(choice: ThemeChoice) {
  try {
    if (choice === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the choice just won't persist.
  }
}

export function useTheme() {
  const [choice, setChoice] = useState(readChoice)
  const [system, setSystem] = useState(systemTheme)
  const theme = resolveTheme(choice, system)

  useEffect(() => {
    const query = darkQuery()
    const onChange = () => setSystem(systemTheme())
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => writeChoice(choice), [choice])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return { choice, setChoice }
}
