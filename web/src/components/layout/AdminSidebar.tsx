import { NavLink } from 'react-router-dom'
import { adminNav } from '@/mocks'
import { cn } from '@/lib/utils'

export function AdminSidebar() {
  return (
    <aside className="flex flex-col gap-2">
      <p className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        管理端
      </p>
      <nav className="flex flex-col gap-1">
        {adminNav.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted',
                isActive && 'bg-muted font-medium',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
