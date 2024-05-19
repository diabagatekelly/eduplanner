import { mockActivity, mockStudent, mockUser } from "../../mocks";
import {addNewStudent, createUserActivity, populateUser, saveStudentDetails} from '../../../store/actions/userActions';
import { ISODateString } from '../../../interfaces/isoDateType';
import { formatISODate } from '../../../utils/formatDate';

describe('User actions', () => {
  let mockSessionStorage;
  const teacher = {...mockUser, lastLogin: formatISODate(new Date().toISOString() as ISODateString)}

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-02-04'))

    sessionStorage.clear()
    mockSessionStorage = sessionStorage;
    mockSessionStorage.setItem('user_data', JSON.stringify(teacher))
  })

  afterEach(() => {
    mockSessionStorage.clear()
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  describe('Main user', () => {
    it('should call POPULATE reducer with user data (login)', () => {
      const reducer = populateUser()
      expect(reducer).toMatchObject({type: 'POPULATE', allData: teacher})
    })
  })

  describe('Student', () => {
    it('should call EDIT reducer with the user_data updated with new linked account student id (add new student)', () => {
      const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      const currentUserStudents = currentUser.linkedAccountsData?.students?.length
      expect(currentUser).toMatchObject(teacher)
      expect(currentUserStudents).toBeFalsy()
  
      const reducer = addNewStudent(mockStudent)
      const expectedUpdatedUser = {...teacher, linkedAccountsData: { students: [mockStudent.userId]}}
      const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      expect(reducer).toMatchObject({
        type: 'EDIT',
        editProps: [
          {
            linkedAccountsData: { students: [mockStudent.userId]}
          }
        ]
      })
      expect(updatedUser).toMatchObject(expectedUpdatedUser)
      expect(updatedUser.linkedAccountsData.students.includes(mockStudent.userId)).toBe(true)
    })
  
    it('should call EDIT reducer with the user_data updated with new student details (save student details)', () => {
      const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      const currentUserStudents = currentUser.students
      expect(currentUser).toMatchObject(teacher)
      expect(currentUserStudents).toBeFalsy()
  
      const reducer = saveStudentDetails(mockStudent)
      const expectedUpdatedUser = {...teacher, students: {'mock-student': mockStudent}}
      const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      expect(reducer).toMatchObject({
        type: 'EDIT',
        editProps: [
          {
            students: {'mock-student': mockStudent}
          }
        ]
      })
      expect(updatedUser).toMatchObject(expectedUpdatedUser)
      expect(updatedUser.students).toMatchObject({'mock-student': mockStudent})
    })
  })

  describe('Activity', () => {
    it('should call EDIT reducer with user_data updated with main user new activity (create new activity for main user)', () => {
      const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      const currentUserActivities = currentUser.activities
      expect(currentUserActivities).toEqual([])
  
      const reducer = createUserActivity({userActivity: mockActivity, userId: teacher.userId, username: teacher.username})
      const expectedUpdatedUser = {...teacher, activities: [mockActivity]}
      const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      expect(reducer).toMatchObject({
        type: 'EDIT',
        editProps: [
          {
            activities: [mockActivity]
          }
        ]
      })
      expect(updatedUser).toMatchObject(expectedUpdatedUser)
      expect(updatedUser.activities).not.toMatchObject([])
      expect(JSON.stringify(updatedUser.activities[0])).toEqual(JSON.stringify(mockActivity))
    })

    it('should call EDIT reducer with user_data updated with student new activity (create new activity for student)', () => {
      const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      const currentUserStudents = currentUser.linkedAccountsData?.students?.length
      const currentUserStudentsDetails = currentUser.students
      expect(currentUserStudents).toEqual(0)
      expect(currentUserStudentsDetails).toBeFalsy()

      addNewStudent(mockStudent)
      saveStudentDetails(mockStudent)

      const studentUpdatedWithActivity = {...mockStudent, activities: [mockActivity]}

      const reducer = createUserActivity({userActivity: mockActivity, userId: mockStudent.userId, username: mockStudent.username})
      const expectedUpdatedUser = {...teacher, linkedAccountsData: { students: [mockStudent.userId]}, students: {'mock-student': studentUpdatedWithActivity}}
      const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      expect(reducer).toMatchObject({
        type: 'EDIT',
        editProps: [
          {
            students: {'mock-student': studentUpdatedWithActivity}
          }
        ]
      })
      expect(updatedUser).toMatchObject(expectedUpdatedUser)
      expect(updatedUser.students['mock-student'].activities).not.toMatchObject([])
      expect(JSON.stringify(updatedUser.students['mock-student'].activities[0])).toEqual(JSON.stringify(mockActivity))
    })
  })
})