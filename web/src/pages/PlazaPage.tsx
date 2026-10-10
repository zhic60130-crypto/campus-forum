import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchTagsApi } from '@/api/meta'
import { fetchTopicsApi } from '@/api/topic'
import { BannerCarousel } from '@/components/forum/BannerCarousel'
import { PostCard } from '@/components/forum/PostCard'
import { PostComposer } from '@/components/forum/PostComposer'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import type { Topic } from '@/types'

const PAGE_SIZE = 6

export function PlazaPage() {
  const [params, setParams] = useSearchParams()
  const categoryId = params.get('categoryId') ?? undefined
  const tagId = params.get('tagId') ?? undefined
  const q = params.get('q') ?? undefined
  const sort = (params.get('sort') as 'hot' | 'latest' | null) ?? 'latest'
  const page = Number(params.get('page') ?? '1') || 1

  const [posts, setPosts] = useState<Topic[]>([])
  const [total, setTotal] = useState(0)
  const [tagLabels, setTagLabels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [result, tags] = await Promise.all([
        fetchTopicsApi({ categoryId, tagId, q, sort, page, size: PAGE_SIZE }),
        fetchTagsApi(),
      ])
      setPosts(result.records)
      setTotal(result.total)
      setTagLabels(
        Object.fromEntries(tags.map((t) => [t.id, t.label] as const)),
      )
    } finally {
      setLoading(false)
    }
  }, [categoryId, tagId, q, sort, page])

  useEffect(() => {
    void load()
  }, [load])

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    next.set(key, value)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-5">
      <BannerCarousel />
      <PostComposer onCreated={() => void load()} />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">帖子广场</h1>
        <ToggleGroup
          type="single"
          value={sort}
          onValueChange={(v) => {
            if (v) updateParam('sort', v)
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="latest">最新</ToggleGroupItem>
          <ToggleGroupItem value="hot">热门</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {q ? (
        <p className="text-sm text-muted-foreground">搜索：{q}</p>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : posts.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>暂无帖子</EmptyTitle>
            <EmptyDescription>换个筛选条件，或发一篇新帖吧</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-xl border bg-card/40 px-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} tagLabels={tagLabels} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParam('page', String(page - 1))}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParam('page', String(page + 1))}
          >
            下一页
          </Button>
        </div>
      ) : null}
    </div>
  )
}
