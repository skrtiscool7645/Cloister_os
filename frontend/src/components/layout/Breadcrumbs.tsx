import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn('flex items-center gap-1.5 text-sm text-gray-500', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-gray-300 select-none">/</span>}
            {item.href && !isLast ? (
              <Link to={item.href} className="hover:text-blue-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast ? 'text-gray-900 font-medium' : '')}>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
