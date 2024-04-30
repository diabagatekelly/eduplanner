import '@testing-library/jest-dom'
import { render } from '../../../util';
import { screen, act } from '@testing-library/react'
import * as React from 'react';
import { mockUser, mockStudent } from '../../../../specs/mocks';
import store from '../../../../store/store';
import Profile from '../../../../app/[username]/profile/page';
import { ISODateString } from '../../../../interfaces/isoDateType';
import { formatISODate } from '../../../../utils/formatDate';

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
    usePathname: jest.fn()
  }
});

describe('Profile', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-02-16'))
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.resetAllMocks()
    window.sessionStorage.clear()
  })

  describe('Student profiles', () => {
    it('should display student with no teacher', async () => {
      const user = {...mockStudent, lastLogin: formatISODate(new Date().toISOString() as ISODateString)}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);

      render(<Profile />)
      const profile = await screen.findByTestId('profile-info')

      const studentWithNoLinkedAccounts = 
        '<p class="py-1"><span class="font-bold">First Name:</span> mock</p>'+
        '<p class="py-1"><span class="font-bold">Last Name:</span> student</p>'+
        '<p class="py-1"><span class="font-bold">Email:</span> mock.student@email.com</p>'+
        '<p class="py-1"><span class="font-bold">Account Type(s):</span> student</p>'+
        '<p class="py-1"><span class="font-bold">Linked Accounts:</span> None</p>'+
        `<p class="py-1"><span class="font-bold">Last logged in:</span> 2024-02-16</p>`
      expect(profile).toContainHTML(studentWithNoLinkedAccounts)
    })

    it('should display student with a teacher', async () => {
      const user = {...mockStudent, lastLogin: formatISODate(new Date().toISOString() as ISODateString), linkedAccountsData: {teacher: 'some-teacher@email.com'}}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);

      render(<Profile />)
      const profile = await screen.findByTestId('profile-info')

      const studentWithLinkedAccounts = 
        '<p class="py-1"><span class="font-bold">First Name:</span> mock</p>'+
        '<p class="py-1"><span class="font-bold">Last Name:</span> student</p>'+
        '<p class="py-1"><span class="font-bold">Email:</span> mock.student@email.com</p>'+
        '<p class="py-1"><span class="font-bold">Account Type(s):</span> student</p>'+
        '<p class="py-1"><span class="font-bold">Linked Accounts:</span> some-teacher@email.com (teacher)</p>'+
        `<p class="py-1"><span class="font-bold">Last logged in:</span> 2024-02-16</p>`
      expect(profile).toContainHTML(studentWithLinkedAccounts)
    })
  })

  describe('Teacher profiles', () => {
    it('should display teacher with no student', async () => {
      const user = {...mockUser, lastLogin: formatISODate(new Date().toISOString() as ISODateString)}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);

      render(<Profile />)
      const profile = await screen.findByTestId('profile-info')

      const teacherWithNoLinkedAccounts = 
        '<p class="py-1"><span class="font-bold">First Name:</span> mock</p>'+
        '<p class="py-1"><span class="font-bold">Last Name:</span> user</p>'+
        '<p class="py-1"><span class="font-bold">Email:</span> mock.user@email.com</p>'+
        '<p class="py-1"><span class="font-bold">Account Type(s):</span> teacher</p>'+
        '<p class="py-1"><span class="font-bold">Linked Accounts:</span> None</p>'+
        `<p class="py-1"><span class="font-bold">Last logged in:</span> 2024-02-16</p>`
      expect(profile).toContainHTML(teacherWithNoLinkedAccounts)
    })

    it('should display teacher with one student', async () => {
      const user = {...mockUser, lastLogin: formatISODate(new Date().toISOString() as ISODateString), linkedAccountsData: {students: ['student1@email.com']}}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);

      render(<Profile />)
      const profile = await screen.findByTestId('profile-info')

      const teacherWithOneLinkedAccounts = 
        '<p class="py-1"><span class="font-bold">First Name:</span> mock</p>'+
        '<p class="py-1"><span class="font-bold">Last Name:</span> user</p>'+
        '<p class="py-1"><span class="font-bold">Email:</span> mock.user@email.com</p>'+
        '<p class="py-1"><span class="font-bold">Account Type(s):</span> teacher</p>'+
        '<p class="py-1"><span class="font-bold">Linked Accounts:</span> student1@email.com (students)</p>'+
        `<p class="py-1"><span class="font-bold">Last logged in:</span> 2024-02-16</p>`
      expect(profile).toContainHTML(teacherWithOneLinkedAccounts)
    })

    it('should display teacher with multiple students', async () => {
      const user = {...mockUser, lastLogin: formatISODate(new Date().toISOString() as ISODateString), linkedAccountsData: {students: ['student1@email.com', 'student2@email.com']}}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);

      render(<Profile />)
      const profile = await screen.findByTestId('profile-info')

      const teacherWithMultipleLinkedAccounts = 
        '<p class="py-1"><span class="font-bold">First Name:</span> mock</p>'+
        '<p class="py-1"><span class="font-bold">Last Name:</span> user</p>'+
        '<p class="py-1"><span class="font-bold">Email:</span> mock.user@email.com</p>'+
        '<p class="py-1"><span class="font-bold">Account Type(s):</span> teacher</p>'+
        '<p class="py-1"><span class="font-bold">Linked Accounts:</span> student1@email.com, student2@email.com (students)</p>'+
        `<p class="py-1"><span class="font-bold">Last logged in:</span> 2024-02-16</p>`
      expect(profile).toContainHTML(teacherWithMultipleLinkedAccounts)
    })
  })

  describe('Modal behavior', () => {
    it('should show profile', async () => {
      const user = {...mockUser, lastLogin: formatISODate(new Date().toISOString() as ISODateString), linkedAccountsData: {students: ['student1@email.com', 'student2@email.com']}}
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: user}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);

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