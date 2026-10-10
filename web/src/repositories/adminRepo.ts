import { delay } from '@/lib/delay'
import {
  decorateTopic,
  paginate,
  recomputeTagCounts,
} from '@/repositories/helpers'
import { deleteTopic } from '@/repositories/topicRepo'
import { requireUser } from '@/stores/auth'
import { useDbStore } from '@/stores/db'
import type {
  Announcement,
  PageResult,
  Role,
  Tag,
  Topic,
  User,
} from '@/types'
import { toPublicUser } from '@/lib/delay'

function requireAdmin() {
  const user = requireUser()
  if (user.role !== 'ADMIN') throw new Error('需要管理员权限')
  return user
}

export async function fetchAdminTopics(query: {
  q?: string
  page?: number
  size?: number
}): Promise<PageResult<Topic>> {
  await delay()
  requireAdmin()
  const { q, page = 1, size = 10 } = query
  let list = [...useDbStore.getState().topics]
  if (q?.trim()) {
    const key = q.trim().toLowerCase()
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(key) ||
        t.authorName.toLowerCase().includes(key),
    )
  }
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const result = paginate(list, page, size)
  return { ...result, records: result.records.map((t) => decorateTopic(t)) }
}

export async function deleteAdminTopic(id: string): Promise<void> {
  await delay()
  requireAdmin()
  await deleteTopic(id)
}

export async function fetchAdminTags(): Promise<Tag[]> {
  await delay()
  requireAdmin()
  recomputeTagCounts()
  return useDbStore.getState().tags
}

export async function createTag(label: string): Promise<Tag> {
  await delay()
  requireAdmin()
  const db = useDbStore.getState()
  if (db.tags.some((t) => t.label === label.trim())) {
    throw new Error('标签已存在')
  }
  const tag: Tag = { id: db.allocId('tag'), label: label.trim(), count: 0 }
  useDbStore.setState({ tags: [...db.tags, tag] })
  return tag
}

export async function updateTag(id: string, label: string): Promise<Tag> {
  await delay()
  requireAdmin()
  const db = useDbStore.getState()
  if (!db.tags.some((t) => t.id === id)) throw new Error('标签不存在')
  if (db.tags.some((t) => t.label === label.trim() && t.id !== id)) {
    throw new Error('标签名已存在')
  }
  const tags = db.tags.map((t) =>
    t.id === id ? { ...t, label: label.trim() } : t,
  )
  useDbStore.setState({ tags })
  return tags.find((t) => t.id === id)!
}

export async function deleteTag(id: string): Promise<void> {
  await delay()
  requireAdmin()
  const db = useDbStore.getState()
  useDbStore.setState({
    tags: db.tags.filter((t) => t.id !== id),
    topics: db.topics.map((topic) => ({
      ...topic,
      tagIds: topic.tagIds.filter((tid) => tid !== id),
    })),
  })
  recomputeTagCounts()
}

export async function fetchAdminUsers(query: {
  q?: string
  page?: number
  size?: number
}): Promise<PageResult<User>> {
  await delay()
  requireAdmin()
  const { q, page = 1, size = 10 } = query
  let list = useDbStore.getState().users.map((u) => toPublicUser(u) as User)
  if (q?.trim()) {
    const key = q.trim().toLowerCase()
    list = list.filter(
      (u) =>
        u.username.toLowerCase().includes(key) ||
        u.email.toLowerCase().includes(key),
    )
  }
  return paginate(list, page, size)
}

export async function updateUserRole(id: string, role: Role): Promise<User> {
  await delay()
  requireAdmin()
  const db = useDbStore.getState()
  if (!db.users.some((u) => u.id === id)) throw new Error('用户不存在')
  const users = db.users.map((u) => (u.id === id ? { ...u, role } : u))
  useDbStore.setState({ users })
  return toPublicUser(users.find((u) => u.id === id)!) as User
}

export async function fetchAdminAnnouncements(): Promise<Announcement[]> {
  await delay()
  requireAdmin()
  return [...useDbStore.getState().announcements].sort(
    (a, b) => a.sort - b.sort,
  )
}

export async function createAnnouncement(input: {
  content: string
  sort: number
}): Promise<Announcement> {
  await delay()
  requireAdmin()
  const item: Announcement = {
    id: useDbStore.getState().allocId('a'),
    content: input.content.trim(),
    sort: input.sort,
  }
  useDbStore.setState({
    announcements: [...useDbStore.getState().announcements, item],
  })
  return item
}

export async function updateAnnouncement(
  id: string,
  input: { content: string; sort: number },
): Promise<Announcement> {
  await delay()
  requireAdmin()
  const db = useDbStore.getState()
  if (!db.announcements.some((a) => a.id === id)) {
    throw new Error('公告不存在')
  }
  const next = {
    id,
    content: input.content.trim(),
    sort: input.sort,
  }
  useDbStore.setState({
    announcements: db.announcements.map((a) => (a.id === id ? next : a)),
  })
  return next
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await delay()
  requireAdmin()
  useDbStore.setState({
    announcements: useDbStore
      .getState()
      .announcements.filter((a) => a.id !== id),
  })
}
