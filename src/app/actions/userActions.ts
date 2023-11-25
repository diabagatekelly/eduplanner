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
  const isMain = activityData.userEmail === currentUserData.email
  if (isMain) {
    const currentActivities = currentUserData.activities || []
    currentActivities.push(activityData)
    currentUserData.activities = currentActivities
  } else {
    const student = currentUserData.students[activityData.username]
    const studentActivities = student.activities || []
    studentActivities.push(activityData)
    currentUserData.students[activityData.username].activities = studentActivities
  }
  
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

export function editUserActivity(updateData) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = updateData.userEmail === currentUserData.email
  let activityToUpdate;

  if (isMain) {
    activityToUpdate = currentUserData.activities.find(activity => activity.name === updateData.name)
    let activityIndex = currentUserData.activities.indexOf(activityToUpdate)
    activityToUpdate.completionStatus = updateData.completionStatus
    activityToUpdate.dateLastCompleted

    currentUserData.activities[activityIndex] = activityToUpdate;
  } else {
    const student = currentUserData.students[updateData.username]
    activityToUpdate = student.activities.find(activity => activity.name === updateData.name)
    let activityIndex = student.activities.indexOf(activityToUpdate)
    activityToUpdate.completionStatus = updateData.completionStatus
    activityToUpdate.dateLastCompleted
    currentUserData.students[updateData.username].activities = activityToUpdate
  }

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

export function removeUserActivity(userInfo, activityName) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  let activitiesToKeep;
  const isMain = userInfo.username === currentUserData.username

  if (isMain) {
    activitiesToKeep = currentUserData.activities.filter(activity => activity.name !== activityName)
    currentUserData.activities = activitiesToKeep;
  } else {
    const student = currentUserData.students[userInfo.username]
    activitiesToKeep = student.activities.filter(activity => activity.name !== activityName)
    currentUserData.students[userInfo.username].activities = activitiesToKeep
  }
  
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

export function createUserCard(cardData) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = cardData[0].email === currentUserData.email
  if (isMain) {
    const currentActivities = currentUserData.activities
    let currentActivity = currentActivities.find(activity => activity.name === cardData[0].activityName)
    const currentActivityCards = currentActivity.cards || []
    const updatedActivityCards = [...currentActivityCards, ...cardData]
    currentActivity.cards = updatedActivityCards
    currentUserData.activities = currentActivities
  } else {
    const student = currentUserData.students[cardData[0].username]
    const studentActivities = student.activities || []
    let studentCurrentActivity = studentActivities.find(activity => activity.name === cardData[0].activityName)
    const studentActivityCards = studentCurrentActivity.cards || []
    const updatedStudentActivityCards = [...studentActivityCards, ...cardData]
    studentCurrentActivity.cards = updatedStudentActivityCards
    currentUserData.students[cardData[0].username].activities = studentActivities
  }
  
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