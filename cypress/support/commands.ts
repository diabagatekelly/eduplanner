import { IUser } from '@/types/IUser'

/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
Cypress.Commands.add('loginBySession', (user: IUser) => {
  cy.task('auth:createSession', {
    userId: user.userId,
    username: user.username,
    accountType: user.accountType,
  }).then((token) => {
    cy.setCookie('authjs.session-token', token as string)

    // Intercept the session endpoint so useSession() resolves immediately
    // with the correct user data (avoids race conditions on page load).
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    })

    // Pages now fetch user data via useUser hook (findUser API call).
    // Intercept findUser for the logged-in user so pages get their data.
    // This is unconditional — test-specific intercepts registered later take
    // priority (Cypress checks LIFO) and can handle other userIds.
    cy.intercept('GET', `${Cypress.env('GET_USER_URL')}*`, {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'User found.',
        details: { student: user },
      },
    })

    cy.visit(`/${user.username}`)
  })
})

Cypress.Commands.add('navigateToRegisterPage', () => {
  // Overwrite any leftover session cookie with an invalid token so the
  // middleware treats the request as unauthenticated (avoids redirect).
  // Visit /login first (real HTTP round-trip) to flush the cookie change
  // into the browser's network layer before navigating to /register.
  cy.setCookie('authjs.session-token', 'invalid')
  cy.visit('/login')
  cy.visit('/register')
})

Cypress.Commands.add('register', (mockUser: IUser) => {
  cy.get('[data-testid="register-form"]').within(() => {
    cy.get('input[name="firstName"]').type(mockUser.firstName)
    cy.get('input[name="lastName"]').type(mockUser.lastName)
    cy.get('input[name="password"]').type(mockUser.password)
    cy.get('input[name="email"]').type(mockUser.email)
    cy.get('input[name="accountType"]').check('teacher')
    cy.root().submit()
  })
})

Cypress.Commands.add('login', (credentials: { email: string; password: string }) => {
  cy.clearAllCookies()
  cy.visit('/login')
  cy.get('[data-testid="login-form"]').within(() => {
    cy.get('input[name="email"]').type(credentials.email)
    cy.get('input[name="password"]').type(credentials.password)
    cy.root().submit()
  })
})

Cypress.Commands.add('createActivity', () => {
  cy.get('[data-testid="add-activity-form"]').within(() => {
    cy.get('input[name="name"]').should('not.be.disabled')
    cy.get('input[name="name"]').type('Quran')
    cy.get('input[name="description"]').type('Quran memorization')
    cy.get('input[name="points"]').clear().type('15')
    cy.get('input[id="yesDecks"]').click()
    cy.root().submit()
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      loginBySession(user: IUser): void
      navigateToRegisterPage(): void
      register(user: IUser): void
      login(credentials: { email: string; password: string }): void
      createActivity(): void
      // drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}
