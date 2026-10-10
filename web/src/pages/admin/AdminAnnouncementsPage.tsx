import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  createAnnouncementApi,
  deleteAnnouncementApi,
  fetchAdminAnnouncementsApi,
  updateAnnouncementApi,
} from '@/api/admin'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Announcement } from '@/types'

export function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [content, setContent] = useState('')
  const [sort, setSort] = useState(10)
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setItems(await fetchAdminAnnouncementsApi())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载失败')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingId) {
        await updateAnnouncementApi(editingId, { content, sort })
        toast.success('已更新公告')
      } else {
        await createAnnouncementApi({ content, sort })
        toast.success('已创建公告')
      }
      setContent('')
      setSort(10)
      setEditingId(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold">公告管理</h1>
      <form onSubmit={(e) => void onSubmit(e)} className="rounded-xl border p-4">
        <FieldGroup>
          <Field>
            <FieldLabel>内容</FieldLabel>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
            />
          </Field>
          <Field>
            <FieldLabel>排序</FieldLabel>
            <Input
              type="number"
              value={sort}
              onChange={(e) => setSort(Number(e.target.value) || 0)}
              className="max-w-40"
            />
          </Field>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? '保存修改' : '新增公告'}</Button>
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setContent('')
                  setSort(10)
                }}
              >
                取消编辑
              </Button>
            ) : null}
          </div>
        </FieldGroup>
      </form>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>内容</TableHead>
              <TableHead>排序</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-md">{item.content}</TableCell>
                <TableCell>{item.sort}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(item.id)
                        setContent(item.content)
                        setSort(item.sort)
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        void deleteAnnouncementApi(item.id)
                          .then(() => {
                            toast.success('已删除')
                            return load()
                          })
                          .catch((err) =>
                            toast.error(
                              err instanceof Error ? err.message : '删除失败',
                            ),
                          )
                      }
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
