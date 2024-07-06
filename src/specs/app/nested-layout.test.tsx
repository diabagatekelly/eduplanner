import '@testing-library/jest-dom';
import NestedLayout from '../../app/nested-layout';
import { act, fireEvent, screen } from '@testing-library/react';
import { render } from '../util';
import * as React from 'react';
import Dashboard from '../../components/dashboard';
import { mockUser, mockActivity } from '../mocks';
import store from '../../store/store';

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
    usePathname: jest.fn(),
    useParams: jest.fn(() => {
      return {
        activity: 'Quran'
      }
    })
  }
});


describe('Nested layout', () => {

  afterEach(() => {
    global.window.innerWidth = 1200;
    jest.clearAllMocks()
  })

  it('should toggle drawer as expected and highlight Manage Students', async () => {
    global.window.innerWidth = 700;
    jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => '/mock-user/students')
    const userDetails = {...mockUser, activities: [mockActivity]};
    const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: userDetails}
    jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
    render(<NestedLayout {...{children: <Dashboard {...{userDetails, isMain: true, isTeacher: true}}/>, isTeacher: true}}/>)
    const drawerBtn = await screen.findByTestId('drawer-button')
    const drawer = await screen.findByTestId("default-sidebar")

    const closedDrawerClass = "fixed top-16 left-0 z-0 w-64 h-screen transition-transform sm:translate-x-0 -translate-x-full"
    const openedDrawerClass = "fixed top-25 left-0 z-0 w-64 h-screen transition-transform sm:translate-x-0"
    expect(drawer).toHaveClass(closedDrawerClass)

    await act(async () => {
      await fireEvent.click(drawerBtn)
    })

    expect(drawer).toHaveClass(openedDrawerClass)

    await act(async () => {
      await fireEvent.click(drawerBtn)
    })

    expect(drawer).toHaveClass(closedDrawerClass)

    const menuItemStudents = document.querySelectorAll('.menu-item')[1].querySelector('a') as Element;
    const highlightedClass = "bg-gray-800 text-white hover:bg-gray-700"
  
    expect(menuItemStudents).toHaveClass(highlightedClass)
  })

  it('should highlight Dashboard menu item', async () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => '/mock-user')

    const userDetails = {...mockUser, activities: [mockActivity]}
    const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: userDetails}
    jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
    render(<NestedLayout {...{children: <Dashboard {...{userDetails, isMain: true, isTeacher: false}}/>, isTeacher: false}}/>)

    const menuItemDashboard = document.querySelectorAll('.menu-item')[0].querySelector('a') as Element;
    const highlightedClass = "bg-gray-800 text-white hover:bg-gray-700"
  
    expect(menuItemDashboard).toHaveClass(highlightedClass)
  })
})