import axios, { type AxiosError } from 'axios'
import { toast } from 'sonner'

const TOKEN_KEY = 'campus-forum-token'
const USER_KEY = 'campus-forum-user'

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function clearAuthStorage(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

type ApiEnvelope<T> = {
  success: boolean
  code: number
  message: string
  data: T
}

function redirectToLogin(): void {
  if (window.location.pathname.startsWith('/login')) return
  const redirect = encodeURIComponent(
    window.location.pathname + window.location.search,
  )
  window.location.href = `/login?redirect=${redirect}`
}

function handleUnauthorized(): void {
  clearAuthStorage()
  redirectToLogin()
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiEnvelope<unknown>
    if (payload && typeof payload.success === 'boolean') {
      if (!payload.success) {
        const msg = payload.message || '请求失败'
        if (payload.code === 401) {
          handleUnauthorized()
        } else {
          toast.error(msg)
        }
        return Promise.reject(new Error(msg))
      }
      return payload.data
    }
    return response.data
  },
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    const status = error.response?.status
    const msg =
      error.response?.data?.message || error.message || '网络错误'
    if (status === 401) {
      handleUnauthorized()
    } else {
      toast.error(msg)
    }
    return Promise.reject(new Error(msg))
  },
)

export default http
