import axios from "axios";

export const getApi = async (url, options) => {
  return await axios.get(
    url,
    options
  ).then(async (response) => {
   return response;
  })
}

export const postApi = async (url, rawData) => {
  const data = JSON.stringify(rawData)
  return await axios.post(
    url,
    data
  ).then(async (response) => {
   return response;
  })
}
