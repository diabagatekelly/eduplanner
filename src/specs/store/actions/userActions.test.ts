import { mockActivity, mockStudent, mockUser, mockUserCard } from "../../mocks";
import {addNewStudent, createUserActivity, createUserCard, editUserActivity, editUserCard, populateUser, removeStudent, removeUserActivity, removeUserCard, resetUser, saveStudentDetails} from '../../../store/actions/userActions';
import { ISODateString } from '../../../interfaces/isoDateType';
import { CompletionStatus } from "../../../interfaces/CompletionStatusEnum";

describe('User actions', () => {
  let mockSessionStorage;
  const teacher = {...mockUser, lastLogin: new Date('2/3/2024').toISOString()}

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/3/2024'))

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

    it('should call RESET reducer when deleting user', () => {
      const reducer = resetUser();
      expect(reducer).toMatchObject({type: 'RESET'})
    })
  })

  describe('Student', () => {
    it('should call EDIT reducer with the user_data updated with new linked account student id (add new student)', () => {
      const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      const currentUserStudents = currentUser.linkedAccountsData?.students?.length
      expect(currentUser).toMatchObject(teacher)
      expect(currentUserStudents).toBeFalsy()
  
      const reducer = addNewStudent(mockStudent)
      const expectedUpdatedUser = {...teacher, linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username]]}}
      const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      expect(reducer).toMatchObject({
        type: 'EDIT',
        editProps: [
          {
            linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username]]}
          }
        ]
      })
      expect(updatedUser).toMatchObject(expectedUpdatedUser)
      expect(updatedUser.linkedAccountsData.students.some(tuple => (tuple[0] === mockStudent.userId))).toBe(true)
    })

    it('should call EDIT reducer with the user_data updated with new additional linked account student id (add 2nd new student)', () => {
      addNewStudent(mockStudent)
      const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))

      const currentUserStudents = currentUser.linkedAccountsData?.students?.length
      expect(currentUser).toMatchObject({...teacher, linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username]]}})
      expect(currentUserStudents).toBeTruthy()

      const secondStudent = {...mockStudent, userId: btoa('some-email.com'), email: 'some-email.com', username: 'student-2'}
      const reducer = addNewStudent(secondStudent)

      const expectedUpdatedUser = {...teacher, linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username], [secondStudent.userId, secondStudent.username]]}}
      const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      expect(reducer).toMatchObject({
        type: 'EDIT',
        editProps: [
          {
            linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username], [secondStudent.userId, secondStudent.username]]}
          }
        ]
      })
      expect(updatedUser).toMatchObject(expectedUpdatedUser)
      expect(updatedUser.linkedAccountsData.students.some(tuple => (tuple[0] === secondStudent.userId))).toBe(true)
    })

    it('should call EDIT reducer with the user_data updated with old student account removed (remove student)', () => {
      const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      const currentUserStudents = currentUser.linkedAccountsData?.students?.length
      expect(currentUser).toMatchObject(teacher)
      expect(currentUserStudents).toBeFalsy()
  
      addNewStudent(mockStudent)
      saveStudentDetails(mockStudent)

      const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      expect(updatedUser.linkedAccountsData.students.some(tuple => tuple[0] === mockStudent.userId)).toBe(true)
      expect(updatedUser.students[mockStudent.username]).toMatchObject(mockStudent)

      const reducer = removeStudent(mockStudent.userId)
      const expectedUpdatedUser = {...teacher, students: {}, linkedAccountsData: {students: []}}
      const updatedUserWithNoStudent = JSON.parse(mockSessionStorage.getItem('user_data'))

      expect(reducer).toMatchObject({
        type: 'EDIT',
        editProps: [
          {
            linkedAccountsData: {students: []}
          },
          {
            students: {}
          }
        ]
      })

      expect(updatedUserWithNoStudent).toMatchObject(expectedUpdatedUser)
      expect(updatedUserWithNoStudent.students).toMatchObject({})
      expect(updatedUserWithNoStudent.linkedAccountsData.students.length).toEqual(0)
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

    it('should call EDIT reducer with the user_data updated with new additional student details (save 2nd student details)', () => {
      saveStudentDetails(mockStudent)
      const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      const currentUserStudents = currentUser.students

      expect(currentUser).toMatchObject({...teacher, students: {'mock-student': mockStudent}})
      expect(currentUserStudents).toBeTruthy()
  
      const secondStudent = {...mockStudent, userId: btoa('some-email.com'), email: 'some-email.com', username: 'student-2'}
      const reducer = saveStudentDetails(secondStudent)
      const expectedUpdatedUser = {...teacher, students: {'mock-student': mockStudent, 'student-2': secondStudent}}
      const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      expect(reducer).toMatchObject({
        type: 'EDIT',
        editProps: [
          {
            students: {'mock-student': mockStudent, 'student-2': secondStudent}
          }
        ]
      })
      expect(updatedUser).toMatchObject(expectedUpdatedUser)
      expect(updatedUser.students).toMatchObject({'mock-student': mockStudent, 'student-2': secondStudent})
    })
  })

  describe('Activity', () => {
    it('should call EDIT reducer with user_data updated with main user new activity (create new activity for main user)', () => {
      const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
      const currentUserActivities = currentUser.activities
      expect(currentUserActivities).toEqual([])
  
      const reducer = createUserActivity({userActivity: mockActivity, username: teacher.username})
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

      const reducer = createUserActivity({userActivity: mockActivity, username: mockStudent.username})
      const expectedUpdatedUser = {...teacher, linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username]]}, students: {'mock-student': studentUpdatedWithActivity}}
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

    describe('With activity', () => {
      const student = {...mockStudent, activities: [mockActivity]}
      const teacher = {...mockUser, students: {[student.username]: student}, linkedAccountsData: {students: [student.userId]}, lastLogin: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString, activities: [mockActivity]}
      const updatedActivity = {...mockActivity, lastUpdatedOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString, completionStatus: CompletionStatus.COMPLETED}
      
      beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2/3/2024'))
    
        sessionStorage.clear()
        mockSessionStorage = sessionStorage;
        mockSessionStorage.setItem('user_data', JSON.stringify(teacher))
      })
    
      afterEach(() => {
        mockSessionStorage.clear()
        jest.clearAllMocks()
        jest.useRealTimers()
      })

      it('should call EDIT with user_data updated with main user updated activity (edit activity for main user)', () => {
        const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        const currentUserActivities = currentUser.activities
        expect(currentUserActivities[0]).toEqual(mockActivity)
        expect(currentUserActivities[0]).not.toEqual(updatedActivity)

        const reducer = editUserActivity({username: teacher.username, updatedActivity})
        const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        expect(reducer).toMatchObject({
          type: 'EDIT',
          editProps: [
            {
              activities: [updatedActivity]
            }
          ]
        })
        expect(updatedUser.activities[0]).toMatchObject(updatedActivity)
      })
    
      it('should call EDIT with user_data updated with student updated activity (edit activity for student)', () => {
        const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        const currentUserStudentActivities = currentUser.students[student.username].activities
        expect(currentUserStudentActivities[0]).toEqual(mockActivity)
        expect(currentUserStudentActivities[0]).not.toEqual(updatedActivity)

        const reducer = editUserActivity({username: student.username, updatedActivity})
        const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        expect(reducer).toMatchObject({
          type: 'EDIT',
          editProps: [
            {
              students: updatedUser.students
            }
          ]
        })
        expect(updatedUser.students[student.username].activities[0]).toMatchObject(updatedActivity)
      })

      it('should call EDIT with user_data updated with main user removed activity (remove activity for main user)', () => {
        const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        const currentUserActivities = currentUser.activities
        expect(currentUserActivities[0]).toEqual(mockActivity)
        expect(currentUserActivities[0]).not.toEqual(updatedActivity)

        const reducer = removeUserActivity(teacher.username, updatedActivity.name)
        const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        expect(reducer).toMatchObject({
          type: 'EDIT',
          editProps: [
            {
              activities: []
            }
          ]
        })
        expect(updatedUser.activities.length).toEqual(0)
      })

      it('should call EDIT with user_data updated with student removed activity (remove activity for student)', () => {
        const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        const currentUserStudentActivities = currentUser.students[student.username].activities
        expect(currentUserStudentActivities[0]).toEqual(mockActivity)
        expect(currentUserStudentActivities[0]).not.toEqual(updatedActivity)

        const reducer = removeUserActivity(student.username, updatedActivity.name)
        const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        expect(reducer).toMatchObject({
          type: 'EDIT',
          editProps: [
            {
              students: updatedUser.students
            }
          ]
        })
        expect(updatedUser.students[student.username].activities.length).toEqual(0)
      })
    })
  })

  describe('Cards', () => {
    describe('Create cards', () => {
      it('should call EDIT reducer with user_data updated with main user new cards (create new cards for main user)', () => {
        createUserActivity({userActivity: mockActivity, username: teacher.username})
        const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        const currentUserCards = currentUser.activities?.cards
        expect(currentUserCards).toBeFalsy()
  
        const activityWithCards = {...mockActivity, cards: [mockUserCard]}
    
        const reducer = createUserCard({username: teacher.username, activityName: 'Quran', newCards: [mockUserCard]})
        const expectedUpdatedUser = {...teacher, activities: [activityWithCards]}
        const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        expect(reducer).toMatchObject({
          type: 'EDIT',
          editProps: [
            {
              activities: [activityWithCards]
            }
          ]
        })
        expect(updatedUser).toMatchObject(expectedUpdatedUser)
        expect(updatedUser.activities[0].cards).toBeTruthy()
        expect(updatedUser.activities[0].cards).not.toMatchObject([])
        expect(JSON.stringify(updatedUser.activities[0].cards[0])).toEqual(JSON.stringify(mockUserCard))
      })
  
      it('should call EDIT reducer with user_data updated with student user new cards (create new cards for student user)', () => {
        addNewStudent(mockStudent)
        saveStudentDetails(mockStudent)
        createUserActivity({userActivity: mockActivity, username: mockStudent.username})
  
        const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        const currentUserStudents = currentUser.linkedAccountsData?.students?.length
        const currentUserStudentsDetails = currentUser.students
        const currentUserStudentsActivities = currentUserStudentsDetails[mockStudent.username].activities
        expect(currentUserStudents).toEqual(1)
        expect(currentUserStudentsDetails).toBeTruthy()
        expect(currentUserStudentsActivities.length).toEqual(1)
  
        const studentWithCards = {...mockStudent, activities: [{...mockActivity, cards: [mockUserCard]}]}
    
        const reducer = createUserCard({username: mockStudent.username, activityName: 'Quran', newCards: [mockUserCard]})
        const expectedUpdatedUser = {...teacher, linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username]]}, students: {'mock-student': studentWithCards}}
        const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        expect(reducer).toMatchObject({
          type: 'EDIT',
          editProps: [
            {
              students: {'mock-student': studentWithCards}
            }
          ]
        })
        expect(updatedUser).toMatchObject(expectedUpdatedUser)
        expect(updatedUser.students[mockStudent.username].activities[0].cards).toBeTruthy()
        expect(updatedUser.students[mockStudent.username].activities[0].cards).not.toMatchObject([])
        expect(JSON.stringify(updatedUser.students[mockStudent.username].activities[0].cards[0])).toEqual(JSON.stringify(mockUserCard))
      })
    })

    describe('Edit cards', () => {
      it('should call EDIT reducer with user_data updated with main user edited cards (edit cards for main user)', () => {
        createUserActivity({userActivity: mockActivity, username: teacher.username})
        createUserCard({username: teacher.username, activityName: 'Quran', newCards: [mockUserCard]})
        const userWithCards = JSON.parse(mockSessionStorage.getItem('user_data'))
        expect(JSON.stringify(userWithCards.activities[0].cards[0])).toEqual(JSON.stringify(mockUserCard))

        const reducer = editUserCard({username: teacher.username, activityName: 'Quran', updatedCard: {...mockUserCard, completionStatus: CompletionStatus.COMPLETED}})

        const expectedUpdatedUser = {...teacher, activities: [{...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.COMPLETED}]}]}
        const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        
        expect(reducer).toMatchObject({
          type: 'EDIT',
          editProps: [
            {
              activities: [{...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.COMPLETED}]}]
            }
          ]
        })
        expect(updatedUser).toMatchObject(expectedUpdatedUser)
        expect(JSON.stringify(updatedUser.activities[0].cards[0])).toEqual(JSON.stringify({...mockUserCard, completionStatus: CompletionStatus.COMPLETED}))
      })
  
      it('should call EDIT reducer with user_data updated with student user edited cards (edit cards for student user)', () => {
        addNewStudent(mockStudent)
        saveStudentDetails(mockStudent)
        createUserActivity({userActivity: mockActivity, username: mockStudent.username})
        createUserCard({username: mockStudent.username, activityName: 'Quran', newCards: [mockUserCard]})
  
        const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        const currentUserStudentsActivities = currentUser.students[mockStudent.username].activities
  
        expect(currentUserStudentsActivities[0].cards[0]).toMatchObject(mockUserCard)

        const updatedCard = {...mockUserCard, completionStatus: CompletionStatus.COMPLETED}
  
        const studentWithUpdatedCards = {...mockStudent, activities: [{...mockActivity, cards: [updatedCard]}]}
    
        const reducer = editUserCard({username: mockStudent.username, activityName: 'Quran', updatedCard: updatedCard})
        const expectedUpdatedUser = {...teacher, linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username]]}, students: {'mock-student': studentWithUpdatedCards}}
        const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        expect(reducer).toMatchObject({
          type: 'EDIT',
          editProps: [
            {
              students: {'mock-student': studentWithUpdatedCards}
            }
          ]
        })
        expect(updatedUser).toMatchObject(expectedUpdatedUser)
        expect(JSON.stringify(updatedUser.students[mockStudent.username].activities[0].cards[0])).toEqual(JSON.stringify(updatedCard))
      })
    })

    describe('Remove cards', () => {
      it('should call EDIT reducer with user_data updated with main user deleted cards (delete cards for main user)', () => {
        createUserActivity({userActivity: mockActivity, username: teacher.username})
        createUserCard({username: teacher.username, activityName: 'Quran', newCards: [mockUserCard]})
        const userWithCards = JSON.parse(mockSessionStorage.getItem('user_data'))
        expect(JSON.stringify(userWithCards.activities[0].cards[0])).toEqual(JSON.stringify(mockUserCard))

        const reducer = removeUserCard({username: teacher.username, activityName: 'Quran', cardId: mockUserCard.cardId})

        const expectedUpdatedUser = {...teacher, activities: [{...mockActivity, cards: []}]}
        const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        
        expect(reducer).toMatchObject({
          type: 'EDIT',
          editProps: [
            {
              activities: [{...mockActivity, cards: []}]
            }
          ]
        })
        expect(updatedUser).toMatchObject(expectedUpdatedUser)
        expect(updatedUser.activities[0].cards.length).toEqual(0)
      })
  
      it('should call EDIT reducer with user_data updated with student user deleted cards (deleted cards for student user)', () => {
        addNewStudent(mockStudent)
        saveStudentDetails(mockStudent)
        createUserActivity({userActivity: mockActivity, username: mockStudent.username})
        createUserCard({username: mockStudent.username, activityName: 'Quran', newCards: [mockUserCard]})
  
        const currentUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        const currentUserStudentsActivities = currentUser.students[mockStudent.username].activities
  
        expect(currentUserStudentsActivities[0].cards[0]).toMatchObject(mockUserCard)
  
        const studentWithUpdatedCards = {...mockStudent, activities: [{...mockActivity, cards: []}]}
    
        const reducer = removeUserCard({username: mockStudent.username, activityName: 'Quran', cardId: mockUserCard.cardId})
        const expectedUpdatedUser = {...teacher, linkedAccountsData: { students: [[mockStudent.userId, mockStudent.username]]}, students: {'mock-student': studentWithUpdatedCards}}
        const updatedUser = JSON.parse(mockSessionStorage.getItem('user_data'))
        expect(reducer).toMatchObject({
          type: 'EDIT',
          editProps: [
            {
              students: {'mock-student': studentWithUpdatedCards}
            }
          ]
        })
        expect(updatedUser).toMatchObject(expectedUpdatedUser)
        expect(updatedUser.students[mockStudent.username].activities[0].cards.length).toEqual(0)
      })
    })
    
  })
})