import { useState } from 'react'
import { HeartIcon, MessageSquareIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { deleteCommentApi } from '@/api/topic'
import { toggleCommentLikeApi } from '@/api/interact'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { useAuthStore } from '@/stores/auth'
import type { Comment } from '@/types'
import { ReplyComposer } from './ReplyComposer'

type Props = {
  postId: string
  comments: Comment[]
  onChange: () => void
}

export function ReplyList({ postId, comments, onChange }: Props) {
  const user = useAuthStore((s) => s.user)
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const roots = comments.filter((c) => !c.parentId)
  const childrenOf = (id: string) =>
    comments.filter((c) => c.parentId === id)

  async function onLike(id: string) {
    if (!user) {
      toast.message('请先登录')
      return
    }
    try {
      await toggleCommentLikeApi(id)
      onChange()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败')
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteCommentApi(postId, id)
      toast.success('评论已删除')
      onChange()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  if (!comments.length) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyTitle>还没有回复</EmptyTitle>
          <EmptyDescription>来做第一个留言的人吧</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {roots.map((root) => {
        const children = childrenOf(root.id)
        const showComposer = replyToId === root.id
        return (
          <div key={root.id} className="rounded-lg border p-3">
            <CommentItem
              comment={root}
              canDelete={
                !!user && (user.id === root.authorId || user.role === 'ADMIN')
              }
              onLike={() => void onLike(root.id)}
              onDelete={() => void onDelete(root.id)}
              onReply={() =>
                setReplyToId((id) => (id === root.id ? null : root.id))
              }
              replyActive={showComposer}
            />
            {children.length > 0 || showComposer ? (
              <div className="mt-3 ml-4 flex flex-col gap-3 border-l pl-3">
                {children.map((child) => (
                  <CommentItem
                    key={child.id}
                    comment={child}
                    canDelete={
                      !!user &&
                      (user.id === child.authorId || user.role === 'ADMIN')
                    }
                    onLike={() => void onLike(child.id)}
                    onDelete={() => void onDelete(child.id)}
                  />
                ))}
                {showComposer ? (
                  <ReplyComposer
                    postId={postId}
                    parentId={root.id}
                    replyToName={root.authorName}
                    compact
                    onCancel={() => setReplyToId(null)}
                    onCreated={() => {
                      setReplyToId(null)
                      onChange()
                    }}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function CommentItem({
  comment,
  canDelete,
  onLike,
  onDelete,
  onReply,
  replyActive,
}: {
  comment: Comment
  canDelete: boolean
  onLike: () => void
  onDelete: () => void
  onReply?: () => void
  replyActive?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{comment.authorName}</span>
        {comment.replyToName ? (
          <span className="text-muted-foreground">
            回复 @{comment.replyToName}
          </span>
        ) : null}
        <span className="text-xs text-muted-foreground">
          {new Date(comment.createdAt).toLocaleString('zh-CN')}
        </span>
      </div>
      <p className="text-sm leading-relaxed">{comment.content}</p>
      <div className="flex items-center gap-1">
        <Button
          variant={comment.liked ? 'secondary' : 'ghost'}
          size="xs"
          className={comment.liked ? 'text-red-600' : undefined}
          onClick={onLike}
        >
          <HeartIcon
            data-icon="inline-start"
            className={comment.liked ? 'fill-current' : undefined}
          />
          {comment.likeCount}
        </Button>
        {onReply ? (
          <Button
            variant={replyActive ? 'secondary' : 'ghost'}
            size="xs"
            onClick={onReply}
          >
            <MessageSquareIcon data-icon="inline-start" />
            {replyActive ? '取消' : '回复'}
          </Button>
        ) : null}
        {canDelete ? (
          <Button variant="ghost" size="xs" onClick={onDelete}>
            <Trash2Icon data-icon="inline-start" />
            删除
          </Button>
        ) : null}
      </div>
    </div>
  )
}
