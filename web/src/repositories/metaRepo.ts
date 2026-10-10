import { delay } from '@/lib/delay'
import {
  decorateTopic,
  recomputeCategoryCounts,
  recomputeTagCounts,
} from '@/repositories/helpers'
import { useDbStore } from '@/stores/db'
import type { Category, FriendLink, Tag, Topic } from '@/types'

export async function fetchCategories(): Promise<Category[]> {
  await delay(60)
  recomputeCategoryCounts()
  return useDbStore.getState().categories
}

export async function fetchTags(): Promise<Tag[]> {
  await delay(60)
  recomputeTagCounts()
  return useDbStore.getState().tags
}

export async function fetchAnnouncements(): Promise<string[]> {
  await delay(60)
  return [...useDbStore.getState().announcements]
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.content)
}

export async function fetchFriendLinks(): Promise<FriendLink[]> {
  await delay(60)
  return useDbStore.getState().friendLinks
}

export async function fetchHotTopics(limit = 5): Promise<Topic[]> {
  await delay(60)
  return [...useDbStore.getState().topics]
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, limit)
    .map((t) => decorateTopic(t))
}
