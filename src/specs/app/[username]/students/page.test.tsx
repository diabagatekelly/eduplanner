import Students from '../../../../app/[username]/students/page'
import '@testing-library/jest-dom'
import { render } from '../../../util'
import * as React from 'react'
import { mockUser } from '../../../../specs/mocks'
import NestedLayout from '../../../../app/nested-layout'
import { useSession } from 'next-auth/react'
import { useUser } from '../../../../hooks/use-user'

jest.mock('../../../../app/nested-layout')
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
  }
})
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))
jest.mock('../../../../hooks/use-user')

describe('Students list', () => {
  const teacher = {
    ...mockUser,
    accountType: 'teacher',
    linkedAccountsData: { students: ['y@email.com'] },
  }
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/3/2024'))
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { userId: teacher.userId, username: teacher.username } },
    })
    ;(useUser as jest.Mock).mockReturnValue({ data: teacher })
    ;(NestedLayout as jest.Mock).mockImplementation(() => null)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('should render with no session', () => {
    ;(useSession as jest.Mock).mockReturnValue({ data: null })
    ;(useUser as jest.Mock).mockReturnValue({ data: undefined })
    const { container } = render(<Students />)
    // Loading guard returns null when userId is missing
    expect(container.querySelector('.py-20')!.innerHTML).toBe('')
    expect(NestedLayout).not.toHaveBeenCalled()
  })

  it('should pass the correct isTeacher values for student to NestedLayout', () => {
    render(<Students />)
    expect((NestedLayout as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({ isTeacher: true })
    )
  })

  it('should pass the correct user to AddStudent', () => {
    render(<Students />)
    const expectedAddStudentArgs = { user: teacher }
    const addStudentChild = (NestedLayout as jest.Mock).mock.calls[0][0].children[0].props
      .children[1].props
    expect(addStudentChild).toMatchObject(expectedAddStudentArgs)
  })

  it('should pass the correct listType, isMain, and userDetails to ListUi', () => {
    render(<Students />)
    const expectedListUiArgs = { listType: 'students', isMain: true, userDetails: teacher }
    const listUiChild = (NestedLayout as jest.Mock).mock.calls[0][0].children[0].props.children[3]
      .props.children[1].props
    expect(listUiChild).toMatchObject(expectedListUiArgs)
  })

  it('should display back button', async () => {
    render(<Students />)
    expect((NestedLayout as jest.Mock).mock.calls[0][0].children[1].props).toMatchObject({
      children: 'Back',
    })

    const useRouter = jest.spyOn(require('next/navigation'), 'useRouter')
    useRouter.mockImplementation(() => ({
      push: jest.fn(),
    }))
    ;(NestedLayout as jest.Mock).mock.calls[0][0].children[1].props.onClick()
    expect(useRouter.mock.results[0].value.push).toHaveBeenCalledWith(`/${mockUser.username}`)
  })
})
