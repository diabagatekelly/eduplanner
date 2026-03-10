import Main from '../../../../../app/[username]/students/[student]/page'
import '@testing-library/jest-dom'
import { render } from '../../../../util'
import * as React from 'react'
import { act } from 'react'
import { mockStudent, mockUser } from '../../../../../specs/mocks'
import NestedLayout from '../../../../../app/nested-layout'
import { useSession } from 'next-auth/react'
import { useUser } from '../../../../../hooks/use-user'
import { useStudent } from '../../../../../hooks/use-student'

jest.mock('../../../../../app/nested-layout')
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))
jest.mock('../../../../../hooks/use-user')
jest.mock('../../../../../hooks/use-student')

describe('Main user page', () => {
  const back = window.history.back

  beforeAll(() => {
    Object.defineProperty(window, 'history', {
      value: { back: jest.fn() },
    })
  })

  afterAll(() => {
    window.history.back = back
  })
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
    ;(useStudent as jest.Mock).mockReturnValue({ data: undefined })
    ;(NestedLayout as jest.Mock).mockImplementation(() => null)
    await act(async () => {
      render(<Main {...{ params: Promise.resolve({ student: 'mock-student' }) }} />)
    })
    expect(NestedLayout).toHaveBeenCalled()
  })

  describe('Not main - Teacher', () => {
    const teacherWithStudentLink = {
      ...mockUser,
      linkedAccountsData: {
        students: [[mockStudent.userId, mockStudent.username]],
      },
    }
    beforeEach(() => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: { userId: mockUser.userId, username: mockUser.username } },
      })
      ;(useUser as jest.Mock).mockReturnValue({ data: teacherWithStudentLink })
      ;(useStudent as jest.Mock).mockReturnValue({ data: mockStudent })
      ;(NestedLayout as jest.Mock).mockImplementation(() => null)
    })

    it("should correctly display the student's name", async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ student: `${mockStudent.username}` }) }} />)
      })
      expect('Manage mock student.')
    })

    it('should pass the correct isTeacher values for teacher on student page to NestedLayout', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ student: `${mockStudent.username}` }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[0][0]).toEqual(
        expect.objectContaining({ isTeacher: true })
      )
    })

    it('should pass the correct userDetails, isMain, isTeacher values for teacher on student page to Dashboard', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ student: `${mockStudent.username}` }) }} />)
      })
      const expecteDashboarddArgs = { isMain: false, isTeacher: true, userDetails: mockStudent }
      expect((NestedLayout as jest.Mock).mock.calls[0][0].children[1].props).toMatchObject(
        expecteDashboarddArgs
      )
    })

    it('should display back button', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ student: `${mockStudent.username}` }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[0][0].children[2].props).toMatchObject({
        children: 'Back',
      })
      ;(NestedLayout as jest.Mock).mock.calls[0][0].children[2].props.onClick()
      expect(window.history.back).toHaveBeenCalled()
    })
  })
})
