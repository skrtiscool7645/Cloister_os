import React from 'react'

export function Icon({ name, className }: { name: string; className?: string }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }
  switch (name) {
    case 'dashboard':
      return (
        <svg {...common} className={className}>
          <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-8H3v8z" />
        </svg>
      )
    case 'properties':
      return (
        <svg {...common} className={className}><path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" /></svg>
      )
    case 'tenants':
      return (
        <svg {...common} className={className}><path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>
      )
    case 'maintenance':
      return (
        <svg {...common} className={className}><path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M21 14v7H3v-7" /><path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M7 10l5-5 5 5" /></svg>
      )
    case 'work-orders':
      return (
        <svg {...common} className={className}><path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 6h6M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6" /></svg>
      )
    case 'settings':
      return (
        <svg {...common} className={className}><path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" /><path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82L4.21 3.21A2 2 0 016.79.38l.06.06A1.65 1.65 0 008.67.77 1.65 1.65 0 0010 0h4a1.65 1.65 0 001.33.77c.66.36 1.36.83 1.92 1.39l.06.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82c.36.66.83 1.36 1.39 1.92z" /></svg>
      )
    default:
      return <svg {...common} className={className}><circle cx="12" cy="12" r="10" strokeWidth={1.5} /></svg>
  }
}

export default Icon
