import LinkAccountPopup from '../../../components/popups/linkAccountPopup';
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { linkAccount } from '../../../api/controller';
import { mockUser, mockStudent } from '../../../specs/mocks';

jest.mock('../../../api/controller');

describe('Link Account Popup', () => {
  const teacher = {...mockUser, accountType: 'teacher', linkedAccountsData: {students: []}}
  const newStudent = {...mockStudent}
  const childArgs = {newStudent, user: teacher}
  const reload = window.location.reload;

  beforeAll(() => {
    sessionStorage.setItem("user_data", JSON.stringify(teacher))
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() }
    });
  })

  afterAll(() => {
    sessionStorage.clear()
    window.location.reload = reload;

  })

  it('should render popup to add new student', async () => {
    let showModal;
    let onClose = () => {showModal = false};

    render(<LinkAccountPopup {...{onClose, showModal: true, ...childArgs}} />)
 
    const heading = await screen.findByRole('heading', { level: 3 })
    const studentInfo = await screen.findByRole('heading', { level: 5 })
 
    expect(heading).toHaveTextContent('Are you sure you want to add this student?')
    expect(studentInfo).toHaveTextContent('mock student - mock.student@email.com')
  })

  it('should invoke linkAccount controller when form is submitted', async () => {
    (linkAccount as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: null, details: {}}})
    })

    let showModal;
    let onClose = () => {showModal = false};

    render(<LinkAccountPopup {...{onClose, showModal: true, ...childArgs}} />)

    const submitButton = screen.getByTestId('link-accounts-btn')
    const linkAccountsDTO = { teacherId: teacher.userId, studentId: [newStudent.userId, newStudent.username ]}
    
    await act(async () => {
      await fireEvent.click(submitButton)
    })
    
    await expect(linkAccount).toHaveBeenCalledWith(linkAccountsDTO)
  })

  it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
    (linkAccount as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: 'Successfully added new student.', details: {}}})
    });
    
    let showModal = true;
  
    render(<LinkAccountPopup {...{onClose: () => showModal = false, showModal, ...childArgs}} />)
    const submitButton = await screen.getByTestId('link-accounts-btn')
    const submitMessage = await screen.findByTestId('add-student-outcome-message');

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(submitMessage).toHaveTextContent('Successfully added a new student')
  })

  it('should not close popup when response is not 200 or 500 and display error message', async () => {
    const error = {response: {status: 400, data: {status: 'failedTransaction', message: 'Erroneous response'}}};
    (linkAccount as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    let showModal = true;
  
    render(<LinkAccountPopup {...{onClose: () => showModal = false, showModal, ...childArgs}} />)
    const submitButton = await screen.getByTestId('link-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })


    const errorMessage = await screen.findByText(/Erroneous response/i)
    expect(errorMessage).toBeInTheDocument()
  })

  it('should not close popup when response is 500 and display error message', async () => {
    const error = {response: {status: 500, data: {status: 'internalServerError', message: 'Server error'}}};
    (linkAccount as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })
    jest.spyOn(console, 'log')
    let showModal = true;
  
    render(<LinkAccountPopup {...{onClose: () => showModal = false, showModal, ...childArgs}} />)
    const submitButton = await screen.getByTestId('link-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Failed to add new student due to an internal error. Please try again later./i)
  
    expect(errorMessage).toBeInTheDocument()
    expect(console.log).toHaveBeenCalledWith(error)
  })

  it('should not close popup when error is thrown with no response', async () => {
    (linkAccount as jest.Mock).mockImplementation(() => {
      return Promise.reject({status: 500, message: 'Error thrown and caught.'});
    });
    jest.spyOn(console, 'log')
    let showModal = true;
  
    render(<LinkAccountPopup {...{onClose: () => showModal = false, showModal, ...childArgs}} />)
    const submitButton = await screen.getByTestId('link-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Server is down. Try again later./i)
    expect(errorMessage).toBeInTheDocument()  
    expect(console.log).toHaveBeenCalledWith({status: 500, message: 'Error thrown and caught.'})
  })
})