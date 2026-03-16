import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import QueryErrorDisplay from '@/components/query-error-display'

describe('QueryErrorDisplay', () => {
  it('renders error message and retry button', () => {
    const mockRetry = jest.fn()
    render(<QueryErrorDisplay error={new Error('Network failure')} onRetry={mockRetry} />)

    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    expect(screen.getByText('Network failure')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('shows fallback message when error has no message', () => {
    const mockRetry = jest.fn()
    render(<QueryErrorDisplay error={new Error('')} onRetry={mockRetry} />)

    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument()
  })

  it('calls onRetry when Retry button is clicked', () => {
    const mockRetry = jest.fn()
    render(<QueryErrorDisplay error={new Error('test')} onRetry={mockRetry} />)

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(mockRetry).toHaveBeenCalledTimes(1)
  })
})
