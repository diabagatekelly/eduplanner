import ViewActivity from '../../../components/activities/view-activity'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { editActivity, requestCardReview } from '../../../api/controller';
import { mockUser, mockActivity, mockStudent } from '../../mocks';
import { CompletionStatus } from '../../../interfaces/CompletionStatusEnum';
import ListUi from "../../../components/lists/lists-ui";
import { ISODateString } from '../../../interfaces/isoDateType';

jest.mock('../../../components/lists/lists-ui');
jest.mock('../../../api/controller');
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
  }
});

describe('View activity', () => {
  const userDetails = {...mockUser, activities: [mockActivity]}
  const reload = window.location.reload;

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() }
    });
    sessionStorage.setItem("user_data", JSON.stringify(userDetails))
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/3/2024'))
  })

  afterAll(() => {
    sessionStorage.clear()
    window.location.reload = reload;
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  describe('Display', () => {
    beforeEach(() => {
      sessionStorage.setItem("user_data", JSON.stringify(userDetails))
    })

    it('should render user activity details', async () => {
      render(<ViewActivity {...{userDetails: userDetails, userActivity: mockActivity, isMain: true}} />)
   
      const heading = await screen.findByTestId('activity-name')
      const activityDetails = await screen.findByTestId('activity-details')
   
      expect(heading).toHaveTextContent('Quran')
      expect(activityDetails).toHaveTextContent('Description: Quran memorization')
      expect(activityDetails).toHaveTextContent('Points: 15 points')
      expect(activityDetails).toHaveTextContent('Status: pending')
      expect(activityDetails).toHaveTextContent('Last Updated: Never')
    })
  
    it('should display ListUi for cards', () => {
      (ListUi as jest.Mock).mockImplementation(() => null);
      render(<ViewActivity {...{userDetails, userActivity: mockActivity, isMain: true}} />)
      const listUi = (ListUi as jest.Mock).mock.calls[0][0];
      expect(listUi.listType).toEqual('cards')
      expect(listUi.isMain).toEqual(true)
      expect(listUi.userDetails).toMatchObject(userDetails)
      expect(listUi.activity).toMatchObject(mockActivity)
    })
  
    describe('Activity update button', () => {
      it('should display active green button if activity is not completed', async () => {
        render(<ViewActivity {...{userDetails: userDetails, userActivity: mockActivity, isMain: true}} />)
        const button = await screen.findByTestId('activity-update-btn');
  
        expect(button).not.toBeDisabled()
        expect(button).toHaveClass('green-btn')
        expect(button).toHaveTextContent('Mark completed')
      })
  
      it('should display disabled gray button if activity is completed', async () => {
        const activity = {...mockActivity, completionStatus: CompletionStatus.COMPLETED}
        const withCompletedActivity = {...userDetails, activities: [activity]}
        render(<ViewActivity {...{userDetails: withCompletedActivity, userActivity: activity, isMain: true}} />)
        const button = await screen.findByTestId('activity-update-btn');
  
        expect(button).toBeDisabled()
        expect(button).toHaveClass('disabled-btn')
        expect(button).toHaveTextContent('Already completed')
      })
    })
  })

  describe('Prevent submitting', () => {
    const lazyUser = {...mockUser, activities: [{...mockActivity, cards: [{completionStatus: CompletionStatus.PENDING}]}]}
    beforeEach(() => {
      sessionStorage.setItem("user_data", JSON.stringify(lazyUser))
    })

    it('should not submit and display message if any card is not COMPLETED or is INACTIVE', async () => {
      render(<ViewActivity {...{userDetails: lazyUser, userActivity: {...mockActivity, cards: [{completionStatus: CompletionStatus.PENDING}]}, isMain: true}} />)
      const button = await screen.findByTestId('activity-update-btn');
      const submitMessage = await screen.findByTestId('update-activity-outcome')
      
      await act(async () => {
        await fireEvent.click(button)
      })

      await expect(editActivity).not.toHaveBeenCalled()
      await expect(requestCardReview).not.toHaveBeenCalled()
      expect(submitMessage).toHaveTextContent('You still have some cards to complete!!')
    })
  })

  describe('Update activity', () => {
    beforeEach(() => {
      sessionStorage.setItem("user_data", JSON.stringify(userDetails))
    })

    it('should invoke editActivity controller when button is clicked', async () => {
      const userActivityDTO = {...mockActivity, completionStatus: CompletionStatus.COMPLETED, lastUpdatedOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString};
      (editActivity as jest.Mock).mockImplementation(() => {
        return Promise.resolve({status: 200, data: {message: null, details: userActivityDTO}})
      })

      render(<ViewActivity {...{userDetails: userDetails, userActivity: mockActivity, isMain: true}} />)
      const button = await screen.findByTestId('activity-update-btn');
      await act(async () => {
        await fireEvent.click(button)
      })
      
      await expect(editActivity).toHaveBeenCalledWith({userId: userDetails.userId, updatedActivity: userActivityDTO})
    })

    it('should display success message, then reload', async () => {
      const updatedActivity = {
        ...mockActivity,
        completionStatus: CompletionStatus.COMPLETED,
        lastUpdatedOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString
      };
      (editActivity as jest.Mock).mockImplementation(() => {
        return Promise.resolve({status: 200, data: {message: 'Success', details: updatedActivity}})
      });

      render(<ViewActivity {...{userDetails, userActivity: mockActivity, isMain: true}} />)
      const button = await screen.findByTestId('activity-update-btn');
      const submitMessage = await screen.findByTestId('update-activity-outcome')
      
      await act(async () => {
        await fireEvent.click(button)
      })

      expect(submitMessage).toHaveTextContent("Success")
      expect(window.location.reload).toHaveBeenCalled()
    })

    it('should not reload when response is not 200 or 500 and display error message', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => null);

      const error = {response: {status: 400, data: {status: 'failedTransaction', message: 'Erroneous response'}}};
      (editActivity as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })

      render(<ViewActivity {...{userDetails, userActivity: mockActivity, isMain: true}} />)
      const button = await screen.findByTestId('activity-update-btn');

      await act(async () => {
        await fireEvent.click(button)
      })

      const errorMessage = await screen.findByText(/Erroneous response/i)
      expect(errorMessage).toBeInTheDocument()
      expect(window.location.reload).not.toHaveBeenCalled()
    })

    it('should not reload when response is 500 and display error message', async () => {
      const error = {response: {status: 500, data: {status: 'internalServerError', message: 'Server error'}}};
      (editActivity as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })
      render(<ViewActivity {...{userDetails, userActivity: mockActivity, isMain: true}} />)
      const button = await screen.findByTestId('activity-update-btn');

      await act(async () => {
        await fireEvent.click(button)
      })

      const errorMessage = await screen.getByText(/Failed to edit activity due to an internal error. Please try again later./i)
    
      expect(errorMessage).toBeInTheDocument()
      expect(console.log).toHaveBeenCalledWith(error)
      expect(window.location.reload).not.toHaveBeenCalled()
    })

    it('should not reload when error is thrown with no response', async () => {
      (editActivity as jest.Mock).mockImplementation(() => {
        return Promise.reject({status: 500, message: 'Error thrown and caught.'});
      });
      
      render(<ViewActivity {...{userDetails, userActivity: mockActivity, isMain: true}} />)
      const button = await screen.findByTestId('activity-update-btn');

      await act(async () => {
        await fireEvent.click(button)
      })

      const errorMessage = await screen.getByText(/Server is down. Try again later./i)
      expect(errorMessage).toBeInTheDocument()  
      expect(console.log).toHaveBeenCalledWith({status: 500, message: 'Error thrown and caught.'})
    })
  })

  describe('Submit for review', () => {
    const studentUserDetails = {...mockStudent, activities: [mockActivity]}
    beforeEach(() => {
      sessionStorage.setItem("user_data", JSON.stringify(studentUserDetails))
    })

    describe('Activity update button', () => {
      it('should display active green button if activity is not completed', async () => {
        render(<ViewActivity {...{userDetails: studentUserDetails, userActivity: mockActivity, isMain: true}} />)
        const button = await screen.findByTestId('activity-update-btn');
  
        expect(button).not.toBeDisabled()
        expect(button).toHaveClass('green-btn')
        expect(button).toHaveTextContent('Request review')
      })
  
      it('should display disabled gray button if activity is completed', async () => {
        const activity = {...mockActivity, completionStatus: CompletionStatus.COMPLETED}
        const withCompletedActivity = {...studentUserDetails, activities: [activity]}
        render(<ViewActivity {...{userDetails: withCompletedActivity, userActivity: activity, isMain: true}} />)
        const button = await screen.findByTestId('activity-update-btn');
  
        expect(button).toBeDisabled()
        expect(button).toHaveClass('disabled-btn')
        expect(button).toHaveTextContent('Already completed')
      })
    })

    it('should invoke requestCardReview controller when button is clicked', async () => {
      const userActivityDTO = {...mockActivity, completionStatus: CompletionStatus.REVIEW, lastUpdatedOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString};
      (requestCardReview as jest.Mock).mockImplementation(() => {
        return Promise.resolve({status: 200, data: {message: null, details: {}}})
      });

      (editActivity as jest.Mock).mockImplementation(() => {
        return Promise.resolve({status: 200, data: {message: null, details: userActivityDTO}})
      });

      render(<ViewActivity {...{userDetails: studentUserDetails, userActivity: mockActivity, isMain: true}} />)
      const button = await screen.findByTestId('activity-update-btn');
      await act(async () => {
        await fireEvent.click(button)
      })
      
      const requestReviewDTO = {
        id: mockActivity.activityId,
        teacherId: studentUserDetails.linkedAccountsData.teacher,
        student: {
          id: studentUserDetails.userId,
          fullName: `${studentUserDetails.firstName} ${studentUserDetails.lastName}`,
          email: studentUserDetails.email
        }
      }

      
      await expect(requestCardReview).toHaveBeenCalledWith(requestReviewDTO)
      await expect(editActivity).toHaveBeenCalledWith({userId: studentUserDetails.userId, updatedActivity: userActivityDTO})
    })

    it('should display success message, then reload', async () => {
      const updatedActivity = {
        ...mockActivity,
        completionStatus: CompletionStatus.REVIEW,
        lastUpdatedOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString
      };
      (editActivity as jest.Mock).mockImplementation(() => {
        return Promise.resolve({status: 200, data: {message: 'Success', details: updatedActivity}})
      });

      (requestCardReview as jest.Mock).mockImplementation(() => {
        return Promise.resolve({status: 200, data: {message: null, details: {}}})
      });

      render(<ViewActivity {...{userDetails: studentUserDetails, userActivity: mockActivity, isMain: true}} />)
      const button = await screen.findByTestId('activity-update-btn');
      const submitMessage = await screen.findByTestId('update-activity-outcome')
      
      await act(async () => {
        await fireEvent.click(button)
      })

      expect(submitMessage).toHaveTextContent('Request for review successfully sent.')
      expect(window.location.reload).toHaveBeenCalled()
    })

    it('should not reload when response is not 200 or 500 and display error message', async () => {
      const error = {response: {status: 400, data: {status: 'failedTransaction', message: 'Erroneous response'}}};
      (requestCardReview as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })

      render(<ViewActivity {...{userDetails: studentUserDetails, userActivity: mockActivity, isMain: true}} />)
      const button = await screen.findByTestId('activity-update-btn');

      await act(async () => {
        await fireEvent.click(button)
      })

      const errorMessage = await screen.findByText(/Erroneous response/i)
      expect(errorMessage).toBeInTheDocument()
      expect(window.location.reload).not.toHaveBeenCalled()
    })

    it('should not reload when response is 500 and display error message', async () => {
      const error = {response: {status: 500, data: {status: 'internalServerError', message: 'Server error'}}};
      (requestCardReview as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })
      render(<ViewActivity {...{userDetails: studentUserDetails, userActivity: mockActivity, isMain: true}} />)
      const button = await screen.findByTestId('activity-update-btn');

      await act(async () => {
        await fireEvent.click(button)
      })

      const errorMessage = await screen.getByText(/Failed to request review due to an internal error. Please try again later./i)
    
      expect(errorMessage).toBeInTheDocument()
      expect(console.log).toHaveBeenCalledWith(error)
      expect(window.location.reload).not.toHaveBeenCalled()
    })

    it('should not reload when error is thrown with no response', async () => {
      (requestCardReview as jest.Mock).mockImplementation(() => {
        return Promise.reject({status: 500, message: 'Error thrown and caught.'});
      });
      render(<ViewActivity {...{userDetails: studentUserDetails, userActivity: mockActivity, isMain: true}} />)
      const button = await screen.findByTestId('activity-update-btn');

      await act(async () => {
        await fireEvent.click(button)
      })

      const errorMessage = await screen.getByText(/Server is down. Try again later./i)
      expect(errorMessage).toBeInTheDocument()  
      expect(console.log).toHaveBeenCalledWith({status: 500, message: 'Error thrown and caught.'})
    })
  })
})