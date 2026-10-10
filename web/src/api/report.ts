import http from '@/lib/http'
import type {
  PageResult,
  Report,
  ReportInput,
  ReportStatus,
  ResolveReportInput,
} from '@/types'

export function submitTopicReportApi(
  topicId: string,
  input: ReportInput,
): Promise<void> {
  return http.post(`/topics/${topicId}/report`, input)
}

export function fetchAdminReportsApi(query: {
  status?: ReportStatus | 'ALL'
  page?: number
  size?: number
}): Promise<PageResult<Report>> {
  return http.get('/admin/reports', { params: query })
}

export function resolveAdminReportApi(
  id: string,
  input: ResolveReportInput,
): Promise<void> {
  return http.put(`/admin/reports/${id}/resolve`, input)
}
