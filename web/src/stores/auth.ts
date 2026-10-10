import { create } from 'zustand'
import { clearAuthStorage, getToken } from '@/lib/http'
import type { User } from '@/types'

const TOKEN_KEY = 'campus-forum-token'
const USER_KEY = 'campus-forum-user'

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

type AuthState = {
  token: string | null
  user: User | null
  bootstrapped: boolean
  isLoggedIn: boolean
  isAdmin: boolean
  setSession: (token: string, user: User) => void
  setUser: (user: User) => void
  clearSession: () => void
  bootstrap: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  bootstrapped: false,
  isLoggedIn: false,
  isAdmin: false,
  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({
      token,
      user,
      isLoggedIn: true,
      isAdmin: user.role === 'ADMIN',
      bootstrapped: true,
    })
  },
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({
      user,
      isLoggedIn: Boolean(get().token || getToken()),
      isAdmin: user.role === 'ADMIN',
    })
  },
  clearSession: () => {
    clearAuthStorage()
    set({
      token: null,
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      bootstrapped: true,
    })
  },
  bootstrap: () => {
    if (get().bootstrapped) return
    const token = getToken()
    const user = loadUser()
    if (token && user) {
      set({
        token,
        user,
        isLoggedIn: true,
        isAdmin: user.role === 'ADMIN',
        bootstrapped: true,
      })
      void import('@/api/auth')
        .then(({ fetchMeApi }) => fetchMeApi())
        .catch(() => {
          get().clearSession()
        })
    } else {
      clearAuthStorage()
      set({
        bootstrapped: true,
        token: null,
        user: null,
        isLoggedIn: false,
        isAdmin: false,
      })
    }
  },
}))

export function getCurrentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null
}

export function requireUser(): User {
  const user = useAuthStore.getState().user
  if (!user) throw new Error('请先登录')
  return user
}
