import { mockUser } from '../../src/specs/mocks'
import { IUser } from '../../src/types/IUser'
import { ISODateString } from '../../src/types/ISODateString'

describe('User Profile', () => {
  const user: IUser = { ...mockUser, lastLogin: mockUser.lastLogin as ISODateString }
  beforeEach(() => {
    cy.loginBySession(user)
  })

  it('should navigate to profile and display user information', () => {
    cy.get('[data-testid="user-icon"]').should('have.attr', 'aria-expanded')
    cy.get('[data-testid="user-icon"]').click()
    cy.get('[data-testid="profile-link"]').click()
    cy.url().should('include', '/profile')
    cy.get('[data-testid="profile-info"]').should('exist')
    cy.get('[data-testid="profile-first"]').contains(user.firstName)
    cy.get('[data-testid="profile-last"]').contains(user.lastName)
    cy.get('[data-testid="profile-email"]').contains(user.email)
  })
})
