import UnlinkAccountPopup from '../../../components/popups/unlinkAccountPopup'
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

describe('Unlink Account Popup', () => {
  const teacher = { ...mockUser, linkedAccountsData: { students: [mockStudent.userId] } }
  const childArgs = { user: mockStudent, teacherId: teacher.userId }

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should show error when teacherId is missing and submit is clicked', async () => {
    const args = { user: mockStudent }
    render(<UnlinkAccountPopup {...{ onClose: jest.fn(), showModal: true, ...args }} />)
    const submitButton = screen.getByTestId('unlink-accounts-btn')
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

    render(<UnlinkAccountPopup {...{ onClose, showModal: true, ...childArgs }} />)

    const heading = await screen.findByRole('heading', { level: 3 })
    const studentInfo = await screen.findByRole('heading', { level: 5 })

    expect(heading).toHaveTextContent('Are you sure you want to remove this student?')
    expect(studentInfo).toHaveTextContent('mock.student@email.com')
  })

  it('should show success toast and close popup after unlinking account', async () => {
    const onClose = jest.fn()

    render(<UnlinkAccountPopup {...{ onClose, showModal: true, ...childArgs }} />)

    const submitButton = screen.getByTestId('unlink-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Successfully removed student.')
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('should close popup when response is successful and display success message', async () => {
    let showModal = true

    render(
      <UnlinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('unlink-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Successfully removed student.')
    })
  })

  it('should not close popup when response is not 200 or 500 and display error message', async () => {
    server.use(
      http.delete('*/user/linked-accounts/delete/*', () =>
        HttpResponse.json(
          { status: 'failedTransaction', message: 'Erroneous response' },
          { status: 400 }
        )
      )
    )

    let showModal = true

    render(
      <UnlinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('unlink-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erroneous response')
    })
  })

  it('should not close popup when response is 500 and display error message', async () => {
    server.use(
      http.delete('*/user/linked-accounts/delete/*', () =>
        HttpResponse.json(
          { status: 'internalServerError', message: 'Server error' },
          { status: 500 }
        )
      )
    )

    let showModal = true

    render(
      <UnlinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('unlink-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to unlink accounts due to an internal error. Please try again later.'
      )
    })
  })

  it('should not close popup when error is thrown with no response', async () => {
    server.use(http.delete('*/user/linked-accounts/delete/*', () => HttpResponse.error()))
    let showModal = true

    render(
      <UnlinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('unlink-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
    })
  })
})
