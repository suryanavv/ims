import * as React from "react"
import {
    IconChartBar,
    IconBuildingHospital,
    IconPhone,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { LoginResponse } from "@/api/auth"
import { useSuperAdmin, type SuperAdminSection } from "@/contexts/super-admin-context"
import { NavMain } from "@/components/nav-main"

interface SuperAdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: LoginResponse
    onLogout?: () => void
}

const navItems: Array<{
    id: SuperAdminSection
    title: string
    icon: React.ComponentType<{ className?: string }>
}> = [
        {
            id: "overview",
            title: "Overview",
            icon: IconChartBar,
        },
        {
            id: "clinics",
            title: "Clinics Management",
            icon: IconBuildingHospital,
        },
        {
            id: "logs",
            title: "Call Logs",
            icon: IconPhone,
        },
    ]

export function SuperAdminSidebar({
    user,
    onLogout,
    ...props
}: SuperAdminSidebarProps) {
    const { activeSection, setSection } = useSuperAdmin()

    const navItemsForMain = React.useMemo(() => navItems.map((item) => ({
        title: item.title,
        url: "#",
        icon: item.icon,
        page: item.id,
    })), [])

    return (
        <Sidebar {...props}>
            <SidebarHeader className="pt-3 px-4 flex items-center">
                <SidebarMenu className="w-full">
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-3 hover:bg-transparent focus:bg-transparent active:bg-transparent"
                        >
                            <a href="#" className="flex items-center gap-2">
                                <img
                                    src="/logo.svg"
                                    alt="EzMedTech Logo"
                                    className="w-6 h-6 object-contain rounded-full"
                                />
                                <span className="text-base font-bold truncate">EZMedTech IMS</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    items={navItemsForMain}
                    currentPage={activeSection}
                    onPageChange={(page) => page && setSection(page as SuperAdminSection)}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavUser
                    user={{
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email,
                        avatar: "",
                        role: user.role,
                        phone: "",
                    }}
                    onLogout={onLogout}
                />
            </SidebarFooter>
        </Sidebar>
    )
}
