import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  createBannerApi,
  fetchAdminBannersApi,
  removeBannerApi,
  toggleBannerApi,
  updateBannerApi,
} from '@/api/banner'
import { uploadImageApi } from '@/api/image'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Banner } from '@/types'

const emptyForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  link: '',
  enabled: true,
  sort: 10,
}

export function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setBanners(await fetchAdminBannersApi())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载失败')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setPendingFile(null)
    setPreviewUrl('')
  }

  function onPickImage(file: File | null) {
    if (!file) return
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pendingFile && !form.imageUrl) {
      toast.error('请上传轮播图片')
      return
    }
    setSaving(true)
    try {
      let imageUrl = form.imageUrl
      if (pendingFile) {
        const uploaded = await uploadImageApi(pendingFile)
        imageUrl = uploaded.url
      }
      const payload = { ...form, imageUrl }
      if (editingId) {
        await updateBannerApi(editingId, payload)
        toast.success('已更新轮播')
      } else {
        await createBannerApi(payload)
        toast.success('已创建轮播')
      }
      resetForm()
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold">轮播管理</h1>
      <form onSubmit={(e) => void onSubmit(e)} className="rounded-xl border p-4">
        <FieldGroup>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel>标题</FieldLabel>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </Field>
            <Field>
              <FieldLabel>副标题</FieldLabel>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="banner-image">轮播图片</FieldLabel>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="bg-muted aspect-[10/3] w-full max-w-md overflow-hidden rounded-lg border">
                  {previewUrl || form.imageUrl ? (
                    <img
                      src={previewUrl || form.imageUrl}
                      alt="轮播预览"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                      暂无预览
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      onPickImage(e.target.files?.[0] ?? null)
                    }
                  />
                  <FieldDescription>
                    选择本地图片，保存时上传到服务器
                  </FieldDescription>
                </div>
              </div>
            </Field>
            <Field>
              <FieldLabel>排序</FieldLabel>
              <Input
                type="number"
                value={form.sort}
                onChange={(e) =>
                  setForm({ ...form, sort: Number(e.target.value) || 0 })
                }
              />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.enabled}
              onCheckedChange={(enabled) => setForm({ ...form, enabled })}
            />
            <span className="text-sm">启用</span>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving
                ? '保存中…'
                : editingId
                  ? '保存修改'
                  : '新增轮播'}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
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
              <TableHead>标题</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>启用</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.subtitle}
                  </div>
                </TableCell>
                <TableCell>{b.sort}</TableCell>
                <TableCell>
                  <Switch
                    checked={b.enabled}
                    onCheckedChange={() =>
                      void toggleBannerApi(b.id)
                        .then(load)
                        .catch((err) =>
                          toast.error(
                            err instanceof Error ? err.message : '切换失败',
                          ),
                        )
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (previewUrl.startsWith('blob:')) {
                          URL.revokeObjectURL(previewUrl)
                        }
                        setEditingId(b.id)
                        setPendingFile(null)
                        setPreviewUrl('')
                        setForm({
                          title: b.title,
                          subtitle: b.subtitle,
                          imageUrl: b.imageUrl,
                          link: b.link,
                          enabled: b.enabled,
                          sort: b.sort,
                        })
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        void removeBannerApi(b.id)
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
