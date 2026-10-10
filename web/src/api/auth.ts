import http from '@/lib/http'
import { useAuthStore } from '@/stores/auth'
import type { LoginResult, User } from '@/types'

export async function loginApi(
  username: string,
  password: string,
): Promise<LoginResult> {
  const data = await http.post<unknown, LoginResult>('/auth/login', {
    username,
    password,
  })
  useAuthStore.getState().setSession(data.token, data.user)
  return data
}

export async function registerApi(input: {
  username: string
  email: string
  password: string
}): Promise<LoginResult> {
  const data = await http.post<unknown, LoginResult>('/auth/register', input)
  useAuthStore.getState().setSession(data.token, data.user)
  return data
}

export async function fetchMeApi(): Promise<User> {
  const user = await http.get<unknown, User>('/auth/me')
  useAuthStore.getState().setUser(user)
  return user
}

export async function logoutApi(): Promise<void> {
  try {
    await http.post('/auth/logout')
  } finally {
    useAuthStore.getState().clearSession()
  }
}
