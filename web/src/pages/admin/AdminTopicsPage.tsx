import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { deleteAdminTopicApi, fetchAdminTopicsApi } from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Topic } from '@/types'

export function AdminTopicsPage() {
  const [q, setQ] = useState('')
  const [posts, setPosts] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchAdminTopicsApi({ q, page: 1, size: 50 })
      setPosts(result.records)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [q])

  useEffect(() => {
    void load()
  }, [load])

  async function onDelete(id: string) {
    try {
      await deleteAdminTopicApi(id)
      toast.success('已删除')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">帖子管理</h1>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void load()
          }}
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索标题或作者"
            className="w-56"
          />
          <Button type="submit" variant="secondary">
            搜索
          </Button>
        </form>
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>点赞</TableHead>
              <TableHead>时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>加载中…</TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>暂无数据</TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link to={`/post/${post.id}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell>{post.authorName}</TableCell>
                  <TableCell>{post.likeCount}</TableCell>
                  <TableCell>
                    {new Date(post.createdAt).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void onDelete(post.id)}
                    >
                      删除
                    </Button>
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
