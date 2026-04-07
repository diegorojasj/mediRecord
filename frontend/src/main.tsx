import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { SidebarProvider } from './components/ui/sidebar.tsx'
import { RouterProvider } from '@tanstack/react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <SidebarProvider>
        {/* <App /> */}
        <RouterProvider />
      </SidebarProvider>
    </TooltipProvider>
  </StrictMode>,
)
