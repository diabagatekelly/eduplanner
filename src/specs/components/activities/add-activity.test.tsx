import AddActivity from '../../../components/activities/add-activity'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { mockUser, mockActivity } from '../../../specs/mocks'
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

describe('Add activity', () => {
  const userDetails = { ...mockUser }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render form to add an activity', async () => {
    render(<AddActivity {...{ userDetails }} />)

    const heading = await screen.findByRole('heading', { level: 3 })
    const addActivityForm = await screen.findByTestId('add-activity-form')

    expect(heading).toHaveTextContent('Add a new activity:')
    expect(addActivityForm).toBeInTheDocument()
  })

  it('should invoke createActivity controller when form is submitted', async () => {
    render(<AddActivity {...{ userDetails }} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText('Description (optional):')
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/Yes/i)
    const submitButton = screen.getByTestId('add-activity-btn')

    await act(() => {
      fireEvent.change(name, {
        target: { value: 'Quran' },
      })
      fireEvent.change(description, {
        target: { value: 'Quran memorization' },
      })
      fireEvent.change(points, {
        target: { value: '15' },
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(name).toHaveValue('')
    })
  })

  it('should not create pre-existing user activity', async () => {
    const userDetails = { ...mockUser, activities: [{ name: 'Quran' }] }
    render(<AddActivity {...{ userDetails }} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText('Description (optional):')
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/Yes/i)
    const submitButton = screen.getByTestId('add-activity-btn')

    await act(() => {
      fireEvent.change(name, {
        target: { value: 'Quran' },
      })
      fireEvent.change(description, {
        target: { value: 'Quran memorization' },
      })
      fireEvent.change(points, {
        target: { value: '15' },
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith('This is already one of your activities.')
    })
    expect(name).toHaveValue('')
    expect(description).toHaveValue('')
    expect(points).toHaveValue(0)
  })

  it('should reset form when response is successful and display success message, then reset message when form in focus', async () => {
    server.use(
      http.post('*/user/activities/add', () =>
        HttpResponse.json({
          message: 'Successfully created activity.',
          details: { userId: userDetails.userId, userActivity: mockActivity },
        })
      )
    )

    render(<AddActivity {...{ userDetails }} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText('Description (optional):')
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/Yes/i)
    const submitButton = screen.getByTestId('add-activity-btn')

    await act(() => {
      fireEvent.change(name, {
        target: { value: 'Quran' },
      })
      fireEvent.change(description, {
        target: { value: 'Quran memorization' },
      })
      fireEvent.change(points, {
        target: { value: '15' },
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Successfully created activity.')
    })
    expect(name).toHaveValue('')
    expect(description).toHaveValue('')
    expect(points).toHaveValue(0)
  })

  it('should not reset form when response is not 200 or 500 and display error message', async () => {
    server.use(
      http.post('*/user/activities/add', () =>
        HttpResponse.json(
          { status: 'failedTransaction', message: 'Erroneous response' },
          { status: 400 }
        )
      )
    )

    render(<AddActivity {...{ userDetails }} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText('Description (optional):')
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/Yes/i)
    const submitButton = screen.getByTestId('add-activity-btn')

    await act(() => {
      fireEvent.change(name, {
        target: { value: 'Quran' },
      })
      fireEvent.change(description, {
        target: { value: 'Quran memorization' },
      })
      fireEvent.change(points, {
        target: { value: '15' },
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(name).toHaveValue('Quran')
    expect(description).toHaveValue('Quran memorization')
    expect(points).toHaveValue(15)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erroneous response')
    })

    expect(name).toHaveValue('Quran')
    expect(description).toHaveValue('Quran memorization')
    expect(points).toHaveValue(15)
  })

  it('should not reset form when response is 500 and display error message', async () => {
    server.use(
      http.post('*/user/activities/add', () =>
        HttpResponse.json(
          { status: 'internalServerError', message: 'Server error' },
          { status: 500 }
        )
      )
    )
    render(<AddActivity {...{ userDetails }} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText('Description (optional):')
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/Yes/i)
    const submitButton = screen.getByTestId('add-activity-btn')

    await act(() => {
      fireEvent.change(name, {
        target: { value: 'Quran' },
      })
      fireEvent.change(description, {
        target: { value: 'Quran memorization' },
      })
      fireEvent.change(points, {
        target: { value: '15' },
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(name).toHaveValue('Quran')
    expect(description).toHaveValue('Quran memorization')
    expect(points).toHaveValue(15)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to create activity due to an internal error. Please try again later.'
      )
    })

    expect(name).toHaveValue('Quran')
    expect(description).toHaveValue('Quran memorization')
    expect(points).toHaveValue(15)
  })

  it('should not reset form when error is thrown with no response', async () => {
    server.use(http.post('*/user/activities/add', () => HttpResponse.error()))
    render(<AddActivity {...{ userDetails }} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText('Description (optional):')
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/No/i)
    const submitButton = screen.getByTestId('add-activity-btn')

    await act(() => {
      fireEvent.change(name, {
        target: { value: 'Quran' },
      })
      fireEvent.change(description, {
        target: { value: 'Quran memorization' },
      })
      fireEvent.change(points, {
        target: { value: '15' },
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(name).toHaveValue('Quran')
    expect(description).toHaveValue('Quran memorization')
    expect(points).toHaveValue(15)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
    })
  })
})
