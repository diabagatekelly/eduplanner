import { IUser } from '../../src/types/IUser'
import { ICard } from '../../src/types/ICard'
import { ISODateString } from '../../src/types/isoDateType'
import { CompletionStatus } from '../../src/types/CompletionStatusEnum'
import {
  mockActivity,
  mockLanguageActivity,
  mockCookingActivity,
  mockUser,
  mockStudent,
  mockUserCard,
  mockUserLanguageGrammarCard,
  mockUserMiscCard,
} from '../../src/specs/mocks'

describe('Add Quran Cards', () => {
  const userWithActivity: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithActivity)
    cy.intercept(Cypress.env('CREATE_CARD_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Cards added.',
        details: [mockUserCard],
      },
    }).as('createCards')
  })

  it('should navigate to add-card form via sidebar and submit Quran cards', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.contains('Add new card').click()
    cy.url().should('include', '#add')
    cy.get('[data-testid="addQuranCardForm"]').should('exist')
    cy.get('[data-testid="quran-checkbox-input"]').first().check()
    cy.get('[data-testid="add-cards-submit-button"]').click()
    cy.wait('@createCards')
    cy.get('[data-testid="outcome-message"]').should('not.be.empty')
  })
})

describe('Add Quran Custom Card', () => {
  const userWithActivity: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithActivity)
    cy.intercept(Cypress.env('CREATE_CARD_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Cards added.',
        details: [mockUserCard],
      },
    }).as('createCards')
  })

  it('should add a custom Quran card via text input and submit', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.contains('Add new card').click()
    cy.url().should('include', '#add')
    cy.get('[data-testid="addQuranCardForm"]').should('exist')
    cy.get('[data-testid="custom-quran"]').type('Naas 1 to 2')
    cy.get('[data-testid="add-cards-submit-button"]').click()
    cy.wait('@createCards')
    cy.get('[data-testid="outcome-message"]').should('not.be.empty')
  })
})

describe('Add Language Cards', () => {
  const userWithLanguageActivity: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockLanguageActivity, cards: [] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithLanguageActivity)
    cy.intercept(Cypress.env('CREATE_CARD_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Cards added.',
        details: [mockUserLanguageGrammarCard],
      },
    }).as('createCards')
  })

  it('should add a grammar card via type list and validate popup', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Arabic-Language')
    cy.contains('Add new card').click()
    cy.url().should('include', '#add')
    cy.get('[data-testid="add-language-card-form"]').should('exist')
    cy.get('[data-testid="select-language-card-type"] select').select('Grammar card')
    cy.get('[data-testid="textarea-for-typed-list"]').type('conjugate 3 verbs in present tense')
    cy.get('[data-testid="add-type-cards-validate-button"]').click()
    cy.get('[data-testid="validate-popup"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="validate-btn"]').click()
    cy.wait('@createCards')
  })
})

describe('Add Misc Cards', () => {
  const userWithMiscActivity: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockCookingActivity, cards: [] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithMiscActivity)
    cy.intercept(Cypress.env('CREATE_CARD_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Cards added.',
        details: [mockUserMiscCard],
      },
    }).as('createCards')
  })

  it('should add a misc card via type list and validate popup', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Cooking')
    cy.contains('Add new card').click()
    cy.url().should('include', '#add')
    cy.get('[data-testid="add-misc-card-form"]').should('exist')
    cy.get('[data-testid="textarea-for-typed-list"]').type('cook an egg, practice making your bed')
    cy.get('[data-testid="add-type-cards-validate-button"]').click()
    cy.get('[data-testid="validate-popup"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="validate-btn"]').click()
    cy.wait('@createCards')
  })
})

describe('Cards list display', () => {
  const userWithCards: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [mockUserCard] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithCards)
  })

  it('should show inactive cards tab with existing cards', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.contains('View All Inactive Cards').click()
    cy.url().should('include', '#inactive')
    cy.get('[data-testid="list-inactive-cards"]').should('exist')
  })
})

describe('Card Management — Activate', () => {
  const userWithInactiveCard: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [mockUserCard] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithInactiveCard)
    cy.intercept(Cypress.env('ACTIVATE_CARD_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Card activated.',
        details: { ...mockUserCard, completionStatus: 'Active' },
      },
    }).as('activateCard')
  })

  it('should open activate popup and call activate API on confirm', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.contains('View All Inactive Cards').click()
    cy.url().should('include', '#inactive')
    cy.get('[data-testid="inactive-card-activate-btn"]').first().click()
    cy.get('[data-testid="manage-card-popup-activate"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="activate-card-btn"]').click()
    cy.wait('@activateCard')
  })
})

describe('Add Language Vocab Cards', () => {
  const userWithLanguageActivity: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockLanguageActivity, cards: [] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithLanguageActivity)
    cy.intercept(Cypress.env('CREATE_CARD_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Cards added.',
        details: [mockUserLanguageGrammarCard],
      },
    }).as('createCards')
  })

  it('should add a vocab card via type list and validate popup', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Arabic-Language')
    cy.contains('Add new card').click()
    cy.url().should('include', '#add')
    cy.get('[data-testid="add-language-card-form"]').should('exist')
    cy.get('[data-testid="select-language-card-type"] select').select('Vocab card')
    cy.get('[data-testid="select-input-type"] select').select('Type list')
    cy.get('[data-testid="textarea-for-typed-list"]').type('house, tree, car')
    cy.get('[data-testid="add-type-cards-validate-button"]').click()
    cy.get('[data-testid="validate-popup"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="validate-btn"]').click()
    cy.wait('@createCards')
  })
})

describe('Card Management — Delete', () => {
  const userWithInactiveCard: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [mockUserCard] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithInactiveCard)
    cy.intercept(Cypress.env('DELETE_CARD_URL'), {
      statusCode: 200,
      body: { status: 'success', message: 'Card deleted.' },
    }).as('deleteCard')
  })

  it('should open delete popup and call delete API on confirm', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.contains('View All Inactive Cards').click()
    cy.url().should('include', '#inactive')
    cy.get('[data-testid="inactive-card-delete-btn"]').first().click()
    cy.get('[data-testid="manage-card-popup-delete"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="delete-card-btn"]').click()
    cy.wait('@deleteCard')
  })
})

describe('Active Cards Display', () => {
  const mockActiveCard: ICard = {
    ...mockUserCard,
    completionStatus: CompletionStatus.PENDING,
  }
  const userWithActiveCard: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [mockActiveCard] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithActiveCard)
  })

  it('should show active cards tab with existing active cards', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.contains('View All Active Cards').click()
    cy.url().should('include', '#active')
    cy.get('[data-testid="list-active-cards"]').should('exist')
  })
})

describe('Today Cards Display', () => {
  const today = new Date(Date.now()).toLocaleDateString('en-US', {
    timeZone: 'EST',
  }) as ISODateString
  const mockTodayCard: ICard = {
    ...mockUserCard,
    completionStatus: CompletionStatus.PENDING,
    addedOn: today,
  }
  const userWithTodayCard: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [mockTodayCard] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithTodayCard)
  })

  it('should show cards of the day on default activity view', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.get('[data-testid="list-today-cards"]').should('exist')
  })
})

describe('Card Management — Promote', () => {
  const today = new Date(Date.now()).toLocaleDateString('en-US', {
    timeZone: 'EST',
  }) as ISODateString
  const mockTodayCard: ICard = {
    ...mockUserCard,
    completionStatus: CompletionStatus.PENDING,
    addedOn: today,
  }
  const userWithTodayCard: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [mockTodayCard] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithTodayCard)
    cy.intercept(Cypress.env('EDIT_CARD_STAGE_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Card stage updated.',
        details: { ...mockTodayCard, stage: '1' },
      },
    }).as('editCardStage')
  })

  it('should open edit popup and promote card stage', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.get('[data-testid="today-card-edit-btn"]').first().click()
    cy.get('[data-testid="manage-card-popup-edit"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="promote-stage-btn"]').click()
    cy.wait('@editCardStage')
  })
})

describe('Card Management — Reset Stage', () => {
  const today = new Date(Date.now()).toLocaleDateString('en-US', {
    timeZone: 'EST',
  }) as ISODateString
  const mockTodayCard: ICard = {
    ...mockUserCard,
    completionStatus: CompletionStatus.PENDING,
    addedOn: today,
  }
  const userWithTodayCard: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [mockTodayCard] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithTodayCard)
    cy.intercept(Cypress.env('RESET_CARD_STAGE_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Card stage reset.',
        details: { ...mockTodayCard, stage: '0' },
      },
    }).as('resetCardStage')
  })

  it('should open edit popup and reset card stage', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.get('[data-testid="today-card-edit-btn"]').first().click()
    cy.get('[data-testid="manage-card-popup-edit"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="reset-stage-btn"]').click()
    cy.wait('@resetCardStage')
  })
})

describe('Card Management — Override Stage', () => {
  const mockActiveCard: ICard = {
    ...mockUserCard,
    completionStatus: CompletionStatus.PENDING,
  }
  const userWithActiveCard: IUser = {
    ...mockUser,
    lastLogin: mockUser.lastLogin as ISODateString,
    activities: [{ ...mockActivity, cards: [mockActiveCard] }],
  }

  beforeEach(() => {
    cy.loginBySession(userWithActiveCard)
    cy.intercept(Cypress.env('EDIT_CARD_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Card updated.',
        details: { ...mockActiveCard, stage: '7' },
      },
    }).as('editCard')
  })

  it('should open override popup, select a stage, and call edit card API on confirm', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.contains('View All Active Cards').click()
    cy.url().should('include', '#active')
    cy.get('[data-testid="active-card-override-btn"]').first().click()
    cy.get('[data-testid="manage-card-popup-override"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="override-stge-form"]').select('7')
    cy.get('[data-testid="override-stage-btn"]').click()
    cy.wait('@editCard')
  })
})

describe('Card Management — Submit for Review', () => {
  const today = new Date(Date.now()).toLocaleDateString('en-US', {
    timeZone: 'EST',
  }) as ISODateString
  const mockTodayCard: ICard = {
    ...mockUserCard,
    activity: mockActivity.name,
    completionStatus: CompletionStatus.PENDING,
    addedOn: today,
  }
  const mockStudentWithTeacher = {
    ...mockStudent,
    lastLogin: mockStudent.lastLogin as ISODateString,
    linkedAccountsData: { teacher: mockUser.userId },
    activities: [{ ...mockActivity, cards: [mockTodayCard] }],
  }
  beforeEach(() => {
    cy.loginBySession(mockStudentWithTeacher)
    cy.intercept(Cypress.env('REQUEST_REVIEW_URL'), {
      statusCode: 200,
      body: { status: 'success', message: 'Review requested.' },
    }).as('requestReview')
    cy.intercept(Cypress.env('EDIT_CARD_STAGE_URL'), {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Card stage updated.',
        details: { ...mockTodayCard, completionStatus: CompletionStatus.REVIEW },
      },
    }).as('editCardStage')
  })

  it('should submit card for teacher review as a student', () => {
    cy.get('[data-testid="activity-in-list"]').first().click()
    cy.url().should('include', '/activities/Quran')
    cy.get('[data-testid="today-card-edit-btn"]').first().click()
    cy.get('[data-testid="manage-card-popup-edit"]').should('not.have.attr', 'hidden')
    cy.get('[data-testid="submit-review-btn"]').click()
    cy.wait('@requestReview')
    cy.wait('@editCardStage')
  })
})
