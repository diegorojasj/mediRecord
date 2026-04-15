import type { ReactNode } from "react"
import AppSideBar from "./components/appSidebar"

const Layout = ({ children }: { children: ReactNode }) => {
    return <>
        <AppSideBar />
        {children}
    </>
}

export default Layout