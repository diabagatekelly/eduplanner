import { mockUser } from '../../src/specs/mocks'
import { IUser } from '../../src/types/IUser'
import { ISODateString } from '../../src/types/isoDateType'

describe('User Profile', () => {
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
  })

  it('should navigate to profile and display user information', () => {
    cy.login({ email: user.email, password: user.password })
    cy.wait('@loginSuccess')
    cy.get('[data-testid="user-icon"]').click()
    cy.get('[data-testid="profile-link"]').click()
    cy.url().should('include', '/profile')
    cy.get('[data-testid="profile-info"]').should('exist')
    cy.get('[data-testid="profile-first"]').contains(user.firstName)
    cy.get('[data-testid="profile-last"]').contains(user.lastName)
    cy.get('[data-testid="profile-email"]').contains(user.email)
  })
})
