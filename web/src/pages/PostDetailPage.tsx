import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FlagIcon, HeartIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import {
  toggleTopicFavoriteApi,
  toggleTopicLikeApi,
} from '@/api/interact'
import { fetchTagsApi } from '@/api/meta'
import { deleteTopicApi, fetchCommentsApi, fetchTopicApi } from '@/api/topic'
import { ReplyComposer } from '@/components/forum/ReplyComposer'
import { ReplyList } from '@/components/forum/ReplyList'
import { ReportTopicDialog } from '@/components/forum/ReportTopicDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth'
import type { Comment, Topic } from '@/types'

export function PostDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [post, setPost] = useState<Topic | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [tagLabels, setTagLabels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [reportOpen, setReportOpen] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [topic, list, tags] = await Promise.all([
        fetchTopicApi(id),
        fetchCommentsApi(id),
        fetchTagsApi(),
      ])
      setPost(topic)
      setComments(list)
      setTagLabels(
        Object.fromEntries(tags.map((t) => [t.id, t.label] as const)),
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载失败')
      setPost(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  async function requireLogin(action: () => Promise<void>) {
    if (!user) {
      toast.message('请先登录')
      navigate(`/login?redirect=/post/${id}`)
      return
    }
    try {
      await action()
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        帖子不存在或已删除
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link to="/">返回广场</Link>
          </Button>
        </div>
      </div>
    )
  }

  const canDelete =
    !!user && (user.id === post.authorId || user.role === 'ADMIN')

  return (
    <div className="flex flex-col gap-5">
      <article className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{post.authorName}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
          {post.tagIds.map((tid) => (
            <Badge key={tid} variant="secondary">
              {tagLabels[tid] ?? tid}
            </Badge>
          ))}
        </div>
        <p className="whitespace-pre-wrap text-base leading-relaxed">
          {post.summary}
        </p>
        {post.images.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {post.images.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="max-h-72 w-full rounded-lg object-cover"
              />
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            variant={post.liked ? 'secondary' : 'outline'}
            size="sm"
            className={post.liked ? 'text-red-600' : undefined}
            onClick={() =>
              void requireLogin(async () => {
                await toggleTopicLikeApi(post.id)
              })
            }
          >
            <HeartIcon
              data-icon="inline-start"
              className={post.liked ? 'fill-current' : undefined}
            />
            {post.likeCount}
          </Button>
          <Button
            variant={post.favorited ? 'secondary' : 'outline'}
            size="sm"
            className={post.favorited ? 'text-amber-600' : undefined}
            onClick={() =>
              void requireLogin(async () => {
                await toggleTopicFavoriteApi(post.id)
              })
            }
          >
            <StarIcon
              data-icon="inline-start"
              className={post.favorited ? 'fill-current' : undefined}
            />
            {post.favoriteCount}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!user) {
                toast.message('请先登录')
                navigate(`/login?redirect=/post/${id}`)
                return
              }
              setReportOpen(true)
            }}
          >
            <FlagIcon data-icon="inline-start" />
            举报
          </Button>
          {canDelete ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                void requireLogin(async () => {
                  await deleteTopicApi(post.id)
                  toast.success('帖子已删除')
                  navigate('/')
                })
              }
            >
              <Trash2Icon data-icon="inline-start" />
              删除
            </Button>
          ) : null}
        </div>
      </article>

      <Separator />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">回复 ({comments.length})</h2>
        <ReplyComposer postId={post.id} onCreated={() => void load()} />
        <ReplyList
          postId={post.id}
          comments={comments}
          onChange={() => void load()}
        />
      </section>

      <ReportTopicDialog
        topicId={post.id}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </div>
  )
}
