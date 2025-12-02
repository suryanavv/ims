import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 px-4 bg-background/70 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <span className="text-lg font-semibold">IMS Portal</span>
      </div>
      <div className="flex items-center gap-2">
        <img
          src="/logo.svg"
          alt="EzMedTech Logo"
          className="w-6 h-6 object-contain rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground leading-tight">
            Powered by
          </span>
          <span className="text-sm font-semibold text-foreground leading-tight">
            EzMedTech
          </span>
        </div>
      </div>
    </header>
  )
}
