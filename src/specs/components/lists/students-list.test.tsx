import StudentsList from '../../../components/lists/students-list'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { IUser } from '../../../interfaces/IUser';
import { mockStudent, mockUser } from '../../mocks';
import store from '../../../store/store';
import { findUser } from '../../../api/controller';
import { useRouter } from 'next/navigation';

jest.mock('../../../api/controller');
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn()
  }
});

describe('Students List', () => {
  const getBorderColor = () => 'red';

  describe('No students', () => {
    const teacher: IUser = {...mockUser, linkedAccountsData: {students: []}}
    
    beforeEach(() => {
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: teacher}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
    })

    it('should display "no students" message when teacher has no students', () => {
      render(<StudentsList {...{userDetails: undefined, getBorderColor}}/>)

      const noStudentsMessage = screen.getByTestId('no-students-message')

      expect(noStudentsMessage).toHaveTextContent('You have no students yet.')
    })
  })

  describe('Delete popup', () => {
    const teacher: IUser = {...mockUser, linkedAccountsData: {students: [mockStudent.userId]}, students: {[`${mockStudent.username}`]: mockStudent}}

    beforeEach(() => {
      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: teacher}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
    })

    it('should open delete popup when trying to remove user as a student', async () => {
      render(<StudentsList {...{userDetails: teacher, getBorderColor}}/>)
      
      const deleteBtn = screen.getByTestId('student-list-delete')
      
      await act(async () => {
        await fireEvent.click(deleteBtn)
      })
      
      const unlinkAccountPopup = screen.getByTestId('unlink-account-popup')
      
      const expectedPopupText = 'Are you sure you want to remove this student?'
      const expectedStudentEmail = mockStudent.email

      expect(unlinkAccountPopup).toBeVisible()
      expect(unlinkAccountPopup).toHaveTextContent(expectedPopupText)
      expect(unlinkAccountPopup).toHaveTextContent(expectedStudentEmail)

      const closeUnlinkAccountPopupBtn = screen.getByTestId('unlink-account-popup-close-btn')
      await act(async () => {
        await fireEvent.click(closeUnlinkAccountPopupBtn)
      })

      expect(unlinkAccountPopup).not.toBeVisible()
    
    })
  })

  describe('Students details already populated', () => {
    const teacher: IUser = {...mockUser, linkedAccountsData: {students: [mockStudent.userId]}, students: {[`${mockStudent.username}`]: mockStudent}}

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
      window.sessionStorage.setItem('user_data', JSON.stringify(teacher))
      window.sessionStorage.setItem('user_token', 'xxxxxx')
      window.sessionStorage.setItem('created_on', '2/3/2024')

      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: teacher}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
    })

    afterEach(() => {
      jest.clearAllMocks()
      window.sessionStorage.clear()
      jest.useRealTimers()
    })

    it('should display a list of student names', () => {
      render(<StudentsList {...{userDetails: teacher, getBorderColor}}/>)
      const studentList = screen.getByTestId('students-list')
    
      expect(studentList).toHaveTextContent(`${mockStudent.username.split('-').join(' ')}`)
    })

    it('should not make an API call, but rather use existing student details', async () => {
      (findUser as jest.Mock).mockImplementation(() => {
        return Promise.resolve({status: 200, data: {message: 'User found.', details: {student: mockStudent}}})
      });
      const mockRouter = {
        push: jest.fn()
      };
      (useRouter as jest.Mock).mockReturnValue(mockRouter);

      render(<StudentsList {...{userDetails: teacher, getBorderColor}}/>)
      
      const studentEmail = screen.getByTestId('students-email')
      const url = `/${teacher.username}/students/${mockStudent.username}`
      
      await act(async () => {
        await fireEvent.click(studentEmail)
      })

      expect(findUser).not.toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith(url)
    })
  })

  describe('Has students but students object not populated', () => {
    const teacher: IUser = {...mockUser, linkedAccountsData: {students: [mockStudent.userId]}}

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
      window.sessionStorage.setItem('user_data', JSON.stringify(teacher))
      window.sessionStorage.setItem('user_token', 'xxxxxx')
      window.sessionStorage.setItem('created_on', '2/3/2024')

      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: teacher}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
    })

    afterEach(() => {
      jest.clearAllMocks()
      window.sessionStorage.clear()
      jest.useRealTimers()
    })

    it('should make API an API call to get student details if there are no populated students', async () => {
      (findUser as jest.Mock).mockImplementation(() => {
        return Promise.resolve({status: 200, data: {message: 'User found.', details: {student: mockStudent}}})
      });
      const mockRouter = {
        push: jest.fn()
      };
      (useRouter as jest.Mock).mockReturnValue(mockRouter);

      render(<StudentsList {...{userDetails: teacher, getBorderColor}}/>)
      
      const studentEmail = screen.getByTestId('students-email')
      const url = `/${teacher.username}/students/${mockStudent.username}`
      
      await act(async () => {
        await fireEvent.click(studentEmail)
      })

      expect(findUser).toHaveBeenCalledWith({userId: mockStudent.userId})
      expect(mockRouter.push).toHaveBeenCalledWith(url)
    })
  })

  describe('Has students but correct student not yet in object', () => {
    const fakeStudent = {...mockStudent, username: 'some-other-student', email: 'some-fake@emai.com', userId: btoa('some-fake@emai.com')}
    const teacher: IUser = {...mockUser, linkedAccountsData: {students: [fakeStudent.userId, mockStudent.userId ]}, students: {'some-other-student': fakeStudent}}

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
      window.sessionStorage.setItem('user_data', JSON.stringify(teacher))
      window.sessionStorage.setItem('user_token', 'xxxxxx')
      window.sessionStorage.setItem('created_on', '2/3/2024')

      const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: teacher}
      jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
    })

    afterEach(() => {
      jest.clearAllMocks()
      window.sessionStorage.clear()
      jest.useRealTimers()
    })

    it('should make API an API call to get student details if there are no populated students', async () => {
      (findUser as jest.Mock).mockImplementation(() => {
        return Promise.resolve({status: 200, data: {message: 'User found.', details: {student: mockStudent}}})
      });
      const mockRouter = {
        push: jest.fn()
      };
      (useRouter as jest.Mock).mockReturnValue(mockRouter);

      render(<StudentsList {...{userDetails: teacher, getBorderColor}}/>)
      
      const studentEmail = screen.getByText(`${mockStudent.email}`)
      const url = `/${teacher.username}/students/${mockStudent.username}`
      
      await act(async () => {
        await fireEvent.click(studentEmail)
      })

      expect(findUser).toHaveBeenCalledWith({userId: mockStudent.userId})
      expect(findUser).not.toHaveBeenCalledWith({userId: fakeStudent.userId})
      expect(mockRouter.push).toHaveBeenCalledWith(url)
    })

    it('should not reset form when response is not 200 or 500 and display error message', async () => {
      const error = {response: {status: 400, data: {status: 'failedTransaction', message: 'Erroneous response'}}};
      (findUser as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })
      const mockRouter = {
        push: jest.fn()
      };
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
  
      render(<StudentsList {...{userDetails: teacher, getBorderColor}}/>)
  
      const studentEmail = screen.getByText(`${mockStudent.email}`)

      await act(async () => {
        await fireEvent.click(studentEmail)
      })
  
      const errorMessage = screen.getByText(/Erroneous response/i)
    
      expect(mockRouter.push).not.toHaveBeenCalled()
      expect(errorMessage).toBeInTheDocument()
    })
  
    it('should not reset form when response is 500 and display error message', async () => {
      const error = {response: {status: 500, data: {status: 'internalServerError', message: 'Server error'}}};
      (findUser as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })
      jest.spyOn(console, 'log')
      const mockRouter = {
        push: jest.fn()
      };
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
  
      render(<StudentsList {...{userDetails: teacher, getBorderColor}}/>)
  
      const studentEmail = screen.getByText(`${mockStudent.email}`)

      await act(async () => {
        await fireEvent.click(studentEmail)
      })
  
      const errorMessage = await screen.getByText(/Failed to fetch student details due to an internal error. Please try again later./i)
    
      expect(mockRouter.push).not.toHaveBeenCalled()
      expect(errorMessage).toBeInTheDocument()
      expect(console.log).toHaveBeenCalledWith(error)
    })
  
    it('should not reset form when error is thrown with no response', async () => {
      
      (findUser as jest.Mock).mockImplementation(() => {
        return Promise.reject({status: 500, message: 'Error thrown and caught.'});
      });
      jest.spyOn(console, 'log')
      const mockRouter = {
        push: jest.fn()
      };
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
  
      render(<StudentsList {...{userDetails: teacher, getBorderColor}}/>)
  
      const studentEmail = screen.getByText(`${mockStudent.email}`)

      await act(async () => {
        await fireEvent.click(studentEmail)
      })
  
      const errorMessage = await screen.getByText(/Server is down. Try again later./i)
      expect(mockRouter.push).not.toHaveBeenCalled()
      expect(errorMessage).toBeInTheDocument()  
      expect(console.log).toHaveBeenCalledWith({status: 500, message: 'Error thrown and caught.'})
    })

  })
})