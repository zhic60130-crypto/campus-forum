import http from '@/lib/http'
import type { Category, FriendLink, Tag, Topic } from '@/types'

export function fetchCategoriesApi(): Promise<Category[]> {
  return http.get('/meta/categories')
}

export function fetchTagsApi(): Promise<Tag[]> {
  return http.get('/meta/tags')
}

export function fetchAnnouncementsApi(): Promise<string[]> {
  return http.get('/meta/announcements')
}

export function fetchFriendLinksApi(): Promise<FriendLink[]> {
  return http.get('/meta/friend-links')
}

export function fetchHotTopicsApi(limit = 5): Promise<Topic[]> {
  return http.get('/topics/hot', { params: { limit } })
}
