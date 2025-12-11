import { useState, type CSSProperties } from 'react'
import './App.css'
import { LoginPage } from '@/components/login-page'
import { type LoginResponse, authAPI } from '@/api/auth'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { AppHeader } from '@/components/AppHeader'
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard'
import { ClinicAdminDashboard } from '@/components/clinic-admin/ClinicAdminDashboard'
import { SuperAdminProvider, useSuperAdmin } from '@/contexts/super-admin-context'
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout'

function App() {
  const [user, setUser] = useState<LoginResponse | null>(() => authAPI.getUser())

  const handleLogin = (response: LoginResponse) => {
    setUser(response)
  }

  const handleLogout = async () => {
    await authAPI.logout()
    setUser(null)
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  // Superadmin dashboard layout - wrap with provider
  if (user.role === 'superadmin') {
    return (
      <SuperAdminProvider>
        <SuperAdminContent user={user} onLogout={handleLogout} />
      </SuperAdminProvider>
    )
  }

  // Clinic admin dashboard layout
  if (user.role === 'clinic_admin') {
    return (
      <SidebarProvider
        style={
          {
            '--sidebar-width': '16rem',
            '--header-height': '4rem',
          } as CSSProperties
        }
      >
        <AppSidebar
          variant="floating"
          user={user}
          onLogout={handleLogout}
        />
        <main className="flex-1 flex flex-col">
          <AppHeader />
          <ClinicAdminDashboard user={user} />
        </main>
      </SidebarProvider>
    )
  }

  // Placeholder UI for other roles until their dashboards are implemented
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 flex items-center px-4 border-b">
        <h1 className="text-lg font-semibold">IMS Application</h1>
        <span className="ml-4 text-sm text-muted-foreground capitalize">
          {user.role} view coming soon
        </span>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Logged in as {user.first_name} {user.last_name} ({user.email})
          </p>
        </div>
      </main>
    </div>
  )
}

// Separate component to use the context hook
function SuperAdminContent({
  user,
  onLogout,
}: {
  user: LoginResponse
  onLogout: () => Promise<void>
}) {
  const { isOpen } = useSuperAdmin()

  // Show full-screen Super Admin Dashboard when open
  if (isOpen) {
    return <SuperAdminLayout user={user} onLogout={onLogout} />
  }

  // Show main IMS view with cards dashboard
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '16rem',
          '--header-height': '4rem',
        } as CSSProperties
      }
    >
      <AppSidebar
        variant="floating"
        user={user}
        onLogout={onLogout}
      />
      <main className="flex-1 flex flex-col">
        <AppHeader />
        <SuperAdminDashboard user={user} />
      </main>
    </SidebarProvider>
  )
}

export default App

