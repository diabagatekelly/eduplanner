describe('Navigation', () => {
  beforeEach(() => {
    cy.clearAllCookies()
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
