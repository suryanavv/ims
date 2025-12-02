import * as React from "react"
import { IconChevronDown, IconChevronRight, IconMedicalCross } from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { services } from "@/components/services-config"
import type { LoginResponse } from "@/api/auth"

export function AppSidebar({
  user,
  onLogout,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: LoginResponse
  onLogout?: () => void
}) {
  const applications = services.filter((s) => s.category === "applications")
  const analytics = services.filter((s) => s.category === "analytics")

  const [appsOpen, setAppsOpen] = React.useState(true)
  const [analyticsOpen, setAnalyticsOpen] = React.useState(true)

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconMedicalCross className="!size-5" />
                <span className="text-base font-semibold">IMS Application</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Applications Section */}
        <SidebarGroup className="mt-1">
          <SidebarGroupLabel
            className="cursor-pointer select-none flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-sidebar-accent"
            onClick={() => setAppsOpen((v) => !v)}
          >
            <span className="text-xs font-semibold uppercase tracking-wide">
              Applications
            </span>
            {appsOpen ? (
              <IconChevronDown className="size-3 text-muted-foreground" />
            ) : (
              <IconChevronRight className="size-3 text-muted-foreground" />
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent className={appsOpen ? "mt-1" : "hidden"}>
            <SidebarMenu>
              {applications.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton className="text-sm pl-6">
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics Section */}
        <SidebarGroup className="-mt-5">
          <SidebarGroupLabel
            className="cursor-pointer select-none flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-sidebar-accent"
            onClick={() => setAnalyticsOpen((v) => !v)}
          >
            <span className="text-xs font-semibold uppercase tracking-wide">
              Analytics
            </span>
            {analyticsOpen ? (
              <IconChevronDown className="size-3 text-muted-foreground" />
            ) : (
              <IconChevronRight className="size-3 text-muted-foreground" />
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent className={analyticsOpen ? "mt-1" : "hidden"}>
            <SidebarMenu>
              {analytics.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton className="text-sm pl-6">
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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

