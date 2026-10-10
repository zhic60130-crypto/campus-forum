import { delay, toPublicUser } from '@/lib/delay'
import { useAuthStore } from '@/stores/auth'
import { useDbStore } from '@/stores/db'
import type { LoginResult, User } from '@/types'

export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  await delay()
  const user = useDbStore
    .getState()
    .users.find((u) => u.username === username && u.password === password)
  if (!user) throw new Error('用户名或密码错误')
  const publicUser = toPublicUser(user) as User
  const token = `mock-token-${user.id}-${Date.now()}`
  useAuthStore.getState().setSession(token, publicUser)
  return {
    token,
    expire: new Date(Date.now() + 7 * 864e5).toISOString(),
    user: publicUser,
  }
}

export async function register(input: {
  username: string
  email: string
  password: string
}): Promise<LoginResult> {
  await delay()
  const db = useDbStore.getState()
  if (db.users.some((u) => u.username === input.username)) {
    throw new Error('用户名已存在')
  }
  if (db.users.some((u) => u.email === input.email)) {
    throw new Error('邮箱已被注册')
  }
  const id = db.allocId('u')
  const record = {
    id,
    username: input.username,
    email: input.email,
    password: input.password,
    avatar: '',
    bio: '',
    role: 'USER' as const,
  }
  useDbStore.setState({ users: [...db.users, record] })
  return login(input.username, input.password)
}

export async function fetchMe(): Promise<User> {
  await delay(60)
  const auth = useAuthStore.getState()
  if (!auth.user || !auth.token) throw new Error('未登录')
  const fresh = useDbStore.getState().users.find((u) => u.id === auth.user!.id)
  if (!fresh) {
    auth.clearSession()
    throw new Error('用户不存在')
  }
  const publicUser = toPublicUser(fresh) as User
  auth.setUser(publicUser)
  return publicUser
}

export async function logout(): Promise<void> {
  await delay(40)
  useAuthStore.getState().clearSession()
}

export async function updateProfile(input: {
  username: string
  email: string
  avatar: string
  bio?: string
}): Promise<User> {
  await delay()
  const auth = useAuthStore.getState()
  if (!auth.user) throw new Error('请先登录')
  const db = useDbStore.getState()
  if (
    db.users.some(
      (u) => u.username === input.username && u.id !== auth.user!.id,
    )
  ) {
    throw new Error('用户名已被占用')
  }
  if (
    db.users.some((u) => u.email === input.email && u.id !== auth.user!.id)
  ) {
    throw new Error('邮箱已被占用')
  }
  const users = db.users.map((u) =>
    u.id === auth.user!.id
      ? {
          ...u,
          username: input.username,
          email: input.email,
          avatar: input.avatar,
          bio: input.bio ?? '',
        }
      : u,
  )
  useDbStore.setState({
    users,
    topics: db.topics.map((t) =>
      t.authorId === auth.user!.id ? { ...t, authorName: input.username } : t,
    ),
    replies: db.replies.map((r) =>
      r.authorId === auth.user!.id ? { ...r, authorName: input.username } : r,
    ),
  })
  const updated = toPublicUser(users.find((u) => u.id === auth.user!.id)!) as User
  auth.setUser(updated)
  return updated
}

export async function updatePassword(input: {
  oldPassword: string
  newPassword: string
}): Promise<void> {
  await delay()
  const auth = useAuthStore.getState()
  if (!auth.user) throw new Error('请先登录')
  const db = useDbStore.getState()
  const record = db.users.find((u) => u.id === auth.user!.id)
  if (!record) throw new Error('用户不存在')
  if (record.password !== input.oldPassword) {
    throw new Error('原密码不正确')
  }
  if (input.newPassword.length < 6) {
    throw new Error('新密码至少 6 位')
  }
  useDbStore.setState({
    users: db.users.map((u) =>
      u.id === record.id ? { ...u, password: input.newPassword } : u,
    ),
  })
}
