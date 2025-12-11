import * as React from "react"
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
import { services } from "@/components/services-config"
import type { LoginResponse } from "@/api/auth"
import { dashboardAPI } from "@/api/dashboard"
import { authAPI } from "@/api/auth"
import { NavMain } from "@/components/nav-main"

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
  const [serviceNameMap, setServiceNameMap] = React.useState<Map<string, string>>(new Map())
  const [activeServiceId, setActiveServiceId] = React.useState<string | undefined>()

  React.useEffect(() => {
    let isMounted = true

    if (user.role !== "clinic_admin") {
      setAllowedServiceIds(null)
      setLoadingServices(false)
      return
    }

    const load = async () => {
      try {
        setLoadingServices(true)
        const data = await dashboardAPI.getUserServices()

        const matchedIds = new Set<string>()
        const nameMap = new Map<string, string>()

        if (data.integrations && Array.isArray(data.integrations)) {
          for (const item of data.integrations) {
            const name =
              (typeof item.integration_name === "string"
                ? item.integration_name
                : typeof item.service_name === "string"
                  ? item.service_name
                  : "") || ""
            if (!name) continue
            const key = name.toLowerCase().replace(/\s+/g, "-")

            if (key.includes("calendar") || key === "voice-agent") {
              matchedIds.add("clinics-dashboard")
              nameMap.set("clinics-dashboard", name)
            }
            if (key === "i-693" || key === "i693") {
              matchedIds.add("i-693-application")
              nameMap.set("i-693-application", name)
            }
            if (key === "dental" || key === "open-dental" || key.includes("onboarding")) {
              matchedIds.add("ezmedtech-onboarding")
              nameMap.set("ezmedtech-onboarding", name)
            }
            if (key === "ar" || key.includes("account-receivable")) {
              matchedIds.add("ar-application")
              nameMap.set("ar-application", name)
            }
          }
        }

        if (data.forms && Array.isArray(data.forms)) {
          for (const item of data.forms) {
            const name = typeof item.form_name === "string" ? item.form_name : ""
            if (!name) continue
            const key = name.toLowerCase().replace(/\s+/g, "-")

            if (key === "i-693" || key === "i693") {
              matchedIds.add("i-693-application")
              nameMap.set("i-693-application", name)
            }
            if (key === "dental" || key === "open-dental" || key.includes("onboarding")) {
              matchedIds.add("ezmedtech-onboarding")
              nameMap.set("ezmedtech-onboarding", name)
            }
            if (key === "ar" || key.includes("account-receivable")) {
              matchedIds.add("ar-application")
              nameMap.set("ar-application", name)
            }
          }
        }

        if (!isMounted) return
        setAllowedServiceIds(Array.from(matchedIds))
        setServiceNameMap(nameMap)
      } catch {
        if (!isMounted) return
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

  React.useEffect(() => {
    if (!activeServiceId && filteredServices.length > 0) {
      setActiveServiceId(filteredServices[0].id)
    }
  }, [activeServiceId, filteredServices])

  const handleServiceClick = async (service: (typeof services)[number]) => {
    setActiveServiceId(service.id)

    if (user.role === "superadmin") {
      if (service.url) {
        window.open(service.url, "_blank", "noopener")
      }
      return
    }

    if (user.role === "clinic_admin") {
      const originalName = serviceNameMap.get(service.id) || service.title
      try {
        await authAPI.launchSSO(originalName)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("SSO launch failed, falling back to direct URL:", err)
        if (service.url) {
          window.open(service.url, "_blank", "noopener")
        }
      }
    }
  }

  const navItems = filteredServices.map((item) => ({
    title: item.title,
    url: "#",
    icon: item.icon,
    page: item.id,
  }))

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
                <img src="/logo.svg" alt="EzMedTech Logo" className="w-6 h-6 object-contain" />
                <div className="text-lg font-semibold flex-1 min-w-0 max-w-[12rem] truncate">EZMedTech IMS</div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {user.role === "clinic_admin" && loadingServices ? (
          <div className="px-4 py-3 text-xs text-muted-foreground">
            Loading your clinic services...
          </div>
        ) : navItems.length === 0 ? (
          <div className="px-4 py-3 text-xs text-muted-foreground">
            No services to display. Please contact your administrator.
          </div>
        ) : (
          <NavMain
            items={navItems}
            currentPage={activeServiceId}
            onPageChange={(page) => {
              const service = filteredServices.find((s) => s.id === page)
              if (service) void handleServiceClick(service)
            }}
          />
        )}
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
