import { IUser } from "../../src/interfaces/IUser";
import { ISODateString } from "../../src/interfaces/isoDateType";
import { mockActivity, mockStudent, mockUser } from "../../src/specs/mocks";

describe('Add Activity', () => {
  describe('Student view', () => {
    const user: IUser = {...mockStudent, lastLogin: (mockStudent.lastLogin as ISODateString)};
    const loginUrl = `${Cypress.env('LOGIN_USER_URL')}?userId=bW9jay5zdHVkZW50QGVtYWlsLmNvbQ%3D%3D&password=password`
    beforeEach(() => {
      cy.intercept(loginUrl, {
        statusCode: 200,
        body: {
          status: 'success',
          message: 'User found',
          details: {token: 'xxxxxx', user}
        }
      })
    })
    it('should not show a form to add an activity', () => {
      cy.login({email: user.email, password: user.password})
      cy.wait(100)
      cy.contains('Ask your teacher or parent to add you and create some activities for you!')
      cy.get('[data-testid="add-activity-form"]')
        .should('not.exist')
    })
  })

  describe('Teacher view', () => {
    const user: IUser = {...mockUser, lastLogin: (mockUser.lastLogin as ISODateString)};
    const loginUrl = `${Cypress.env('LOGIN_USER_URL')}?userId=bW9jay51c2VyQGVtYWlsLmNvbQ%3D%3D&password=password`
    const addActivityUrl = Cypress.env('ADD_ACTIVITY_URL')
    
    beforeEach(() => {
      cy.intercept(loginUrl, {
        statusCode: 200,
        body: {
          status: 'success',
          message: 'User found',
          details: {token: 'xxxxxx', user}
        }
      })

      cy.intercept(addActivityUrl, {
        statusCode: 200,
        body: {
          status: 'success',
          message: 'Activity creaed.',
          details: {userActivity: mockActivity, userId: user.userId}
        }
      })
    })

    it('should show activity form for teacher and no activities, then add and display new activity', () => {
      cy.login({email: user.email, password: user.password})
      cy.wait(100)
      cy.get('[data-testid="add-activity-form"]')
        .should('exist')
      cy.get('[data-testid="no-activities-message"]')
        .contains('You have no activities yet.')
      cy.createActivity()
      cy.get('[data-testid="activities-list"]')
        .contains('Quran')
      cy.get('input[name="name"]').should('be.empty')
      cy.get('input[name="description"]').should('be.empty')
      cy.window().its('store').invoke('getState').should('deep.equal', {
        authReducer: {isAuthenticated: true},
        userReducer: { ...user, activities: [mockActivity]}
      })
    })
  })

  describe('Unsuccessful activity creation', () => {
    const user: IUser = {...mockUser, lastLogin: (mockUser.lastLogin as ISODateString)};
    const loginUrl = `${Cypress.env('LOGIN_USER_URL')}?userId=bW9jay51c2VyQGVtYWlsLmNvbQ%3D%3D&password=password`
    const addActivityUrl = Cypress.env('ADD_ACTIVITY_URL')
    
    beforeEach(() => {
      cy.intercept(loginUrl, {
        statusCode: 200,
        body: {
          status: 'success',
          message: 'User found',
          details: {token: 'xxxxxx', user}
        }
      })

      cy.intercept(addActivityUrl, {
        statusCode: 400,
        body: {
          status: 'error',
          message: 'Failed to create activity.'
        }
      })
    })

    it('should show error message, not create activity, and not update state if error occurs', () => {
      cy.login({email: user.email, password: user.password})
      cy.wait(100)
      cy.get('[data-testid="no-activities-message"]')
        .contains('You have no activities yet.')
      cy.createActivity()
      cy.get('[data-testid="add-activity-submit-message"]')
        .contains('Failed to create activity.')
      cy.get('[data-testid="no-activities-message"]')
        .contains('You have no activities yet.')
      cy.get('input[name="name"]').should('have.value', 'Quran')
      cy.get('input[name="description"]').should('have.value', 'Quran memorization')
      cy.window().its('store').invoke('getState').should('deep.equal', {
        authReducer: {isAuthenticated: true},
        userReducer: { ...user}
      })
    })
  })
})