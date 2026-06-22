import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundaryFallback from '@/components/error-boundary-fallback'

describe('ErrorBoundaryFallback', () => {
  it('renders error message and try again button', () => {
    const mockReset = jest.fn()
    render(<ErrorBoundaryFallback error={new Error('test')} resetErrorBoundary={mockReset} />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('calls resetErrorBoundary when Try again is clicked', () => {
    const mockReset = jest.fn()
    render(<ErrorBoundaryFallback error={new Error('test')} resetErrorBoundary={mockReset} />)

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(mockReset).toHaveBeenCalledTimes(1)
  })
})
