import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import PageSkeleton from '@/components/skeletons/page-skeleton'

describe('PageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<PageSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('has accessible loading attributes', () => {
    render(<PageSkeleton />)
    const skeleton = screen.getByRole('status')
    expect(skeleton).toHaveAttribute('aria-busy', 'true')
  })
})
