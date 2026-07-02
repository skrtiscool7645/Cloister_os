import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-6 flex-wrap gap-3', className)}>
      <div>
        <h1 className="text-3xl md:text-2xl font-extrabold text-gray-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-3 items-center">{actions}</div>}
    </div>
  )
}
