import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchAdminReportsApi, resolveAdminReportApi } from '@/api/report'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Report, ReportStatus } from '@/types'

export function AdminReportsPage() {
  const [status, setStatus] = useState<ReportStatus | 'ALL'>('PENDING')
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchAdminReportsApi({ status, page: 1, size: 50 })
      setReports(result.records)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    void load()
  }, [load])

  async function resolve(id: string, action: 'DISMISS' | 'DELETE_TOPIC') {
    try {
      await resolveAdminReportApi(id, { action })
      toast.success(action === 'DISMISS' ? '已忽略' : '已删帖结案')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">举报审核</h1>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as ReportStatus | 'ALL')}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">全部</SelectItem>
              <SelectItem value="PENDING">待处理</SelectItem>
              <SelectItem value="RESOLVED">已处理</SelectItem>
              <SelectItem value="DISMISSED">已忽略</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>帖子</TableHead>
              <TableHead>举报人</TableHead>
              <TableHead>原因</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>加载中…</TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>暂无举报</TableCell>
              </TableRow>
            ) : (
              reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.topicTitle}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.detail || '无补充说明'}
                    </div>
                  </TableCell>
                  <TableCell>{r.reporterName}</TableCell>
                  <TableCell>{r.reasonLabel}</TableCell>
                  <TableCell>{r.statusLabel}</TableCell>
                  <TableCell className="text-right">
                    {r.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void resolve(r.id, 'DISMISS')}
                        >
                          忽略
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void resolve(r.id, 'DELETE_TOPIC')}
                        >
                          删帖结案
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
