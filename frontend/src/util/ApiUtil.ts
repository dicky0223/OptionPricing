import axios, { AxiosRequestConfig } from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
})

export const apiPost = async <T>(url: string, body?: object, config?: AxiosRequestConfig): Promise<T> => {
  return (await instance.post(url, body, config )).data
}
