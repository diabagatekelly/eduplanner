import Main from '../../../app/[username]/page'
import '@testing-library/jest-dom'
import { render } from '../../util'
import * as React from 'react'
import { act } from 'react'
import { mockUser, mockStudent } from '../../../specs/mocks'
import NestedLayout from '../../../app/nested-layout'
import store from '../../../store/store'

jest.mock('../../../app/nested-layout')

describe('Main user page', () => {
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

  describe('Main - Student', () => {
    beforeEach(() => {
      const mockStoreState = { authReducer: { isAuthenticated: true }, userReducer: mockStudent }
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState)
      ;(NestedLayout as jest.Mock).mockImplementation(() => null)
    })

    it('should pass the correct isTeacher values for student to NestedLayout', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ username: 'mock-student' }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[1][0]).toEqual(
        expect.objectContaining({ isTeacher: false })
      )
    })

    it('should pass the correct userDetails, isMain, isTeacher values for student to Dashboard', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ username: 'mock-student' }) }} />)
      })
      const expecteDashboarddArgs = { isMain: true, isTeacher: false, userDetails: mockStudent }
      expect((NestedLayout as jest.Mock).mock.calls[1][0].children[1].props).toMatchObject(
        expecteDashboarddArgs
      )
    })
  })

  describe('Main - Teacher', () => {
    beforeEach(() => {
      const mockStoreState = { authReducer: { isAuthenticated: true }, userReducer: mockUser }
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState)
      ;(NestedLayout as jest.Mock).mockImplementation(() => null)
    })

    it('should pass the correct isTeacher values for teacher on own page to NestedLayout', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ username: 'mock-user' }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[1][0]).toEqual(
        expect.objectContaining({ isTeacher: true })
      )
    })

    it('should pass the correct userDetails, isMain, isTeacher values for teacher on own page to Dashboard', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ username: 'mock-user' }) }} />)
      })
      const expecteDashboarddArgs = { isMain: true, isTeacher: true, userDetails: mockUser }
      expect((NestedLayout as jest.Mock).mock.calls[1][0].children[1].props).toMatchObject(
        expecteDashboarddArgs
      )
    })
  })
})
