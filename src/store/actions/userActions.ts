import { IActivity } from '@/types/IActivity'
import { ICard } from '@/types/ICard'
import { IUser } from '@/types/IUser'

type EditAction = { type: 'EDIT'; editProps: Record<string, unknown>[] }

export function populateUser(): { type: 'POPULATE'; allData: IUser } {
  return {
    type: 'POPULATE',
    allData: <IUser>JSON.parse(sessionStorage.getItem('user_data')) || {},
  }
}

export function resetUser(): { type: 'RESET' } {
  return {
    type: 'RESET',
  }
}

export function addNewStudent(newStudent: IUser): EditAction {
  let currentUserData: IUser = JSON.parse(sessionStorage.getItem('user_data'))
  const hasStudents = currentUserData.linkedAccountsData.students?.length
  const studentInfoTuple: [string, string] = [newStudent.userId, newStudent.username]
  let updatedStudentIds: [string, string][] = hasStudents
    ? [...currentUserData.linkedAccountsData.students, studentInfoTuple]
    : [].concat([studentInfoTuple])

  currentUserData.linkedAccountsData.students = updatedStudentIds
  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [
      {
        linkedAccountsData: { students: updatedStudentIds },
      },
    ],
  }
}

export function saveStudentDetails(newStudent: IUser): EditAction {
  const newStudentObj = {
    [`${newStudent.username}`]: newStudent,
  }
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const updatedStudents = currentUserData.students
    ? { ...currentUserData.students, ...newStudentObj }
    : { ...newStudentObj }
  currentUserData.students = updatedStudents
  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [
      {
        students: updatedStudents,
      },
    ],
  }
}

export function removeStudent(studentUserId: string): EditAction {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  let studentToDelete: IUser | undefined
  if (currentUserData.students) {
    studentToDelete = Object.values<IUser>(currentUserData.students).find(
      (student) => student.userId === studentUserId
    )
    delete currentUserData.students[studentToDelete.username]
  }
  const updatedStudentIds = currentUserData.linkedAccountsData.students?.filter(
    (tuple: [string, string]) => tuple[0] !== studentUserId
  )
  currentUserData.linkedAccountsData.students = updatedStudentIds

  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [
      {
        linkedAccountsData: currentUserData.linkedAccountsData,
      },
      {
        students: currentUserData.students,
      },
    ],
  }
}

export function createUserActivity({
  userActivity,
  username,
}: {
  userActivity: IActivity
  username: string
}): EditAction {
  let editObject: Record<string, unknown>
  const currentUserData: IUser = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = username === currentUserData.username
  if (isMain) {
    const currentActivities = currentUserData.activities
    currentActivities.push(userActivity)
    currentUserData.activities = currentActivities
    editObject = {
      activities: currentUserData.activities,
    }
  } else {
    const student = currentUserData.students?.[username]
    const studentActivities = student?.activities
    studentActivities.push(userActivity)
    currentUserData.students[username].activities = studentActivities
    editObject = {
      students: currentUserData.students,
    }
  }

  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [editObject],
  }
}

export function editUserActivity({
  username,
  updatedActivity,
}: {
  username: string
  updatedActivity: IActivity
}): EditAction {
  const currentUserData: IUser = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = username === currentUserData.username
  let activityToUpdate: IActivity | undefined
  let editObject: Record<string, unknown>

  if (isMain) {
    activityToUpdate = currentUserData.activities.find(
      (activity) => activity.name === updatedActivity.name
    )
    let activityIndex = currentUserData.activities.indexOf(activityToUpdate)
    activityToUpdate.completionStatus = updatedActivity.completionStatus
    activityToUpdate.lastUpdatedOn = updatedActivity.lastUpdatedOn
    currentUserData.activities[activityIndex] = activityToUpdate
    editObject = { activities: currentUserData.activities }
  } else {
    const student = currentUserData.students[username]
    activityToUpdate = student.activities.find((activity) => activity.name === updatedActivity.name)
    let activityIndex = student.activities.indexOf(activityToUpdate)
    activityToUpdate.completionStatus = updatedActivity.completionStatus
    activityToUpdate.lastUpdatedOn = updatedActivity.lastUpdatedOn
    currentUserData.students[username].activities[activityIndex] = activityToUpdate
    editObject = { students: currentUserData.students }
  }

  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [editObject],
  }
}

export function removeUserActivity(username: string, activityName: string): EditAction {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  let activitiesToKeep: IActivity[]
  let editObject: Record<string, unknown>
  const isMain = username === currentUserData.username

  if (isMain) {
    activitiesToKeep = currentUserData.activities.filter(
      (activity: IActivity) => activity.name !== activityName
    )
    currentUserData.activities = activitiesToKeep
    editObject = { activities: currentUserData.activities }
  } else {
    const student = currentUserData.students[username]
    activitiesToKeep = student.activities.filter(
      (activity: IActivity) => activity.name !== activityName
    )
    currentUserData.students[username].activities = activitiesToKeep
    editObject = { students: currentUserData.students }
  }

  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [editObject],
  }
}

export function createUserCard({
  username,
  activityName,
  newCards,
}: {
  username: string
  activityName: string
  newCards: ICard[]
}): EditAction {
  const currentUserData: IUser = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = username === currentUserData.username
  if (isMain) {
    const currentActivities = currentUserData.activities
    let currentActivity = currentActivities.find((activity) => activity.name === activityName)
    const currentActivityCards = currentActivity.cards || []
    const updatedActivityCards = [...currentActivityCards, ...newCards]
    currentActivity.cards = Array.from(new Set(updatedActivityCards))
    currentUserData.activities = currentActivities
    sessionStorage.setItem('user_data', JSON.stringify(currentUserData))

    return {
      type: 'EDIT',
      editProps: [
        {
          activities: currentUserData.activities,
        },
      ],
    }
  } else {
    const student = currentUserData.students[username]
    const studentActivities = student.activities
    let studentCurrentActivity = studentActivities.find(
      (activity) => activity.name === activityName
    )
    const studentActivityCards = studentCurrentActivity.cards || []
    const updatedStudentActivityCards = [...studentActivityCards, ...newCards]
    studentCurrentActivity.cards = Array.from(new Set(updatedStudentActivityCards))
    currentUserData.students[username].activities = studentActivities
    sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
    return {
      type: 'EDIT',
      editProps: [
        {
          students: currentUserData.students,
        },
      ],
    }
  }
}

export function editUserCard({
  username,
  activityName,
  updatedCard,
}: {
  username: string
  activityName: string
  updatedCard: ICard
}): EditAction {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = username === currentUserData.username
  if (isMain) {
    const currentActivities = currentUserData.activities
    let currentActivity = currentActivities.find(
      (activity: IActivity) => activity.name === activityName
    )
    const currentActivityCards = currentActivity.cards
    let cardToUpdate = currentActivityCards.find((card: ICard) => card.cardId === updatedCard.cardId)
    let cardToUpdateIdx = currentActivityCards.indexOf(cardToUpdate)
    currentActivityCards.splice(cardToUpdateIdx, 1, updatedCard)
    currentUserData.activities = currentActivities
    sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
    return {
      type: 'EDIT',
      editProps: [
        {
          activities: currentUserData.activities,
        },
      ],
    }
  } else {
    const student = currentUserData.students[username]
    const studentActivities = student.activities
    let studentCurrentActivity = studentActivities.find(
      (activity: IActivity) => activity.name === activityName
    )
    const studentActivityCards = studentCurrentActivity.cards
    let cardToUpdate = studentActivityCards.find((card: ICard) => card.cardId === updatedCard.cardId)
    let cardToUpdateIdx = studentActivityCards.indexOf(cardToUpdate)
    studentActivityCards.splice(cardToUpdateIdx, 1, updatedCard)
    currentUserData.students[username].activities = studentActivities
  }

  sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
  return {
    type: 'EDIT',
    editProps: [
      {
        students: currentUserData.students,
      },
    ],
  }
}

export function removeUserCard({
  username,
  activityName,
  cardId,
}: {
  username: string
  activityName: string
  cardId: string
}): EditAction {
  const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
  const isMain = username === currentUserData.username
  if (isMain) {
    const currentActivities = currentUserData.activities
    let currentActivity = currentActivities.find(
      (activity: IActivity) => activity.name === activityName
    )
    const currentActivityCards = currentActivity.cards
    let cardToUpdate = currentActivityCards.find((card: ICard) => card.cardId === cardId)
    let cardToUpdateIdx = currentActivityCards.indexOf(cardToUpdate)
    currentActivityCards.splice(cardToUpdateIdx, 1)
    const updatedActivityCards = [...currentActivityCards]
    currentActivity.cards = updatedActivityCards
    currentUserData.activities = currentActivities
    sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
    return {
      type: 'EDIT',
      editProps: [
        {
          activities: currentUserData.activities,
        },
      ],
    }
  } else {
    const student = currentUserData.students[username]
    const studentActivities = student.activities
    let studentCurrentActivity = studentActivities.find(
      (activity: IActivity) => activity.name === activityName
    )
    const studentActivityCards = studentCurrentActivity.cards
    let cardToUpdate = studentActivityCards.find((card: ICard) => card.cardId === cardId)
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
        students: currentUserData.students,
      },
    ],
  }
}
