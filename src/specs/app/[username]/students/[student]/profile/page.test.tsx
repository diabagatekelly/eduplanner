import '@testing-library/jest-dom'
import { render } from '../../../../../util';
import { screen, act } from '@testing-library/react'
import * as React from 'react';
import { mockUser, mockStudent } from '../../../../../../specs/mocks';
import store from '../../../../../../store/store';
import Profile from '../../../../../../app/[username]/students/[student]/profile/page';

const student = {...mockStudent, linkedAccountsData: {teacher: btoa('mock.user@email.com')}, lastLogin: '2/15/2024'}
const teacher = {
  ...mockUser,
  linkedAccountsData: {students: [btoa('mock.student@email.com')]}, 
  lastLogin: '2/15/2024',
  students: {'mock-student': student} 
}

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
    usePathname: jest.fn(),
    useParams: jest.fn()
  }
});

describe('Non-main Profile', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/15/2024'))
    window.sessionStorage.setItem('user_data', JSON.stringify(teacher))
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.resetAllMocks()
    window.sessionStorage.clear()
  })

  describe('Non-main student profiles', () => {
    it('should display student from teacher account', async () => {
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: teacher, hashReducer: ''}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      const useParams = jest.spyOn(require("next/navigation"), "useParams")
      useParams.mockReturnValue({student: 'mock-student', username: 'mock-user'})

      render(<Profile />)
      const firstName = await screen.findByTestId("profile-first");
      const lastName = await screen.findByTestId("profile-last");
      const email = await screen.findByTestId("profile-email");
      const accountType = await screen.findByTestId("profile-accountType");
      const linked = await screen.findByTestId("profile-linkedAccounts");
      const loginDate = await screen.findByTestId("profile-login");
    
      expect(firstName).toHaveTextContent('mock')
      expect(lastName).toHaveTextContent('student')
      expect(email).toHaveTextContent('mock.student@email.com')
      expect(accountType).toHaveTextContent('student')
      expect(linked).toHaveTextContent('mock.user@email.com (teacher)')
      expect(loginDate).toHaveTextContent('2/15/2024')
    })
  })


  describe('Modal behavior', () => {
    it('should show profile', async () => {
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: teacher, hashReducer: ''}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      const useParams = jest.spyOn(require("next/navigation"), "useParams")
      useParams.mockReturnValue({student: 'mock-student', username: 'mock-user'})

      const profile = render(<Profile />)
      const deleteBtn = profile.container.querySelector('#delete-button') as HTMLButtonElement;
      const popup = profile.container.querySelector('#popup-modal')

      act(() => {
        deleteBtn.click()
      })
      expect(popup).toHaveAttribute('open')

      const popupClosebtn = profile.container.querySelector('#popup-close-btn') as HTMLButtonElement;

      act(() => {
        popupClosebtn.click()
      })

      expect(popup).not.toHaveAttribute('open')
    })
  })
})





