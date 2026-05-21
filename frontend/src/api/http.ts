import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5080'

export const http = axios.create({
  baseURL,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
