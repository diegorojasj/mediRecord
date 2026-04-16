import type { ReactNode } from "react"
import AppSideBar from "./components/appSidebar"
import {
    SidebarInset,
    SidebarTrigger,
} from "./components/ui/sidebar"

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <AppSideBar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                    </div>
                </header>
                <main className="flex flex-1 flex-col p-4">
                    {children}
                </main>
            </SidebarInset>
        </>
    )
}

export default Layout
