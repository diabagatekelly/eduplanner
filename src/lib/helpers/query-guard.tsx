import { ReactElement } from 'react'
import PageSkeleton from '@/components/skeletons/page-skeleton'
import QueryErrorDisplay from '@/components/query-error-display'

export function queryGuard({
  isLoading,
  isError,
  error,
  refetch,
}: {
  isLoading: boolean
  isError: boolean
  error?: unknown
  refetch?: () => void
}): ReactElement | null {
  if (isLoading) return <PageSkeleton />
  if (isError) return <QueryErrorDisplay error={error} onRetry={refetch} />
  return null
}
