import AddStudent from '../../../components/students/add-student'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { findUser } from '../../../api/controller';
import { mockUser, mockStudent } from '../../../specs/mocks';

jest.mock('../../../api/controller');
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
  }
});

describe('Add student', () => {
  const user = {...mockUser, accountType: 'teacher'}

  beforeAll(() => {
    sessionStorage.setItem("user_data", JSON.stringify(user))
  })

  afterAll(() => {
    sessionStorage.clear()
  })

  it('should render form to search for student', async () => {
    render(<AddStudent {...{user}} />)
 
    const heading = await screen.findByRole('heading', { level: 3 })
    const findStudentForm = await screen.findByTestId('find-student-form')
 
    expect(heading).toHaveTextContent('Add a new student:')
    expect(findStudentForm).toBeInTheDocument()
  })

  it('should invoke findUser controller when form is submitted', async () => {
    (findUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: null, details: {}}})
    })
    render(<AddStudent {...{user}} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')
    
    const studentDTO = {userId: mockStudent.userId}

    await act(() => {
      fireEvent.change(email, {
        target: {value: mockStudent.email}
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })
    
    await expect(findUser).toHaveBeenCalledWith(studentDTO)
  })

  it('should not add same user as his own student', async () => {
    const invalidStudent = {...mockStudent, email: user.email}
    render(<AddStudent {...{user}} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')
    const submitMessage = screen.getByTestId("find-student-submit-message")

    await act(() => {
      fireEvent.change(email, {
        target: {value: invalidStudent.email}
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(submitMessage).toHaveTextContent("You can't add yourself as a student.")
    expect(email).toHaveValue('')
  })

  it('should not add pre-existing student', async () => {
    const userWithStudents = {...mockUser, linkedAccountsData: {students: [`${mockStudent.email}`]}}
    render(<AddStudent {...{user: userWithStudents}} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')
    const submitMessage = screen.getByTestId("find-student-submit-message")

    await act(() => {
      fireEvent.change(email, {
        target: {value: mockStudent.email}
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(submitMessage).toHaveTextContent("This is already one of your students.")
    expect(email).toHaveValue('')
  })

  it('should clear pre-existing message when form in focus', async () => {
    const userWithStudents = {...mockUser, linkedAccountsData: {students: [`${mockStudent.email}`]}}
    render(<AddStudent {...{user: userWithStudents}} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')
    const submitMessage = screen.getByTestId("find-student-submit-message")

    await act(() => {
      fireEvent.change(email, {
        target: {value: mockStudent.email}
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(submitMessage).toHaveTextContent("This is already one of your students.")
    expect(email).toHaveValue('')

    await act(() => {
      fireEvent.change(email, {
        target: {value: mockStudent.email}
      })
    })

    expect(submitMessage).toHaveTextContent("")
  })

  it('should reset form when response is successful and display popup with student info', async () => {
    (findUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: 'User found.', details: {student: mockStudent}}})
    })
  
    render(<AddStudent {...{user}} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')

    const linkAccountPopup = screen.getByTestId('link-account-popup')
    const closePopupBtn = screen.getByTestId('close-link-account-popup')

    await act(() => {
      fireEvent.change(email, {
        target: {value: mockStudent.email}
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const expectedHTML = 'mock student - mock.student@email.com';

    expect(linkAccountPopup).toHaveAttribute('open')
    expect(linkAccountPopup).toHaveTextContent(expectedHTML)

    await act(async () => {
      await fireEvent.click(closePopupBtn)
    })
  })

  it('should not reset form when response is not 200 or 500 and display error message', async () => {
    const error = {response: {status: 400, data: {status: 'failedTransaction', message: 'Erroneous response'}}};
    (findUser as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    render(<AddStudent {...{user}} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')

    await act(() => {
      fireEvent.change(email, {
        target: {value: mockStudent.email}
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(email).toHaveValue(mockStudent.email)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.findByText(/Erroneous response/i)
  
    expect(email).toHaveValue(mockStudent.email)
    expect(errorMessage).toBeInTheDocument()
  })

  it('should not reset form when response is 500 and display error message', async () => {
    const error = {response: {status: 500, data: {status: 'internalServerError', message: 'Server error'}}};
    (findUser as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })
    jest.spyOn(console, 'log')
    render(<AddStudent {...{user}} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')

    await act(() => {
      fireEvent.change(email, {
        target: {value: mockStudent.email}
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(email).toHaveValue(mockStudent.email)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Failed to add new student due to an internal error. Please try again later./i)
  
    expect(email).toHaveValue(mockStudent.email)
    expect(errorMessage).toBeInTheDocument()
    expect(console.log).toHaveBeenCalledWith(error)
  })

  it('should not reset form when error is thrown with no response', async () => {
    
    (findUser as jest.Mock).mockImplementation(() => {
      return Promise.reject({status: 500, message: 'Error thrown and caught.'});
    });
    jest.spyOn(console, 'log')
    render(<AddStudent {...{user}} />)

    const email = screen.getByTestId('student-email')
    const submitButton = screen.getByTestId('find-student-btn')

    await act(() => {
      fireEvent.change(email, {
        target: {value: mockStudent.email}
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(email).toHaveValue(mockStudent.email)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Server is down. Try again later./i)
    expect(errorMessage).toBeInTheDocument()  
    expect(console.log).toHaveBeenCalledWith({status: 500, message: 'Error thrown and caught.'})
  })
})