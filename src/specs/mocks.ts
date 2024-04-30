import { IUser } from "../../src/interfaces/IUser";
import { CompletionStatus } from "../../src/interfaces/CompletionStatusEnum";
import { ISODateString } from "../../src/interfaces/isoDateType";
import { formatISODate } from "../../src/utils/formatDate";

export const mockUser: IUser = {
  userId: btoa('mock.user@email.com'),
  firstName: 'mock',
  lastName: 'user',
  username: 'mock-user',
  email: 'mock.user@email.com',
  password: 'password',
  accountType: 'teacher',
  linkedAccountsData: {students: []},
  lastLogin: formatISODate(new Date().toISOString() as ISODateString), 
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
  lastLogin: formatISODate(new Date().toISOString() as ISODateString),
  activities: [] 
}

export const mockActivity = {
  activityId: btoa('mock.user@email.com-Quran'), // btoa(userEmail-activityName)
  name: 'Quran',
  points: 15,
  description: 'Quran memorization',
  completionStatus: CompletionStatus.PENDING,
  hasCards: true,
  createdOn: formatISODate(new Date().toISOString() as ISODateString), 
  lastUpdatedOn: null,
}