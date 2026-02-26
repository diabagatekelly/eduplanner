import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const axiosInstance: AxiosInstance = axios.create()

/* istanbul ignore next */
axiosInstance.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      if ((session as any)?.accessToken) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${(session as any).accessToken}`
      }
    } catch {
      // Server-side or session unavailable — proceed without token
    }
  }
  return config
})

export const getCommand = async (url: string, config: AxiosRequestConfig) => {
  return await axiosInstance.get(url, config)
}

export const postCommand = async (url: string, jsonData: object) => {
  return await axiosInstance.post(url, jsonData)
}

export const patchCommand = async (url: string, jsonData: object) => {
  return await axiosInstance.patch(url, jsonData, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const deleteCommand = async (url: string, userId: string) => {
  const finalUrl = `${url}/${userId}`
  return await axiosInstance.delete(finalUrl)
}
