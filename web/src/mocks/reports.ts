import type { Report } from '@/types'

export const seedReports: Report[] = [
  {
    id: 'rp1',
    topicId: 'p4',
    topicTitle: '关于首页加载慢的一点反馈',
    topicExists: true,
    reporterId: 'u3',
    reporterName: 'nova',
    reason: 'OTHER',
    reasonLabel: '其他',
    detail: '感觉更像功能建议，不太适合发在反馈区？',
    status: 'PENDING',
    statusLabel: '待处理',
    createdAt: '2026-03-05T09:00:00',
  },
]
