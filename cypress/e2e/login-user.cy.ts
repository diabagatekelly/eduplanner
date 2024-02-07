import * as mockUser from '../fixtures/mock-user.json';
import { IUser } from '../../src/interfaces/IUser';
import { ISODateString } from '../../src/interfaces/isoDateType';


describe('Login User', () => {
  const user: IUser = {...mockUser, lastLogin: (mockUser.lastLogin as ISODateString)};

  describe('Successful login', () => {
    beforeEach(() => {
      cy.intercept(Cypress.env('LOGIN_USER_URL'), {
        statusCode: 200,
        body: {
          status: 'success',
          message: 'User found',
          details: {token: 'xxxxxx', user}
        }
      })
    })
    it('should login user', () => {
      cy.login({email: user.email, password: user.password})
      cy.wait(100)
      cy.contains(`Welcome to your dashboard ${mockUser.firstName} ${mockUser.lastName}.`)
      cy.url().should('include', `${mockUser.username}`) 
    })

    it('should update store values as expected', () => {
      cy.login({email: user.email, password: user.password})
      cy.wait(100)
      cy.window().its('store').invoke('getState').should('deep.equal', {
        authReducer: {isAuthenticated: true},
        userReducer: { default: user, ...user}
      })
    })
  })

  describe('Unsuccessful login', () => {
    beforeEach(() => {
      cy.intercept(Cypress.env('LOGIN_USER_URL'), {
        statusCode: 500,
        body: {
          status: 'error',
          message: 'Some error message which should be overriden by default.'
        }
      })
    })

    it('should display error message and stay on the same page if login fails', () => {
      cy.login({email: user.email, password: user.password})
      cy.wait(100)
      cy.contains('Failed to login due to an internal error. Please try again later.')
      cy.url().should('not.include', `${mockUser.username}`) 
    })

    it('should not populate store when login fails', () => {
      cy.login({email: user.email, password: user.password})
      cy.window().its('store').invoke('getState').should('deep.equal', {
        authReducer: {isAuthenticated: false},
        userReducer: {}
      })
    })
  })
})