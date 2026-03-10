import { deleteCommand, getCommand, patchCommand, postCommand } from '@/api/service'
import { IActivity } from '@/types/IActivity'
import { ICard } from '@/types/ICard'
import { IUser, IUserLogin } from '@/types/IUser'
import { IResponse } from '@/types/IApiResponse'

export const findUser = async (params: {
  userId: string
}): Promise<IResponse<{ student: IUser }>> => {
  const url = process.env.NEXT_GET_USER_URL!
  return await getCommand(url, { params })
}

export const editUser = async (params: {
  userId: string
  editData: Record<string, any>
}): Promise<IResponse> => {
  const url = process.env.NEXT_EDIT_USER_URL!
  return await patchCommand(url, params)
}

export const deleteUser = async (userId: string): Promise<IResponse> => {
  const url = process.env.NEXT_DELETE_USER_URL!
  return await deleteCommand(url, userId)
}

export const loginUser = async (
  params: IUserLogin
): Promise<IResponse<{ token: string; user: IUser }>> => {
  const url = process.env.NEXT_LOGIN_USER_URL!
  return await getCommand(url, { params })
}

export const registerUser = async (
  userJsonData: IUser
): Promise<IResponse<{ token: string; user: IUser }>> => {
  const url = process.env.NEXT_REGISTER_USER_URL!
  return await postCommand(url, userJsonData)
}

export const linkAccount = async (accountsData: {
  teacherId: string
  studentId: [string, string]
}): Promise<IResponse> => {
  const url = process.env.NEXT_ADD_LINKED_ACCOUNT_URL!
  return await postCommand(url, accountsData)
}

export const unlinkAccount = async (accounts: {
  teacherId: string
  studentId: string
}): Promise<IResponse> => {
  const url = process.env.NEXT_DELETE_LINKED_ACCOUNT_URL!
  const params = `${accounts.teacherId}/${accounts.studentId}`
  return await deleteCommand(url, params)
}

export const createActivity = async (data: {
  userActivity: IActivity
  userId: string
}): Promise<IResponse<{ userId: string; userActivity: IActivity }>> => {
  const url = process.env.NEXT_CREATE_ACTIVITY_URL!
  return await postCommand(url, data)
}

export const editActivity = async (params: {
  userId: string
  updatedActivity: IActivity
}): Promise<IResponse<IActivity>> => {
  const url = process.env.NEXT_EDIT_ACTIVITY_URL!
  return await patchCommand(url, params)
}

export const deleteActivity = async (activityDetails: {
  userId: string
  activityName: string
}): Promise<IResponse> => {
  const url = process.env.NEXT_DELETE_ACTIVITY_URL!
  const params = `${activityDetails.userId}/${activityDetails.activityName}`
  return await deleteCommand(url, params)
}

export const createCards = async (cardPayload: {
  userId: string
  activity: string
  cards: ICard[]
}): Promise<IResponse<ICard[]>> => {
  const url = process.env.NEXT_CREATE_CARD_URL!
  return await postCommand(url, cardPayload)
}

export const activateCard = async (cardPayload: {
  userId: string
  activity: string
  cardId: string
}): Promise<IResponse> => {
  const url = process.env.NEXT_ACTIVATE_CARD_URL!
  return await postCommand(url, cardPayload)
}

export const editAnyCardAttr = async (data: {
  userId: string
  activity: string
  cardId: string
  editData: Record<string, any>
}): Promise<IResponse<ICard>> => {
  const url = process.env.NEXT_EDIT_CARD_URL!
  return await postCommand(url, data)
}

export const editCardStage = async (data: {
  userId: string
  activity: string
  cardId: string
  editData: Record<string, any>
}): Promise<IResponse<ICard>> => {
  const url = process.env.NEXT_EDIT_CARD_STAGE_URL!
  return await postCommand(url, data)
}

export const resetCardStage = async (cardPayload: {
  userId: string
  activity: string
  cardId: string
}): Promise<IResponse> => {
  const url = process.env.NEXT_RESET_CARD_STAGE_URL!
  return await postCommand(url, cardPayload)
}

export const requestCardReview = async (data: {
  id: string
  teacherId: string
  student: {
    id: string
    fullName: string
    email: string
  }
}): Promise<IResponse> => {
  const url = process.env.NEXT_REQUEST_REVIEW_CARD_URL!
  return await postCommand(url, data)
}

export const deleteCard = async (
  cards: { userId: string; activity: string; cardId: string }[]
): Promise<IResponse> => {
  const url = process.env.NEXT_DELETE_CARD_URL!
  return await postCommand(url, cards)
}
