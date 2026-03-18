import StudentsList from '../../../components/lists/students-list'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { IUser } from '../../../types/IUser'
import { mockStudent, mockUser } from '../../mocks'
import { useRouter } from 'next/navigation'
import { server } from '../../msw/server'
import { http, HttpResponse } from 'msw'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('next-auth/react', () => ({
  getSession: jest.fn().mockResolvedValue(null),
}))
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(),
  }
})

describe('Students List', () => {
  describe('No students', () => {
    const teacher: IUser = { ...mockUser, linkedAccountsData: { students: [] } }

    it('should display "no students" message when teacher has no students', () => {
      render(<StudentsList {...{ userDetails: undefined }} />)
      const noStudentsMessage = screen.getByTestId('no-students-message')
      expect(noStudentsMessage).toHaveTextContent('You have no students yet.')
    })
  })

  describe('Delete popup', () => {
    const teacher: IUser = {
      ...mockUser,
      linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username]] },
      students: { [mockStudent.username]: mockStudent },
    }

    it('should open delete popup when trying to remove user as a student', async () => {
      render(<StudentsList {...{ userDetails: teacher }} />)
      const deleteBtn = screen.getByTestId('student-list-delete')

      await act(async () => {
        await fireEvent.click(deleteBtn)
      })

      const unlinkAccountPopup = screen.getByTestId('unlink-account-popup')

      const expectedPopupText = 'Are you sure you want to remove this student?'
      const expectedStudentEmail = mockStudent.email

      expect(unlinkAccountPopup).toBeVisible()
      expect(unlinkAccountPopup).toHaveTextContent(expectedPopupText)
      expect(unlinkAccountPopup).toHaveTextContent(expectedStudentEmail)

      const closeUnlinkAccountPopupBtn = screen.getByTestId('unlink-account-popup-close-btn')
      await act(async () => {
        await fireEvent.click(closeUnlinkAccountPopupBtn)
      })

      expect(unlinkAccountPopup).not.toBeVisible()
    })
  })

  describe('Students details already populated', () => {
    const teacher: IUser = {
      ...mockUser,
      linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username]] },
      students: { [mockStudent.username]: mockStudent },
    }

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should display a list of student names', () => {
      render(<StudentsList {...{ userDetails: teacher }} />)
      const studentList = screen.getByTestId('students-list')

      expect(studentList).toHaveTextContent(`${mockStudent.username.split('-').join(' ')}`)
    })

    it('should navigate directly using cached student details without API call', async () => {
      const mockRouter = {
        push: jest.fn(),
      }
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

      render(<StudentsList {...{ userDetails: teacher }} />)

      const studentEmail = screen.getByTestId('students-email')
      const url = `/${teacher.username}/students/${mockStudent.username}`

      await act(async () => {
        await fireEvent.click(studentEmail)
      })

      expect(mockRouter.push).toHaveBeenCalledWith(url)
    })
  })

  describe('Has students but students object not populated', () => {
    const teacher: IUser = {
      ...mockUser,
      linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username]] },
    }

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should fetch student details via API and navigate when students object is not populated', async () => {
      server.use(
        http.get('*/user', () =>
          HttpResponse.json({ message: null, details: { student: mockStudent } })
        )
      )

      const mockRouter = {
        push: jest.fn(),
      }
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

      render(<StudentsList {...{ userDetails: teacher }} />)

      const studentEmail = screen.getByTestId('students-email')
      const url = `/${teacher.username}/students/${mockStudent.username}`

      await act(async () => {
        await fireEvent.click(studentEmail)
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(url)
      })
    })
  })

  describe('Has students but correct student not yet in object', () => {
    const fakeStudent = {
      ...mockStudent,
      username: 'some-other-student',
      email: 'some-fake@emai.com',
      userId: btoa('some-fake@emai.com'),
    }
    const teacher: IUser = {
      ...mockUser,
      linkedAccountsData: {
        students: [
          [mockStudent.userId, mockStudent.username],
          [fakeStudent.userId, fakeStudent.username],
        ],
      },
      students: { 'some-other-student': fakeStudent },
    }

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should fetch missing student details via API and navigate', async () => {
      server.use(
        http.get('*/user', () =>
          HttpResponse.json({ message: null, details: { student: mockStudent } })
        )
      )

      const mockRouter = {
        push: jest.fn(),
      }
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

      render(<StudentsList {...{ userDetails: teacher }} />)

      const studentUsername = screen.getAllByTestId('students-email')[0]
      const url = `/${teacher.username}/students/${mockStudent.username}`

      await act(async () => {
        await fireEvent.click(studentUsername)
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(url)
      })
    })

    it('should display error message when response is not 200 or 500', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => null)
      server.use(
        http.get('*/user', () =>
          HttpResponse.json(
            { status: 'failedTransaction', message: 'Erroneous response' },
            { status: 400 }
          )
        )
      )

      const mockRouter = {
        push: jest.fn(),
      }
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

      render(<StudentsList {...{ userDetails: teacher }} />)

      const studentUsername = screen.getAllByTestId('students-email')[0]

      await act(async () => {
        await fireEvent.click(studentUsername)
      })

      await waitFor(() => {
        const errorMessage = screen.getByText(/Erroneous response/i)
        expect(errorMessage).toBeInTheDocument()
      })
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should display error message when response is 500', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => null)
      server.use(
        http.get('*/user', () =>
          HttpResponse.json(
            { status: 'internalServerError', message: 'Server error' },
            { status: 500 }
          )
        )
      )

      const mockRouter = {
        push: jest.fn(),
      }
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

      render(<StudentsList {...{ userDetails: teacher }} />)

      const studentUsername = screen.getAllByTestId('students-email')[0]

      await act(async () => {
        await fireEvent.click(studentUsername)
      })

      await waitFor(() => {
        const errorMessage = screen.getByText(
          /Failed to fetch student details due to an internal error. Please try again later./i
        )
        expect(errorMessage).toBeInTheDocument()
      })
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should display error message when error has no response', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => null)
      server.use(http.get('*/user', () => HttpResponse.error()))

      const mockRouter = {
        push: jest.fn(),
      }
      ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

      render(<StudentsList {...{ userDetails: teacher }} />)

      const studentUsername = screen.getAllByTestId('students-email')[0]

      await act(async () => {
        await fireEvent.click(studentUsername)
      })

      await waitFor(() => {
        const errorMessage = screen.getByText(/Server is down. Try again later./i)
        expect(errorMessage).toBeInTheDocument()
      })
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })
})
