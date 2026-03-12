import { mockUser } from '../../src/specs/mocks'
import { IUser } from '../../src/types/IUser'

describe('Login User', () => {
  const user: IUser = { ...mockUser }

  describe('Successful login', () => {
    it('should show dashboard with welcome message when authenticated', () => {
      cy.loginBySession(user)
      cy.contains(`Welcome ${mockUser.firstName} ${mockUser.lastName}!`)
      cy.url().should('include', mockUser.username)
    })
  })

  describe('Unsuccessful login', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api/auth/callback/credentials*').as('loginFail')
    })

    it('should display error message and stay on the login page', () => {
      cy.login({ email: user.email, password: user.password })
      cy.wait('@loginFail')
      cy.contains('User not found. Incorrect email or password. Please try again.')
      cy.url().should('not.include', mockUser.username)
    })
  })
})
