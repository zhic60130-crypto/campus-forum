import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BellIcon,
  LogOutIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  StarIcon,
  UserIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { logoutApi } from '@/api/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth'

export function AppHeader() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const { user, isLoggedIn, isAdmin } = useAuthStore()

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams()
    if (q.trim()) next.set('q', q.trim())
    navigate({ pathname: '/', search: next.toString() ? `?${next}` : '' })
  }

  async function onLogout() {
    try {
      await logoutApi()
    } finally {
      toast.success('已退出登录')
      navigate('/')
    }
  }

  return (
    <header className="z-40 shrink-0 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link
          to="/"
          className="shrink-0 font-heading text-xl font-semibold tracking-tight"
        >
          Forum
        </Link>

        <form
          onSubmit={onSearch}
          className="mx-auto flex w-full max-w-md items-center gap-2"
        >
          <div className="relative w-full">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索帖子标题或内容"
              className="pl-8"
            />
          </div>
          <Button type="submit" variant="secondary">
            搜索
          </Button>
        </form>

        <div className="flex shrink-0 items-center gap-1.5">
          {isAdmin ? (
            <Button asChild variant="ghost">
              <Link to="/admin/topics">
                <ShieldIcon data-icon="inline-start" />
                管理端
              </Link>
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="消息">
                <BellIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>消息</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                暂无消息
                <div className="mt-1 text-xs">通知功能将在后续版本开放</div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar size="sm">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.username} />
                    ) : null}
                    <AvatarFallback>
                      {user.username.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-24 truncate text-sm">
                    {user.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/bookmarks')}>
                    <StarIcon />
                    我的收藏
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-posts')}>
                    <UserIcon />
                    我发布的
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/settings/profile')}
                  >
                    <SettingsIcon />
                    个人资料
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/settings/security')}
                  >
                    <SettingsIcon />
                    账号与安全
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void onLogout()}>
                  <LogOutIcon />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button asChild variant="ghost">
                <Link to="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link to="/register">注册</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
