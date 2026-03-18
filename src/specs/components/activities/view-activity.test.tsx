import ViewActivity from '../../../components/activities/view-activity'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { mockUser, mockActivity, mockStudent } from '../../mocks'
import { CompletionStatus } from '../../../types/CompletionStatusEnum'
import ListUi from '../../../components/lists/lists-ui'
import { toast } from 'sonner'

import { server } from '../../msw/server'
import { http, HttpResponse } from 'msw'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('../../../components/lists/lists-ui')
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

describe('View activity', () => {
  const userDetails = { ...mockUser, activities: [mockActivity] }

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2/3/2024').getTime())
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('Display', () => {
    it('should render user activity details', async () => {
      render(
        <ViewActivity {...{ userDetails: userDetails, userActivity: mockActivity, isMain: true }} />
      )

      const heading = await screen.findByTestId('activity-name')
      const activityDetails = await screen.findByTestId('activity-details')

      expect(heading).toHaveTextContent('Quran')
      expect(activityDetails).toHaveTextContent('Description: Quran memorization')
      expect(activityDetails).toHaveTextContent('Points: 15 points')
      expect(activityDetails).toHaveTextContent('Status: pending')
      expect(activityDetails).toHaveTextContent('Last Updated: Never')
    })

    it('should display ListUi for cards', () => {
      ;(ListUi as jest.Mock).mockImplementation(() => null)
      render(<ViewActivity {...{ userDetails, userActivity: mockActivity, isMain: true }} />)
      const listUi = (ListUi as jest.Mock).mock.calls[0][0]
      expect(listUi.listType).toEqual('cards')
      expect(listUi.isMain).toEqual(true)
      expect(listUi.userDetails).toMatchObject(userDetails)
      expect(listUi.activity).toMatchObject(mockActivity)
    })

    describe('Activity update button', () => {
      it('should display active green button if activity is not completed', async () => {
        render(
          <ViewActivity
            {...{ userDetails: userDetails, userActivity: mockActivity, isMain: true }}
          />
        )
        const button = await screen.findByTestId('activity-update-btn')

        expect(button).not.toBeDisabled()
        expect(button).toHaveClass('green-btn')
        expect(button).toHaveTextContent('Mark completed')
      })

      it('should display disabled gray button if activity is completed', async () => {
        const activity = { ...mockActivity, completionStatus: CompletionStatus.COMPLETED }
        const withCompletedActivity = { ...userDetails, activities: [activity] }
        render(
          <ViewActivity
            {...{ userDetails: withCompletedActivity, userActivity: activity, isMain: true }}
          />
        )
        const button = await screen.findByTestId('activity-update-btn')

        expect(button).toBeDisabled()
        expect(button).toHaveClass('disabled-btn')
        expect(button).toHaveTextContent('Already completed')
      })
    })
  })

  describe('Prevent submitting', () => {
    const lazyUser = {
      ...mockUser,
      activities: [{ ...mockActivity, cards: [{ completionStatus: CompletionStatus.PENDING }] }],
    }

    it('should not submit and display message if any card is not COMPLETED or is INACTIVE', async () => {
      render(
        <ViewActivity
          {...{
            userDetails: lazyUser,
            userActivity: {
              ...mockActivity,
              cards: [{ completionStatus: CompletionStatus.PENDING }],
            },
            isMain: true,
          }}
        />
      )
      const button = await screen.findByTestId('activity-update-btn')

      await act(async () => {
        await fireEvent.click(button)
      })

      expect(toast.warning).toHaveBeenCalledWith('You still have some cards to complete!!')
    })
  })

  describe('Update activity', () => {
    it('should invoke editActivity controller when button is clicked', async () => {
      server.use(
        http.patch('*/user/activities/edit', () =>
          HttpResponse.json({ message: 'Activity updated', details: mockActivity })
        )
      )

      render(
        <ViewActivity {...{ userDetails: userDetails, userActivity: mockActivity, isMain: true }} />
      )
      const button = await screen.findByTestId('activity-update-btn')
      await act(async () => {
        await fireEvent.click(button)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Activity updated')
      })
    })

    it('should display success message', async () => {
      server.use(
        http.patch('*/user/activities/edit', () =>
          HttpResponse.json({ message: 'Success', details: mockActivity })
        )
      )

      render(<ViewActivity {...{ userDetails, userActivity: mockActivity, isMain: true }} />)
      const button = await screen.findByTestId('activity-update-btn')

      await act(async () => {
        await fireEvent.click(button)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Success')
      })
    })

    it('should display error message when response is not 200 or 500', async () => {
      server.use(
        http.patch('*/user/activities/edit', () =>
          HttpResponse.json(
            { status: 'failedTransaction', message: 'Erroneous response' },
            { status: 400 }
          )
        )
      )

      render(<ViewActivity {...{ userDetails, userActivity: mockActivity, isMain: true }} />)
      const button = await screen.findByTestId('activity-update-btn')

      await act(async () => {
        await fireEvent.click(button)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erroneous response')
      })
    })

    it('should display error message when response is 500', async () => {
      server.use(
        http.patch('*/user/activities/edit', () =>
          HttpResponse.json(
            { status: 'internalServerError', message: 'Server error' },
            { status: 500 }
          )
        )
      )
      render(<ViewActivity {...{ userDetails, userActivity: mockActivity, isMain: true }} />)
      const button = await screen.findByTestId('activity-update-btn')

      await act(async () => {
        await fireEvent.click(button)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to edit activity due to an internal error. Please try again later.'
        )
      })
    })

    it('should display error message when error has no response', async () => {
      server.use(http.patch('*/user/activities/edit', () => HttpResponse.error()))

      render(<ViewActivity {...{ userDetails, userActivity: mockActivity, isMain: true }} />)
      const button = await screen.findByTestId('activity-update-btn')

      await act(async () => {
        await fireEvent.click(button)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
      })
    })
  })

  describe('Submit for review', () => {
    const studentUserDetails = { ...mockStudent, activities: [mockActivity] }

    describe('Activity update button', () => {
      it('should display active green button if activity is not completed', async () => {
        render(
          <ViewActivity
            {...{ userDetails: studentUserDetails, userActivity: mockActivity, isMain: true }}
          />
        )
        const button = await screen.findByTestId('activity-update-btn')

        expect(button).not.toBeDisabled()
        expect(button).toHaveClass('green-btn')
        expect(button).toHaveTextContent('Request review')
      })

      it('should display disabled gray button if activity is completed', async () => {
        const activity = { ...mockActivity, completionStatus: CompletionStatus.COMPLETED }
        const withCompletedActivity = { ...studentUserDetails, activities: [activity] }
        render(
          <ViewActivity
            {...{ userDetails: withCompletedActivity, userActivity: activity, isMain: true }}
          />
        )
        const button = await screen.findByTestId('activity-update-btn')

        expect(button).toBeDisabled()
        expect(button).toHaveClass('disabled-btn')
        expect(button).toHaveTextContent('Already completed')
      })
    })

    it('should invoke requestCardReview controller when button is clicked', async () => {
      render(
        <ViewActivity
          {...{ userDetails: studentUserDetails, userActivity: mockActivity, isMain: true }}
        />
      )
      const button = await screen.findByTestId('activity-update-btn')
      await act(async () => {
        await fireEvent.click(button)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Request for review successfully sent.')
      })
    })

    it('should display success message', async () => {
      render(
        <ViewActivity
          {...{ userDetails: studentUserDetails, userActivity: mockActivity, isMain: true }}
        />
      )
      const button = await screen.findByTestId('activity-update-btn')

      await act(async () => {
        await fireEvent.click(button)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Request for review successfully sent.')
      })
    })

    it('should display error message when response is not 200 or 500', async () => {
      server.use(
        http.post('*/user/cards/request-review', () =>
          HttpResponse.json(
            { status: 'failedTransaction', message: 'Erroneous response' },
            { status: 400 }
          )
        )
      )

      render(
        <ViewActivity
          {...{ userDetails: studentUserDetails, userActivity: mockActivity, isMain: true }}
        />
      )
      const button = await screen.findByTestId('activity-update-btn')

      await act(async () => {
        await fireEvent.click(button)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erroneous response')
      })
    })

    it('should display error message when response is 500', async () => {
      server.use(
        http.post('*/user/cards/request-review', () =>
          HttpResponse.json(
            { status: 'internalServerError', message: 'Server error' },
            { status: 500 }
          )
        )
      )
      render(
        <ViewActivity
          {...{ userDetails: studentUserDetails, userActivity: mockActivity, isMain: true }}
        />
      )
      const button = await screen.findByTestId('activity-update-btn')

      await act(async () => {
        await fireEvent.click(button)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to request review due to an internal error. Please try again later.'
        )
      })
    })

    it('should display error message when error has no response', async () => {
      server.use(http.post('*/user/cards/request-review', () => HttpResponse.error()))
      render(
        <ViewActivity
          {...{ userDetails: studentUserDetails, userActivity: mockActivity, isMain: true }}
        />
      )
      const button = await screen.findByTestId('activity-update-btn')

      await act(async () => {
        await fireEvent.click(button)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
      })
    })
  })
})
