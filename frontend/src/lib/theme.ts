export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'company_os_theme'

export function getSavedTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(STORAGE_KEY)
  return value === 'dark' || value === 'light' ? value : null
}

export function getPreferredTheme(): ThemeMode {
  const saved = getSavedTheme()
  if (saved) return saved

  return 'light'
}

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  window.localStorage.setItem(STORAGE_KEY, theme)
  window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }))
}

export function getCurrentTheme(): ThemeMode {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function toggleTheme() {
  const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark'
  applyTheme(nextTheme)
}

export function initTheme() {
  // Always restore the app in the light SaaS appearance on startup.
  // Ignore previously persisted dark mode on initial load so the UI remains clean.
  const theme: ThemeMode = 'light'
  applyTheme(theme)
  return theme
}
