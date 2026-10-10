import { getCurrentUserId } from '@/stores/auth'
import { useDbStore } from '@/stores/db'
import type { Comment, PageResult, Topic } from '@/types'

export function paginate<T>(items: T[], page = 1, size = 10): PageResult<T> {
  const p = Math.max(1, page)
  const s = Math.max(1, size)
  const start = (p - 1) * s
  return {
    records: items.slice(start, start + s),
    total: items.length,
    page: p,
    size: s,
  }
}

export function decorateTopic(topic: Topic, userId = getCurrentUserId()): Topic {
  const db = useDbStore.getState()
  const liked = userId ? (db.topicLikes[userId] ?? []).includes(topic.id) : false
  const favorited = userId
    ? (db.topicFavorites[userId] ?? []).includes(topic.id)
    : false
  return { ...topic, liked, favorited }
}

export function decorateComment(
  comment: Comment,
  userId = getCurrentUserId(),
): Comment {
  const db = useDbStore.getState()
  const liked = userId
    ? (db.commentLikes[userId] ?? []).includes(comment.id)
    : false
  return { ...comment, liked }
}

export function recomputeTagCounts() {
  const { topics, tags } = useDbStore.getState()
  const counts = new Map<string, number>()
  for (const t of topics) {
    for (const id of t.tagIds) {
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
  }
  useDbStore.setState({
    tags: tags.map((tag) => ({ ...tag, count: counts.get(tag.id) ?? 0 })),
  })
}

export function recomputeCategoryCounts() {
  const { topics, categories } = useDbStore.getState()
  const counts = new Map<string, number>()
  for (const t of topics) {
    counts.set(t.categoryId, (counts.get(t.categoryId) ?? 0) + 1)
  }
  useDbStore.setState({
    categories: categories.map((c) => ({
      ...c,
      count: counts.get(c.id) ?? 0,
    })),
  })
}
