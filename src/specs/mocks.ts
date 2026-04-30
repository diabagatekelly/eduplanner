import { IUser } from '../types/IUser'
import { ICard } from '../types/ICard'
import { IActivity } from '../types/IActivity'
import { CompletionStatus, COMPLETION_STATUS } from '../lib/constants/completion-status'
import { ISODateString } from '../types/ISODateString'
import { IQuranSurahCard, IQuranJuzCard } from '@/types/ICard'
import { ACTIVITY_TYPES } from '../lib/constants/activity-types'
import { CARD_ACTIVITY_TYPES } from '../lib/constants/card-types'

export const mockUser: IUser = {
  userId: btoa('mock.user@email.com'),
  firstName: 'mock',
  lastName: 'user',
  username: 'mock-user',
  email: 'mock.user@email.com',
  password: 'password',
  accountType: 'teacher',
  linkedAccountsData: { students: [] },
  lastLogin: new Date(Date.now()).toLocaleDateString('en-US', { timeZone: 'EST' }) as ISODateString,
  activities: [],
}

export const mockStudent: IUser = {
  userId: btoa('mock.student@email.com'),
  firstName: 'mock',
  lastName: 'student',
  username: 'mock-student',
  email: 'mock.student@email.com',
  password: 'password',
  accountType: 'student',
  linkedAccountsData: {},
  lastLogin: new Date(Date.now()).toLocaleDateString('en-US', { timeZone: 'EST' }) as ISODateString,
  activities: [],
}

export const mockActivity: IActivity = {
  activityId: btoa(`mock.user@email.com-${ACTIVITY_TYPES.QURAN}`), // btoa(userEmail-activityName)
  name: ACTIVITY_TYPES.QURAN,
  points: 15,
  description: 'Quran memorization',
  completionStatus: COMPLETION_STATUS.PENDING,
  hasCards: true,
  createdOn: new Date(Date.now()).toLocaleDateString('en-US', { timeZone: 'EST' }) as ISODateString,
  lastUpdatedOn: null,
}

export const mockLanguageActivity: IActivity = {
  activityId: btoa('mock.user@email.com-Arabic-Language'), // btoa(userEmail-activityName)
  name: 'Arabic-Language',
  points: 10,
  description: 'Arabic language',
  completionStatus: COMPLETION_STATUS.PENDING,
  hasCards: true,
  createdOn: new Date(Date.now()).toLocaleDateString('en-US', { timeZone: 'EST' }) as ISODateString,
  lastUpdatedOn: null,
}

export const mockCookingActivity: IActivity = {
  activityId: btoa('mock.user@email.com-Cooking'), // btoa(userEmail-activityName)
  name: 'Cooking',
  points: 3,
  description: 'practice cooking',
  completionStatus: COMPLETION_STATUS.PENDING,
  hasCards: true,
  createdOn: new Date(Date.now()).toLocaleDateString('en-US', { timeZone: 'EST' }) as ISODateString,
  lastUpdatedOn: null,
}

export const mockUserCard: ICard = {
  cardId: `${btoa('surah-114-name-Naas-juz-30')}`,
  activity: ACTIVITY_TYPES.QURAN,
  activityType: CARD_ACTIVITY_TYPES.QURAN,
  addedOn: null,
  lastUpdatedOn: null,
  nextShowDate: null,
  stage: '0',
  completionStatus: COMPLETION_STATUS.INACTIVE,
}

export const mockUserLanguageVocabCard: ICard = {
  cardId: `${btoa('arabic-vocab-house')}`,
  activity: 'Arabic-Language',
  activityType: CARD_ACTIVITY_TYPES.VOCAB,
  addedOn: null,
  lastUpdatedOn: null,
  nextShowDate: null,
  stage: '0',
  completionStatus: COMPLETION_STATUS.INACTIVE,
}

export const mockUserLanguageGrammarCard: ICard = {
  cardId: `${btoa('arabic-grammar-house')}`,
  activity: 'Arabic-Language',
  activityType: CARD_ACTIVITY_TYPES.GRAMMAR,
  addedOn: null,
  lastUpdatedOn: null,
  nextShowDate: null,
  stage: '0',
  completionStatus: COMPLETION_STATUS.INACTIVE,
}

export const mockUserMiscCard: ICard = {
  cardId: `${btoa('misc-card-cook an egg')}`,
  activity: 'Cooking',
  activityType: CARD_ACTIVITY_TYPES.MISCELLANEOUS,
  addedOn: null,
  lastUpdatedOn: null,
  nextShowDate: null,
  stage: '0',
  completionStatus: COMPLETION_STATUS.INACTIVE,
}

export const mockBankSurahCard: IQuranSurahCard = {
  cardId: `${btoa('surah-114-name-Naas-juz-30')}`,
  type: CARD_ACTIVITY_TYPES.QURAN,
  level: 'Surah',
  name: 'Naas',
  juz: 30,
  number: 114,
}

export const mockBankJuzCard: IQuranJuzCard = {
  cardId: `${btoa('juz-30')}`,
  type: CARD_ACTIVITY_TYPES.QURAN,
  level: 'Juz',
  juz: 30,
}
