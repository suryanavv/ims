import type { ServiceItem } from "@/components/services-config"
import type { LoginResponse } from "@/api/auth"
import { services } from "@/components/services-config"
import { useSuperAdmin } from "@/contexts/super-admin-context"

interface SuperAdminDashboardProps {
  user: LoginResponse
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  const { open } = useSuperAdmin()
  const applications = services.filter((s) => s.category === "applications")
  const analytics = services.filter((s) => s.category === "analytics")

  const handleCardClick = (title: string) => {
    const service = [...applications, ...analytics].find(s => s.title === title)
    if (service?.id === "super-admin-dashboard") {
      open()
      return
    }

    if (service?.url) {
      window.open(service.url, '_blank')
    } else {
      // Placeholder - later this can navigate to specific application URLs
      // eslint-disable-next-line no-console
      console.log("Open application:", title, "for user", user.email)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Main Panel only – left navigation is the sidebar */}
      <div className="space-y-6">
        {/* Applications section */}
        <div className="space-y-3">
          <h3 className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            Applications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {applications.map((item) => {
              const Icon = item.icon as ServiceItem["icon"]
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className="neumorphic-inset flex flex-col items-start gap-4 rounded-2xl p-5 min-h-[200px] border-2 border-transparent hover:border-primary hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => handleCardClick(item.title)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleCardClick(item.title)
                    }
                  }}
                >
                  <div className="inline-flex items-center justify-center rounded-2xl bg-secondary w-14 h-14">
                    <Icon
                      className="w-7 h-7"
                      strokeWidth={1.5}
                      style={item.color ? { color: item.color } : undefined}
                    />
                  </div>
                  <h4 className="text-xl font-semibold text-left">
                    {item.title}
                  </h4>
                </div>
              )
            })}
          </div>
        </div>

        {/* Analytics section */}
        <div className="space-y-3">
          <h3 className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            Analytics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {analytics.map((item) => {
              const Icon = item.icon as ServiceItem["icon"]
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className="neumorphic-inset flex flex-col items-start gap-4 rounded-2xl p-5 min-h-[200px] border-2 border-transparent hover:border-primary hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => handleCardClick(item.title)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleCardClick(item.title)
                    }
                  }}
                >
                  <div className="inline-flex items-center justify-center rounded-2xl bg-secondary w-14 h-14">
                    <Icon
                      className="w-7 h-7"
                      strokeWidth={1.5}
                      style={item.color ? { color: item.color } : undefined}
                    />
                  </div>
                  <h4 className="text-xl font-semibold text-left">
                    {item.title}
                  </h4>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
