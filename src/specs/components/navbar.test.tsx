import Navbar from '../../components/navbar'
import '@testing-library/jest-dom'
import { act, fireEvent, screen } from '@testing-library/react'
import { render } from '../util';
import * as React from 'react';
import { mockActivity, mockUser } from '../mocks';
import { editUser } from '../../api/controller';
import { ISODateString } from '../../interfaces/isoDateType';
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

    describe('Highligting active items', () => {
      it('should highlight Login button when on login page', async () => {
        jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => '/login');
        render(<Navbar {...{isAuthenticated: false, username: mockUser.username}}/>);

        const loginBtn = await screen.findByText('Login');
        const highlightedClass = 'bg-gray-900 text-white';

        expect(loginBtn).toHaveClass(highlightedClass)
      })

      it('should highlight Home button when on login page', async () => {
        jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => '/');
        render(<Navbar {...{isAuthenticated: false, username: mockUser.username}}/>);

        const homeBtn = screen.getByTestId("home-btn");
        const highlightedClass = 'bg-gray-900 text-white';

        expect(homeBtn).toHaveClass(highlightedClass)
      })
    })    
  })

  describe('Authorized user', () => {
    it('should display "Home" button and "User" icon', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => null);

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

        await expect(editUser).toHaveBeenCalledWith({userId: mockUser.userId, editData: {lastLogin: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString}})
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

    describe('Highligting active items', () => {
      it('should highlight Profile button when on profile page', async () => {
        const userDetails = {...mockUser, activities: [mockActivity]};
        const mockStoreState = {authReducer: {isAuthenticated: true}, userReducer: userDetails}
        jest.spyOn(store, 'getState').mockReturnValue(mockStoreState);
        
        jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => '/mock-user/profile');
        render(<Navbar {...{isAuthenticated: true, username: mockUser.username}}/>);

        const userIcon = await screen.findByTestId("user-icon");
        await act(async () => {
          await fireEvent.click(userIcon)
        })

        const profileMenuItem = await screen.findByTestId("profile-link")
        const highlightedClass = 'italic rounded-md border-2 border-gray-700';

        expect(profileMenuItem).toHaveClass(highlightedClass)
      })
    })
  })

  describe('Toggle drawer', () => {
    beforeEach(() => {
      global.window.innerWidth = 500;
    })

    afterEach(() => {
      global.window.innerWidth = 1200;
    })

    it('should toggle drawer as expected', async () => {
      render(<Navbar {...{isAuthenticated: true, username: mockUser.username}}/>)
      const barsIconWhenClosed = await screen.findByTestId('bars-icon-btn')
    
      expect(barsIconWhenClosed).toBeInTheDocument()
      
      await act(async () => {
        await fireEvent.click(barsIconWhenClosed)
      })
      
      const xIconWhenOpened = await screen.findByTestId('x-icon-btn')
      expect(xIconWhenOpened).toBeInTheDocument()
      
  
      await act(async () => {
        await fireEvent.click(xIconWhenOpened)
      })

      const barsIconWhenClosed2 = await screen.findByTestId('bars-icon-btn')
      expect(barsIconWhenClosed2).toBeInTheDocument()
    })
  })
})