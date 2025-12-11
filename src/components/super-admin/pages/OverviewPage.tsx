import { useEffect, useState } from "react"
import {
    IconBuildingHospital,
    IconUsers,
    IconUserShield,
    IconPlugConnected,
    IconForms,
} from "@tabler/icons-react"
import { dashboardAPI, type AnalyticsResponse } from "@/api/dashboard"

export function OverviewPage() {
    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const fetchAnalytics = async () => {
            try {
                setLoading(true)
                const data = await dashboardAPI.getAnalytics()
                if (isMounted) {
                    setAnalytics(data)
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load analytics")
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        void fetchAnalytics()

        return () => {
            isMounted = false
        }
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading analytics...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-destructive">{error}</div>
            </div>
        )
    }

    if (!analytics) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">No analytics data available</div>
            </div>
        )
    }

    const totalUsers = Object.values(analytics.users_by_role).reduce(
        (sum, count) => sum + count,
        0
    )

    const totalIntegrations = Object.values(analytics.integrations).reduce(
        (sum, category) => {
            if (!category) return sum
            return sum + Object.values(category).reduce((s, c) => s + c, 0)
        },
        0
    )

    const totalForms = Object.values(analytics.forms).reduce((sum, count) => sum + count, 0)

    const statCards = [
        {
            title: "Total Clinics",
            value: analytics.total_clinics,
            icon: <IconBuildingHospital className="size-6" />,
            color: "text-blue-500",
        },
        {
            title: "Clinic Admins",
            value: analytics.users_by_role.clinic_admin || 0,
            icon: <IconUsers className="size-6" />,
            color: "text-green-500",
        },
        {
            title: "Total Users",
            value: totalUsers,
            icon: <IconUserShield className="size-6" />,
            color: "text-purple-500",
        },
        {
            title: "Active Integrations",
            value: totalIntegrations,
            icon: <IconPlugConnected className="size-6" />,
            color: "text-orange-500",
        },
    ]

    const integrationEntries = Object.entries(analytics.integrations).filter(
        ([, value]) => value && Object.keys(value).length > 0
    )

    return (
        <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.title}
                        className="neumorphic-inset p-4 neumorphic-hover transition-all duration-200 rounded-2xl"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>{stat.icon}</div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-md font-semibold">
                                    {stat.title}
                                </div>
                                <div className="text-3xl font-bold tabular-nums sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                                    {stat.value}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Integrations and Forms Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Integrations Breakdown */}
                <div className="neumorphic-inset rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <IconPlugConnected className="size-5 text-primary" />
                        <h3 className="text-lg font-semibold">Integrations Breakdown</h3>
                    </div>
                    <div className="space-y-4">
                        {integrationEntries.map(([category, items]) => (
                            <div key={category} className="space-y-2">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    {category}
                                </h4>
                                <div className="space-y-1">
                                    {Object.entries(items ?? {}).map(([name, count]) => (
                                        <div
                                            key={name}
                                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50"
                                        >
                                            <span className="text-sm">{name}</span>
                                            <span className="text-sm font-medium ">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Forms Usage */}
                <div className="neumorphic-inset rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <IconForms className="size-5 text-primary" />
                        <h3 className="text-lg font-semibold">Forms Usage</h3>
                        <span className="ml-auto text-sm text-muted-foreground">
                            Total: {totalForms}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(analytics.forms).map(([name, count]) => (
                            <div
                                key={name}
                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50"
                            >
                                <span className="text-sm">{name}</span>
                                <span className="text-sm font-medium">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
