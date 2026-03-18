import AddStudent from '../../../components/students/add-student'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { mockUser, mockStudent } from '../../../specs/mocks'
import { toast } from 'sonner'
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
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
  }
})

describe('Add student', () => {
  const user = { ...mockUser, accountType: 'teacher' }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render form to search for student', async () => {
    render(<AddStudent {...{ user }} />)

    const heading = await screen.findByRole('heading', { level: 3 })
    const findStudentForm = await screen.findByTestId('find-student-form')

    expect(heading).toHaveTextContent('Add a new student:')
    expect(findStudentForm).toBeInTheDocument()
  })

  it('should invoke findUser controller when form is submitted', async () => {
    render(<AddStudent {...{ user }} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')

    await act(() => {
      fireEvent.change(email, {
        target: { value: mockStudent.email },
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByTestId('link-account-popup')).toBeVisible()
    })
  })

  it('should not add same user as his own student', async () => {
    const invalidStudent = { ...mockStudent, email: user.email }
    render(<AddStudent {...{ user }} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')

    await act(() => {
      fireEvent.change(email, {
        target: { value: invalidStudent.email },
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith("You can't add yourself as a student.")
    })
    expect(email).toHaveValue('')
  })

  it('should not add pre-existing student', async () => {
    const userWithStudents = {
      ...mockUser,
      linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username]] },
    }
    render(<AddStudent {...{ user: userWithStudents }} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')

    await act(() => {
      fireEvent.change(email, {
        target: { value: mockStudent.email },
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith('This is already one of your students.')
    })
    expect(email).toHaveValue('')
  })

  it('should reset form when response is successful and display popup with student info', async () => {
    server.use(
      http.get('*/user', () =>
        HttpResponse.json({ message: 'User found.', details: { student: mockStudent } })
      )
    )

    render(<AddStudent {...{ user }} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')

    await act(() => {
      fireEvent.change(email, {
        target: { value: mockStudent.email },
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const linkAccountPopup = screen.getByTestId('link-account-popup')
    const closePopupBtn = screen.getByTestId('close-link-account-popup')
    const expectedHTML = 'mock student - mock.student@email.com'

    expect(linkAccountPopup).toBeVisible()
    expect(linkAccountPopup).toHaveTextContent(expectedHTML)

    await act(async () => {
      await fireEvent.click(closePopupBtn)
    })
  })

  it('should not reset form when response is not 200 or 500 and display error message', async () => {
    server.use(
      http.get('*/user', () =>
        HttpResponse.json(
          { status: 'failedTransaction', message: 'Erroneous response' },
          { status: 400 }
        )
      )
    )

    render(<AddStudent {...{ user }} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')

    await act(() => {
      fireEvent.change(email, {
        target: { value: mockStudent.email },
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(email).toHaveValue(mockStudent.email)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erroneous response')
    })

    expect(email).toHaveValue(mockStudent.email)
  })

  it('should not reset form when response is 500 and display error message', async () => {
    server.use(
      http.get('*/user', () =>
        HttpResponse.json(
          { status: 'internalServerError', message: 'Server error' },
          { status: 500 }
        )
      )
    )
    render(<AddStudent {...{ user }} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')

    await act(() => {
      fireEvent.change(email, {
        target: { value: mockStudent.email },
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(email).toHaveValue(mockStudent.email)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to find student due to an internal error. Please try again later.'
      )
    })

    expect(email).toHaveValue(mockStudent.email)
  })

  it('should not reset form when error is thrown with no response', async () => {
    server.use(http.get('*/user', () => HttpResponse.error()))
    render(<AddStudent {...{ user }} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')

    await act(() => {
      fireEvent.change(email, {
        target: { value: mockStudent.email },
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(email).toHaveValue(mockStudent.email)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
    })
  })
})
