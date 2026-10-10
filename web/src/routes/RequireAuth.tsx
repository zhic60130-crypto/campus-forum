import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

type Props = {
  children: React.ReactNode
  admin?: boolean
}

export function RequireAuth({ children, admin }: Props) {
  const location = useLocation()
  const { bootstrapped, isLoggedIn, isAdmin } = useAuthStore()

  if (!bootstrapped) {
    return (
      <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
        加载中…
      </div>
    )
  }

  if (!isLoggedIn) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (admin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
