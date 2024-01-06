import { getApi, postApi } from "@/app/api/service";

export const findUser = async (options) => {
  const url = process.env.NEXT_GET_USER_URL

  return await getApi(url, options)
    .then(async (response) => {
      return response;
    })
}

export const editUser = async (rawData) => {
  const url = process.env.NEXT_EDIT_USER_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const deleteUser = async (rawData) => {
  const url = process.env.NEXT_DELETE_USER_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const loginUser = async (rawData) => {
  const url = process.env.NEXT_LOGIN_USER_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const registerUser = async (rawData) => {
  const url = process.env.NEXT_REGISTER_USER_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const linkAccount = async (rawData) => {
  const url = process.env.NEXT_ADD_LINKED_ACCOUNT_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const unlinkAccount = async (rawData) => {
  const url = process.env.NEXT_DELETE_LINKED_ACCOUNT_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const createActivity = async (rawData) => {
  const url = process.env.NEXT_CREATE_ACTIVITY_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const editActivity = async (rawData) => {
  const url = process.env.NEXT_EDIT_ACTIVITY_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const deleteActivity = async (rawData) => {
  const url = process.env.NEXT_DELETE_ACTIVITY_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const createCard = async (rawData) => {
  const url = process.env.NEXT_CREATE_CARD_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const editCard = async (rawData) => {
  const url = process.env.NEXT_EDIT_CARD_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const editCardStage = async (rawData) => {
  const url = process.env.NEXT_EDIT_CARD_STAGE_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const resetCardStage = async (rawData) => {
  const url = process.env.NEXT_RESET_CARD_STAGE_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const deleteCard = async (rawData) => {
  const url = process.env.NEXT_DELETE_CARD_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}