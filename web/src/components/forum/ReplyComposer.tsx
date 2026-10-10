import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { createCommentApi } from '@/api/topic'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/stores/auth'

type Props = {
  postId: string
  parentId?: string | null
  replyToName?: string | null
  compact?: boolean
  onCreated?: () => void
  onCancel?: () => void
}

export function ReplyComposer({
  postId,
  parentId = null,
  replyToName = null,
  compact,
  onCreated,
  onCancel,
}: Props) {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoggedIn) {
      toast.message('请先登录后再回复')
      navigate(`/login?redirect=/post/${postId}`)
      return
    }
    if (!content.trim()) {
      toast.error('请输入回复内容')
      return
    }
    setSubmitting(true)
    try {
      await createCommentApi(postId, {
        content,
        parentId,
        replyToName,
      })
      setContent('')
      toast.success('回复成功')
      onCreated?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '回复失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className={compact ? '' : 'mt-2'}>
      <FieldGroup>
        <Field>
          {!compact ? (
            <FieldLabel htmlFor={`reply-${postId}`}>发表回复</FieldLabel>
          ) : null}
          <Textarea
            id={`reply-${postId}-${parentId ?? 'root'}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              replyToName ? `回复 @${replyToName}` : '写下你的想法…'
            }
            rows={compact ? 2 : 3}
            autoFocus={compact}
          />
        </Field>
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size={compact ? 'sm' : 'default'}
            disabled={submitting}
          >
            {submitting ? '发送中…' : '发送'}
          </Button>
          {compact && onCancel ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              取消
            </Button>
          ) : null}
        </div>
      </FieldGroup>
    </form>
  )
}
