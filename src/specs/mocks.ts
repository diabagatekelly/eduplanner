import { IUser } from "../../src/interfaces/IUser";
import { ICard } from "../../src/interfaces/ICard";
import { IActivity } from "../../src/interfaces/IActivity";
import { CompletionStatus } from "../../src/interfaces/CompletionStatusEnum";
import { ISODateString } from "../../src/interfaces/isoDateType";
import { formatISODate } from "../../src/utils/formatDate";
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

export const mockUserCard: ICard = {
  cardId: `${btoa('surah-114-name-Naas-juz-30')}`,
  activity: 'Quran',
  activityType: 'Quran',
  addedOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString,
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