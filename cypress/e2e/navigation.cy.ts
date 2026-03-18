describe('Navigation', () => {
  beforeEach(() => {
    // Ensure a clean cookie state before each test to avoid cross-test leakage.
    cy.clearAllCookies()

    // Overwrite any leftover session cookie with an invalid token so the
    // middleware treats the request as unauthenticated (avoids redirect).
    // Visit /login first (real HTTP round-trip) to flush the cookie change.
    cy.setCookie('authjs.session-token', 'invalid')
    cy.visit('/login')
  })

  it('should redirect blank URL to /login', () => {
    cy.visit('')
    cy.url().should('include', '/login')
  })
  it('should redirect root URL to /login', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })
})
