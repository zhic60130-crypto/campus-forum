import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { bootstrapped, isLoggedIn } = useAuthStore()

  if (!bootstrapped) {
    return (
      <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
        加载中…
      </div>
    )
  }

  if (isLoggedIn) return <Navigate to="/" replace />
  return children
}
