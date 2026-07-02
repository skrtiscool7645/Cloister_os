import { useState, useMemo, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  loading?: boolean
  searchable?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  pageSize?: number
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  className?: string
  onRowClick?: (item: T) => void
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading,
  searchable,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  emptyTitle = 'No data found',
  emptyDescription,
  emptyAction,
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey]
      const bVal = (b as Record<string, unknown>)[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  const handleSearchChange = (value: string) => {
    onSearchChange?.(value)
    setPage(0)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {searchable && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue ?? ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
        />
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm table-auto">
              <thead>
                <tr className="border-b border-gray-100">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        'text-left px-5 py-3 font-medium text-neutral-500 sticky top-0 bg-white',
                        col.sortable && 'cursor-pointer select-none hover:text-gray-900 transition-colors',
                        col.headerClassName,
                      )}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.header}
                        {col.sortable && sortKey === col.key && (
                          <span className="text-blue-500 text-xs">
                            {sortDir === 'asc' ? '\u25B2' : '\u25BC'}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.map((item, idx) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      'transition-colors',
                      onRowClick && 'cursor-pointer',
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                      'hover:bg-gray-100',
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-5 py-3.5 text-gray-700', col.className)}>
                        {col.render
                          ? col.render(item)
                          : String((item as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <span className="text-xs text-gray-500">
                {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={cn(
                      'px-3 py-1 text-xs border rounded transition-colors',
                      i === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 hover:bg-gray-100',
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1 text-xs border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
