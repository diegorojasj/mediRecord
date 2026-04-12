import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { SidebarProvider } from './components/ui/sidebar.tsx'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen.ts'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </TooltipProvider>
  </StrictMode>,
)
