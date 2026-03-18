import '@testing-library/jest-dom'
import { render } from '../../../../../util'
import { screen, act } from '@testing-library/react'
import * as React from 'react'
import { mockUser, mockStudent } from '../../../../../../specs/mocks'
import Profile from '../../../../../../app/[username]/students/[student]/profile/page'
import { useSession } from 'next-auth/react'
import { useUser } from '../../../../../../hooks/use-user'
import { useStudent } from '../../../../../../hooks/use-student'

const student = {
  ...mockStudent,
  linkedAccountsData: { teacher: btoa('mock.user@email.com') },
  lastLogin: '2/15/2024',
}
const teacher = {
  ...mockUser,
  linkedAccountsData: {
    students: [[mockStudent.userId, mockStudent.username]],
  },
  lastLogin: '2/15/2024',
}

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
    usePathname: jest.fn(),
    useParams: jest.fn(),
  }
})
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))
jest.mock('../../../../../../hooks/use-user')
jest.mock('../../../../../../hooks/use-student')

describe('Non-main Profile', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/15/2024'))
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.resetAllMocks()
  })

  it('should render with no session', async () => {
    ;(useSession as jest.Mock).mockReturnValue({ data: null })
    ;(useUser as jest.Mock).mockReturnValue({ data: undefined })
    ;(useStudent as jest.Mock).mockReturnValue({ data: undefined })
    const useParams = jest.spyOn(require('next/navigation'), 'useParams')
    useParams.mockReturnValue({ student: 'mock-student', username: 'mock-user' })
    const { container } = render(<Profile />)
    // Loading guard returns null when userId is missing
    expect(container.querySelector('.py-20')!.innerHTML).toBe('')
  })

  describe('Non-main student profiles', () => {
    it('should display student from teacher account', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: { userId: mockUser.userId, username: mockUser.username } },
      })
      ;(useUser as jest.Mock).mockReturnValue({ data: teacher })
      ;(useStudent as jest.Mock).mockReturnValue({ data: student })
      const useParams = jest.spyOn(require('next/navigation'), 'useParams')
      useParams.mockReturnValue({ student: 'mock-student', username: 'mock-user' })

      render(<Profile />)
      const firstName = await screen.findByTestId('profile-first')
      const lastName = await screen.findByTestId('profile-last')
      const email = await screen.findByTestId('profile-email')
      const accountType = await screen.findByTestId('profile-accountType')
      const linked = await screen.findByTestId('profile-linkedAccounts')
      const loginDate = await screen.findByTestId('profile-login')

      expect(firstName).toHaveTextContent('mock')
      expect(lastName).toHaveTextContent('student')
      expect(email).toHaveTextContent('mock.student@email.com')
      expect(accountType).toHaveTextContent('student')
      expect(linked).toHaveTextContent('mock.user@email.com (teacher)')
      expect(loginDate).toHaveTextContent('2/15/2024')
    })
  })

  describe('Modal behavior', () => {
    it('should show profile', async () => {
      ;(useSession as jest.Mock).mockReturnValue({
        data: { user: { userId: mockUser.userId, username: mockUser.username } },
      })
      ;(useUser as jest.Mock).mockReturnValue({ data: teacher })
      ;(useStudent as jest.Mock).mockReturnValue({ data: student })
      const useParams = jest.spyOn(require('next/navigation'), 'useParams')
      useParams.mockReturnValue({ student: 'mock-student', username: 'mock-user' })

      const profile = render(<Profile />)
      const deleteBtn = profile.container.querySelector('#delete-button') as HTMLButtonElement

      act(() => {
        deleteBtn.click()
      })
      const popup = profile.container.querySelector('#popup-modal')
      expect(popup).toBeVisible()

      const popupClosebtn = profile.container.querySelector('#popup-close-btn') as HTMLButtonElement

      act(() => {
        popupClosebtn.click()
      })

      expect(profile.container.querySelector('#popup-modal')).toBeNull()
    })
  })
})
