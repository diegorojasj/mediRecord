import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    DashboardSquare01Icon,
    UserIcon,
    Calendar01Icon,
    Invoice01Icon,
} from "@hugeicons/core-free-icons"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "./ui/sidebar"

const navItems = [
    {
        label: "Dashboard",
        to: "/",
        icon: DashboardSquare01Icon,
    },
    {
        label: "Patients",
        to: "/patients",
        icon: UserIcon,
    },
    {
        label: "Appointments",
        to: "/appointments",
        icon: Calendar01Icon,
    },
    {
        label: "Billing",
        to: "/billing",
        icon: Invoice01Icon,
    },
]

const AppSideBar = () => {
    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.to}>
                                            <HugeiconsIcon icon={item.icon} size={18} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}

export default AppSideBar