import Main from '../../../../../app/[username]/activities/[activity]/page'
import '@testing-library/jest-dom'
import { render, screen } from '../../../../util'
import * as React from 'react'
import { act } from 'react'
import { mockUser, mockStudent, mockActivity } from '../../../../../specs/mocks'
import NestedLayout from '../../../../../app/nested-layout'
import { useSession } from 'next-auth/react'
import { useUser } from '../../../../../hooks/use-user'

const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    back: mockBack,
  })),
}))
jest.mock('../../../../../app/nested-layout')
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))
jest.mock('../../../../../hooks/use-user')

describe('Main user page', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/3/2024'))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('should render with no session', async () => {
    ;(useSession as jest.Mock).mockReturnValue({ data: null })
    ;(useUser as jest.Mock).mockReturnValue({ data: undefined })
    ;(NestedLayout as jest.Mock).mockImplementation(() => null)
    const { container } = await act(async () => {
      return render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
    })
    // Loading guard returns null when userId is missing
    expect(container.querySelector('.py-20')!.innerHTML).toBe('')
    expect(NestedLayout).not.toHaveBeenCalled()
  })

  it('should render skeleton when loading', async () => {
    ;(useSession as jest.Mock).mockReturnValue({ data: { user: { userId: 'x' } } })
    ;(useUser as jest.Mock).mockReturnValue({ data: undefined, isLoading: true, isError: false })
    const { container } = await act(async () => {
      return render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
    })
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('should render error display when query fails', async () => {
    ;(useSession as jest.Mock).mockReturnValue({ data: { user: { userId: 'x' } } })
    ;(useUser as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed'),
      refetch: jest.fn(),
    })
    await act(async () => {
      render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
    })
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  describe('Main - Student', () => {
    const mockStudentWithActivity = { ...mockStudent, activities: [mockActivity] }
    beforeEach(() => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: { userId: mockStudent.userId, username: mockStudent.username } },
      })
      ;(useUser as jest.Mock).mockReturnValue({ data: mockStudentWithActivity })
      ;(NestedLayout as jest.Mock).mockImplementation(() => null)
    })

    it('should pass the correct isTeacher values for student to NestedLayout', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[0][0]).toEqual(
        expect.objectContaining({ isTeacher: false })
      )
    })

    it('should pass the correct userDetails, userActivity, isMain values for student to ViewActivity', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
      })
      const expectedViewActivityArgs = {
        isMain: true,
        userDetails: mockStudentWithActivity,
        userActivity: mockActivity,
      }
      expect((NestedLayout as jest.Mock).mock.calls[0][0].children[1].props).toMatchObject(
        expectedViewActivityArgs
      )
    })

    it('should display back button', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[0][0].children[2].props).toMatchObject({
        children: 'Back',
      })
      ;(NestedLayout as jest.Mock).mock.calls[0][0].children[2].props.onClick()
      expect(mockBack).toHaveBeenCalled()
    })
  })

  describe('Main - Teacher', () => {
    const mockUserWithActivity = { ...mockUser, activities: [mockActivity] }
    beforeEach(() => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: { userId: mockUser.userId, username: mockUser.username } },
      })
      ;(useUser as jest.Mock).mockReturnValue({ data: mockUserWithActivity })
      ;(NestedLayout as jest.Mock).mockImplementation(() => null)
    })

    it('should pass the correct isTeacher values for teacher on own page to NestedLayout', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[0][0]).toEqual(
        expect.objectContaining({ isTeacher: true })
      )
    })

    it('should pass the correct userDetails, isMain, isTeacher values for teacher on own page to ViewActivity', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
      })
      const expectedViewActivityArgs = {
        isMain: true,
        userDetails: mockUserWithActivity,
        userActivity: mockActivity,
      }
      expect((NestedLayout as jest.Mock).mock.calls[0][0].children[1].props).toMatchObject(
        expectedViewActivityArgs
      )
    })
  })
})
