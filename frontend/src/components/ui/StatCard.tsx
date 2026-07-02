import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  className?: string
}

export function StatCard({ title, value, hint, icon, className }: StatCardProps) {
  return (
    <div className={cn('card p-5 flex items-start gap-4 card-hover transition duration-300 ease-out', className)}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm bg-slate-700">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{title}</div>
        <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{value}</div>
        {hint && <div className="text-sm text-slate-500 mt-2">{hint}</div>}
      </div>
    </div>
  )
}

export default StatCard
