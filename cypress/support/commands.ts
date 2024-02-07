import { IUser } from '@/interfaces/IUser'

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
Cypress.Commands.add('navigateToRegisterPage', () => {
  cy.visit('/')
  cy.get('[data-testid="login-btn"]').click()
  cy.get('[data-testid="register-link"]').click()
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

Cypress.Commands.add('login', (credentials: {email: string, password: string}) => { 
  cy.visit('/')
  cy.get('[data-testid="login-btn"]').click()
  cy.get('[data-testid="login-form"]').within(() => {
    cy.get('input[name="email"]').type(credentials.email)
    cy.get('input[name="password"]').type(credentials.password)
    cy.root().submit()
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      navigateToRegisterPage(): void
      register(user: IUser): void,
      login(credentials: {email: string, password: string}): void,
      // drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}