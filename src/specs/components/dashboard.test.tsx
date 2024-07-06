import Dashboard from '../../components/dashboard'
import '@testing-library/jest-dom'
import { screen, act, fireEvent } from '@testing-library/react'
import { render } from '../util';
import * as React from 'react';
import { mockUser } from '../../specs/mocks';

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
    usePathname: jest.fn()
  }
});

describe('Dashboard', () => {
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
  
  it('should mention student info if not main user page', async () => {
    const userDetails = {...mockUser}
    render(<Dashboard {...{userDetails, isMain: false, isTeacher: false}}/>)
    
    const h3 = await screen.findByTestId("dashboard-header");
    const addActivityForm = await screen.findByTestId("add-activity-form")
    const activitiesList = await screen.findByTestId("activities-list")
    
    expect(h3).toHaveTextContent('Manage student mock user.')
    expect(addActivityForm).toBeInTheDocument();
    expect(activitiesList).toBeInTheDocument()
  })

  it('should show main teacher info', async () => {
    const userDetails = {...mockUser, accountType: "teacher"}
    render(<Dashboard {...{userDetails, isMain: true, isTeacher: true}}/>)
  
    const h3 = await screen.findByTestId("dashboard-header");
    const addActivityForm = await screen.findByTestId("add-activity-form")
    const activitiesList = await screen.findByTestId("activities-list")
    
    expect(h3).toHaveTextContent('Welcome to your dashboard mock user.')
    expect(addActivityForm).toBeInTheDocument();
    expect(activitiesList).toBeInTheDocument()
  })

  it('should show instructions for main student with teacher', async () => {
    const userDetails = {...mockUser, linkedAccountsData: {teacher: btoa('my-teacher@email.com')}}
    render(<Dashboard {...{userDetails, isMain: true, isTeacher: false}}/>)
  
    const h3 = await screen.findByTestId("dashboard-header");
    const studentInstructions = await screen.findByTestId("student-instructions");
    const addActivityForm = await screen.queryAllByTestId("add-activity-form")
    const activitiesList = await screen.findByTestId("activities-list")
    
    expect(h3).toHaveTextContent('Welcome to your dashboard mock user.')
    expect(studentInstructions).toHaveTextContent("Your teacher's email is my-teacher@email.com.")
    expect(activitiesList).toBeInTheDocument()
    expect(addActivityForm.length).toBe(0)
  })

  it('should show instructions for main student with no teacher', async () => {
    const userDetails = {...mockUser}
    render(<Dashboard {...{userDetails, isMain: true, isTeacher: false}}/>)
  
    const h3 = await screen.findByTestId("dashboard-header");
    const studentInstructions = await screen.findByTestId("student-instructions");
    const addActivityForm = await screen.queryAllByTestId("add-activity-form")
    const activitiesList = await screen.findByTestId("activities-list")
    
    expect(h3).toHaveTextContent('Welcome to your dashboard mock user.')
    expect(studentInstructions).toHaveTextContent("Ask your teacher or parent to add you and create some activities for you!")
    expect(activitiesList).toBeInTheDocument()
    expect(addActivityForm.length).toBe(0)
  })

  it('should display back button', async () => {
    const userDetails = {...mockUser}
    render(<Dashboard {...{userDetails, isMain: true, isTeacher: false}}/>)
    const backButton = await screen.getByText('Back')

    await act(async () => {
      await fireEvent.click(backButton)
    })
    expect(window.history.back).toHaveBeenCalled()
  })
})