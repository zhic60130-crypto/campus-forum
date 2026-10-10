export type Role = 'ADMIN' | 'USER'

export type User = {
  id: string
  username: string
  email: string
  avatar: string
  bio?: string
  role: Role
}

export type UserRecord = User & { password: string }

export type Category = {
  id: string
  label: string
  color: string
  icon: string
  desc?: string
  count?: number
  sort?: number
}

export type Tag = {
  id: string
  label: string
  count?: number
}

export type Topic = {
  id: string
  authorId: string
  authorName: string
  createdAt: string
  categoryId: string
  tagIds: string[]
  title: string
  summary: string
  images: string[]
  likeCount: number
  favoriteCount: number
  liked: boolean
  favorited: boolean
}

export type Comment = {
  id: string
  postId: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
  likeCount: number
  liked: boolean
  parentId: string | null
  replyToName: string | null
}

export type Banner = {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  link: string
  enabled: boolean
  sort: number
}

export type Announcement = {
  id: string
  content: string
  sort: number
}

export type FriendLink = {
  name: string
  url: string
}

export type ReportReason = 'SPAM' | 'ABUSE' | 'ILLEGAL' | 'OTHER'
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED'

export type Report = {
  id: string
  topicId: string
  topicTitle: string
  topicExists: boolean
  reporterId: string
  reporterName: string
  reason: ReportReason
  reasonLabel: string
  detail: string
  status: ReportStatus
  statusLabel: string
  adminNote?: string
  createdAt: string
  resolvedAt?: string
}

export type PageResult<T> = {
  records: T[]
  total: number
  page: number
  size: number
}

export type LoginResult = {
  token: string
  /** 后端为 epoch 毫秒；兼容字符串 */
  expire: number | string
  user: User
}

export type TopicQuery = {
  categoryId?: string
  tagId?: string
  q?: string
  sort?: 'hot' | 'latest'
  page?: number
  size?: number
}

export type CreateTopicInput = {
  title: string
  summary: string
  categoryId: string
  tagIds: string[]
  images?: string[]
}

export type CreateCommentInput = {
  content: string
  parentId?: string | null
  replyToName?: string | null
}

export type ReportInput = {
  reason: ReportReason
  detail?: string
}

export type ResolveReportInput = {
  action: 'DISMISS' | 'DELETE_TOPIC'
  adminNote?: string
}
