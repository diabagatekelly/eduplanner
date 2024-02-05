import * as mockUser from '../fixtures/mock-user.json';
import { IUser } from '../../src/interfaces/IUser';
import { ISODateString } from '../../src/interfaces/isoDateType';

describe('Register user', () => {
  const user: IUser = {...mockUser, lastLogin: (mockUser.lastLogin as ISODateString)};
  beforeEach(() => {
    cy.intercept(Cypress.env('REGISTER_USER_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'User created',
        details: {token: 'xxxxxx', user}
      }
    })
  })
  it('should register user and navigate to Dashboard', () => {
    cy.navigateToRegisterPage()
    cy.contains('Create an account').should('exist')
    cy.register(user)
    cy.wait(100)
    cy.contains(`Welcome to your dashboard ${mockUser.firstName} ${mockUser.lastName}.`)
    cy.url().should('include', `${mockUser.username}`) 
  })

  it('should update store values as expected', () => {
    cy.navigateToRegisterPage()
    cy.register(user)
    cy.window().its('store').invoke('getState').should('deep.equal', {

        authReducer: {isAuthenticated: true},
        userReducer: { default: user, ...user}
      
    })
  })
})



