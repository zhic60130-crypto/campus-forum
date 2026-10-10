import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { fetchTagsApi } from '@/api/meta'
import { deleteTopicApi, fetchMyTopicsApi } from '@/api/topic'
import { PostCard } from '@/components/forum/PostCard'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import type { Topic } from '@/types'

export function MyPostsPage() {
  const [posts, setPosts] = useState<Topic[]>([])
  const [tagLabels, setTagLabels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [result, tags] = await Promise.all([
        fetchMyTopicsApi(1, 50),
        fetchTagsApi(),
      ])
      setPosts(result.records)
      setTagLabels(
        Object.fromEntries(tags.map((t) => [t.id, t.label] as const)),
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function onDelete(id: string) {
    try {
      await deleteTopicApi(id)
      toast.success('已删除')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">我发布的</h1>
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : posts.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>还没有发帖</EmptyTitle>
            <EmptyDescription>去广场写一篇吧</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-xl border px-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              tagLabels={tagLabels}
              showDelete
              onDelete={(id) => void onDelete(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
