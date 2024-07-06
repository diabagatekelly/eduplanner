import Main from '../../../../../../../app/[username]/students/[student]/activities/[activity]/page'
import '@testing-library/jest-dom'
import { render } from '../../../../../../util';
import * as React from 'react';
import { mockStudent, mockUser, mockActivity } from '../../../../../../../specs/mocks';
import NestedLayout from '../../../../../../../app/nested-layout';
import store from '../../../../../../../store/store';

jest.mock('../../../../../../../app/nested-layout');

describe('Main user page', () => {
  const back = window.history.back;

  beforeAll(() => {
    Object.defineProperty(window, 'history', {
      value: { back: jest.fn() }
    });
  })

  afterAll(() => {
    sessionStorage.clear()
    window.history.back = back;
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

  describe('Not main - Teacher', () => {
    const updatedMockStudentWithActivity = {...mockStudent, activities: [mockActivity]}
    const updatedMockMainTeacher = {...mockUser, students: {[`${updatedMockStudentWithActivity.username}`]: updatedMockStudentWithActivity}}
    beforeEach(() => {
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: updatedMockMainTeacher}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
      (NestedLayout as jest.Mock).mockImplementation(() => null);
    })

    it('should pass the correct isTeacher values for non-main (teacher student) to NestedLayout', () => {
      render(<Main {...{params: {activity: 'Quran', student: updatedMockStudentWithActivity.username}}}/>)
      expect((NestedLayout as jest.Mock).mock.calls[1][0]).toEqual(expect.objectContaining({isTeacher: true}))
    })

    it('should pass the correct  userDetails, userActivity, isMain values for non-main (teacher student) to ViewActivity', () => {
      render(<Main {...{params: {activity: 'Quran', student: updatedMockStudentWithActivity.username}}}/>)
      const expectedViewActivityArgs = {isMain: false, userDetails: updatedMockStudentWithActivity, userActivity: mockActivity}
      expect((NestedLayout as jest.Mock).mock.calls[1][0].children[0].props).toMatchObject(expectedViewActivityArgs)
    })

    it('should display back button', async () => {
      render(<Main {...{params: {activity: 'Quran', student: updatedMockStudentWithActivity.username}}}/>)
      expect((NestedLayout as jest.Mock).mock.calls[1][0].children[1].props).toMatchObject({'children': 'Back'});
    
      (NestedLayout as jest.Mock).mock.calls[1][0].children[1].props.onClick()
      expect(window.history.back).toHaveBeenCalled()
    })
  })
})

