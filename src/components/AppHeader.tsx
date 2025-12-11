import { SidebarTrigger } from "@/components/ui/sidebar"
import { useMemo } from "react"

export function AppHeader() {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}")
    } catch {
      return {}
    }
  }, [])

  const displayName = [storedUser.first_name, storedUser.last_name].filter(Boolean).join(" ").trim()

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <span className="text-lg font-semibold">
            {displayName ? `Welcome, ${displayName}` : "IMS Portal"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="EzMedTech Logo"
              className="w-6 h-6 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium leading-tight">
                Powered by
              </span>
              <span className="text-sm font-semibold text-foreground leading-tight">
                EzMedTech
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
