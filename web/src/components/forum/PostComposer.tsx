import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenLineIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { createTopicApi } from '@/api/topic'
import { fetchCategoriesApi, fetchTagsApi } from '@/api/meta'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/stores/auth'
import type { Category, Tag } from '@/types'

type Props = {
  onCreated?: () => void
}

export function PostComposer({ onCreated }: Props) {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void Promise.all([fetchCategoriesApi(), fetchTagsApi()]).then(
      ([cats, tagList]) => {
        setCategories(cats)
        setTags(tagList)
        if (cats[0]) setCategoryId(cats[0].id)
      },
    )
  }, [])

  function openComposer() {
    if (!isLoggedIn) {
      toast.message('请先登录后再发帖')
      navigate('/login?redirect=/')
      return
    }
    setOpen(true)
  }

  function toggleTag(id: string) {
    setTagIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 5) {
        toast.error('最多选择 5 个标签')
        return prev
      }
      return [...prev, id]
    })
  }

  function resetForm() {
    setTitle('')
    setSummary('')
    setTagIds([])
    if (categories[0]) setCategoryId(categories[0].id)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !summary.trim() || !categoryId) {
      toast.error('请填写标题、内容和分类')
      return
    }
    setSubmitting(true)
    try {
      await createTopicApi({
        title,
        summary,
        categoryId,
        tagIds,
      })
      toast.success('发布成功')
      resetForm()
      setOpen(false)
      onCreated?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '发布失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex w-full items-center gap-3 rounded-xl border bg-card/60 px-3 py-2.5">
        <Avatar size="sm">
          {user?.avatar ? (
            <AvatarImage src={user.avatar} alt={user.username} />
          ) : null}
          <AvatarFallback>
            {(user?.username ?? '游').slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={openComposer}
          className="min-w-0 flex-1 truncate text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          有什么想分享的？点这里发帖…
        </button>
        <Button type="button" size="sm" onClick={openComposer}>
          <PenLineIcon data-icon="inline-start" />
          写帖子
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="inset-0 top-0 left-0 flex h-svh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none bg-background p-0 ring-0 sm:max-w-none data-open:zoom-in-100"
        >
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="flex h-full min-h-0 flex-col"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-8">
              <DialogHeader className="gap-0.5 text-left">
                <DialogTitle className="text-lg">写帖子</DialogTitle>
                <DialogDescription>
                  选择合适分类与标签，标题尽量清晰。长文也可以慢慢写。
                </DialogDescription>
              </DialogHeader>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? '发布中…' : '发布'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="关闭"
                  onClick={() => setOpen(false)}
                >
                  <XIcon />
                </Button>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 px-4 py-5 sm:px-8">
                <Field>
                  <FieldLabel htmlFor="compose-title">标题</FieldLabel>
                  <Input
                    id="compose-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="用一句话概括你的话题"
                    maxLength={80}
                    autoFocus
                    className="h-11 text-base"
                  />
                </Field>
                <Field className="flex min-h-0 flex-1 flex-col">
                  <FieldLabel htmlFor="compose-summary">内容</FieldLabel>
                  <Textarea
                    id="compose-summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="分享想法、提问或求助…支持较长内容"
                    className="min-h-64 flex-1 resize-none text-base md:min-h-0"
                  />
                </Field>
              </div>

              <aside className="w-full shrink-0 border-t bg-muted/30 md:w-72 md:border-t-0 md:border-l lg:w-80">
                <ScrollArea className="h-full max-h-64 md:max-h-none md:h-full">
                  <div className="flex flex-col gap-5 p-4 sm:p-5">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>分类</FieldLabel>
                        <Select value={categoryId} onValueChange={setCategoryId}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel>标签</FieldLabel>
                        <FieldDescription>可选，最多 5 个</FieldDescription>
                        <div className="flex flex-col gap-2.5 pt-1">
                          {tags.map((t) => (
                            <label
                              key={t.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={tagIds.includes(t.id)}
                                onCheckedChange={() => toggleTag(t.id)}
                              />
                              {t.label}
                            </label>
                          ))}
                        </div>
                      </Field>
                    </FieldGroup>
                  </div>
                </ScrollArea>
              </aside>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
