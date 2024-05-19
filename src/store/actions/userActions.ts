import { IActivity } from "@/interfaces/IActivity";
import { IUser } from "@/interfaces/IUser";

export function populateUser() {
  return {
    type: 'POPULATE',
    allData: <IUser>(JSON.parse(sessionStorage.getItem('user_data'))) || {}
  }
}

export function resetUser() {
  return {
    type: 'RESET'
  }
}

export function addNewStudent(newStudent: IUser) {
  let currentUserData: IUser = JSON.parse(sessionStorage.getItem('user_data'))
  const hasStudents = currentUserData.linkedAccountsData?.students?.length
  const updatedStudentIds = hasStudents ? [...currentUserData.linkedAccountsData?.students, newStudent.userId] : [newStudent.userId]
  currentUserData.linkedAccountsData.students = updatedStudentIds;
  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [
      {
        linkedAccountsData: { students: updatedStudentIds }
      }
    ]
  }
}

export function saveStudentDetails(newStudent: IUser) {
  const newStudentObj = {
    [`${newStudent.username}`]: newStudent
  }
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const updatedStudents = currentUserData.students ? { ...currentUserData.students, ...newStudentObj } : { ...newStudentObj }
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

export function removeStudent(studentUserId: string) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  let studentToDelete;
  if (currentUserData.students) {
    studentToDelete = Object.values(currentUserData.students).find((student: any) => student.userId === studentUserId)
  }
  const updatedStudentIds = currentUserData.studentIds.filter(id => id !== studentUserId)
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

export function createUserActivity(activityData: {userActivity: IActivity, userId: string, username: string}) {
  let editObject;
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = activityData?.userId === currentUserData.userId
  if (isMain) {
    const currentActivities = currentUserData.activities
    currentActivities.push(activityData.userActivity)
    currentUserData.activities = currentActivities
    editObject = {
      activities: currentUserData.activities
    }
  } else {
    const student = currentUserData.students?.[activityData.username]
    const studentActivities = student?.activities
    studentActivities.push(activityData.userActivity)
    currentUserData.students[activityData.username].activities = studentActivities
    editObject = {
      students: currentUserData.students
    }
  }
  
  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [editObject]
  }
}

export function editUserActivity(updateData) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = updateData.email === currentUserData.email
  let activityToUpdate;

  if (isMain) {
    activityToUpdate = currentUserData.activities.find(activity => activity.name === updateData.name)
    let activityIndex = currentUserData.activities.indexOf(activityToUpdate)
    activityToUpdate.completionStatus = updateData.completionStatus
    activityToUpdate.lastUpdatedOn = updateData.lastUpdatedOn

    currentUserData.activities[activityIndex] = activityToUpdate;
  } else {
    const student = currentUserData.students[updateData.username]
    activityToUpdate = student.activities.find(activity => activity.name === updateData.name)
    let activityIndex = student.activities.indexOf(activityToUpdate)
    activityToUpdate.completionStatus = updateData.completionStatus
    activityToUpdate.lastUpdatedOn = updateData.lastUpdatedOn
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

export function editUserCard(cardData) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = cardData.email === currentUserData.email
  if (isMain) {
    const currentActivities = currentUserData.activities
    let currentActivity = currentActivities.find(activity => activity.name === cardData.activityName)
    const currentActivityCards = currentActivity.cards
    let cardToUpdate = currentActivityCards.find(card => card.id === cardData.id)
    let cardToUpdateIdx = currentActivityCards.indexOf(cardToUpdate)
    for (let item in cardData.updated) {
      currentActivityCards[cardToUpdateIdx][item] = cardData.updated[item]
      currentActivityCards[cardToUpdateIdx][item] = cardData.updated[item]
    }
    const updatedActivityCards = [...currentActivityCards]
    currentActivity.cards = updatedActivityCards
    currentUserData.activities = currentActivities
  } else {
    const student = currentUserData.students[cardData.username]
    const studentActivities = student.activities || []
    let studentCurrentActivity = studentActivities.find(activity => activity.name === cardData.activityName)
    const studentActivityCards = studentCurrentActivity.cards
    let cardToUpdate = studentActivityCards.find(card => card.id === cardData.id)
    let cardToUpdateIdx = studentActivityCards.indexOf(cardToUpdate)
    for (let item in cardData.updated) {
      studentActivityCards[cardToUpdateIdx][item] = cardData.updated[item]
      studentActivityCards[cardToUpdateIdx][item] = cardData.updated[item]
    }
    const updatedStudentActivityCards = [...studentActivityCards]
    studentCurrentActivity.cards = updatedStudentActivityCards
    currentUserData.students[cardData.username].activities = studentActivities
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

export function removeUserCard(cardData) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = cardData.email === currentUserData.email
  if (isMain) {
    const currentActivities = currentUserData.activities
    let currentActivity = currentActivities.find(activity => activity.name === cardData.activityName)
    const currentActivityCards = currentActivity.cards
    let cardToUpdate = currentActivityCards.find(card => card.id === cardData.id)
    let cardToUpdateIdx = currentActivityCards.indexOf(cardToUpdate)
    currentActivityCards.splice(cardToUpdateIdx, 1)
    const updatedActivityCards = [...currentActivityCards]
    currentActivity.cards = updatedActivityCards
    currentUserData.activities = currentActivities
  } else {
    const student = currentUserData.students[cardData.username]
    const studentActivities = student.activities || []
    let studentCurrentActivity = studentActivities.find(activity => activity.name === cardData.activityName)
    const studentActivityCards = studentCurrentActivity.cards
    let cardToUpdate = studentActivityCards.find(card => card.id === cardData.id)
    let cardToUpdateIdx = studentActivityCards.indexOf(cardToUpdate)
    studentActivityCards.splice(cardToUpdateIdx, 1)
    const updatedStudentActivityCards = [...studentActivityCards]
    studentCurrentActivity.cards = updatedStudentActivityCards
    currentUserData.students[cardData.username].activities = studentActivities
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