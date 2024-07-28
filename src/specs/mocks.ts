import { IUser } from "../../src/interfaces/IUser";
import { ICard } from "../../src/interfaces/ICard";
import { IActivity } from "../../src/interfaces/IActivity";
import { CompletionStatus } from "../../src/interfaces/CompletionStatusEnum";
import { ISODateString } from "../../src/interfaces/isoDateType";
import { IQuranSurahCard, IQuranJuzCard } from "@/interfaces/ICard";

export const mockUser: IUser = {
  userId: btoa('mock.user@email.com'),
  firstName: 'mock',
  lastName: 'user',
  username: 'mock-user',
  email: 'mock.user@email.com',
  password: 'password',
  accountType: 'teacher',
  linkedAccountsData: {students: []},
  lastLogin: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString, 
  activities: []
}

export const mockStudent: IUser = {
  userId: btoa('mock.student@email.com'),
  firstName: 'mock',
  lastName: 'student',
  username: 'mock-student',
  email: 'mock.student@email.com',
  password: 'password',
  accountType: 'student',
  linkedAccountsData: {teacher: null},
  lastLogin: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString,
  activities: [] 
}

export const mockActivity: IActivity = {
  activityId: btoa('mock.user@email.com-Quran'), // btoa(userEmail-activityName)
  name: 'Quran',
  points: 15,
  description: 'Quran memorization',
  completionStatus: CompletionStatus.PENDING,
  hasCards: true,
  createdOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString, 
  lastUpdatedOn: null
}

export const mockLanguageActivity: IActivity = {
  activityId: btoa('mock.user@email.com-Arabic-Language'), // btoa(userEmail-activityName)
  name: 'Arabic-Language',
  points: 10,
  description: 'Arabic language',
  completionStatus: CompletionStatus.PENDING,
  hasCards: true,
  createdOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString, 
  lastUpdatedOn: null
}

export const mockCookingActivity: IActivity = {
  activityId: btoa('mock.user@email.com-Cooking'), // btoa(userEmail-activityName)
  name: 'Cooking',
  points: 3,
  description: 'practice cooking',
  completionStatus: CompletionStatus.PENDING,
  hasCards: true,
  createdOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString, 
  lastUpdatedOn: null
}

export const mockUserCard: ICard = {
  cardId: `${btoa('surah-114-name-Naas-juz-30')}`,
  activity: 'Quran',
  activityType: 'Quran',
  addedOn: null,
  lastUpdatedOn: null,
  nextShowDate: null,
  stage: '0',
  completionStatus: CompletionStatus.INACTIVE
}

export const mockUserLanguageVocabCardOral: ICard = {
  cardId: `${btoa('arabic-vocab-house-oral')}`,
  activity: 'Arabic-Language',
  activityType: 'Vocab',
  addedOn: null,
  lastUpdatedOn: null,
  nextShowDate: null,
  stage: '0',
  completionStatus: CompletionStatus.INACTIVE
}

export const mockUserLanguageVocabCardSpelling: ICard = {
  cardId: `${btoa('arabic-vocab-house-spelling')}`,
  activity: 'Arabic-Language',
  activityType: 'Vocab',
  addedOn: null,
  lastUpdatedOn: null,
  nextShowDate: null,
  stage: '0',
  completionStatus: CompletionStatus.INACTIVE
}

export const mockUserLanguageGrammarCard: ICard = {
  cardId: `${btoa('arabic-grammar-house')}`,
  activity: 'Arabic-Language',
  activityType: 'Grammar',
  addedOn: null,
  lastUpdatedOn: null,
  nextShowDate: null,
  stage: '0',
  completionStatus: CompletionStatus.INACTIVE
}

export const mockUserMiscCard: ICard = {
  cardId: `${btoa('misc-card-cook an egg')}`,
  activity: 'Cooking',
  activityType: 'Miscellaneous',
  addedOn: null,
  lastUpdatedOn: null,
  nextShowDate: null,
  stage: '0',
  completionStatus: CompletionStatus.INACTIVE
}

export const mockBankSurahCard: IQuranSurahCard = {
  cardId: `${btoa('surah-114-name-Naas-juz-30')}`,
  type: 'Quran',
  level: 'Surah',
  name: 'Naas',
  juz: 30,
  number: 114
}

export const mockBankJuzCard: IQuranJuzCard = {
  cardId: `${btoa('juz-30')}`,
  type: 'Quran',
  level: 'Juz',
  juz: 30
}