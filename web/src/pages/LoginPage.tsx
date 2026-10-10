import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { loginApi } from '@/api/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await loginApi(username.trim(), password)
      toast.success('登录成功')
      const redirect = params.get('redirect') || '/'
      navigate(redirect)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>登录</CardTitle>
        <CardDescription>演示账号 admin / 123456</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void onSubmit(e)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-username">用户名</FieldLabel>
              <Input
                id="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="login-password">密码</FieldLabel>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '登录中…' : '登录'}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        还没有账号？
        <Link to="/register" className="ml-1 text-foreground underline">
          注册
        </Link>
      </CardFooter>
    </Card>
  )
}
