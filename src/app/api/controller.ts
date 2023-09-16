import { getApi, postApi } from "@/app/api/service";

export const findUser = async (options) => {
  // const url = 'http://localhost:8080/user'
  const url = `${process.env.NEXT_BASE_URL}/user`

  return await getApi(url, options)
    .then(async (response) => {
      return response;
    })
}

export const editUser = async (rawData) => {
  const data = JSON.stringify(rawData);

  // const url = 'http://localhost:8080/user/edit'
  const url = `${process.env.NEXT_BASE_URL}/user/edit`

  return await postApi(url, data)
    .then(async (response) => {
      return response;
    })
}

export const loginUser = async (rawData) => {
  const data = JSON.stringify(rawData);

  // const url = 'http://localhost:8080/user/login'
  const url = `${process.env.NEXT_BASE_URL}/user/login`

  return await postApi(url, data)
    .then(async (response) => {
      return response;
    })
}

export const registerUser = async (rawData) => {
  const data = JSON.stringify(rawData);

  const url = `${process.env.NEXT_BASE_URL}/user/register`
  // const url = 'http://localhost:8080/user/register'

  return await postApi(url, data)
    .then(async (response) => {
      return response;
    })
}