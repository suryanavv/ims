import type React from "react"
import {
  IconApps,
  IconCalendarClock,
  IconChartBar,
  IconChartLine,
  IconClipboardList,
  IconFileText,
  IconHeadset,
  IconReportAnalytics,
  IconStethoscope,
} from "@tabler/icons-react"

export type ServiceCategory = "applications" | "analytics"

export interface ServiceItem {
  id: string
  title: string
  category: ServiceCategory
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>
  color?: string
  // Optional future URL to deep-link into specific app/dashboard
  url?: string
}

export const services: ServiceItem[] = [
  // Applications
  {
    id: "clinics-dashboard",
    title: "Clinqly Calendar",
    category: "applications",
    icon: IconCalendarClock,
    color: "#2563eb",
    url: "https://staging.clinqly.ai/",
  },
  {
    id: "i-693-application",
    title: "I-693 Application",
    category: "applications",
    icon: IconFileText,
    color: "#7c3aed",
    url: "https://ezmedtech.com/",
  },
  {
    id: "ce-application",
    title: "CE Application",
    category: "applications",
    icon: IconClipboardList,
    color: "#059669",
    url: "https://ceform.ezfylr.ai/",
  },
  {
    id: "ezmedtech-onboarding",
    title: "Clinic Onboarding",
    category: "applications",
    icon: IconApps,
    color: "#ea580c",
    url: "https://onboarding.clinqly.ai/",
  },
  {
    id: "medical-records-doctor",
    title: "Medical Records for Doctor Application",
    category: "applications",
    icon: IconStethoscope,
    color: "#0ea5e9",
    url: "https://state-restrain.d3pj1yiwbnvbey.amplifyapp.com/",
  },
  {
    id: "ar-application",
    title: "AR Application",
    category: "applications",
    icon: IconReportAnalytics,
    color: "#db2777",
    url: "https://staging-ar.clinqly.ai/",
  },

  // Analytics & dashboards
  {
    id: "super-admin-dashboard",
    title: "Super Admin Dashboard",
    category: "analytics",
    icon: IconApps,
    color: "#2563eb",
  },
  {
    id: "operations-dashboard",
    title: "Operations Dashboard",
    category: "analytics",
    icon: IconHeadset,
    color: "#f59e0b",
  },
  {
    id: "sales-dashboard",
    title: "Sales Dashboard",
    category: "analytics",
    icon: IconChartLine,
    color: "#22c55e",
  },
  {
    id: "revenue-dashboard",
    title: "Revenue Dashboard",
    category: "analytics",
    icon: IconChartBar,
    color: "#ef4444",
  },
  {
    id: "clinic-insights",
    title: "Clinic Insights",
    category: "analytics",
    icon: IconReportAnalytics,
    color: "#14b8a6",
  },
  {
    id: "digital-marketing-dashboard",
    title: "Digital Marketing Dashboard",
    category: "analytics",
    icon: IconChartLine,
    color: "#8b5cf6",
  },
]


