import DeleteAccountPopup from '../../../components/popups/deleteAccountPopup';
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { deleteUser } from '../../../api/controller';
import { mockUser } from '../../../specs/mocks';
import { useRouter } from 'next/navigation';
import store from '../../../store/store';

jest.mock('../../../api/controller');
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(),
    usePathname: jest.fn()
  }
});

describe('Delete Account Popup', () => {
  const childArgs = {user: mockUser}

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

  it('should render popup to delete account for main', async () => {
    let showModal;
    let onClose = () => {showModal = false};

    render(<DeleteAccountPopup {...{onClose, showModal: true, ...childArgs}} />)
 
    const heading = await screen.findByRole('heading', { level: 3 })
    const studentInfo = await screen.findByRole('heading', { level: 5 })
 
    expect(heading).toHaveTextContent('Are you sure you want to delete this account forever?')
    expect(studentInfo).toHaveTextContent('mock user - mock.user@email.com')
  })

  it('should invoke deleteAccount controller when form is submitted', async () => {
    (deleteUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: null, details: {}}})
    })

    let showModal;
    let onClose = () => {showModal = false};

    render(<DeleteAccountPopup {...{onClose, showModal: true, ...childArgs}} />)

    const submitButton = screen.getByTestId('delete-account-btn')
    
    await act(async () => {
      await fireEvent.click(submitButton)
    })
    
    await expect(deleteUser).toHaveBeenCalledWith(mockUser.userId)
  })

  it('should not close popup when response is not 200 or 500 and display error message', async () => {
    const error = {response: {status: 400, data: {status: 'failedTransaction', message: 'Erroneous response'}}};
    (deleteUser as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    let showModal = true;
  
    render(<DeleteAccountPopup {...{onClose: () => showModal = false, showModal, ...childArgs}} />)
    const submitButton = await screen.getByTestId('delete-account-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })


    const errorMessage = await screen.findByText(/Erroneous response/i)
    expect(errorMessage).toBeInTheDocument()
  })

  it('should not close popup when response is 500 and display error message', async () => {
    const error = {response: {status: 500, data: {status: 'internalServerError', message: 'Server error'}}};
    (deleteUser as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })
    jest.spyOn(console, 'log')
    let showModal = true;
  
    render(<DeleteAccountPopup {...{onClose: () => showModal = false, showModal, ...childArgs}} />)
    const submitButton = await screen.getByTestId('delete-account-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Failed to delete account due to an internal error. Please try again later./i)
  
    expect(errorMessage).toBeInTheDocument()
    expect(console.log).toHaveBeenCalledWith(error)
  })

  it('should not close popup when error is thrown with no response', async () => {
    (deleteUser as jest.Mock).mockImplementation(() => {
      return Promise.reject({status: 500, message: 'Error thrown and caught.'});
    });
    jest.spyOn(console, 'log')
    let showModal = true;
  
    render(<DeleteAccountPopup {...{onClose: () => showModal = false, showModal, ...childArgs}} />)
    const submitButton = await screen.getByTestId('delete-account-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Server is down. Try again later./i)
    expect(errorMessage).toBeInTheDocument()  
    expect(console.log).toHaveBeenCalledWith({status: 500, message: 'Error thrown and caught.'})
  })

  it('should close popup when response is successful and navigate to register page', async () => {
    (deleteUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: 'Successfully added new student.', details: {}}})
    });
    const mockRouter = {
      push: jest.fn()
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    let showModal = true;
  
    render(<DeleteAccountPopup {...{onClose: () => showModal = false, showModal, ...childArgs}} />)
    const submitButton = await screen.getByTestId('delete-account-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(mockRouter.push).toHaveBeenCalledWith('/register')
  })

  it('should remove auth token and reset user data when delete user successfully', async () => {
    const sessionUserBefore = window.sessionStorage.getItem('user_data');
    const sessionTokenBefore = window.sessionStorage.getItem('user_token');
    const sessionCreatedonBefore = window.sessionStorage.getItem('created_on');

    const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: mockUser}
    const mockStore = jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
    const userInStoreBefore = store.getState().userReducer;

    expect(sessionUserBefore).toBe(JSON.stringify(mockUser));
    expect(sessionTokenBefore).toBe('xxxxxx');
    expect(sessionCreatedonBefore).toBe('2/3/2024');
    expect(userInStoreBefore).toEqual(mockUser);
    
    (deleteUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: 'Successfully added new student.', details: {}}})
    });

    mockStore.mockRestore()
    
    let showModal = true;
  
    render(<DeleteAccountPopup {...{onClose: () => showModal = false, showModal, ...childArgs}} />)
    const submitButton = await screen.getByTestId('delete-account-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const sessionUserAfter = window.sessionStorage.getItem('user_data');
    const sessionTokenAfter = window.sessionStorage.getItem('user_token');
    const sessionCreatedonAfter = window.sessionStorage.getItem('created_on');
    const userInStoreAfter = store.getState().userReducer;

    expect(sessionUserAfter).toBe(null);
    expect(sessionTokenAfter).toBe(null);
    expect(sessionCreatedonAfter).toBe(null);
    expect(userInStoreAfter).toEqual({})
  })
})

