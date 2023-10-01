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
  newStudent.username = `${newStudent.firstName}-${newStudent.lastName}`
  const newStudentObj = {
    [newStudent.email]: newStudent
  }
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const updatedStudentIds = currentUserData.studentIds ? [...currentUserData.studentIds, newStudent.email] : [newStudent.email]
  const updatedStudents = currentUserData ? { ...currentUserData.students, ...newStudentObj } : { ...newStudentObj }
  currentUserData.studentIds = updatedStudentIds;
  currentUserData.students = updatedStudents;
  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [
      {
        studentIds: updatedStudentIds
      },
      {
        students: updatedStudents
      }
    ]
  }

}

export function removeStudent(studentEmail) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const updatedStudentIds = currentUserData.studentIds.filter(id => id !== studentEmail)
  delete currentUserData.students[studentEmail]
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