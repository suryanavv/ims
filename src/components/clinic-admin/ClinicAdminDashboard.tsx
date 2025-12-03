import { useEffect, useMemo, useState } from "react"
import type { LoginResponse } from "@/api/auth"
import { authAPI } from "@/api/auth"
import { dashboardAPI } from "@/api/dashboard"
import { services as allServices } from "@/components/services-config"

interface ClinicAdminDashboardProps {
  user: LoginResponse
}

interface NormalizedService {
  key: string
  originalName: string
}

// Mapping from backend service keys to external apps we expose
const CLINIC_SERVICE_CARDS = [
  {
    id: "clinics-dashboard",
    matchKeys: ["google-calendar", "voice-agent", "calendar"],
    title: "Clinqly Calendar",
    description:
      "View patient engagement, today’s schedule, AI agent appointments, calendar views, and refill requests.",
    url: "https://staging.clinqly.ai/",
  },
  {
    id: "i-693-application",
    matchKeys: ["i-693", "i693"],
    title: "I-693 Application",
    description: "Manage I-693 immigration medical forms and workflows.",
    url: "https://ezmedtech.com/",
  },
  {
    id: "ezmedtech-onboarding",
    matchKeys: ["dental", "open-dental", "onboarding"],
    title: "Clinic / Dental Onboarding",
    description: "Onboard new clinics and dental practices with guided workflows.",
    url: "https://onboarding.clinqly.ai/",
  },
  {
    id: "ar-dashboard",
    matchKeys: ["ar", "account-receivable", "accounts-receivable"],
    title: "AR Dashboard",
    description: "Track and manage accounts receivable performance.",
    url: "https://staging-ar.clinqly.ai/",
  },
]

export function ClinicAdminDashboard({}: ClinicAdminDashboardProps) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [services, setServices] = useState<NormalizedService[]>([])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await dashboardAPI.getUserServices()

        const normalized: NormalizedService[] = []

        if (data.integrations && Array.isArray(data.integrations)) {
          for (const item of data.integrations) {
            let name: string = ""
            if (typeof (item as any).integration_name === "string") {
              name = (item as any).integration_name
            } else if (typeof (item as any).service_name === "string") {
              name = (item as any).service_name
            }
            if (name) {
              normalized.push({
                key: name.toLowerCase().replace(/\s+/g, "-"),
                originalName: name,
              })
            }
          }
        }

        if (data.forms && Array.isArray(data.forms)) {
          for (const item of data.forms) {
            const name =
              typeof (item as any).form_name === "string" ? (item as any).form_name : ""
            if (name) {
              normalized.push({
                key: name.toLowerCase().replace(/\s+/g, "-"),
                originalName: name,
              })
            }
          }
        }

        if (!isMounted) return
        setServices(normalized)
      } catch (err) {
        if (!isMounted) return
        const message =
          err instanceof Error ? err.message : "Failed to load clinic services. Please try again."
        setError(message)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [])

  const visibleCards = useMemo(() => {
    if (!services.length) return []
    const keys = services.map((s) => s.key)
    return CLINIC_SERVICE_CARDS.filter((card) =>
      card.matchKeys.some((k) => keys.includes(k)),
    )
  }, [services])

  const handleCardClick = async (card: (typeof CLINIC_SERVICE_CARDS)[number]) => {
    // Find the underlying integration/form to get the exact service name from backend
    const matchedService = services.find((s) =>
      card.matchKeys.includes(s.key),
    )
    const ssoServiceName = matchedService?.originalName || card.title

    try {
      await authAPI.launchSSO(ssoServiceName)
    } catch (err) {
      // If SSO fails for any reason, fall back to direct URL open
      // eslint-disable-next-line no-console
      console.warn("SSO launch failed, falling back to direct URL:", err)
      window.open(card.url, "_blank", "noopener")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-6">
        {/* Applications section banner – same style as SuperAdminDashboard */}
        <div className="space-y-3">
          <h3 className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            Applications
          </h3>

          {loading && (
            <div className="rounded-2xl border bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground">
              Loading your clinic services...
            </div>
          )}

          {error && !loading && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && visibleCards.length === 0 && (
            <div className="rounded-2xl border bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground">
              No external services are currently assigned to your clinic. Please contact your
              administrator.
            </div>
          )}

          {!loading && !error && visibleCards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {visibleCards.map((card) => {
                const service = allServices.find((s) => s.id === card.id)
                const Icon = service?.icon

                return (
                  <div
                    key={card.id}
                    role="button"
                    tabIndex={0}
                    className="neumorphic-inset flex flex-col items-start gap-4 rounded-2xl p-5 min-h-[200px] border-2 border-transparent hover:border-primary hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => void handleCardClick(card)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        void handleCardClick(card)
                      }
                    }}
                  >
                    <div className="inline-flex items-center justify-center rounded-2xl bg-secondary w-14 h-14">
                      {Icon ? (
                        <Icon className="w-7 h-7 text-foreground" />
                      ) : (
                        <span className="text-xl font-semibold text-foreground">
                          {card.title.charAt(0)}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-semibold text-left">
                      {card.title}
                    </h4>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}