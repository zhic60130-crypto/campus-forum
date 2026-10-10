import { useState } from 'react'
import { toast } from 'sonner'
import { submitTopicReportApi } from '@/api/report'
import { reasonLabels } from '@/mocks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ReportReason } from '@/types'

type Props = {
  topicId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportTopicDialog({ topicId, open, onOpenChange }: Props) {
  const [reason, setReason] = useState<ReportReason>('SPAM')
  const [detail, setDetail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit() {
    setSubmitting(true)
    try {
      await submitTopicReportApi(topicId, { reason, detail })
      toast.success('举报已提交，等待审核')
      onOpenChange(false)
      setDetail('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '举报失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>举报帖子</DialogTitle>
          <DialogDescription>
            请选择原因并补充说明，管理员会尽快处理。
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>原因</FieldLabel>
            <Select
              value={reason}
              onValueChange={(v) => setReason(v as ReportReason)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.keys(reasonLabels) as ReportReason[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {reasonLabels[key]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="report-detail">补充说明</FieldLabel>
            <Textarea
              id="report-detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="可选"
              rows={3}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button disabled={submitting} onClick={() => void onSubmit()}>
            {submitting ? '提交中…' : '提交举报'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
