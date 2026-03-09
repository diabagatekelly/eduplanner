// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import { mockUser } from '../../src/specs/mocks'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Pre-warm the Next.js dev server before any specs run.
// On CI the first visit to a route triggers cold-start compilation which can
// exceed pageLoadTimeout. Visiting here with a generous timeout compiles the
// two slowest routes once so every spec that follows loads instantly.
before(() => {
  cy.task('auth:createSession', mockUser).then((token) => {
    cy.setCookie('authjs.session-token', token as string)
    cy.visit(`/${mockUser.username}`, { timeout: 300000 })
    cy.visit(`/${mockUser.username}/profile`, { timeout: 300000 })
    cy.clearAllCookies()
  })
})
