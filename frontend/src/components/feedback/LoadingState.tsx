import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  )
}

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3', className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
    </div>
  )
}

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  )
}

interface InlineSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function InlineSpinner({ className, size = 'sm' }: InlineSpinnerProps) {
  const sizeClasses = { sm: 'w-4 h-4 border', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-2' }
  return (
    <div
      className={cn(
        'border-blue-600 border-t-transparent rounded-full animate-spin',
        sizeClasses[size],
        className,
      )}
    />
  )
}
