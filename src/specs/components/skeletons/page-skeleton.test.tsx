import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import PageSkeleton from '@/components/skeletons/page-skeleton'

describe('PageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<PageSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
