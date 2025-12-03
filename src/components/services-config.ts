import {
  IconApps,
  IconCalendarClock,
  IconChartBar,
  IconChartLine,
  IconClipboardList,
  IconFileText,
  IconHeadset,
  IconReportAnalytics,
  IconSearch,
  IconStethoscope,
} from "@tabler/icons-react"

export type ServiceCategory = "applications" | "analytics"

export interface ServiceItem {
  id: string
  title: string
  category: ServiceCategory
  icon: React.ComponentType<{ className?: string }>
  // Optional future URL to deep-link into specific app/dashboard
  url?: string
}

export const services: ServiceItem[] = [
  // Applications / core dashboards
  {
    id: "super-admin-dashboard",
    title: "Super Admin Dashboard",
    category: "applications",
    icon: IconApps,
  },
  {
    id: "clinics-dashboard",
    title: "Clinqly Calendar",
    category: "applications",
    icon: IconCalendarClock,
    url: "https://staging.clinqly.ai/",
  },
  {
    id: "operations-dashboard",
    title: "Operations Dashboard",
    category: "applications",
    icon: IconHeadset,
  },
  {
    id: "sales-dashboard",
    title: "Sales Dashboard",
    category: "applications",
    icon: IconChartLine,
  },
  {
    id: "i-693-application",
    title: "I-693 Application",
    category: "applications",
    icon: IconFileText,
    url: "https://ezmedtech.com/",
  },
  {
    id: "ce-application",
    title: "CE Application",
    category: "applications",
    icon: IconClipboardList,
  },
  {
    id: "ezmedtech-onboarding",
    title: "Clinic Onboarding",
    category: "applications",
    icon: IconApps,
    url: "https://onboarding.clinqly.ai/",
  },
  {
    id: "medical-records-doctor",
    title: "Medical Records for Doctor Application",
    category: "applications",
    icon: IconStethoscope,
  },
  {
    id: "search-engine-ezmedtech",
    title: "Search Engine for EzMedTech",
    category: "applications",
    icon: IconSearch,
  },

  // Analytics & insights
  {
    id: "patient-scheduling-dashboard",
    title: "Patient Scheduling Running Dashboard",
    category: "analytics",
    icon: IconCalendarClock,
  },
  {
    id: "revenue-dashboard",
    title: "Revenue Dashboard",
    category: "analytics",
    icon: IconChartBar,
  },
  {
    id: "ar-dashboard",
    title: "AR Dashboard",
    category: "analytics",
    icon: IconReportAnalytics,
    url: "https://staging-ar.clinqly.ai/",
  },
  {
    id: "clinic-insights",
    title: "Clinic Insights",
    category: "analytics",
    icon: IconReportAnalytics,
  },
  {
    id: "ai-score-call-transcript",
    title: "AI Score for Call Transcript",
    category: "analytics",
    icon: IconReportAnalytics,
  },
  {
    id: "digital-marketing-dashboard",
    title: "Digital Marketing Dashboard",
    category: "analytics",
    icon: IconChartLine,
  },
]


