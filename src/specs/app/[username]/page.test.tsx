import Main from '@/app/[username]/page'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { mockUser } from '@/specs/mocks';
import NestedLayout from '@/app/nested-layout';
import store from '@/store/store';
import Dashboard from '@/components/dashboard';

jest.mock('../../../app/nested-layout');
jest.mock('../../../components/dashboard');


describe('Main user page', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-02-04'))
    window.sessionStorage.setItem('user', JSON.stringify(mockUser))
    window.sessionStorage.setItem('token', 'xxxxxx')
    window.sessionStorage.setItem('created_on', '2024-02-04')
  })

  afterEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()
    jest.useRealTimers()
  })

  describe('Main - Student', () => {
    beforeEach(() => {
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: mockUser}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      (NestedLayout as jest.Mock).mockImplementation(() => null);
    })

    it('should pass the correct isTeacher values for student to NestedLayout', () => {
      render(<Main {...{params: {username: 'mock-user'}}}/>)
      expect((NestedLayout as jest.Mock).mock.calls[1][0]).toEqual(expect.objectContaining({isTeacher: false}))
    })

    it('should pass the correct userDetails, isMain, isTeacher values for student to Dashboard', () => {
      render(<Main {...{params: {username: 'mock-user'}}}/>)
      const expecteDashboarddArgs = {isMain: true, isTeacher: false, userDetails: mockUser}
      expect((NestedLayout as jest.Mock).mock.calls[1][0].children.props).toMatchObject(expecteDashboarddArgs)
    })
  })

  describe('Main - Teacher', () => {
    const updatedMockMainTeacher = {...mockUser, accountType: 'teacher'}
    beforeEach(() => {
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: updatedMockMainTeacher}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      (NestedLayout as jest.Mock).mockImplementation(() => null);
    })

    it('should pass the correct isTeacher values for teacher on own page to NestedLayout', () => {
      render(<Main {...{params: {username: 'mock-user'}}}/>)
      expect((NestedLayout as jest.Mock).mock.calls[1][0]).toEqual(expect.objectContaining({isTeacher: true}))
    })

    it('should pass the correct userDetails, isMain, isTeacher values for teacher on own page to Dashboard', () => {
      render(<Main {...{params: {username: 'mock-user'}}}/>)
      const expecteDashboarddArgs = {isMain: true, isTeacher: true, userDetails: updatedMockMainTeacher}
      expect((NestedLayout as jest.Mock).mock.calls[1][0].children.props).toMatchObject(expecteDashboarddArgs)
    })
  })

  describe('Not main - Teacher', () => {
    const updatedMockMainTeacher = {...mockUser, accountType: 'teacher'}
    beforeEach(() => {
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: updatedMockMainTeacher}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      (NestedLayout as jest.Mock).mockImplementation(() => null);
    })

    it('should pass the correct isTeacher values for teacher on student page to NestedLayout', () => {
      render(<Main {...{params: {username: 'student-user'}}}/>)
      expect((NestedLayout as jest.Mock).mock.calls[1][0]).toEqual(expect.objectContaining({isTeacher: true}))
    })

    it('should pass the correct userDetails, isMain, isTeacher values for teacher on student page to Dashboard', () => {
      render(<Main {...{params: {username: 'student-user'}}}/>)
      const expecteDashboarddArgs = {isMain: false, isTeacher: true, userDetails: updatedMockMainTeacher}
      expect((NestedLayout as jest.Mock).mock.calls[1][0].children.props).toMatchObject(expecteDashboarddArgs)
    })
  })
  
})

