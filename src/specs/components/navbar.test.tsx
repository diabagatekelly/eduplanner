import Navbar from '../../components/navbar'
import '@testing-library/jest-dom'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { render } from '../util'
import * as React from 'react'
import { mockUser } from '../mocks'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { server } from '../msw/server'
import { http, HttpResponse } from 'msw'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
    usePathname: jest.fn(() => mockUser.username),
  }
})
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
  getSession: jest.fn().mockResolvedValue(null),
}))

describe('Navbar', () => {
  describe('Unauthorized user', () => {
    it('should display "Home" and "Login" buttons', async () => {
      render(
        <Navbar
          {...{ isAuthenticated: false, username: mockUser.username, userId: mockUser.userId }}
        />
      )

      const homeBtn = await screen.findByTestId('home-btn')
      const loginBtn = await screen.findByTestId('login-btn')

      expect(homeBtn).toBeInTheDocument()
      expect(loginBtn).toBeInTheDocument()
    })

    it('shoud navigate to "/login" when login button clicked', async () => {
      render(
        <Navbar
          {...{ isAuthenticated: false, username: mockUser.username, userId: mockUser.userId }}
        />
      )

      const loginBtn = screen.getByTestId('login-btn')

      loginBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const target = e.target as HTMLAnchorElement
        const destination = target.getAttribute('href')
        expect(destination).toEqual('/login')
      })

      await act(async () => {
        await fireEvent.click(loginBtn)
      })
    })

    it('shoud navigate to "/home" when home button clicked', async () => {
      render(
        <Navbar
          {...{ isAuthenticated: false, username: mockUser.username, userId: mockUser.userId }}
        />
      )

      const homeBtn = screen.getByTestId('home-btn')

      homeBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const target = e.target as HTMLAnchorElement
        const destination = target.getAttribute('href')
        expect(destination).toEqual('/home')
      })

      await act(async () => {
        await fireEvent.click(homeBtn)
      })
    })

    describe('Highligting active items', () => {
      it('should highlight Login button when on login page', async () => {
        jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => '/login')
        render(
          <Navbar
            {...{ isAuthenticated: false, username: mockUser.username, userId: mockUser.userId }}
          />
        )

        const loginBtn = await screen.findByText('Login')
        const highlightedClass = 'bg-gray-900 text-white'

        expect(loginBtn).toHaveClass(highlightedClass)
      })

      it('should highlight Home button when on login page', async () => {
        jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => '/home')
        render(
          <Navbar
            {...{ isAuthenticated: false, username: mockUser.username, userId: mockUser.userId }}
          />
        )

        const homeBtn = screen.getByTestId('home-btn')
        const highlightedClass = 'bg-gray-900 text-white'

        expect(homeBtn).toHaveClass(highlightedClass)
      })
    })
  })

  describe('Authorized user', () => {
    it('should display "Home" button and "User" icon', async () => {
      render(
        <Navbar
          {...{ isAuthenticated: true, username: mockUser.username, userId: mockUser.userId }}
        />
      )

      const homeBtn = await screen.findByTestId('home-btn')
      const userIcon = await screen.findByTestId('user-icon')

      expect(homeBtn).toBeInTheDocument()
      expect(userIcon).toBeInTheDocument()
    })

    it('should navigate to profile when profile menu is clicked', async () => {
      render(
        <Navbar
          {...{ isAuthenticated: true, username: mockUser.username, userId: mockUser.userId }}
        />
      )

      const userIcon = await screen.findByTestId('user-icon')

      await act(async () => {
        await fireEvent.click(userIcon)
      })

      const profileMenuItem = await screen.findByTestId('profile-link')

      profileMenuItem.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const target = e.target as HTMLAnchorElement
        const destination = target.getAttribute('href')
        expect(destination).toEqual(`/${mockUser.username}/profile`)
      })

      await act(async () => {
        await fireEvent.click(profileMenuItem)
      })
    })

    it('should navigate to # logout is clickd', async () => {
      render(
        <Navbar
          {...{ isAuthenticated: true, username: mockUser.username, userId: mockUser.userId }}
        />
      )

      const userIcon = await screen.findByTestId('user-icon')

      await act(async () => {
        await fireEvent.click(userIcon)
      })

      const logoutMenuItem = await screen.findByTestId('logout-link')

      logoutMenuItem.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const target = e.target as HTMLAnchorElement
        const destination = target.getAttribute('href')
        expect(destination).toEqual('#')
      })

      await act(async () => {
        await fireEvent.click(logoutMenuItem)
      })
    })

    describe('Logging out', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(new Date('2/3/2024').getTime())
      })

      afterEach(() => {
        jest.restoreAllMocks()
      })

      it('should invoke editUser and signOut when logout is clicked', async () => {
        render(
          <Navbar
            {...{ isAuthenticated: true, username: mockUser.username, userId: mockUser.userId }}
          />
        )

        const userIcon = await screen.findByTestId('user-icon')
        await act(async () => {
          await fireEvent.click(userIcon)
        })

        const logoutMenuItem = await screen.findByTestId('logout-link')
        await act(async () => {
          await fireEvent.click(logoutMenuItem)
        })

        await waitFor(() => {
          expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
        })
      })

      it('should not log out when response is not 200 or 500 and log error message', async () => {
        server.use(
          http.patch('*/user/edit', () =>
            HttpResponse.json(
              { status: 'failedTransaction', message: 'Erroneous response' },
              { status: 400 }
            )
          )
        )

        render(
          <Navbar
            {...{ isAuthenticated: true, username: mockUser.username, userId: mockUser.userId }}
          />
        )

        const userIcon = await screen.findByTestId('user-icon')
        await act(async () => {
          await fireEvent.click(userIcon)
        })

        const logoutMenuItem = await screen.findByTestId('logout-link')
        await act(async () => {
          await fireEvent.click(logoutMenuItem)
        })

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Erroneous response')
        })
        expect(signOut).not.toHaveBeenCalled()
      })

      it('should not log out when response is 500 and log error message', async () => {
        server.use(
          http.patch('*/user/edit', () =>
            HttpResponse.json(
              { status: 'internalServerError', message: 'Server error' },
              { status: 500 }
            )
          )
        )

        render(
          <Navbar
            {...{ isAuthenticated: true, username: mockUser.username, userId: mockUser.userId }}
          />
        )

        const userIcon = await screen.findByTestId('user-icon')
        await act(async () => {
          await fireEvent.click(userIcon)
        })

        const logoutMenuItem = await screen.findByTestId('logout-link')
        await act(async () => {
          await fireEvent.click(logoutMenuItem)
        })

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            'Failed to update and log out due to an internal error. Please try again later.'
          )
        })
        expect(signOut).not.toHaveBeenCalled()
      })

      it('should not log out when error is thrown with no response and log error message', async () => {
        server.use(http.patch('*/user/edit', () => HttpResponse.error()))

        render(
          <Navbar
            {...{ isAuthenticated: true, username: mockUser.username, userId: mockUser.userId }}
          />
        )

        const userIcon = await screen.findByTestId('user-icon')
        await act(async () => {
          await fireEvent.click(userIcon)
        })

        const logoutMenuItem = await screen.findByTestId('logout-link')
        await act(async () => {
          await fireEvent.click(logoutMenuItem)
        })

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
        })
        expect(signOut).not.toHaveBeenCalled()
      })
    })

    describe('Highligting active items', () => {
      it('should highlight Profile button when on profile page', async () => {
        jest
          .spyOn(require('next/navigation'), 'usePathname')
          .mockImplementation(() => '/mock-user/profile')
        render(
          <Navbar
            {...{ isAuthenticated: true, username: mockUser.username, userId: mockUser.userId }}
          />
        )

        const userIcon = await screen.findByTestId('user-icon')
        await act(async () => {
          await fireEvent.click(userIcon)
        })

        const profileMenuItem = await screen.findByTestId('profile-link')
        const highlightedClass = 'italic rounded-md border-2 border-gray-700'

        expect(profileMenuItem).toHaveClass(highlightedClass)
      })
    })
  })

  describe('Toggle drawer', () => {
    beforeEach(() => {
      global.window.innerWidth = 500
    })

    afterEach(() => {
      global.window.innerWidth = 1200
    })

    it('should toggle drawer as expected', async () => {
      render(
        <Navbar
          {...{ isAuthenticated: true, username: mockUser.username, userId: mockUser.userId }}
        />
      )
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
