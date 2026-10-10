import http from '@/lib/http'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

export async function updateProfileApi(input: {
  username: string
  email: string
  avatar: string
  bio?: string
}): Promise<User> {
  const user = await http.put<unknown, User>('/account/profile', {
    username: input.username,
    email: input.email,
    avatar: input.avatar,
    bio: input.bio ?? '',
  })
  useAuthStore.getState().setUser(user)
  return user
}

export async function updatePasswordApi(input: {
  oldPassword: string
  newPassword: string
}): Promise<void> {
  await http.put('/account/password', input)
}
