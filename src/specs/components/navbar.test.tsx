import Navbar from '../../components/navbar'
import '@testing-library/jest-dom'
import { act, fireEvent, screen } from '@testing-library/react'
import { render } from '../util';
import * as React from 'react';
import {mockUser} from '../mocks';
import { editUser } from '../../api/controller';
import { ISODateString } from '../../interfaces/isoDateType';
import { formatISODate } from '../../utils/formatDate';
import store from '../../store/store';

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn()
    })),
    usePathname: jest.fn(() => mockUser.username)
  }
});
jest.mock('../../api/controller');


describe('Navbar', () => {
  describe('Unauthorized user', () => {
    it('should display "Home" and "Login" buttons', async () => {
      render(<Navbar {...{isAuthenticated: false, username: mockUser.username}}/>)
    
      const homeBtn = await screen.findByTestId("home-btn");
      const loginBtn = await screen.findByTestId("login-btn");
    
      expect(homeBtn).toBeInTheDocument();
      expect(loginBtn).toBeInTheDocument();
    })

    it('shoud navigate to "/login" when login button clicked', async () => {
      render(<Navbar {...{isAuthenticated: false, username: mockUser.username}}/>)
    
      const loginBtn = screen.getByTestId("login-btn");

      loginBtn.addEventListener("click", (e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        const target = e.target as HTMLAnchorElement;
        const destination = target.getAttribute('href')
        expect(destination).toEqual('/login')
      })

      await act(async () => {
        await fireEvent.click(loginBtn)
      })
      
    })

    it('shoud navigate to "/" when home button clicked', async () => {
      render(<Navbar {...{isAuthenticated: false, username: mockUser.username}}/>)
    
      const homeBtn = screen.getByTestId("home-btn");

      homeBtn.addEventListener("click", (e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        const target = e.target as HTMLAnchorElement;
        const destination = target.getAttribute('href')
        expect(destination).toEqual('/')
      })

      await act(async () => {
        await fireEvent.click(homeBtn)
      })
      
    })

    
  })

  describe('Authorized user', () => {
    it('should display "Home" button and "User" icon', async () => {
      render(<Navbar {...{isAuthenticated: true, username: mockUser.username}}/>)
    
      const homeBtn = await screen.findByTestId("home-btn");
      const userIcon = await screen.findByTestId("user-icon");
    
      expect(homeBtn).toBeInTheDocument();
      expect(userIcon).toBeInTheDocument();
    })

    it('should navigate to profile when profile menu is clicked', async () => {
      render(<Navbar {...{isAuthenticated: true, username: mockUser.username}}/>)
    
      const userIcon = await screen.findByTestId("user-icon");

      await act(async () => {
        await fireEvent.click(userIcon)
      })

      const profileMenuItem = await screen.findByTestId("profile-link")

      profileMenuItem.addEventListener("click", (e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        const target = e.target as HTMLAnchorElement;
        const destination = target.getAttribute('href')
        expect(destination).toEqual(`/${mockUser.username}/profile`)
      })

      await act(async () => {
        await fireEvent.click(profileMenuItem)
      })
    

    })

    it('should navigate to # logout is clickd', async () => {
      render(<Navbar {...{isAuthenticated: true, username: mockUser.username}}/>)
    
      const userIcon = await screen.findByTestId("user-icon");

      await act(async () => {
        await fireEvent.click(userIcon)
      })

      const logoutMenuItem = await screen.findByTestId("logout-link")

      logoutMenuItem.addEventListener("click", (e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        const target = e.target as HTMLAnchorElement;
        const destination = target.getAttribute('href')
        expect(destination).toEqual('#')
      })

      await act(async () => {
        await fireEvent.click(logoutMenuItem)
      })
    })

    describe('Logging out', () => {
      beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-02-04'))
        window.sessionStorage.setItem('user_data', JSON.stringify(mockUser))
        window.sessionStorage.setItem('user_token', 'xxxxxx')
        window.sessionStorage.setItem('created_on', '2024-02-04')
      })
    
      afterEach(() => {
        jest.clearAllMocks()
        window.sessionStorage.clear()
        jest.useRealTimers()
      })

      it('should invoke loginUser controller when form is submitted', async () => {
        (editUser as jest.Mock).mockImplementationOnce(() => {
          return Promise.resolve({status: 200, data: {message: null, details: {user: mockUser}}})
        });
        const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: mockUser}
        const mockStore = jest.spyOn(store, 'getState').mockReturnValue(mockStoreState)

        const useRouter = jest.spyOn(require("next/navigation"), "useRouter");
        useRouter.mockImplementation(() => ({
          push: jest.fn()
        }));

        render(<Navbar {...{isAuthenticated: true, username: mockUser.username}}/>)
    
        const userIcon = await screen.findByTestId("user-icon");
        await act(async () => {
          await fireEvent.click(userIcon)
        })

        const logoutMenuItem = await screen.findByTestId("logout-link")
        await act(async () => {
          await fireEvent.click(logoutMenuItem)
        })
        
        mockStore.mockRestore();

        await expect(editUser).toHaveBeenCalledWith({userId: mockUser.userId, editData: {lastLogin: formatISODate(new Date().toISOString() as ISODateString)}})
        expect(window.sessionStorage.getItem('user_token')).toBe(null)
        expect(window.sessionStorage.getItem('user_data')).toBe(null)
        expect(window.sessionStorage.getItem('created_on')).toBe(null)
        expect(useRouter.mock.results[1].value.push).toHaveBeenCalledWith('/login')
      })

      it('should not log out when response is not 200 or 500 and log error message', async () => {
        const error = {response: {status: 400, data: {status: 'failedTransaction', message: 'Erroneous response'}}};
        (editUser as jest.Mock).mockImplementationOnce(() => {
          return Promise.reject(error)
        })
    
        const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: mockUser}
        const mockStore = jest.spyOn(store, 'getState').mockReturnValue(mockStoreState)

        const useRouter = jest.spyOn(require("next/navigation"), "useRouter");
        useRouter.mockImplementation(() => ({
          push: jest.fn()
        }));

        jest.spyOn(console, 'log')

        render(<Navbar {...{isAuthenticated: true, username: mockUser.username}}/>)
    
        const userIcon = await screen.findByTestId("user-icon");
        await act(async () => {
          await fireEvent.click(userIcon)
        })

        const logoutMenuItem = await screen.findByTestId("logout-link")
        await act(async () => {
          await fireEvent.click(logoutMenuItem)
        })
        
        mockStore.mockRestore();
          
        expect(console.log).toHaveBeenCalledWith('Erroneous response')
        expect(useRouter.mock.results[1].value.push).not.toHaveBeenCalledWith('/login')
      })

      it('should not log out when response is 500 and log error message', async () => {
        const error = {response: {status: 500, data: {status: 'internalServerError', message: 'Server error'}}};
        (editUser as jest.Mock).mockImplementationOnce(() => {
          return Promise.reject(error)
        })
    
        const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: mockUser}
        const mockStore = jest.spyOn(store, 'getState').mockReturnValue(mockStoreState)

        const useRouter = jest.spyOn(require("next/navigation"), "useRouter");
        useRouter.mockImplementation(() => ({
          push: jest.fn()
        }));

        jest.spyOn(console, 'log')

        render(<Navbar {...{isAuthenticated: true, username: mockUser.username}}/>)
    
        const userIcon = await screen.findByTestId("user-icon");
        await act(async () => {
          await fireEvent.click(userIcon)
        })

        const logoutMenuItem = await screen.findByTestId("logout-link")
        await act(async () => {
          await fireEvent.click(logoutMenuItem)
        })
        
        mockStore.mockRestore();
          
        expect(console.log).toHaveBeenCalledWith('Oops, something went wrong in updating and logging out. Please try again later.')
        expect(useRouter.mock.results[1].value.push).not.toHaveBeenCalledWith('/login')
      })

      it('should not log out when error is thrown with no response and log error message', async () => {
        (editUser as jest.Mock).mockImplementationOnce(() => {
          return Promise.reject({status: 500, message: 'Error thrown and caught.'});
        })
    
        const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: mockUser}
        const mockStore = jest.spyOn(store, 'getState').mockReturnValue(mockStoreState)

        const useRouter = jest.spyOn(require("next/navigation"), "useRouter");
        useRouter.mockImplementation(() => ({
          push: jest.fn()
        }));

        jest.spyOn(console, 'log')

        render(<Navbar {...{isAuthenticated: true, username: mockUser.username}}/>)
    
        const userIcon = await screen.findByTestId("user-icon");
        await act(async () => {
          await fireEvent.click(userIcon)
        })

        const logoutMenuItem = await screen.findByTestId("logout-link")
        await act(async () => {
          await fireEvent.click(logoutMenuItem)
        })
        
        mockStore.mockRestore();
          
        expect(console.log).toHaveBeenCalledWith('Server is down. Try again later.')
        expect(useRouter.mock.results[1].value.push).not.toHaveBeenCalledWith('/login')
      })
    })

  })
})