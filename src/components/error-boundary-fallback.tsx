'use client'

import { FallbackProps } from 'react-error-boundary'

export default function ErrorBoundaryFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4">An unexpected error occurred. Please try again.</p>
      <button onClick={resetErrorBoundary} type="button" className="default-btn">
        Try again
      </button>
    </div>
  )
}
