import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AdminShell() {
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <AppHeader />
      <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 gap-6 px-4 py-4 md:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="h-full min-h-0">
          <ScrollArea className="h-full">
            <div className="pr-2">
              <AdminSidebar />
            </div>
          </ScrollArea>
        </aside>
        <main className="h-full min-h-0 min-w-0">
          <ScrollArea className="h-full">
            <div className="pr-4 pb-6">
              <Outlet />
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}
