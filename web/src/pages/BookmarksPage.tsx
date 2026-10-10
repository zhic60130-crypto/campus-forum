import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchTagsApi } from '@/api/meta'
import { fetchFavoriteTopicsApi } from '@/api/topic'
import { PostCard } from '@/components/forum/PostCard'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import type { Topic } from '@/types'

export function BookmarksPage() {
  const [posts, setPosts] = useState<Topic[]>([])
  const [tagLabels, setTagLabels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([fetchFavoriteTopicsApi(1, 50), fetchTagsApi()])
      .then(([result, tags]) => {
        if (!alive) return
        setPosts(result.records)
        setTagLabels(
          Object.fromEntries(tags.map((t) => [t.id, t.label] as const)),
        )
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : '加载失败'))
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">我的收藏</h1>
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : posts.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>还没有收藏</EmptyTitle>
            <EmptyDescription>在帖子详情页点击收藏即可加入这里</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-xl border px-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} tagLabels={tagLabels} />
          ))}
        </div>
      )}
    </div>
  )
}
