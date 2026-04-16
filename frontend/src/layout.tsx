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
                <main className="flex flex-1 flex-col p-4">
                    <div className="flex items-center">
                        <SidebarTrigger />
                    </div>
                    <div className="float-right">{children}</div>
                </main>
            </SidebarInset>
        </>
    )
}

export default Layout
