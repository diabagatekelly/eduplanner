import { mockUser } from '../../src/specs/mocks'
import { ISODateString } from '../../src/types/ISODateString'

describe('Navigation', () => {
  describe('when unauthenticated', () => {
    beforeEach(() => {
      // Belt-and-suspenders cookie cleanup against cross-spec leakage:
      // clearAllCookies, then explicitly overwrite the session cookie with
      // an invalid token, then flush via a real /login round-trip.
      cy.clearAllCookies()
      cy.clearCookie('authjs.session-token')
      cy.setCookie('authjs.session-token', 'invalid')
      cy.visit('/login')
    })

    it('redirects root URL to /login', () => {
      cy.visit('/')
      cy.url().should('include', '/login')
    })
  })

  describe('when authenticated', () => {
    const user = { ...mockUser, lastLogin: mockUser.lastLogin as ISODateString }

    beforeEach(() => {
      cy.loginBySession(user)
    })

    it('redirects root URL straight to /${username} (no /login bounce)', () => {
      cy.visit('/')
      cy.url().should('include', `/${user.username}`)
    })
  })
})
