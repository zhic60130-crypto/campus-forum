import http from '@/lib/http'
import type { Announcement, PageResult, Role, Tag, Topic, User } from '@/types'

export function fetchAdminTopicsApi(query: {
  q?: string
  page?: number
  size?: number
}): Promise<PageResult<Topic>> {
  return http.get('/admin/topics', { params: query })
}

export function deleteAdminTopicApi(id: string): Promise<void> {
  return http.delete(`/admin/topics/${id}`)
}

export function fetchAdminTagsApi(): Promise<Tag[]> {
  return http.get('/admin/tags')
}

export function createTagApi(label: string): Promise<Tag> {
  return http.post('/admin/tags', { label })
}

export function updateTagApi(id: string, label: string): Promise<Tag> {
  return http.put(`/admin/tags/${id}`, { label })
}

export function deleteTagApi(id: string): Promise<void> {
  return http.delete(`/admin/tags/${id}`)
}

export function fetchAdminUsersApi(query: {
  q?: string
  page?: number
  size?: number
}): Promise<PageResult<User>> {
  return http.get('/admin/users', { params: query })
}

export function updateUserRoleApi(id: string, role: Role): Promise<User> {
  return http.put(`/admin/users/${id}/role`, { role })
}

export function fetchAdminAnnouncementsApi(): Promise<Announcement[]> {
  return http.get('/admin/announcements')
}

export function createAnnouncementApi(input: {
  content: string
  sort: number
}): Promise<Announcement> {
  return http.post('/admin/announcements', input)
}

export function updateAnnouncementApi(
  id: string,
  input: { content: string; sort: number },
): Promise<Announcement> {
  return http.put(`/admin/announcements/${id}`, input)
}

export function deleteAnnouncementApi(id: string): Promise<void> {
  return http.delete(`/admin/announcements/${id}`)
}
