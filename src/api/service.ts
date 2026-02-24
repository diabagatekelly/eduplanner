import axios from 'axios'

export const getCommand = async (url: string, params: Record<any, any>) => {
  return await axios.get(url, params)
}

export const postCommand = async (url: string, jsonData: Record<string, any>) => {
  return await axios.post(url, jsonData)
}

export const patchCommand = async (url: string, jsonData: Record<string, any>) => {
  return await axios.patch(url, jsonData, { headers: { 'Content-Type': 'application/json' } })
}

export const deleteCommand = async (url: string, userId: string) => {
  const finalUrl = `${url}/${userId}`
  return await axios.delete(finalUrl)
}
