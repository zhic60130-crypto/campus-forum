import { delay } from '@/lib/delay'
import { decorateComment, decorateTopic } from '@/repositories/helpers'
import { requireUser } from '@/stores/auth'
import { useDbStore } from '@/stores/db'

function toggleInList(
  map: Record<string, string[]>,
  userId: string,
  targetId: string,
): { next: Record<string, string[]>; added: boolean } {
  const current = new Set(map[userId] ?? [])
  const added = !current.has(targetId)
  if (added) current.add(targetId)
  else current.delete(targetId)
  return {
    next: { ...map, [userId]: [...current] },
    added,
  }
}

export async function toggleTopicLike(id: string) {
  await delay(80)
  const user = requireUser()
  const db = useDbStore.getState()
  const topic = db.topics.find((t) => t.id === id)
  if (!topic) throw new Error('帖子不存在')
  const { next, added } = toggleInList(db.topicLikes, user.id, id)
  const likeCount = Math.max(0, topic.likeCount + (added ? 1 : -1))
  useDbStore.setState({
    topicLikes: next,
    topics: db.topics.map((t) => (t.id === id ? { ...t, likeCount } : t)),
  })
  return { liked: added, likeCount }
}

export async function toggleTopicFavorite(id: string) {
  await delay(80)
  const user = requireUser()
  const db = useDbStore.getState()
  const topic = db.topics.find((t) => t.id === id)
  if (!topic) throw new Error('帖子不存在')
  const { next, added } = toggleInList(db.topicFavorites, user.id, id)
  const favoriteCount = Math.max(0, topic.favoriteCount + (added ? 1 : -1))
  useDbStore.setState({
    topicFavorites: next,
    topics: db.topics.map((t) =>
      t.id === id ? { ...t, favoriteCount } : t,
    ),
  })
  return { favorited: added, favoriteCount }
}

export async function toggleCommentLike(id: string) {
  await delay(80)
  const user = requireUser()
  const db = useDbStore.getState()
  const comment = db.replies.find((r) => r.id === id)
  if (!comment) throw new Error('评论不存在')
  const { next, added } = toggleInList(db.commentLikes, user.id, id)
  const likeCount = Math.max(0, comment.likeCount + (added ? 1 : -1))
  useDbStore.setState({
    commentLikes: next,
    replies: db.replies.map((r) => (r.id === id ? { ...r, likeCount } : r)),
  })
  return { liked: added, likeCount }
}

export async function getDecoratedTopic(id: string) {
  const topic = useDbStore.getState().topics.find((t) => t.id === id)
  return topic ? decorateTopic(topic) : null
}

export async function getDecoratedComment(id: string) {
  const comment = useDbStore.getState().replies.find((r) => r.id === id)
  return comment ? decorateComment(comment) : null
}
