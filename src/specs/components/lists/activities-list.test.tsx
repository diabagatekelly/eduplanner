import ActivitiesList from '../../../components/lists/activities-list'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { IUser } from '../../../types/IUser'
import { mockActivity, mockStudent, mockUser } from '../../mocks'
import store from '../../../store/store'
import { deleteActivity } from '../../../api/controller'
import { CompletionStatus } from '../../../types/CompletionStatusEnum'

jest.mock('../../../api/controller')
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
    usePathname: jest.fn(() => 'localhost/mock-user'),
  }
})

describe('Activities List', () => {
  describe('No activities', () => {
    const teacher: IUser = { ...mockUser, activities: [] }

    beforeEach(() => {
      const mockStoreState = { authReducer: { isAuthenticated: true }, userReducer: teacher }
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState)
    })

    it('should display "no activities" message when uer has no activities', () => {
      render(<ActivitiesList {...{ isMain: true, userDetails: teacher }} />)
      const noActivities = screen.getByTestId('no-activities-message')
      expect(noActivities).toHaveTextContent('You have no activities yet.')
    })
  })

  describe('With activities', () => {
    const mockActivity1 = mockActivity
    const mockActivity2 = { ...mockActivity, name: 'Reading' }
    const student = {
      ...mockStudent,
      activities: [{ ...mockActivity1, completionStatus: CompletionStatus.COMPLETED }],
    }
    const teacher: IUser = {
      ...mockUser,
      activities: [
        mockActivity1,
        { ...mockActivity2, completionStatus: CompletionStatus.DELINQUENT },
      ],
    }

    beforeEach(() => {
      const mockStoreState = { authReducer: { isAuthenticated: true }, userReducer: teacher }
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState)
    })

    it('should display list of activities', async () => {
      render(<ActivitiesList {...{ isMain: true, userDetails: teacher }} />)
      const activitiesList = screen.getAllByTestId('activity-in-list')
      expect(activitiesList).toHaveLength(2)
      expect(activitiesList[0]).toHaveTextContent('Quran')
      expect(activitiesList[1]).toHaveTextContent('Reading')
    })

    it('should fetch activity for main user', async () => {
      render(<ActivitiesList {...{ isMain: true, userDetails: teacher }} />)
      const activitiesList = screen.getAllByTestId('activity-in-list')

      const useRouter = jest.spyOn(require('next/navigation'), 'useRouter')
      useRouter.mockImplementation(() => ({
        push: jest.fn(),
      }))

      await act(async () => {
        await fireEvent.click(activitiesList[0])
      })

      expect(useRouter.mock.results[1].value.push).toHaveBeenCalledWith(
        '/mock-user/activities/Quran'
      )
    })

    it('should fetch activity for non-main user', async () => {
      render(<ActivitiesList {...{ isMain: false, userDetails: student }} />)
      const activitiesList = screen.getAllByTestId('activity-in-list')

      const useRouter = jest.spyOn(require('next/navigation'), 'useRouter')

      useRouter.mockImplementation(() => ({
        push: jest.fn(),
      }))

      await act(async () => {
        await fireEvent.click(activitiesList[0])
      })

      expect(useRouter.mock.results[1].value.push).toHaveBeenCalledWith(
        '/mock-user/students/mock-student/activities/Quran'
      )
    })

    it('should delete activity for main user', async () => {
      render(<ActivitiesList {...{ isMain: true, userDetails: teacher }} />)
      const deleteActivitiesList = screen.getAllByTestId('delete-activities-in-list')
      ;(deleteActivity as jest.Mock).mockImplementation(() => {
        return Promise.resolve({
          status: 200,
          data: { message: 'Activity deleted.', details: { activity: mockActivity } },
        })
      })

      await act(async () => {
        await fireEvent.click(deleteActivitiesList[0])
      })

      const deleteActivityPopup = screen.getByTestId('delete-activity-popup')
      const expectedPopupText = 'Are you sure you want to delete this activity?'

      expect(deleteActivityPopup).toBeVisible()
      expect(deleteActivityPopup).toHaveTextContent(expectedPopupText)
      expect(deleteActivityPopup).toHaveTextContent('Quran')

      const closeDeleteActivityPopupBtn = screen.getByTestId('delete-activity-popup-close-btn')
      await act(async () => {
        await fireEvent.click(closeDeleteActivityPopupBtn)
      })

      expect(deleteActivityPopup).not.toBeVisible()
    })
  })
})
