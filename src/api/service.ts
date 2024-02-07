import axios from "axios";

export const getCommand = async (url: string, params: Record<any, any>) => {
  return await axios.get(url, params)
}

export const postCommand = async (url: string, jsonData: Record<string, any>) => {
  return await axios.post(url, jsonData)
}
