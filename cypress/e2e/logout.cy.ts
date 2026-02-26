import { mockUser } from '../../src/specs/mocks'
import { IUser } from '../../src/types/IUser'
import { ISODateString } from '../../src/types/isoDateType'

describe('Logout', () => {
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
      { method: 'PATCH', url: Cypress.env('EDIT_USER_URL') },
      {
        statusCode: 200,
        body: { status: 'success', message: 'User updated.' },
      }
    ).as('editUser')
  })

  it('should call edit API and redirect to login page on logout', () => {
    cy.login({ email: user.email, password: user.password })
    cy.wait('@loginSuccess')
    cy.get('[data-testid="user-icon"]').click()
    cy.get('[data-testid="logout-link"]').click()
    cy.wait('@editUser')
    cy.url().should('include', '/login')
  })
})
