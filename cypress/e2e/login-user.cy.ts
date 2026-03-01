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
      cy.intercept('POST', '/api/auth/signin/credentials', {
        statusCode: 401,
        body: { error: 'CredentialsSignin' },
      }).as('loginFail')
    })

    it('should display error message and stay on the login page', () => {
      cy.login({ email: user.email, password: user.password })
      cy.wait('@loginFail')
      cy.contains('Failed to login due to an internal error. Please try again later.')
      cy.url().should('not.include', mockUser.username)
    })
  })
})
