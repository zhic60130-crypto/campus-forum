import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { updateProfileApi } from '@/api/account'
import { uploadImageApi } from '@/api/image'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth'

function SettingsNav() {
  return (
    <div className="flex gap-2">
      <Button asChild variant="secondary" size="sm">
        <Link to="/settings/profile">个人资料</Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link to="/settings/security">账号与安全</Link>
      </Button>
    </div>
  )
}

export function ProfileSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const [username, setUsername] = useState(user?.username ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? '')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  function onPickAvatar(file: File | null) {
    if (!file) return
    setPendingFile(file)
    setAvatar(URL.createObjectURL(file))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      let avatarUrl = avatar.startsWith('blob:') ? user?.avatar ?? '' : avatar
      if (pendingFile) {
        const uploaded = await uploadImageApi(pendingFile)
        avatarUrl = uploaded.url
      }
      const updated = await updateProfileApi({
        username,
        email,
        avatar: avatarUrl,
        bio,
      })
      setAvatar(updated.avatar)
      setPendingFile(null)
      toast.success('资料已更新')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <SettingsNav />

      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-5">
        <h1 className="text-lg font-semibold">个人资料</h1>
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {avatar ? <AvatarImage src={avatar} alt={username} /> : null}
            <AvatarFallback>
              {(username || 'U').slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Field>
            <FieldLabel htmlFor="avatar-file">头像</FieldLabel>
            <Input
              id="avatar-file"
              type="file"
              accept="image/*"
              onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
            />
            <FieldDescription>选择后保存时上传到服务器</FieldDescription>
          </Field>
        </div>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="profile-username">用户名</FieldLabel>
            <Input
              id="profile-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-email">邮箱</FieldLabel>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-bio">简介</FieldLabel>
            <Textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </Field>
          <Button type="submit" disabled={loading}>
            {loading ? '保存中…' : '保存修改'}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
