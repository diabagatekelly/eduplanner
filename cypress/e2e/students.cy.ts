import { mockUser, mockStudent } from '../../src/specs/mocks'
import { IUser } from '../../src/types/IUser'
import { ISODateString } from '../../src/types/isoDateType'

describe('Students Page', () => {
  describe('No students yet', () => {
    const user: IUser = { ...mockUser, lastLogin: mockUser.lastLogin as ISODateString }

    beforeEach(() => {
      cy.intercept(
        { method: 'GET', pathname: '/user/login' },
        {
          statusCode: 200,
          body: {
            status: 'success',
            message: 'User found',
            details: { token: 'xxxxxx', user },
          },
        }
      ).as('loginSuccess')
    })

    it('should show empty state when teacher has no students', () => {
      cy.login({ email: user.email, password: user.password })
      cy.wait('@loginSuccess')
      cy.contains('Manage Students').click()
      cy.url().should('include', '/students')
      cy.get('[data-testid="no-students-message"]').should('exist')
    })
  })

  describe('Link student', () => {
    const user: IUser = { ...mockUser, lastLogin: mockUser.lastLogin as ISODateString }
    const student: IUser = { ...mockStudent, lastLogin: mockStudent.lastLogin as ISODateString }

    beforeEach(() => {
      cy.intercept(
        { method: 'GET', pathname: '/user/login' },
        {
          statusCode: 200,
          body: {
            status: 'success',
            message: 'User found',
            details: { token: 'xxxxxx', user },
          },
        }
      ).as('loginSuccess')
      cy.intercept(
        { method: 'GET', url: `${Cypress.env('GET_USER_URL')}*` },
        {
          statusCode: 200,
          body: {
            status: 'success',
            message: 'User found.',
            details: { student },
          },
        }
      ).as('findUser')
      cy.intercept(Cypress.env('LINK_ACCOUNT_URL'), {
        statusCode: 200,
        body: { status: 'success', message: 'Accounts linked.' },
      }).as('linkAccount')
    })

    it('should find student by email, open link popup, and confirm link', () => {
      cy.login({ email: user.email, password: user.password })
      cy.wait('@loginSuccess')
      cy.contains('Manage Students').click()
      cy.url().should('include', '/students')
      cy.get('[data-testid="student-email"]').type(student.email)
      cy.get('[data-testid="find-student-btn"]').click()
      cy.wait('@findUser')
      cy.get('[data-testid="link-account-popup"]').should('not.have.attr', 'hidden')
      cy.contains('Are you sure you want to add this student?')
      cy.get('[data-testid="link-accounts-btn"]').click()
      cy.wait('@linkAccount')
    })
  })

  describe('With linked student', () => {
    const userWithStudent: IUser = {
      ...mockUser,
      lastLogin: mockUser.lastLogin as ISODateString,
      linkedAccountsData: {
        students: [[mockStudent.userId, mockStudent.username] as [string, string]],
      },
    }

    beforeEach(() => {
      cy.intercept(
        { method: 'GET', pathname: '/user/login' },
        {
          statusCode: 200,
          body: {
            status: 'success',
            message: 'User found',
            details: { token: 'xxxxxx', user: userWithStudent },
          },
        }
      ).as('loginSuccess')
    })

    it('should display linked student in the students list', () => {
      cy.login({ email: userWithStudent.email, password: userWithStudent.password })
      cy.wait('@loginSuccess')
      cy.contains('Manage Students').click()
      cy.url().should('include', '/students')
      cy.get('[data-testid="students-list"]').should('exist')
      cy.contains('mock student')
    })
  })

  describe('Navigate to student dashboard', () => {
    const userWithStudent: IUser = {
      ...mockUser,
      lastLogin: mockUser.lastLogin as ISODateString,
      linkedAccountsData: {
        students: [[mockStudent.userId, mockStudent.username] as [string, string]],
      },
    }

    beforeEach(() => {
      cy.intercept(
        { method: 'GET', pathname: '/user/login' },
        {
          statusCode: 200,
          body: {
            status: 'success',
            message: 'User found',
            details: { token: 'xxxxxx', user: userWithStudent },
          },
        }
      ).as('loginSuccess')
      cy.intercept(
        { method: 'GET', url: `${Cypress.env('GET_USER_URL')}*` },
        {
          statusCode: 200,
          body: {
            status: 'success',
            message: 'User found.',
            details: {
              student: { ...mockStudent, lastLogin: mockStudent.lastLogin as ISODateString },
            },
          },
        }
      ).as('findStudent')
    })

    it('should navigate to student dashboard when teacher clicks student name', () => {
      cy.login({ email: userWithStudent.email, password: userWithStudent.password })
      cy.wait('@loginSuccess')
      cy.contains('Manage Students').click()
      cy.url().should('include', '/students')
      cy.get('[data-testid="students-email"]').first().click()
      cy.wait('@findStudent')
      cy.url().should('include', '/students/mock-student')
    })
  })

  describe('Unlink student', () => {
    const userWithStudent: IUser = {
      ...mockUser,
      lastLogin: mockUser.lastLogin as ISODateString,
      linkedAccountsData: {
        students: [[mockStudent.userId, mockStudent.username] as [string, string]],
      },
    }

    beforeEach(() => {
      cy.intercept(
        { method: 'GET', pathname: '/user/login' },
        {
          statusCode: 200,
          body: {
            status: 'success',
            message: 'User found',
            details: { token: 'xxxxxx', user: userWithStudent },
          },
        }
      ).as('loginSuccess')
      cy.intercept(
        { method: 'DELETE', url: `${Cypress.env('UNLINK_ACCOUNT_URL')}/**` },
        {
          statusCode: 200,
          body: { status: 'success', message: 'Accounts unlinked.' },
        }
      ).as('unlinkAccount')
    })

    it('should open unlink popup and call unlink API on confirm', () => {
      cy.login({ email: userWithStudent.email, password: userWithStudent.password })
      cy.wait('@loginSuccess')
      cy.contains('Manage Students').click()
      cy.url().should('include', '/students')
      cy.get('[data-testid="student-list-delete"]').first().click()
      cy.get('[data-testid="unlink-account-popup"]').should('not.have.attr', 'hidden')
      cy.contains('Are you sure you want to remove this student?')
      cy.get('[data-testid="unlink-accounts-btn"]').click()
      cy.wait('@unlinkAccount')
    })
  })
})
