import { reasonLabels, statusLabels } from '@/mocks'
import { delay, nowIso } from '@/lib/delay'
import { paginate } from '@/repositories/helpers'
import { deleteTopic } from '@/repositories/topicRepo'
import { requireUser } from '@/stores/auth'
import { useDbStore } from '@/stores/db'
import type {
  PageResult,
  Report,
  ReportInput,
  ReportStatus,
  ResolveReportInput,
} from '@/types'

export async function submitTopicReport(
  topicId: string,
  input: ReportInput,
): Promise<void> {
  await delay()
  const user = requireUser()
  const db = useDbStore.getState()
  const topic = db.topics.find((t) => t.id === topicId)
  if (!topic) throw new Error('帖子不存在')
  if (topic.authorId === user.id) throw new Error('不能举报自己的帖子')
  if (
    db.reports.some(
      (r) => r.topicId === topicId && r.reporterId === user.id,
    )
  ) {
    throw new Error('你已举报过该帖子')
  }
  const report: Report = {
    id: db.allocId('rp'),
    topicId,
    topicTitle: topic.title,
    topicExists: true,
    reporterId: user.id,
    reporterName: user.username,
    reason: input.reason,
    reasonLabel: reasonLabels[input.reason] ?? input.reason,
    detail: input.detail?.trim() ?? '',
    status: 'PENDING',
    statusLabel: statusLabels.PENDING,
    createdAt: nowIso(),
  }
  useDbStore.setState({ reports: [report, ...db.reports] })
}

export async function fetchAdminReports(query: {
  status?: ReportStatus | 'ALL'
  page?: number
  size?: number
}): Promise<PageResult<Report>> {
  await delay()
  requireUser()
  const { status = 'ALL', page = 1, size = 10 } = query
  let list = [...useDbStore.getState().reports]
  if (status !== 'ALL') list = list.filter((r) => r.status === status)
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return paginate(list, page, size)
}

export async function resolveAdminReport(
  id: string,
  input: ResolveReportInput,
): Promise<void> {
  await delay()
  const user = requireUser()
  if (user.role !== 'ADMIN') throw new Error('需要管理员权限')
  const db = useDbStore.getState()
  const report = db.reports.find((r) => r.id === id)
  if (!report) throw new Error('举报不存在')
  if (report.status !== 'PENDING') throw new Error('该举报已处理')

  if (input.action === 'DELETE_TOPIC' && report.topicExists) {
    await deleteTopic(report.topicId)
  }

  const nextStatus = input.action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED'
  useDbStore.setState({
    reports: useDbStore.getState().reports.map((r) =>
      r.id === id
        ? {
            ...r,
            status: nextStatus,
            statusLabel: statusLabels[nextStatus],
            adminNote: input.adminNote?.trim() || undefined,
            resolvedAt: nowIso(),
            topicExists:
              input.action === 'DELETE_TOPIC' ? false : r.topicExists,
          }
        : r,
    ),
  })
}
