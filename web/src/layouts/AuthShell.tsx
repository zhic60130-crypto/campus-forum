import { Link, Outlet } from 'react-router-dom'

export function AuthShell() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_oklch(0.96_0.02_240),_var(--background)_50%)] px-4">
      <Link to="/" className="mb-8 font-heading text-3xl font-semibold tracking-tight">
        Forum
      </Link>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
