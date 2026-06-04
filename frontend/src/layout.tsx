import type { ReactNode } from 'react';
import AppSideBar from './components/appSidebar';
import { SidebarInset, SidebarTrigger } from './components/ui/sidebar';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AppSideBar />
      <SidebarInset className="overflow-x-hidden">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden p-2 sm:p-3 lg:p-4">
          <div className="flex h-8 shrink-0 items-center">
            <SidebarTrigger />
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</div>
        </main>
      </SidebarInset>
    </>
  );
};

export default Layout;
