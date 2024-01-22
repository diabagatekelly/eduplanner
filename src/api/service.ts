import axios from "axios";

export const getApi = async (url, options) => {
  return await axios.get(
    url,
    options
  ).then(async (response) => {
   return response;
  })
}


export const postApi = async (url: string, jsonData: Record<string, any>) => {
  return await axios.post(url, jsonData)
}


