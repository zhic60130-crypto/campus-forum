import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangleIcon,
  FolderOpenIcon,
  HashIcon,
  LayoutGridIcon,
  MessageCircleIcon,
  SparklesIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react'
import { fetchCategoriesApi, fetchTagsApi } from '@/api/meta'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Category, Tag } from '@/types'

const categoryIcons: Record<string, LucideIcon> = {
  MessageCircle: MessageCircleIcon,
  ChatDotRound: MessageCircleIcon,
  Users: UsersIcon,
  User: UsersIcon,
  AlertTriangle: AlertTriangleIcon,
  Warning: AlertTriangleIcon,
  Sparkles: SparklesIcon,
  MagicStick: SparklesIcon,
  FolderOpen: FolderOpenIcon,
  FolderOpened: FolderOpenIcon,
}

export function LeftSidebar() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const categoryId = params.get('categoryId')
  const tagId = params.get('tagId')

  useEffect(() => {
    let alive = true
    Promise.all([fetchCategoriesApi(), fetchTagsApi()])
      .then(([cats, tagList]) => {
        if (!alive) return
        setCategories(cats)
        setTags(tagList)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  function setFilter(next: { categoryId?: string | null; tagId?: string | null }) {
    const p = new URLSearchParams(params)
    if (next.categoryId === null) p.delete('categoryId')
    else if (next.categoryId !== undefined) {
      if (next.categoryId) p.set('categoryId', next.categoryId)
      else p.delete('categoryId')
    }
    if (next.tagId === null) p.delete('tagId')
    else if (next.tagId !== undefined) {
      if (next.tagId) p.set('tagId', next.tagId)
      else p.delete('tagId')
    }
    p.delete('page')
    navigate({ pathname: '/', search: p.toString() ? `?${p}` : '' })
  }

  return (
    <aside className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          浏览
        </p>
        <Button
          variant={!categoryId && !tagId ? 'secondary' : 'ghost'}
          className="justify-start"
          asChild
        >
          <Link to="/">
            <LayoutGridIcon data-icon="inline-start" />
            帖子广场
          </Link>
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          分类
        </p>
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          categories.map((c) => {
            const Icon = categoryIcons[c.icon] ?? MessageCircleIcon
            return (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  setFilter({
                    categoryId: categoryId === c.id ? null : c.id,
                    tagId: null,
                  })
                }
                className={cn(
                  'flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted',
                  categoryId === c.id && 'bg-muted font-medium',
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4 shrink-0" style={{ color: c.color }} />
                  {c.label}
                </span>
                {typeof c.count === 'number' ? (
                  <span className="text-xs text-muted-foreground">{c.count}</span>
                ) : null}
              </button>
            )
          })
        )}
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          标签
        </p>
        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  setFilter({
                    tagId: tagId === t.id ? null : t.id,
                    categoryId: null,
                  })
                }
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors hover:bg-muted',
                  tagId === t.id
                    ? 'border-foreground/20 bg-muted'
                    : 'border-transparent bg-muted/50',
                )}
              >
                <HashIcon className="size-3" />
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
