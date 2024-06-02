import { deleteCommand, getCommand, patchCommand, postCommand } from "@/api/service";
import { IActivity } from "@/interfaces/IActivity";
import { IUser, IUserLogin } from "@/interfaces/IUser";

export const findUser = async (params: {userId: string}) => {
  const url = process.env.NEXT_GET_USER_URL
  return await getCommand(url, {params})
}

export const editUser = async (params: {userId: string, editData: Record<string, any>}) => {
  const url = process.env.NEXT_EDIT_USER_URL
  return await patchCommand(url, params)
}

export const deleteUser = async (userId: string) => {
  const url = process.env.NEXT_DELETE_USER_URL
  return await deleteCommand(url, userId)
}

export const loginUser = async (params: IUserLogin) => {
  const url = process.env.NEXT_LOGIN_USER_URL
  return await getCommand(url, {params})
}

export const registerUser = async (userJsonData: IUser) => {
  const url = process.env.NEXT_REGISTER_USER_URL
  return await postCommand(url, userJsonData)
}

export const linkAccount = async (accountsData: {teacherId: string, studentId: string}) => {
  const url = process.env.NEXT_ADD_LINKED_ACCOUNT_URL
  return await postCommand(url, accountsData)
}

export const unlinkAccount = async (rawData) => {
  const url = process.env.NEXT_DELETE_LINKED_ACCOUNT_URL

  return await postCommand(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const createActivity = async (data: {userActivity: IActivity, userId: string}) => {
  const url = process.env.NEXT_CREATE_ACTIVITY_URL
  return await postCommand(url, data)
}

export const editActivity = async (rawData) => {
  const url = process.env.NEXT_EDIT_ACTIVITY_URL

  return await postCommand(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const deleteActivity = async (rawData) => {
  const url = process.env.NEXT_DELETE_ACTIVITY_URL

  return await postCommand(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const createCard = async (rawData) => {
  const url = process.env.NEXT_CREATE_CARD_URL

  return await postCommand(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const editCard = async (rawData) => {
  const url = process.env.NEXT_EDIT_CARD_URL

  return await postCommand(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const editCardStage = async (rawData) => {
  const url = process.env.NEXT_EDIT_CARD_STAGE_URL

  return await postCommand(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const resetCardStage = async (rawData) => {
  const url = process.env.NEXT_RESET_CARD_STAGE_URL

  return await postCommand(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const requestCardReview = async (rawData) => {
  const url = process.env.NEXT_REQUEST_REVIEW_CARD_URL

  return await postCommand(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const deleteCard = async (rawData) => {
  const url = process.env.NEXT_DELETE_CARD_URL

  return await postCommand(url, rawData)
    .then(async (response) => {
      return response;
    })
}