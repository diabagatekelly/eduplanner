import Main from '../../../app/[username]/page'
import '@testing-library/jest-dom'
import { render } from '../../util'
import * as React from 'react'
import { act } from 'react'
import { mockUser, mockStudent } from '../../../specs/mocks'
import NestedLayout from '../../../app/nested-layout'
import { useSession } from 'next-auth/react'
import { useUser } from '../../../hooks/use-user'

jest.mock('../../../app/nested-layout')
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))
jest.mock('../../../hooks/use-user')

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
      return render(<Main {...{ params: Promise.resolve({ username: 'mock-user' }) }} />)
    })
    // Loading guard returns null when userId is missing
    expect(container.querySelector('.py-20')!.innerHTML).toBe('')
    expect(NestedLayout).not.toHaveBeenCalled()
  })

  describe('Main - Student', () => {
    beforeEach(() => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: { userId: mockStudent.userId, username: mockStudent.username } },
      })
      ;(useUser as jest.Mock).mockReturnValue({ data: mockStudent })
      ;(NestedLayout as jest.Mock).mockImplementation(() => null)
    })

    it('should pass the correct isTeacher values for student to NestedLayout', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ username: 'mock-student' }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[0][0]).toEqual(
        expect.objectContaining({ isTeacher: false })
      )
    })

    it('should pass the correct userDetails, isMain, isTeacher values for student to Dashboard', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ username: 'mock-student' }) }} />)
      })
      const expecteDashboarddArgs = { isMain: true, isTeacher: false, userDetails: mockStudent }
      expect((NestedLayout as jest.Mock).mock.calls[0][0].children[1].props).toMatchObject(
        expecteDashboarddArgs
      )
    })
  })

  describe('Main - Teacher', () => {
    beforeEach(() => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: { userId: mockUser.userId, username: mockUser.username } },
      })
      ;(useUser as jest.Mock).mockReturnValue({ data: mockUser })
      ;(NestedLayout as jest.Mock).mockImplementation(() => null)
    })

    it('should pass the correct isTeacher values for teacher on own page to NestedLayout', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ username: 'mock-user' }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[0][0]).toEqual(
        expect.objectContaining({ isTeacher: true })
      )
    })

    it('should pass the correct userDetails, isMain, isTeacher values for teacher on own page to Dashboard', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ username: 'mock-user' }) }} />)
      })
      const expecteDashboarddArgs = { isMain: true, isTeacher: true, userDetails: mockUser }
      expect((NestedLayout as jest.Mock).mock.calls[0][0].children[1].props).toMatchObject(
        expecteDashboarddArgs
      )
    })
  })
})
