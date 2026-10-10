import { delay, nowIso } from '@/lib/delay'
import {
  decorateComment,
  decorateTopic,
  paginate,
  recomputeCategoryCounts,
  recomputeTagCounts,
} from '@/repositories/helpers'
import { requireUser } from '@/stores/auth'
import { useDbStore } from '@/stores/db'
import type {
  Comment,
  CreateCommentInput,
  CreateTopicInput,
  PageResult,
  Topic,
  TopicQuery,
} from '@/types'

function resolveTagIds(raw: string[]): string[] {
  const db = useDbStore.getState()
  const ids: string[] = []
  let tags = [...db.tags]
  for (const item of raw.slice(0, 5)) {
    const existing = tags.find((t) => t.id === item || t.label === item)
    if (existing) {
      ids.push(existing.id)
      continue
    }
    const id = db.allocId('tag')
    const created = { id, label: item, count: 0 }
    tags = [...tags, created]
    ids.push(id)
  }
  useDbStore.setState({ tags })
  return ids
}

export async function fetchTopics(
  query: TopicQuery = {},
): Promise<PageResult<Topic>> {
  await delay()
  const { categoryId, tagId, q, sort = 'latest', page = 1, size = 8 } = query
  let list = [...useDbStore.getState().topics]
  if (categoryId) list = list.filter((t) => t.categoryId === categoryId)
  if (tagId) list = list.filter((t) => t.tagIds.includes(tagId))
  if (q?.trim()) {
    const key = q.trim().toLowerCase()
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(key) ||
        t.summary.toLowerCase().includes(key),
    )
  }
  list.sort((a, b) => {
    if (sort === 'hot') {
      return b.likeCount - a.likeCount || b.createdAt.localeCompare(a.createdAt)
    }
    return b.createdAt.localeCompare(a.createdAt)
  })
  const pageResult = paginate(list, page, size)
  return {
    ...pageResult,
    records: pageResult.records.map((t) => decorateTopic(t)),
  }
}

export async function fetchTopic(id: string): Promise<Topic> {
  await delay()
  const topic = useDbStore.getState().topics.find((t) => t.id === id)
  if (!topic) throw new Error('帖子不存在')
  return decorateTopic(topic)
}

export async function createTopic(input: CreateTopicInput): Promise<Topic> {
  await delay()
  const user = requireUser()
  const id = useDbStore.getState().allocId('p')
  const topic: Topic = {
    id,
    authorId: user.id,
    authorName: user.username,
    createdAt: nowIso(),
    categoryId: input.categoryId,
    tagIds: resolveTagIds(input.tagIds),
    title: input.title.trim(),
    summary: input.summary.trim(),
    images: input.images ?? [],
    likeCount: 0,
    favoriteCount: 0,
    liked: false,
    favorited: false,
  }
  useDbStore.setState({ topics: [topic, ...useDbStore.getState().topics] })
  recomputeTagCounts()
  recomputeCategoryCounts()
  return decorateTopic(topic)
}

export async function deleteTopic(id: string): Promise<void> {
  await delay()
  const user = requireUser()
  const db = useDbStore.getState()
  const topic = db.topics.find((t) => t.id === id)
  if (!topic) throw new Error('帖子不存在')
  if (topic.authorId !== user.id && user.role !== 'ADMIN') {
    throw new Error('无权删除该帖子')
  }
  useDbStore.setState({
    topics: db.topics.filter((t) => t.id !== id),
    replies: db.replies.filter((r) => r.postId !== id),
    reports: db.reports.map((r) =>
      r.topicId === id && r.status === 'PENDING'
        ? {
            ...r,
            topicExists: false,
            status: 'RESOLVED',
            statusLabel: '已处理',
            resolvedAt: nowIso(),
            adminNote: r.adminNote ?? '帖子已删除',
          }
        : r.topicId === id
          ? { ...r, topicExists: false }
          : r,
    ),
  })
  recomputeTagCounts()
  recomputeCategoryCounts()
}

export async function fetchMyTopics(
  page = 1,
  size = 10,
): Promise<PageResult<Topic>> {
  await delay()
  const user = requireUser()
  const list = useDbStore
    .getState()
    .topics.filter((t) => t.authorId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const result = paginate(list, page, size)
  return { ...result, records: result.records.map((t) => decorateTopic(t)) }
}

export async function fetchFavoriteTopics(
  page = 1,
  size = 10,
): Promise<PageResult<Topic>> {
  await delay()
  const user = requireUser()
  const favIds = new Set(useDbStore.getState().topicFavorites[user.id] ?? [])
  const list = useDbStore
    .getState()
    .topics.filter((t) => favIds.has(t.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const result = paginate(list, page, size)
  return { ...result, records: result.records.map((t) => decorateTopic(t)) }
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  await delay()
  return useDbStore
    .getState()
    .replies.filter((r) => r.postId === postId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((c) => decorateComment(c))
}

export async function createComment(
  postId: string,
  input: CreateCommentInput,
): Promise<Comment> {
  await delay()
  const user = requireUser()
  const db = useDbStore.getState()
  if (!db.topics.some((t) => t.id === postId)) throw new Error('帖子不存在')
  if (input.parentId) {
    const parent = db.replies.find((r) => r.id === input.parentId)
    if (!parent || parent.postId !== postId) throw new Error('回复目标不存在')
    if (parent.parentId) throw new Error('仅支持两级回复')
  }
  const comment: Comment = {
    id: db.allocId('r'),
    postId,
    authorId: user.id,
    authorName: user.username,
    content: input.content.trim(),
    createdAt: nowIso(),
    likeCount: 0,
    liked: false,
    parentId: input.parentId ?? null,
    replyToName: input.replyToName ?? null,
  }
  useDbStore.setState({ replies: [...db.replies, comment] })
  return decorateComment(comment)
}

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<void> {
  await delay()
  const user = requireUser()
  const db = useDbStore.getState()
  const comment = db.replies.find(
    (r) => r.id === commentId && r.postId === postId,
  )
  if (!comment) throw new Error('评论不存在')
  if (comment.authorId !== user.id && user.role !== 'ADMIN') {
    throw new Error('无权删除该评论')
  }
  const removeIds = new Set([commentId])
  if (!comment.parentId) {
    for (const r of db.replies) {
      if (r.parentId === commentId) removeIds.add(r.id)
    }
  }
  useDbStore.setState({
    replies: db.replies.filter((r) => !removeIds.has(r.id)),
  })
}
