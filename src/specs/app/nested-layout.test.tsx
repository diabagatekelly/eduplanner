import '@testing-library/jest-dom'
import NestedLayout from '../../app/nested-layout'
import { act, fireEvent, screen } from '@testing-library/react'
import { render } from '../util'
import * as React from 'react'
import Dashboard from '../../components/dashboard'
import { mockUser, mockActivity, mockStudent, mockLanguageActivity } from '../mocks'
import { useSession } from 'next-auth/react'
import { useUser } from '../../hooks/use-user'
import { useStudent } from '../../hooks/use-student'

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
    usePathname: jest.fn(),
    useParams: jest.fn(() => {
      return {
        activity: 'Quran',
      }
    }),
  }
})
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))
jest.mock('../../hooks/use-user')
jest.mock('../../hooks/use-student')

describe('Nested layout', () => {
  afterEach(() => {
    global.window.innerWidth = 1200
    jest.clearAllMocks()
  })

  it('should render with no session', () => {
    ;(useSession as jest.Mock).mockReturnValue({ data: null })
    ;(useUser as jest.Mock).mockReturnValue({ data: undefined })
    ;(useStudent as jest.Mock).mockReturnValue({ data: undefined })
    render(
      <NestedLayout
        {...{
          children: <div>test</div>,
          isTeacher: false,
        }}
      />
    )
    // Loading guard renders minimal wrapper without drawer when userId is missing
    expect(screen.queryByTestId('drawer-button')).not.toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('should toggle drawer as expected and highlight Manage Students', async () => {
    global.window.innerWidth = 700
    jest
      .spyOn(require('next/navigation'), 'usePathname')
      .mockImplementation(() => '/mock-user/students')
    const userDetails = { ...mockUser, activities: [mockActivity] }
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { userId: mockUser.userId, username: mockUser.username } },
    })
    ;(useUser as jest.Mock).mockReturnValue({ data: userDetails })
    ;(useStudent as jest.Mock).mockReturnValue({ data: undefined })
    render(
      <NestedLayout
        {...{
          children: <Dashboard {...{ userDetails, isMain: true, isTeacher: true }} />,
          isTeacher: true,
        }}
      />
    )
    const drawerBtn = await screen.findByTestId('drawer-button')
    const drawer = await screen.findByTestId('default-sidebar')

    const closedDrawerClass =
      'fixed top-16 left-0 z-0 w-64 h-screen transition-transform sm:translate-x-0 -translate-x-full'
    const openedDrawerClass =
      'fixed top-25 left-0 z-0 w-64 h-screen transition-transform sm:translate-x-0'
    expect(drawer).toHaveClass(closedDrawerClass)

    await act(async () => {
      await fireEvent.click(drawerBtn)
    })

    expect(drawer).toHaveClass(openedDrawerClass)

    await act(async () => {
      await fireEvent.click(drawerBtn)
    })

    expect(drawer).toHaveClass(closedDrawerClass)

    const menuItemStudents = document
      .querySelectorAll('.menu-item')[1]
      .querySelector('a') as Element
    const highlightedClass = 'bg-gray-800 text-white hover:bg-gray-700'

    expect(menuItemStudents).toHaveClass(highlightedClass)
  })

  it('should highlight Dashboard menu item', async () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => '/mock-user')

    const userDetails = { ...mockUser, activities: [mockActivity] }
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { userId: mockUser.userId, username: mockUser.username } },
    })
    ;(useUser as jest.Mock).mockReturnValue({ data: userDetails })
    ;(useStudent as jest.Mock).mockReturnValue({ data: undefined })
    render(
      <NestedLayout
        {...{
          children: <Dashboard {...{ userDetails, isMain: true, isTeacher: false }} />,
          isTeacher: false,
        }}
      />
    )

    const menuItemDashboard = document
      .querySelectorAll('.menu-item')[0]
      .querySelector('a') as Element
    const menuItemActivity = document.querySelectorAll('.menu-item')

    const highlightedClass = 'bg-gray-800 text-white hover:bg-gray-700'

    expect(menuItemDashboard).toHaveClass(highlightedClass)
    expect(menuItemActivity[2]).toBeUndefined()
  })

  it('should display cards submenu for main user', async () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => '/mock-user')
    jest.spyOn(require('next/navigation'), 'useParams').mockImplementation(() => {
      return { activity: 'Quran', student: undefined }
    })
    const userDetails = { ...mockUser, activities: [{ ...mockActivity, hasCards: true }] }
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { userId: mockUser.userId, username: mockUser.username } },
    })
    ;(useUser as jest.Mock).mockReturnValue({ data: userDetails })
    ;(useStudent as jest.Mock).mockReturnValue({ data: undefined })
    render(
      <NestedLayout
        {...{
          children: <Dashboard {...{ userDetails, isMain: true, isTeacher: false }} />,
          isTeacher: false,
        }}
      />
    )

    const cardSubmenu = document.querySelectorAll('.menu-item-cards')[0] as Element
    expect(cardSubmenu).toHaveTextContent('Cards')
  })

  it('should display cards submenu for student page', async () => {
    jest
      .spyOn(require('next/navigation'), 'usePathname')
      .mockImplementation(() => '/mock-user/students/mock-student/activities/Arabic-Language')
    jest.spyOn(require('next/navigation'), 'useParams').mockImplementation(() => {
      return { activity: 'Arabic-Language', student: 'mock-student' }
    })
    const studentWithCards = {
      ...mockStudent,
      activities: [{ ...mockLanguageActivity, hasCards: true }],
    }
    const teacherDetails = {
      ...mockUser,
      linkedAccountsData: {
        students: [[mockStudent.userId, mockStudent.username]],
      },
      activities: [{ ...mockActivity }],
    }
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { userId: mockUser.userId, username: mockUser.username } },
    })
    ;(useUser as jest.Mock).mockReturnValue({ data: teacherDetails })
    ;(useStudent as jest.Mock).mockReturnValue({ data: studentWithCards })
    render(
      <NestedLayout
        {...{
          children: (
            <Dashboard {...{ userDetails: studentWithCards, isMain: false, isTeacher: false }} />
          ),
          isTeacher: false,
        }}
      />
    )

    const cardSubmenu = document.querySelectorAll('.menu-item-cards')[0] as Element
    expect(cardSubmenu).toHaveTextContent('Cards')
  })

  it('should not render cards submenu when student route has no matching linked student', async () => {
    jest
      .spyOn(require('next/navigation'), 'usePathname')
      .mockImplementation(() => '/mock-user/students/unknown-student/activities/Arabic-Language')
    jest.spyOn(require('next/navigation'), 'useParams').mockImplementation(() => {
      return { activity: 'Arabic-Language', student: 'unknown-student' }
    })
    const teacherDetails = {
      ...mockUser,
      linkedAccountsData: { students: [] },
      activities: [{ ...mockActivity }],
    }
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { userId: mockUser.userId, username: mockUser.username } },
    })
    ;(useUser as jest.Mock).mockReturnValue({ data: teacherDetails })
    ;(useStudent as jest.Mock).mockReturnValue({ data: undefined })
    render(
      <NestedLayout
        {...{
          children: <div>Content</div>,
          isTeacher: true,
        }}
      />
    )

    const cardSubmenu = document.querySelectorAll('.menu-item-cards')[0]
    expect(cardSubmenu).toBeUndefined()
  })
})
