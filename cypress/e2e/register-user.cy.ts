import { mockUser } from '../../src/specs/mocks'
import { IUser } from '../../src/types/IUser'

describe('Register user', () => {
  const user: IUser = { ...mockUser }

  describe('Successful registration', () => {
    beforeEach(() => {
      cy.intercept(Cypress.env('REGISTER_USER_URL'), {
        statusCode: 200,
        body: {
          status: 'success',
          message: 'User created',
          details: { token: 'xxxxxx', user },
        },
      })
    })

    it('should register user and navigate to dashboard', () => {
      cy.navigateToRegisterPage()
      cy.contains('Create an account').should('exist')
      cy.register(user)
      cy.url().should('include', '/login')
      cy.loginBySession(user)
      cy.contains(`Welcome ${mockUser.firstName} ${mockUser.lastName}!`)
      cy.url().should('include', `${mockUser.username}`)
    })
  })

  describe('Unsuccessful registration', () => {
    beforeEach(() => {
      cy.intercept(Cypress.env('REGISTER_USER_URL'), {
        statusCode: 400,
        body: {
          status: 'conflict',
          message: 'This user altready exists.',
        },
      })
    })

    it('should display error message and stay on the register page', () => {
      cy.navigateToRegisterPage()
      cy.register(user)
      cy.wait(100)
      cy.contains('This user altready exists.')
      cy.url().should('not.include', `${mockUser.username}`)
    })
  })
})
