import { mockUser } from '../../src/specs/mocks'
import { IUser } from '../../src/types/IUser'
import { ISODateString } from '../../src/types/ISODateString'

describe('Logout', () => {
  const user: IUser = { ...mockUser, lastLogin: mockUser.lastLogin as ISODateString }
  beforeEach(() => {
    cy.loginBySession(user)
    cy.intercept(
      { method: 'PATCH', url: Cypress.env('EDIT_USER_URL') },
      {
        statusCode: 200,
        body: { status: 'success', message: 'User updated.' },
      }
    ).as('editUser')
  })

  it('should call edit API and redirect to login page on logout', () => {
    cy.get('[data-testid="user-icon"]').should('have.attr', 'aria-expanded')
    cy.get('[data-testid="user-icon"]').click()
    cy.get('[data-testid="logout-link"]').click()
    cy.wait('@editUser')
    cy.url({ timeout: 10000 }).should('include', '/login')
  })
})
