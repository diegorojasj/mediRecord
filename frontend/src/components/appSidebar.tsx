import {
  Activity01Icon,
  Calendar01Icon,
  Configuration01Icon,
  DashboardSquare01Icon,
  Invoice01Icon,
  UserIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@tanstack/react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';

const navItems = [
  {
    label: 'Dashboard',
    to: '/',
    icon: DashboardSquare01Icon,
  },
  {
    label: 'Patients',
    to: '/patients',
    icon: UserIcon,
  },
  {
    label: 'Appointments',
    to: '/appointments',
    icon: Calendar01Icon,
  },
  {
    label: 'Billing',
    to: '/billing',
    icon: Invoice01Icon,
  },
  {
    label: 'Config',
    to: '/config',
    icon: Configuration01Icon
  }
];

const AppSideBar = () => {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={Activity01Icon} size={16} />
                </div>
                <span className="font-semibold">MediRecord</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
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
  );
};

export default AppSideBar;
