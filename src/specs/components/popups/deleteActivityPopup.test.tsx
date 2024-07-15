import DeleteActivityPopup from '../../../components/popups/deleteActivityPopup';
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { deleteActivity } from '../../../api/controller';
import { mockActivity, mockUser } from '../../../specs/mocks';

jest.mock('../../../api/controller');
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(),
    usePathname: jest.fn()
  }
});

describe('Delete Activity Popup', () => {
  const childArgs = {user: mockUser, item: {activityName: mockActivity.name}}

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/3/2024'))
    window.sessionStorage.setItem('user_data', JSON.stringify(mockUser))
    window.sessionStorage.setItem('user_token', 'xxxxxx')
    window.sessionStorage.setItem('created_on', '2/3/2024')
  })

  afterEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()
    jest.useRealTimers()
  })

  it('should render popup to delete activity for main', async () => {
    let showModal;
    let onClose = () => {showModal = false};

    render(<DeleteActivityPopup {...{onClose, showModal: true, ...childArgs}} />)
 
    const heading = await screen.findByRole('heading', { level: 3 })
    const activtyName = await screen.findByRole('heading', { level: 5 })
 
    expect(heading).toHaveTextContent('Are you sure you want to delete this activity?')
    expect(activtyName).toHaveTextContent('Quran')
  })

  it('should invoke deleteActivity controller when form is submitted', async () => {
    (deleteActivity as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: null, details: {}}})
    })

    let showModal;
    let onClose = () => {showModal = false};

    render(<DeleteActivityPopup {...{onClose, showModal: true, ...childArgs}} />)
    const submitButton = screen.getByTestId('delete-activity-btn')
    
    await act(async () => {
      await fireEvent.click(submitButton)
    })
    
    await expect(deleteActivity).toHaveBeenCalledWith({userId: mockUser.userId, activityName: mockActivity.name})
  })

  it('should not close popup when response is not 200 or 500 and display error message', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => null)
    const error = {response: {status: 400, data: {status: 'failedTransaction', message: 'Erroneous response'}}};
    (deleteActivity as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    let showModal;
    let onClose = () => {showModal = false};
  
    render(<DeleteActivityPopup {...{onClose, showModal: true, ...childArgs}} />)
    const submitButton = screen.getByTestId('delete-activity-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.findByText(/Erroneous response/i)
    expect(errorMessage).toBeInTheDocument()
  })

  it('should not close popup when response is 500 and display error message', async () => {
    const error = {response: {status: 500, data: {status: 'internalServerError', message: 'Server error'}}};
    (deleteActivity as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    let showModal;
    let onClose = () => {showModal = false};
  
    render(<DeleteActivityPopup {...{onClose, showModal: true, ...childArgs}} />)
    const submitButton = screen.getByTestId('delete-activity-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Failed to delete activity due to an internal error. Please try again later./i)
  
    expect(errorMessage).toBeInTheDocument()
    expect(console.log).toHaveBeenCalledWith(error)
  })

  it('should not close popup when error is thrown with no response', async () => {
    (deleteActivity as jest.Mock).mockImplementation(() => {
      return Promise.reject({status: 500, message: 'Error thrown and caught.'});
    });

    let showModal;
    let onClose = () => {showModal = false};

    render(<DeleteActivityPopup {...{onClose, showModal: true, ...childArgs}} />)
    const submitButton = screen.getByTestId('delete-activity-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Server is down. Try again later./i)
    expect(errorMessage).toBeInTheDocument()  
    expect(console.log).toHaveBeenCalledWith({status: 500, message: 'Error thrown and caught.'})
  })

  it('should close popup when response is successful', async () => {
    (deleteActivity as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: 'Successfully deleted activity.', details: {}}})
    });

    let showModal;
    let onClose = () => {showModal = false};

    render(<DeleteActivityPopup {...{onClose, showModal: true, ...childArgs}} />)
    const submitButton = screen.getByTestId('delete-activity-btn')
    const submitMessage = await screen.findByTestId('delete-activity-outcome-message');

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(submitMessage).toHaveTextContent('Successfully deleted activity')
  })

})
