import * as React from "react"
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react"

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
import { dashboardAPI } from "@/api/dashboard"

export function AppSidebar({
  user,
  onLogout,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: LoginResponse
  onLogout?: () => void
}) {
   const [allowedServiceIds, setAllowedServiceIds] = React.useState<string[] | null>(null)
   const [loadingServices, setLoadingServices] = React.useState(user.role === "clinic_admin")

  React.useEffect(() => {
    let isMounted = true

    // For now, only filter for clinic_admin – superadmin sees all services
    if (user.role !== "clinic_admin") {
      setAllowedServiceIds(null)
       setLoadingServices(false)
      return
    }

    const load = async () => {
      try {
         setLoadingServices(true)
        const data = await dashboardAPI.getUserServices()

        const keys: string[] = []

        if (data.integrations && Array.isArray(data.integrations)) {
          for (const item of data.integrations) {
            const name =
              (typeof item.integration_name === "string"
                ? item.integration_name
                : typeof item.service_name === "string"
                  ? item.service_name
                  : "") || ""
            if (!name) continue
            keys.push(name.toLowerCase().replace(/\s+/g, "-"))
          }
        }

        if (data.forms && Array.isArray(data.forms)) {
          for (const item of data.forms) {
            const name = typeof item.form_name === "string" ? item.form_name : ""
            if (!name) continue
            keys.push(name.toLowerCase().replace(/\s+/g, "-"))
          }
        }

        if (!isMounted) return

        const matchedIds = new Set<string>()

        // Map known service keys from backend to sidebar service ids
        for (const key of keys) {
          if (key.includes("calendar") || key === "voice-agent") {
            matchedIds.add("clinics-dashboard")
          }
          if (key === "i-693" || key === "i693") {
            matchedIds.add("i-693-application")
          }
          if (key === "dental" || key === "open-dental" || key.includes("onboarding")) {
            matchedIds.add("ezmedtech-onboarding")
          }
          if (key === "ar" || key.includes("account-receivable")) {
            matchedIds.add("ar-dashboard")
          }
        }

        setAllowedServiceIds(Array.from(matchedIds))
      } catch {
        if (!isMounted) return
        // On failure, fall back to showing nothing filtered (no extra handling needed)
        setAllowedServiceIds([])
      } finally {
         if (isMounted) {
           setLoadingServices(false)
         }
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [user.role])

  const filteredServices =
    allowedServiceIds === null
      ? services
      : services.filter((s) => allowedServiceIds.includes(s.id))

  const applications = filteredServices.filter((s) => s.category === "applications")
  const analytics = filteredServices.filter((s) => s.category === "analytics")

  const [appsOpen, setAppsOpen] = React.useState(true)
  const [analyticsOpen, setAnalyticsOpen] = React.useState(true)

  return (
    <Sidebar {...props}>
      <SidebarHeader className="pt-3 -mb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <img src="/logo.svg" alt="EzMedTech Logo" className="w-6 h-6 object-contain rounded-full" />
                <span className="text-base font-bold">EZMedTech IMS</span>
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
            {user.role === "clinic_admin" && loadingServices ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Loading your clinic services...
              </div>
            ) : applications.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No applications to display. Please contact your administrator.
              </div>
            ) : (
              <SidebarMenu>
                {applications.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton className="text-sm pl-6">
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
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
            {user.role === "clinic_admin" && loadingServices ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Loading your clinic services...
              </div>
            ) : analytics.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No analytics dashboard to display. Please contact your administrator.
              </div>
            ) : (
              <SidebarMenu>
                {analytics.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton className="text-sm pl-6">
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
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

