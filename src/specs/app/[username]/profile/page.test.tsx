import '@testing-library/jest-dom'
import { render } from '../../../util';
import { screen, act } from '@testing-library/react'
import * as React from 'react';
import { mockUser, mockStudent } from '../../../../specs/mocks';
import store from '../../../../store/store';
import Profile from '../../../../app/[username]/profile/page';
import { ISODateString } from '../../../../interfaces/isoDateType';

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

describe('Profile', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/15/2024'))
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.resetAllMocks()
    window.sessionStorage.clear()
  })

  describe('Student profiles', () => {
    it('should display student with no teacher', async () => {
      const user = {...mockStudent, lastLogin: new Date(Date.now()).toLocaleDateString() as ISODateString}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      const useParams = jest.spyOn(require("next/navigation"), "useParams")
      useParams.mockReturnValue({activity: 'Quran'})

      render(<Profile />)
      const profile = await screen.findByTestId('profile-info')

      const studentWithNoLinkedAccounts = 
        '<p data-testid="profile-first" class="py-1"><span class="font-bold">First Name:</span> mock</p>'+
        '<p data-testid="profile-last" class="py-1"><span class="font-bold">Last Name:</span> student</p>'+
        '<p data-testid="profile-email" class="py-1"><span class="font-bold">Email:</span> mock.student@email.com</p>'+
        '<p data-testid="profile-accountType" class="py-1"><span class="font-bold">Account Type(s):</span> student</p>'+
        '<p data-testid="profile-linkedAccounts" class="py-1"><span class="font-bold">Linked Accounts:</span> None</p>'+
        `<p data-testid="profile-login" class="py-1"><span class="font-bold">Last logged in:</span> 2/15/2024</p>`

      expect(profile).toContainHTML(studentWithNoLinkedAccounts)
    })

    it('should display student with a teacher', async () => {
      const user = {...mockStudent, lastLogin: new Date(Date.now()).toLocaleDateString() as ISODateString, linkedAccountsData: {teacher: btoa('some-teacher@email.com')}}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      const useParams = jest.spyOn(require("next/navigation"), "useParams")
      useParams.mockReturnValue({activity: 'Quran'})

      render(<Profile />)
      const profile = await screen.findByTestId('profile-info')

      const studentWithLinkedAccounts = 
        '<p data-testid="profile-first" class="py-1"><span class="font-bold">First Name:</span> mock</p>'+
        '<p data-testid="profile-last" class="py-1"><span class="font-bold">Last Name:</span> student</p>'+
        '<p data-testid="profile-email" class="py-1"><span class="font-bold">Email:</span> mock.student@email.com</p>'+
        '<p data-testid="profile-accountType" class="py-1"><span class="font-bold">Account Type(s):</span> student</p>'+
        '<p data-testid="profile-linkedAccounts" class="py-1"><span class="font-bold">Linked Accounts:</span> some-teacher@email.com (teacher)</p>'+
        `<p data-testid="profile-login" class="py-1"><span class="font-bold">Last logged in:</span> 2/15/2024</p>`

      expect(profile).toContainHTML(studentWithLinkedAccounts)
    })
  })

  describe('Teacher profiles', () => {
    it('should display teacher with no student', async () => {
      const user = {...mockUser, lastLogin: new Date(Date.now()).toLocaleDateString() as ISODateString}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      const useParams = jest.spyOn(require("next/navigation"), "useParams")
      useParams.mockReturnValue({activity: 'Quran'})

      render(<Profile />)
      const profile = await screen.findByTestId('profile-info')

      const teacherWithNoLinkedAccounts = 
        '<p data-testid="profile-first" class="py-1"><span class="font-bold">First Name:</span> mock</p>'+
        '<p data-testid="profile-last" class="py-1"><span class="font-bold">Last Name:</span> user</p>'+
        '<p data-testid="profile-email" class="py-1"><span class="font-bold">Email:</span> mock.user@email.com</p>'+
        '<p data-testid="profile-accountType" class="py-1"><span class="font-bold">Account Type(s):</span> teacher</p>'+
        '<p data-testid="profile-linkedAccounts" class="py-1"><span class="font-bold">Linked Accounts:</span> None</p>'+
        `<p data-testid="profile-login" class="py-1"><span class="font-bold">Last logged in:</span> 2/15/2024</p>`
      
      expect(profile).toContainHTML(teacherWithNoLinkedAccounts)
    })

    it('should display teacher with one student', async () => {
      const user = {...mockUser, lastLogin: new Date(Date.now()).toLocaleDateString() as ISODateString, linkedAccountsData: {students: [btoa('student1@email.com')]}}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      const useParams = jest.spyOn(require("next/navigation"), "useParams")
      useParams.mockReturnValue({activity: 'Quran'})

      render(<Profile />)
      const profile = await screen.findByTestId('profile-info')

      const teacherWithOneLinkedAccounts = 
        '<p data-testid="profile-first" class="py-1"><span class="font-bold">First Name:</span> mock</p>'+
        '<p data-testid="profile-last" class="py-1"><span class="font-bold">Last Name:</span> user</p>'+
        '<p data-testid="profile-email" class="py-1"><span class="font-bold">Email:</span> mock.user@email.com</p>'+
        '<p data-testid="profile-accountType" class="py-1"><span class="font-bold">Account Type(s):</span> teacher</p>'+
        '<p data-testid="profile-linkedAccounts" class="py-1"><span class="font-bold">Linked Accounts:</span> student1@email.com (students)</p>'+
        `<p data-testid="profile-login" class="py-1"><span class="font-bold">Last logged in:</span> 2/15/2024</p>`
      
      expect(profile).toContainHTML(teacherWithOneLinkedAccounts)
    })

    it('should display teacher with multiple students', async () => {
      const user = {...mockUser, lastLogin: new Date(Date.now()).toLocaleDateString() as ISODateString, linkedAccountsData: {students: [btoa('student1@email.com'), btoa('student2@email.com')]}}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      const useParams = jest.spyOn(require("next/navigation"), "useParams")
      useParams.mockReturnValue({activity: 'Quran'})

      render(<Profile />)
      const profile = await screen.findByTestId('profile-info')

      const teacherWithMultipleLinkedAccounts = 
        '<p data-testid="profile-first" class="py-1"><span class="font-bold">First Name:</span> mock</p>'+
        '<p data-testid="profile-last" class="py-1"><span class="font-bold">Last Name:</span> user</p>'+
        '<p data-testid="profile-email" class="py-1"><span class="font-bold">Email:</span> mock.user@email.com</p>'+
        '<p data-testid="profile-accountType" class="py-1"><span class="font-bold">Account Type(s):</span> teacher</p>'+
        '<p data-testid="profile-linkedAccounts" class="py-1"><span class="font-bold">Linked Accounts:</span> student1@email.com, student2@email.com (students)</p>'+
        `<p data-testid="profile-login" class="py-1"><span class="font-bold">Last logged in:</span> 2/15/2024</p>`
      
      expect(profile).toContainHTML(teacherWithMultipleLinkedAccounts)
    })
  })

  describe('Modal behavior', () => {
    it('should show profile', async () => {
      const user = {...mockUser, lastLogin: new Date(Date.now()).toLocaleDateString() as ISODateString, linkedAccountsData: {students: [btoa('student1@email.com'), btoa('student2@email.com')]}}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      const useParams = jest.spyOn(require("next/navigation"), "useParams")
      useParams.mockReturnValue({activity: 'Quran'})

      const profile = render(<Profile />)
      const deleteBtn = profile.container.querySelector('#delete-button') as HTMLButtonElement;
      const popup = profile.container.querySelector('#popup-modal')

      act(() => {
        deleteBtn.click()
      })
      expect(popup).toBeVisible()

      const popupClosebtn = profile.container.querySelector('#popup-close-btn') as HTMLButtonElement;

      act(() => {
        popupClosebtn.click()
      })

      expect(popup).not.toBeVisible()
    })
  })
})