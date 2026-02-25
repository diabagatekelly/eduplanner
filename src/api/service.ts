import axios, { AxiosRequestConfig } from 'axios'

export const getCommand = async (url: string, config: AxiosRequestConfig) => {
  return await axios.get(url, config)
}

export const postCommand = async (url: string, jsonData: object) => {
  return await axios.post(url, jsonData)
}

export const patchCommand = async (url: string, jsonData: object) => {
  return await axios.patch(url, jsonData, { headers: { 'Content-Type': 'application/json' } })
}

export const deleteCommand = async (url: string, userId: string) => {
  const finalUrl = `${url}/${userId}`
  return await axios.delete(finalUrl)
}
