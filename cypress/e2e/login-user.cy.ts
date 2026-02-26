import { mockUser } from '../../src/specs/mocks'
import { IUser } from '../../src/types/IUser'

describe('Login User', () => {
  const user: IUser = { ...mockUser }
  const loginRoute = { method: 'GET', pathname: '/user/login' }

  beforeEach(() => {
    cy.window().then((win) => win.sessionStorage.clear())
  })

  describe('Successful login', () => {
    beforeEach(() => {
      cy.intercept(loginRoute, {
        statusCode: 200,
        body: {
          status: 'success',
          message: 'User found',
          details: { token: 'xxxxxx', user },
        },
      }).as('loginSuccess')
    })

    it('should login user and redirect to dashboard', () => {
      cy.login({ email: user.email, password: user.password })
      cy.wait('@loginSuccess')
      cy.contains(`Welcome ${mockUser.firstName} ${mockUser.lastName}!`)
      cy.url().should('include', `${mockUser.username}`)
    })
  })

  describe('Unsuccessful login', () => {
    beforeEach(() => {
      cy.intercept(loginRoute, {
        statusCode: 500,
        body: {
          status: 'error',
          message: 'Some error message which should be overriden by default.',
        },
      }).as('loginFail')
    })

    it('should display error message and stay on the login page', () => {
      cy.login({ email: user.email, password: user.password })
      cy.wait('@loginFail')
      cy.contains('Failed to login due to an internal error. Please try again later.')
      cy.url().should('not.include', `${mockUser.username}`)
    })
  })

  // NOTE: "redirect when session cleared" test removed — it relied on sessionStorage.clear()
  // and cy.window().its('store') (Redux). Will be rewritten for next-auth session handling in Layer 2.
})
