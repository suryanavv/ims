import type { LoginResponse } from "@/api/auth"
import { services } from "@/components/services-config"

interface SuperAdminDashboardProps {
  user: LoginResponse
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  const applications = services.filter((s) => s.category === "applications")
  const analytics = services.filter((s) => s.category === "analytics")

  const handleCardClick = (title: string) => {
    // Placeholder - later this can navigate to specific application URLs
    // eslint-disable-next-line no-console
    console.log("Open application:", title, "for user", user.email)
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
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className="neumorphic-inset flex flex-col items-start gap-4 rounded-2xl p-5 min-h-[200px] hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => handleCardClick(item.title)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleCardClick(item.title)
                    }
                  }}
                >
                  <div className="inline-flex items-center justify-center rounded-2xl bg-secondary w-12 h-12">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h4 className="text-base font-semibold text-left">
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
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className="neumorphic-inset flex flex-col items-start gap-4 rounded-2xl p-5 min-h-[200px] hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => handleCardClick(item.title)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleCardClick(item.title)
                    }
                  }}
                >
                  <div className="inline-flex items-center justify-center rounded-2xl bg-secondary w-12 h-12">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h4 className="text-base font-semibold text-left">
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


