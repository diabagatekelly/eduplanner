import { IUser } from '../../src/types/IUser'
import { ISODateString } from '../../src/types/isoDateType'
import { mockActivity, mockStudent, mockUser, mockUserCard } from '../../src/specs/mocks'

describe('Add Activity', () => {
  describe('Student view', () => {
    const user: IUser = { ...mockStudent, lastLogin: mockStudent.lastLogin as ISODateString }

    beforeEach(() => {
      cy.loginBySession(user)
    })

    it('should not show a form to add an activity', () => {
      cy.contains('Ask your teacher or parent to add you and create some activities for you!')
      cy.get('[data-testid="add-activity-form"]').should('not.exist')
    })
  })

  describe('Teacher view', () => {
    const user: IUser = { ...mockUser, lastLogin: mockUser.lastLogin as ISODateString }
    const addActivityUrl = Cypress.env('ADD_ACTIVITY_URL')
    let activityCreated: boolean

    beforeEach(() => {
      activityCreated = false
      cy.loginBySession(user)

      // Dynamic findUser intercept: after activity is created, return user WITH activities
      // so that window.location.reload() re-fetches the updated data
      cy.intercept('GET', `${Cypress.env('GET_USER_URL')}*`, (req) => {
        req.reply({
          statusCode: 200,
          body: {
            status: 'success',
            message: 'User found.',
            details: {
              student: activityCreated ? { ...user, activities: [mockActivity] } : user,
            },
          },
        })
      })

      cy.intercept(addActivityUrl, (req) => {
        activityCreated = true
        req.reply({
          statusCode: 200,
          body: {
            status: 'success',
            message: 'Activity creaed.',
            details: { userActivity: mockActivity, userId: user.userId },
          },
        })
      })
    })

    it('should show activity form for teacher and no activities, then add and display new activity', () => {
      // Wait for useUser data to fully load before form interaction
      cy.contains('Manage Students')
      cy.get('[data-testid="add-activity-form"]').should('exist')
      cy.get('[data-testid="no-activities-message"]').contains('You have no activities yet.')
      cy.createActivity()
      cy.get('[data-testid="activities-list"]').contains('Quran')
      cy.get('input[name="name"]').should('be.empty')
      cy.get('input[name="description"]').should('be.empty')
    })
  })

  describe('Unsuccessful activity creation', () => {
    const user: IUser = { ...mockUser, lastLogin: mockUser.lastLogin as ISODateString }
    const addActivityUrl = Cypress.env('ADD_ACTIVITY_URL')

    beforeEach(() => {
      cy.loginBySession(user)

      cy.intercept(addActivityUrl, {
        statusCode: 400,
        body: {
          status: 'error',
          message: 'Failed to create activity.',
        },
      })
    })

    it('should show error message and not create activity if error occurs', () => {
      // Wait for useUser data to fully load (isMain/isTeacher settle) before
      // interacting with the form, to prevent AddActivity from unmounting
      // mid-submission when Dashboard switches JSX branches.
      cy.contains('Manage Students')
      cy.get('[data-testid="no-activities-message"]').contains('You have no activities yet.')
      cy.createActivity()
      cy.get('[data-testid="add-activity-submit-message"]').contains('Failed to create activity.')
      cy.get('[data-testid="no-activities-message"]').contains('You have no activities yet.')
      cy.get('input[name="name"]').should('have.value', 'Quran')
      cy.get('input[name="description"]').should('have.value', 'Quran memorization')
    })
  })
})

describe('Delete Activity', () => {
  const userWithActivity: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [mockActivity],
  }

  describe('Successful delete', () => {
    beforeEach(() => {
      cy.loginBySession(userWithActivity)
      cy.intercept(
        { method: 'DELETE', url: `${Cypress.env('DELETE_ACTIVITY_URL')}/**` },
        {
          statusCode: 200,
          body: { status: 'success', message: 'Activity deleted.' },
        }
      ).as('deleteActivity')
    })

    it('should open delete popup showing activity name and make delete API call on confirm', () => {
      cy.get('[data-testid="activity-in-list"]').contains('Quran')
      cy.get('[data-testid="delete-activities-in-list"]').first().click()
      cy.get('[data-testid="delete-activity-popup"]').should('be.visible')
      cy.contains('Are you sure you want to delete this activity?')
      cy.contains('Quran')
      cy.get('[data-testid="delete-activity-btn"]').click()
      cy.wait('@deleteActivity')
    })
  })

  describe('Failed delete', () => {
    beforeEach(() => {
      cy.loginBySession(userWithActivity)
      cy.intercept(
        { method: 'DELETE', url: `${Cypress.env('DELETE_ACTIVITY_URL')}/**` },
        {
          statusCode: 500,
          body: { status: 'error', message: 'Internal server error.' },
        }
      )
    })

    it('should show error message in popup when delete fails', () => {
      cy.get('[data-testid="delete-activities-in-list"]').first().click()
      cy.get('[data-testid="delete-activity-btn"]').click()
      cy.get('[data-testid="delete-activity-outcome-message"]').contains(
        'Failed to delete activity due to an internal error. Please try again later.'
      )
    })
  })
})

describe('Request Review for Activity (Student)', () => {
  const mockStudentWithTeacher: IUser = {
    ...mockStudent,
    lastLogin: mockStudent.lastLogin as ISODateString,
    linkedAccountsData: { teacher: mockUser.userId },
    activities: [{ ...mockActivity, cards: [] }],
  }
  beforeEach(() => {
    cy.loginBySession(mockStudentWithTeacher)
    cy.intercept(Cypress.env('REQUEST_REVIEW_URL'), {
      statusCode: 200,
      body: { status: 'success', message: 'Review requested.' },
    }).as('requestReview')
    cy.intercept(Cypress.env('EDIT_ACTIVITY_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Activity updated.',
        details: { ...mockActivity, completionStatus: 'review' },
      },
    }).as('editActivity')
  })

  it('should show Request review button for student and call both APIs on click', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.get('[data-testid="activity-update-btn"]').contains('Request review')
    cy.get('[data-testid="activity-update-btn"]').click()
    cy.wait('@requestReview')
    cy.wait('@editActivity')
  })
})

describe('Mark Activity Complete', () => {
  const userWithActivityAndCards: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [mockUserCard] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithActivityAndCards)
    cy.intercept(Cypress.env('EDIT_ACTIVITY_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Activity updated.',
        details: { ...mockActivity, completionStatus: 'Completed' },
      },
    }).as('editActivity')
  })

  it('should navigate to activity page and call edit API when marking complete', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.get('[data-testid="activity-update-btn"]').contains('Mark completed')
    cy.get('[data-testid="activity-update-btn"]').click()
    cy.wait('@editActivity')
  })
})
