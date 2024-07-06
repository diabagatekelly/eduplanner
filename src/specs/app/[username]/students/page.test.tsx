import Students from '../../../../app/[username]/students/page'
import '@testing-library/jest-dom'
import { render } from '../../../util';
import * as React from 'react';
import { mockUser } from '../../../../specs/mocks';
import NestedLayout from '../../../../app/nested-layout';
import store from '../../../../store/store';

jest.mock('../../../../app/nested-layout');
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    }))
  }
});

describe('Students list', () => {
  const teacher = {...mockUser, accountType: 'teacher', linkedAccountsData: {students: ['y@email.com']}}
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/3/2024'))
    window.sessionStorage.setItem('user_data', JSON.stringify(teacher))
    window.sessionStorage.setItem('user_token', 'xxxxxx')
    window.sessionStorage.setItem('created_on', '2/3/2024')
  
    const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: teacher}
    jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
    (NestedLayout as jest.Mock).mockImplementation(() => null);
  })

  afterEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()
    jest.useRealTimers()
  })

  it('should pass the correct isTeacher values for student to NestedLayout', () => {
    render(<Students />)
    expect((NestedLayout as jest.Mock).mock.calls[1][0]).toEqual(expect.objectContaining({isTeacher: true}))
  })

  it('should pass the correct user to AddStudent', () => {
    render(<Students />)
    const expectedAddStudentArgs = {user: teacher}
    const addStudentChild = (NestedLayout as jest.Mock).mock.calls[1][0].children[0].props.children[0].props
    expect(addStudentChild).toMatchObject(expectedAddStudentArgs)
  })

  it('should pass the correct listType, isMain, and userDetails to ListUi', () => {
    render(<Students />)
    const expectedListUiArgs = {listType: 'students', isMain: true, userDetails: teacher}
    const listUiChild = (NestedLayout as jest.Mock).mock.calls[1][0].children[0].props.children[2].props.children[1].props
    expect(listUiChild).toMatchObject(expectedListUiArgs)
  })

  it('should display back button', async () => {
    render(<Students/>)
    expect((NestedLayout as jest.Mock).mock.calls[1][0].children[1].props).toMatchObject({'children': 'Back'});

    const useRouter = jest.spyOn(require("next/navigation"), "useRouter");
    useRouter.mockImplementation(() => ({
      push: jest.fn()
    }));
  
    (NestedLayout as jest.Mock).mock.calls[1][0].children[1].props.onClick()
    expect(useRouter.mock.results[1].value.push).toHaveBeenCalledWith(`/${mockUser.username}`)
  })

})