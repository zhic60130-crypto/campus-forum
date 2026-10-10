import { Link } from 'react-router-dom'
import { HeartIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Topic } from '@/types'

type Props = {
  post: Topic
  tagLabels?: Record<string, string>
  onDelete?: (id: string) => void
  showDelete?: boolean
}

export function PostCard({ post, tagLabels = {}, onDelete, showDelete }: Props) {
  return (
    <article className="border-b border-border/70 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`/post/${post.id}`}
            className="line-clamp-2 text-base font-medium hover:underline"
          >
            {post.title}
          </Link>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {post.summary}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{post.authorName}</span>
            <span>·</span>
            <span>{new Date(post.createdAt).toLocaleString('zh-CN')}</span>
            {post.tagIds.map((id) => (
              <Badge key={id} variant="secondary">
                {tagLabels[id] ?? id}
              </Badge>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <HeartIcon className="size-3.5" />
              {post.likeCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <StarIcon className="size-3.5" />
              {post.favoriteCount}
            </span>
          </div>
        </div>
        {showDelete && onDelete ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="删除"
            onClick={() => onDelete(post.id)}
          >
            <Trash2Icon />
          </Button>
        ) : null}
      </div>
    </article>
  )
}
