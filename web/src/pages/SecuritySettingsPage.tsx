import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { updatePasswordApi } from '@/api/account'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
function SettingsNav() {
  return (
    <div className="flex gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link to="/settings/profile">个人资料</Link>
      </Button>
      <Button asChild variant="secondary" size="sm">
        <Link to="/settings/security">账号与安全</Link>
      </Button>
    </div>
  )
}

export function SecuritySettingsPage() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('新密码至少 6 位')
      return
    }
    if (newPassword !== confirm) {
      toast.error('两次输入的新密码不一致')
      return
    }
    setLoading(true)
    try {
      await updatePasswordApi({ oldPassword, newPassword })
      toast.success('密码已更新')
      setOldPassword('')
      setNewPassword('')
      setConfirm('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '修改失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <SettingsNav />

      <form onSubmit={(e) => void onSubmit(e)}>
        <h1 className="mb-4 text-lg font-semibold">修改密码</h1>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="old-password">原密码</FieldLabel>
            <Input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="new-password">新密码</FieldLabel>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">确认新密码</FieldLabel>
            <Input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" disabled={loading}>
            {loading ? '提交中…' : '更新密码'}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
