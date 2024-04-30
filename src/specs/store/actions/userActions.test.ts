import { mockStudent, mockUser } from "../../mocks";
import {addNewStudent, populateUser, saveStudentDetails} from '../../../store/actions/userActions';
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

  it('should call POPULATE reducer with user data', () => {
    const reducer = populateUser()
    expect(reducer).toMatchObject({type: 'POPULATE', allData: teacher})
  })

  it('should call EDIT reducer with the user_data updated with new linked account student id', () => {
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

  it('should call EDIT reducer with the user_data updated with new student details', () => {
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