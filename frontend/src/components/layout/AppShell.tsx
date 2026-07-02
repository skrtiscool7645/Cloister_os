import { type ReactNode, useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { getCurrentTheme, toggleTheme } from '@/lib/theme'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(getCurrentTheme())

  useEffect(() => {
    setTheme(getCurrentTheme())

    const updateTheme = () => setTheme(getCurrentTheme())
    window.addEventListener('theme-change', updateTheme)
    return () => window.removeEventListener('theme-change', updateTheme)
  }, [])

  const handleThemeToggle = () => {
    toggleTheme()
  }

  return (
    <div className="min-h-screen">
      <div className="flex">
        <div className={`hidden md:block ${collapsed ? 'w-20' : 'w-64'} transition-all`}> 
          <Sidebar collapsed={collapsed} />
        </div>

        <div className="flex-1 min-h-screen bg-slate-50">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCollapsed((c) => !c)}
                  aria-label="Toggle sidebar"
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 shadow-sm transition hover:bg-slate-200"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
                  </svg>
                </button>
                <div>
                  <div className="text-base font-semibold text-slate-900">Company OS</div>
                  <div className="text-sm text-slate-500">A modern operations platform for property teams</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button aria-label="Notifications" className="p-2 rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                  </svg>
                </button>
                <button aria-label="Toggle theme" className="p-2 rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200" onClick={handleThemeToggle}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {theme === 'dark' ? (
                      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m0-11.314l1.414 1.414M16.95 16.95l1.414 1.414" />
                    ) : (
                      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    )}
                  </svg>
                </button>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700 shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-slate-700 flex items-center justify-center text-white font-semibold">A</div>
                  <div>
                    <div className="text-sm font-semibold">Alex</div>
                    <div className="text-xs text-slate-500">Operations Lead</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto p-4">{children}</main>
        </div>
      </div>
    </div>
  )
}
