import { getApi, postApi } from "@/app/api/service";

export const findUser = async (options) => {
  const url = process.env.NEXT_GET_USER_URL

  return await getApi(url, options)
    .then(async (response) => {
      return response;
    })
}

export const editUser = async (rawData) => {
  // const url = 'http://localhost:8080/user/edit'
  const url = `${process.env.NEXT_BASE_URL}/user/edit`

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const loginUser = async (rawData) => {
  const url = process.env.NEXT_USER_LOGIN_URL

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}

export const registerUser = async (rawData) => {
  const url = `${process.env.NEXT_BASE_URL}/user/register`
  // const url = 'http://localhost:8080/user/register'

  return await postApi(url, rawData)
    .then(async (response) => {
      return response;
    })
}