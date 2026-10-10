import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  createTagApi,
  deleteTagApi,
  fetchAdminTagsApi,
  updateTagApi,
} from '@/api/admin'
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
import type { Tag } from '@/types'

export function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [label, setLabel] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')

  const load = useCallback(async () => {
    try {
      setTags(await fetchAdminTagsApi())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载失败')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createTagApi(label)
      setLabel('')
      toast.success('已创建')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建失败')
    }
  }

  async function onSave(id: string) {
    try {
      await updateTagApi(id, editingLabel)
      setEditingId(null)
      toast.success('已更新')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失败')
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteTagApi(id)
      toast.success('已删除')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">标签管理</h1>
      <form onSubmit={(e) => void onCreate(e)} className="flex gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="新标签名称"
          className="max-w-xs"
          required
        />
        <Button type="submit">新增</Button>
      </form>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标签</TableHead>
              <TableHead>引用数</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  {editingId === tag.id ? (
                    <Input
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      className="max-w-xs"
                    />
                  ) : (
                    tag.label
                  )}
                </TableCell>
                <TableCell>{tag.count ?? 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {editingId === tag.id ? (
                      <Button size="sm" onClick={() => void onSave(tag.id)}>
                        保存
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(tag.id)
                          setEditingLabel(tag.label)
                        }}
                      >
                        编辑
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => void onDelete(tag.id)}
                    >
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
