import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { queryGuard } from '@/lib/helpers/query-guard'

describe('queryGuard', () => {
  it('returns PageSkeleton when isLoading is true', () => {
    const result = queryGuard({ isLoading: true, isError: false })
    const { container } = render(result!)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('returns QueryErrorDisplay when isError is true', () => {
    const refetch = jest.fn()
    const result = queryGuard({
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch,
    })
    render(result!)
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('returns null when not loading or errored', () => {
    const result = queryGuard({ isLoading: false, isError: false })
    expect(result).toBeNull()
  })
})
