import LinkAccountPopup from '../../../components/popups/linkAccountPopup'
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

describe('Link Account Popup', () => {
  const teacher = { ...mockUser, accountType: 'teacher', linkedAccountsData: { students: [] } }
  const newStudent = { ...mockStudent }
  const childArgs = { newStudent, user: teacher }

  it('should show error when teacherId is missing and submit is clicked', async () => {
    const args = { user: {} as any, newStudent: {} as any }
    render(<LinkAccountPopup {...{ onClose: jest.fn(), showModal: true, ...args }} />)
    const submitButton = screen.getByTestId('link-accounts-btn')
    await act(async () => {
      await fireEvent.click(submitButton)
    })
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
    })
  })

  it('should render popup to add new student', async () => {
    let showModal
    let onClose = () => {
      showModal = false
    }

    render(<LinkAccountPopup {...{ onClose, showModal: true, ...childArgs }} />)

    const heading = await screen.findByRole('heading', { level: 3 })
    const studentInfo = await screen.findByRole('heading', { level: 5 })

    expect(heading).toHaveTextContent('Are you sure you want to add this student?')
    expect(studentInfo).toHaveTextContent('mock student - mock.student@email.com')
  })

  it('should invoke linkAccount controller when form is submitted', async () => {
    const onClose = jest.fn()

    render(<LinkAccountPopup {...{ onClose, showModal: true, ...childArgs }} />)

    const submitButton = screen.getByTestId('link-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
    let showModal = true

    render(
      <LinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('link-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Successfully added a new student')
    })
  })

  it('should not close popup when response is not 200 or 500 and display error message', async () => {
    server.use(
      http.post('*/user/linked-accounts/add', () =>
        HttpResponse.json(
          { status: 'failedTransaction', message: 'Erroneous response' },
          { status: 400 }
        )
      )
    )

    let showModal = true

    render(
      <LinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('link-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erroneous response')
    })
  })

  it('should not close popup when response is 500 and display error message', async () => {
    server.use(
      http.post('*/user/linked-accounts/add', () =>
        HttpResponse.json(
          { status: 'internalServerError', message: 'Server error' },
          { status: 500 }
        )
      )
    )

    let showModal = true

    render(
      <LinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('link-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to add new student due to an internal error. Please try again later.'
      )
    })
  })

  it('should not close popup when error is thrown with no response', async () => {
    server.use(http.post('*/user/linked-accounts/add', () => HttpResponse.error()))

    let showModal = true

    render(
      <LinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('link-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
    })
  })
})
