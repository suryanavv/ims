import { SidebarTrigger } from "@/components/ui/sidebar"

export function SuperAdminHeader() {
    return (
        <header className="bg-background sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}

            {/* Title */}
            <h1 className="text-lg font-semibold">Super Admin Dashboard</h1>
        </header>
    )
}
