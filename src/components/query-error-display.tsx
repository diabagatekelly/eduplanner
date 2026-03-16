'use client'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return 'An unexpected error occurred.'
}

export default function QueryErrorDisplay({
  error,
  onRetry,
}: {
  error?: unknown
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] text-center px-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h2>
      <p className="text-gray-600 mb-4">{getErrorMessage(error)}</p>
      {onRetry && (
        <button onClick={onRetry} type="button" className="default-btn">
          Retry
        </button>
      )}
    </div>
  )
}
