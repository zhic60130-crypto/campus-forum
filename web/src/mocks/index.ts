export { seedUsers } from './users'
export { seedCategories } from './categories'
export { seedTags } from './tags'
export { seedTopics } from './topics'
export { seedReplies } from './replies'
export { seedBanners } from './banners'
export { seedAnnouncements } from './announcements'
export { seedFriendLinks } from './friendLinks'
export { seedReports } from './reports'

export const personalNav = [
  { key: 'bookmarks', label: '我的收藏', path: '/bookmarks' },
  { key: 'my-posts', label: '我发布的', path: '/my-posts' },
  { key: 'profile', label: '个人资料', path: '/settings/profile' },
  { key: 'security', label: '账号与安全', path: '/settings/security' },
] as const

export const adminNav = [
  { key: 'topics', label: '帖子管理', path: '/admin/topics' },
  { key: 'reports', label: '举报审核', path: '/admin/reports' },
  { key: 'tags', label: '标签管理', path: '/admin/tags' },
  { key: 'users', label: '用户管理', path: '/admin/users' },
  { key: 'banners', label: '轮播管理', path: '/admin/banners' },
  { key: 'announcements', label: '公告管理', path: '/admin/announcements' },
] as const

export const reasonLabels: Record<string, string> = {
  SPAM: '垃圾广告',
  ABUSE: '人身攻击',
  ILLEGAL: '违法违规',
  OTHER: '其他',
}

export const statusLabels: Record<string, string> = {
  PENDING: '待处理',
  RESOLVED: '已处理',
  DISMISSED: '已忽略',
}
