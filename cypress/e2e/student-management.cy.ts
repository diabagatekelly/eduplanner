import { IUser } from '../../src/types/IUser'
import { ICard } from '../../src/types/ICard'
import { ISODateString } from '../../src/types/isoDateType'
import { CompletionStatus } from '../../src/types/CompletionStatusEnum'
import { mockActivity, mockUser, mockStudent, mockUserCard } from '../../src/specs/mocks'

/**
 * Teacher-managing-student journeys.
 *
 * These tests exercise the useStudent(studentId) query-key path, which is
 * different from the useUser(teacherId) path tested in cards.cy.ts.
 * The query-key mismatch bug (Layer 3) lived exactly here.
 */

const today = new Date(Date.now()).toLocaleDateString('en-US', {
  timeZone: 'EST',
}) as ISODateString

const studentCard: ICard = {
  ...mockUserCard,
  completionStatus: CompletionStatus.INACTIVE,
}

const studentWithActivity: IUser = {
  ...mockStudent,
  lastLogin: mockStudent.lastLogin as ISODateString,
  activities: [{ ...mockActivity, cards: [studentCard] }],
}

const teacherWithStudent: IUser = {
  ...mockUser,
  lastLogin: mockUser.lastLogin as ISODateString,
  linkedAccountsData: {
    students: [[mockStudent.userId, mockStudent.username] as [string, string]],
  },
}

/**
 * Shared setup: log in as teacher, intercept both teacher and student findUser
 * calls, then navigate to the student's activity page.
 */
function setupTeacherOnStudentActivity() {
  cy.loginBySession(teacherWithStudent)

  // Route findUser calls by userId — teacher vs student
  cy.intercept('GET', `${Cypress.env('GET_USER_URL')}*`, (req) => {
    const url = new URL(req.url)
    const requestedUserId = url.searchParams.get('userId')
    if (requestedUserId === mockStudent.userId) {
      req.reply({
        statusCode: 200,
        body: {
          status: 'success',
          message: 'User found.',
          details: { student: studentWithActivity },
        },
      })
    }
    // Teacher requests fall through to the loginBySession default intercept
  }).as('findStudent')

  // Navigate: dashboard → Manage Students → click student → student dashboard
  cy.contains('Manage Students').click()
  cy.get('[data-testid="students-email"]').first().click()
  cy.wait('@findStudent')
  cy.url().should('include', '/students/mock-student')

  // Navigate to student's activity
  cy.get('[data-testid="activity-in-list"]').first().click()
  cy.url().should('include', '/activities/Quran')
}

describe('Teacher Managing Student — Activate Card', () => {
  beforeEach(() => {
    setupTeacherOnStudentActivity()
    cy.intercept(Cypress.env('ACTIVATE_CARD_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Card activated.',
        details: { ...studentCard, completionStatus: 'Active' },
      },
    }).as('activateCard')
  })

  it('should activate a student card from the student activity page', () => {
    cy.contains('View All Inactive Cards').click()
    cy.url().should('include', '#inactive')
    cy.get('[data-testid="inactive-card-activate-btn"]').first().click()
    cy.get('[data-testid="manage-card-popup-activate"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="activate-card-btn"]').click()
    cy.wait('@activateCard')
  })
})

describe('Teacher Managing Student — Delete Card', () => {
  beforeEach(() => {
    setupTeacherOnStudentActivity()
    cy.intercept(Cypress.env('DELETE_CARD_URL'), {
      statusCode: 200,
      body: { status: 'success', message: 'Card deleted.' },
    }).as('deleteCard')
  })

  it('should delete a student card from the student activity page', () => {
    cy.contains('View All Inactive Cards').click()
    cy.url().should('include', '#inactive')
    cy.get('[data-testid="inactive-card-delete-btn"]').first().click()
    cy.get('[data-testid="manage-card-popup-delete"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="delete-card-btn"]').click()
    cy.wait('@deleteCard')
  })
})

describe('Teacher Managing Student — Override Stage', () => {
  const activeStudentCard: ICard = {
    ...studentCard,
    completionStatus: CompletionStatus.PENDING,
  }
  const studentWithActiveCard: IUser = {
    ...mockStudent,
    lastLogin: mockStudent.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [activeStudentCard] }],
  }

  beforeEach(() => {
    cy.loginBySession(teacherWithStudent)

    cy.intercept('GET', `${Cypress.env('GET_USER_URL')}*`, (req) => {
      const url = new URL(req.url)
      if (url.searchParams.get('userId') === mockStudent.userId) {
        req.reply({
          statusCode: 200,
          body: {
            status: 'success',
            message: 'User found.',
            details: { student: studentWithActiveCard },
          },
        })
      }
    }).as('findStudent')

    cy.intercept(Cypress.env('EDIT_CARD_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Card updated.',
        details: { ...activeStudentCard, stage: '7' },
      },
    }).as('editCard')

    cy.contains('Manage Students').click()
    cy.get('[data-testid="students-email"]').first().click()
    cy.wait('@findStudent')
    cy.get('[data-testid="activity-in-list"]').first().click()
  })

  it('should override a student card stage from the student activity page', () => {
    cy.contains('View All Active Cards').click()
    cy.url().should('include', '#active')
    cy.get('[data-testid="active-card-override-btn"]').first().click()
    cy.get('[data-testid="manage-card-popup-override"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="override-stge-form"]').select('7')
    cy.get('[data-testid="override-stage-btn"]').click()
    cy.wait('@editCard')
  })
})

describe('Teacher Managing Student — Reset Stage', () => {
  const todayStudentCard: ICard = {
    ...studentCard,
    completionStatus: CompletionStatus.PENDING,
    addedOn: today,
  }
  const studentWithTodayCard: IUser = {
    ...mockStudent,
    lastLogin: mockStudent.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [todayStudentCard] }],
  }

  beforeEach(() => {
    cy.loginBySession(teacherWithStudent)

    cy.intercept('GET', `${Cypress.env('GET_USER_URL')}*`, (req) => {
      const url = new URL(req.url)
      if (url.searchParams.get('userId') === mockStudent.userId) {
        req.reply({
          statusCode: 200,
          body: {
            status: 'success',
            message: 'User found.',
            details: { student: studentWithTodayCard },
          },
        })
      }
    }).as('findStudent')

    cy.intercept(Cypress.env('RESET_CARD_STAGE_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Card stage reset.',
        details: { ...todayStudentCard, stage: '0' },
      },
    }).as('resetCardStage')

    cy.contains('Manage Students').click()
    cy.get('[data-testid="students-email"]').first().click()
    cy.wait('@findStudent')
    cy.get('[data-testid="activity-in-list"]').first().click()
  })

  it('should reset a student card stage from the student activity page', () => {
    cy.get('[data-testid="today-card-edit-btn"]').first().click()
    cy.get('[data-testid="manage-card-popup-edit"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="reset-stage-btn"]').click()
    cy.wait('@resetCardStage')
  })
})
