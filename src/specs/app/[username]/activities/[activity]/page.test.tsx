import Main from '../../../../../app/[username]/activities/[activity]/page'
import '@testing-library/jest-dom'
import { render } from '../../../../util'
import * as React from 'react'
import { act } from 'react'
import { mockUser, mockStudent, mockActivity } from '../../../../../specs/mocks'
import NestedLayout from '../../../../../app/nested-layout'
import store from '../../../../../store/store'

jest.mock('../../../../../app/nested-layout')

describe('Main user page', () => {
  const back = window.history.back

  beforeAll(() => {
    Object.defineProperty(window, 'history', {
      value: { back: jest.fn() },
    })
  })

  afterAll(() => {
    sessionStorage.clear()
    window.history.back = back
  })

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
    const mockStudentWithActivity = { ...mockStudent, activities: [mockActivity] }
    beforeEach(() => {
      const mockStoreState = {
        authReducer: { isAuthenticated: true },
        userReducer: mockStudentWithActivity,
      }
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState)
      ;(NestedLayout as jest.Mock).mockImplementation(() => null)
    })

    it('should pass the correct isTeacher values for student to NestedLayout', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[1][0]).toEqual(
        expect.objectContaining({ isTeacher: false })
      )
    })

    it('should pass the correct userDetails, userActivity, isMain values for student to ViewActivity', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
      })
      const expectedViewActivityArgs = {
        isMain: true,
        userDetails: mockStudentWithActivity,
        userActivity: mockActivity,
      }
      expect((NestedLayout as jest.Mock).mock.calls[1][0].children[1].props).toMatchObject(
        expectedViewActivityArgs
      )
    })

    it('should display back button', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[1][0].children[2].props).toMatchObject({
        children: 'Back',
      })
      ;(NestedLayout as jest.Mock).mock.calls[1][0].children[2].props.onClick()
      expect(window.history.back).toHaveBeenCalled()
    })
  })

  describe('Main - Teacher', () => {
    const mockUserWithActivity = { ...mockUser, activities: [mockActivity] }
    beforeEach(() => {
      const mockStoreState = {
        authReducer: { isAuthenticated: true },
        userReducer: mockUserWithActivity,
      }
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState)
      ;(NestedLayout as jest.Mock).mockImplementation(() => null)
    })

    it('should pass the correct isTeacher values for teacher on own page to NestedLayout', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
      })
      expect((NestedLayout as jest.Mock).mock.calls[1][0]).toEqual(
        expect.objectContaining({ isTeacher: true })
      )
    })

    it('should pass the correct userDetails, isMain, isTeacher values for teacher on own page to ViewActivity', async () => {
      await act(async () => {
        render(<Main {...{ params: Promise.resolve({ activity: 'Quran' }) }} />)
      })
      const expectedViewActivityArgs = {
        isMain: true,
        userDetails: mockUserWithActivity,
        userActivity: mockActivity,
      }
      expect((NestedLayout as jest.Mock).mock.calls[1][0].children[1].props).toMatchObject(
        expectedViewActivityArgs
      )
    })
  })
})
