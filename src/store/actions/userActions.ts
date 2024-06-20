import { IActivity } from "@/interfaces/IActivity";
import { ICard } from "@/interfaces/ICard";
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
  const hasStudents = currentUserData.linkedAccountsData.students?.length
  const studentInfoTuple: [string, string] = [newStudent.userId, newStudent.username]
  let updatedStudentIds: [string, string][] = 
    hasStudents ? [...currentUserData.linkedAccountsData.students, studentInfoTuple] : [].concat([studentInfoTuple])

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
    delete currentUserData.students[studentToDelete.username]
  }
  const updatedStudentIds = currentUserData.linkedAccountsData.students?.filter(tuple => tuple[0] !== studentUserId)
  currentUserData.linkedAccountsData.students = updatedStudentIds;

  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [
      {
        linkedAccountsData: currentUserData.linkedAccountsData
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

export function editUserActivity({username, updatedActivity}: {username: string, updatedActivity: IActivity}) {
  const currentUserData: IUser = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = username === currentUserData.username
  let activityToUpdate;
  let editObject;

  if (isMain) {
    activityToUpdate = currentUserData.activities.find(activity => activity.name === updatedActivity.name)
    let activityIndex = currentUserData.activities.indexOf(activityToUpdate)
    activityToUpdate.completionStatus = updatedActivity.completionStatus
    activityToUpdate.lastUpdatedOn = updatedActivity.lastUpdatedOn
    currentUserData.activities[activityIndex] = activityToUpdate;
    editObject = { activities: currentUserData.activities }
  } else {
    const student = currentUserData.students[username]
    activityToUpdate = student.activities.find(activity => activity.name === updatedActivity.name)
    let activityIndex = student.activities.indexOf(activityToUpdate)
    activityToUpdate.completionStatus = updatedActivity.completionStatus
    activityToUpdate.lastUpdatedOn = updatedActivity.lastUpdatedOn
    currentUserData.students[username].activities[activityIndex] = activityToUpdate
    editObject = { students: currentUserData.students }
  }

  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [editObject]
  }
}

export function removeUserActivity(username: string, activityName: string) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  let activitiesToKeep;
  let editObject;
  const isMain = username === currentUserData.username

  if (isMain) {
    activitiesToKeep = currentUserData.activities.filter(activity => activity.name !== activityName)
    currentUserData.activities = activitiesToKeep;
    editObject = { activities: currentUserData.activities }
  } else {
    const student = currentUserData.students[username]
    activitiesToKeep = student.activities.filter(activity => activity.name !== activityName)
    currentUserData.students[username].activities = activitiesToKeep
    editObject = { students: currentUserData.students }
  }
  
  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [editObject]
  }
}

export function createUserCard({username, activityName, newCards}: {username: string, activityName: string, newCards: ICard[]}) {
  const currentUserData: IUser = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = username === currentUserData.username
  if (isMain) {
    const currentActivities = currentUserData.activities
    let currentActivity = currentActivities.find(activity => activity.name === activityName)
    const currentActivityCards = currentActivity.cards || []
    const updatedActivityCards = [...currentActivityCards, ...newCards]
    currentActivity.cards = updatedActivityCards
    currentUserData.activities = currentActivities
  } else {
    const student = currentUserData.students[username]
    const studentActivities = student.activities || []
    let studentCurrentActivity = studentActivities.find(activity => activity.name === activityName)
    const studentActivityCards = studentCurrentActivity.cards || []
    const updatedStudentActivityCards = [...studentActivityCards, ...newCards]
    studentCurrentActivity.cards = updatedStudentActivityCards
    currentUserData.students[username].activities = studentActivities
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

export function editUserCard({username, activityName, updatedCard}: {username: string, activityName: string, updatedCard: ICard}) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = username === currentUserData.username
  if (isMain) {
    const currentActivities = currentUserData.activities
    let currentActivity = currentActivities.find(activity => activity.name === activityName)
    const currentActivityCards = currentActivity.cards
    let cardToUpdate = currentActivityCards.find(card => card.cardId === updatedCard.cardId)
    let cardToUpdateIdx = currentActivityCards.indexOf(cardToUpdate)
    currentActivityCards.splice(cardToUpdateIdx, 1, updatedCard)
    // for (let item in cardData.updated) {
    //   currentActivityCards[cardToUpdateIdx][item] = cardData.updated[item]
    //   currentActivityCards[cardToUpdateIdx][item] = cardData.updated[item]
    // }
    // const updatedActivityCards = [...currentActivityCards]
    // currentActivity.cards = updatedActivityCards
    currentUserData.activities = currentActivities
  } else {
    const student = currentUserData.students[username]
    const studentActivities = student.activities
    let studentCurrentActivity = studentActivities.find(activity => activity.name === activityName)
    const studentActivityCards = studentCurrentActivity.cards
    let cardToUpdate = studentActivityCards.find(card => card.cardId === updatedCard.cardId)
    let cardToUpdateIdx = studentActivityCards.indexOf(cardToUpdate)
    studentActivityCards.splice(cardToUpdateIdx, 1, updatedCard)

    // for (let item in cardData.updated) {
    //   studentActivityCards[cardToUpdateIdx][item] = cardData.updated[item]
    //   studentActivityCards[cardToUpdateIdx][item] = cardData.updated[item]
    // }
    // const updatedStudentActivityCards = [...studentActivityCards]
    // studentCurrentActivity.cards = updatedStudentActivityCards
    currentUserData.students[username].activities = studentActivities
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

export function removeUserCard({username, activityName, cardId}: {username: string, activityName: string, cardId: string}) {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = username === currentUserData.username
  if (isMain) {
    const currentActivities = currentUserData.activities
    let currentActivity = currentActivities.find(activity => activity.name === activityName)
    const currentActivityCards = currentActivity.cards
    let cardToUpdate = currentActivityCards.find(card => card.cardId === cardId)
    let cardToUpdateIdx = currentActivityCards.indexOf(cardToUpdate)
    currentActivityCards.splice(cardToUpdateIdx, 1)
    const updatedActivityCards = [...currentActivityCards]
    currentActivity.cards = updatedActivityCards
    currentUserData.activities = currentActivities
  } else {
    const student = currentUserData.students[username]
    const studentActivities = student.activities || []
    let studentCurrentActivity = studentActivities.find(activity => activity.name === activityName)
    const studentActivityCards = studentCurrentActivity.cards
    let cardToUpdate = studentActivityCards.find(card => card.cardId === cardId)
    let cardToUpdateIdx = studentActivityCards.indexOf(cardToUpdate)
    studentActivityCards.splice(cardToUpdateIdx, 1)
    const updatedStudentActivityCards = [...studentActivityCards]
    studentCurrentActivity.cards = updatedStudentActivityCards
    currentUserData.students[username].activities = studentActivities
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