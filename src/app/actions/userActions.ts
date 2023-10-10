export function populateUser() {
  return {
    type: 'POPULATE',
    allData: JSON.parse(sessionStorage.getItem('user_data')) || {}
  }
}

export function resetUser() {
  return {
    type: 'RESET'
  }
}

export function addNewStudent(newStudent) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const updatedStudentIds = currentUserData.studentIds ? [...currentUserData.studentIds, newStudent.email] : [newStudent.email]
  currentUserData.studentIds = updatedStudentIds;
  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [
      {
        studentIds: updatedStudentIds
      }
    ]
  }

}

export function updateStudentData(newStudent) {
  newStudent.username = `${newStudent.firstName}-${newStudent.lastName}`
  const newStudentObj = {
    [`${newStudent.firstName}-${newStudent.lastName}`]: newStudent
  }
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const updatedStudents = currentUserData ? { ...currentUserData.students, ...newStudentObj } : { ...newStudentObj }
  currentUserData.students = updatedStudents;
  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [
      {
        students: updatedStudents
      }
    ]
  }

}

export function removeStudent(studentEmail) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  let studentToDelete;
  if (currentUserData.students) {
    studentToDelete = Object.values(currentUserData.students).find((student: any) => student.email === studentEmail)
  }
  const updatedStudentIds = currentUserData.studentIds.filter(id => id !== studentEmail)
  delete currentUserData.students[studentToDelete.username]
  currentUserData.studentIds = updatedStudentIds;

  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [
      {
        studentIds: updatedStudentIds
      },
      {
        students: currentUserData.students
      }
    ]
  }

}

export function createUserActivity(activityData) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const currentActivities = currentUserData.activities || []
  currentActivities.push(activityData)
  currentUserData.activities = currentActivities
  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [
      {
        activities: currentUserData.activities
      }
    ]
  }
}