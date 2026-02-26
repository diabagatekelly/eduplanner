import { mockUser } from '../../src/specs/mocks'
import { IUser } from '../../src/types/IUser'
import { ISODateString } from '../../src/types/isoDateType'

describe('Delete Account', () => {
  const user: IUser = { ...mockUser, lastLogin: mockUser.lastLogin as ISODateString }
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', pathname: '/user/login' },
      {
        statusCode: 200,
        body: {
          status: 'success',
          message: 'User found',
          details: { token: 'xxxxxx', user },
        },
      }
    ).as('loginSuccess')
    cy.intercept(
      { method: 'DELETE', url: `${Cypress.env('DELETE_USER_URL')}/**` },
      {
        statusCode: 200,
        body: { status: 'success', message: 'Account deleted.' },
      }
    ).as('deleteUser')
  })

  it('should open delete account popup and redirect to register on confirm', () => {
    cy.login({ email: user.email, password: user.password })
    cy.wait('@loginSuccess')
    cy.get('[data-testid="user-icon"]').click()
    cy.get('[data-testid="profile-link"]').click()
    cy.url().should('include', '/profile')
    cy.get('#delete-button').click()
    cy.get('#popup-modal').should('not.have.attr', 'hidden')
    cy.get('[data-testid="delete-account-btn"]').click()
    cy.wait('@deleteUser')
    cy.url().should('include', '/register')
  })
})
