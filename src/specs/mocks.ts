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