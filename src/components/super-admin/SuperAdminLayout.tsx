import type { CSSProperties } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SuperAdminSidebar } from "./SuperAdminSidebar"
import { SuperAdminHeader } from "./SuperAdminHeader"
import { OverviewPage } from "./pages/OverviewPage"
import { ClinicsPage } from "./pages/ClinicsPage"
import { CallLogsPage } from "./pages/CallLogsPage"
import { useSuperAdmin } from "@/contexts/super-admin-context"
import type { LoginResponse } from "@/api/auth"

interface SuperAdminLayoutProps {
    user: LoginResponse
    onLogout?: () => void
}

export function SuperAdminLayout({ user, onLogout }: SuperAdminLayoutProps) {
    const { activeSection } = useSuperAdmin()

    const renderContent = () => {
        switch (activeSection) {
            case "overview":
                return <OverviewPage />
            case "clinics":
                return <ClinicsPage />
            case "logs":
                return <CallLogsPage />
            default:
                return <OverviewPage />
        }
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "16rem",
                    "--header-height": "4rem",
                } as CSSProperties
            }
        >
            <SuperAdminSidebar variant="floating" user={user} onLogout={onLogout} />
            <main className="flex-1 flex flex-col">
                <SuperAdminHeader />
                <div className="flex-1 overflow-auto">{renderContent()}</div>
            </main>
        </SidebarProvider>
    )
}
