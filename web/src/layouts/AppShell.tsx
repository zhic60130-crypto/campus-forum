import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/AppHeader'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { RightSidebar } from '@/components/layout/RightSidebar'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AppShell() {
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,_oklch(0.97_0.01_250),_var(--background)_55%)]">
      <AppHeader />
      <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 gap-6 px-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
        <aside className="hidden h-full min-h-0 lg:block">
          <ScrollArea className="h-full">
            <div className="pr-3">
              <LeftSidebar />
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
        <aside className="hidden h-full min-h-0 lg:block">
          <ScrollArea className="h-full">
            <div className="pl-1 pr-2">
              <RightSidebar />
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  )
}
