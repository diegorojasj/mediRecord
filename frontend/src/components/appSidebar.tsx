import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "./ui/sidebar"

const AppSideBar = () => {
    return <Sidebar>
        <SidebarHeader />
        <SidebarContent>
            <SidebarGroup />
            <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
    </Sidebar>
}

export default AppSideBar