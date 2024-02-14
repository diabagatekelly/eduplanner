import { CompletionStatus } from "@/interfaces/CompletionStatusEnum";
import { ISODateString } from "@/interfaces/isoDateType";
import { formatISODate } from "@/utils/formatDate";

export const mockUser = {
  userId: btoa('mock.user@email.com'),
  firstName: 'mock',
  lastName: 'user',
  username: 'mock-user',
  email: 'mock.user@email.com',
  password: 'password',
  accountType: 'student',
  lastLogin: formatISODate(new Date().toISOString() as ISODateString) 
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