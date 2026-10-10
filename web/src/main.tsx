import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from '@/stores/auth'
import App from './App.tsx'
import './index.css'

function Bootstrap({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  useEffect(() => {
    bootstrap()
  }, [bootstrap])
  return children
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <Bootstrap>
        <App />
        <Toaster richColors position="top-center" />
      </Bootstrap>
    </TooltipProvider>
  </StrictMode>,
)
