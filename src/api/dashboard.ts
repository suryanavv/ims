import { API_BASE_URL } from "./config"
import { authAPI } from "./auth"

// Minimal API client for dashboard-related endpoints

// Generic authenticated fetch with automatic token refresh
async function authenticatedFetch(input: string, init: RequestInit = {}) {
  let token = authAPI.getToken()

  if (!token) {
    token = await authAPI.refreshToken()
  }

  if (!token) {
    throw new Error("Not authenticated. Please login again.")
  }

  const makeRequest = async (accessToken: string) => {
    const headers = {
      ...(init.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    } as HeadersInit

    const response = await fetch(`${API_BASE_URL}${input}`, {
      ...init,
      headers,
      credentials: "include",
    })

    return response
  }

  let response = await makeRequest(token)

  // If unauthorized, try one refresh and retry once
  if (response.status === 401) {
    const newToken = await authAPI.refreshToken()

    if (!newToken) {
      throw new Error("Session expired. Please login again.")
    }

    response = await makeRequest(newToken)
  }

  if (!response.ok) {
    let message = "Request failed"
    try {
      const error = await response.json()
      message = error.detail || error.message || message
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message)
  }

  return response
}

export interface DashboardUserServicesResponse {
  integrations?: Array<Record<string, unknown>>
  forms?: Array<Record<string, unknown>>
  clinic?: Record<string, unknown> | null
}

export interface AnalyticsResponse {
  total_clinics: number
  users_by_role: {
    clinic_admin: number
    superadmin: number
    [key: string]: number
  }
  integrations: {
    Dental?: Record<string, number>
    Medical?: Record<string, number>
    General?: Record<string, number>
    [key: string]: Record<string, number> | undefined
  }
  forms: Record<string, number>
}

export interface GoogleCalendarClinic {
  phone_number: string
  clinic_name?: string
  total_calls?: number
  [key: string]: unknown
}

export interface GoogleCalendarClinicsResponse {
  clinics: GoogleCalendarClinic[]
  total: number
  page: number
  per_page: number
}

export interface CallLog {
  call_id: string
  phone_number?: string
  caller_number?: string
  call_time?: string
  duration?: number
  status?: string
  [key: string]: unknown
}

export interface GoogleCalendarLogsResponse {
  logs: CallLog[]
  total: number
  page: number
  per_page: number
}

export interface TranscriptMessage {
  role: string
  content: string
  timestamp?: string
}

export interface TranscriptResponse {
  call_id: string
  phone_number: string
  transcript: TranscriptMessage[]
  [key: string]: unknown
}

export const dashboardAPI = {
  async getUserServices(): Promise<DashboardUserServicesResponse> {
    const response = await authenticatedFetch("/api/dashboard/user-services")
    return response.json()
  },

  /**
   * Get analytics data for superadmin
   */
  async getAnalytics(): Promise<AnalyticsResponse> {
    const response = await authenticatedFetch("/api/dashboard/analytics")
    return response.json()
  },

  /**
   * Get dashboard stats
   */
  async getStats(): Promise<Record<string, unknown>> {
    const response = await authenticatedFetch("/api/dashboard/stats")
    return response.json()
  },

  /**
   * Get list of clinics with Google Calendar stats
   */
  async getGoogleCalendarClinics(page = 1, perPage = 10): Promise<GoogleCalendarClinicsResponse> {
    const response = await authenticatedFetch(
      `/api/dashboard/external/google-calendar-clinics?page=${page}&per_page=${perPage}`
    )
    return response.json()
  },

  /**
   * Get Google Calendar logs for a specific clinic by phone number
   */
  async getGoogleCalendarLogs(
    phoneNumber: string,
    page = 1,
    perPage = 10
  ): Promise<GoogleCalendarLogsResponse> {
    const encodedPhone = encodeURIComponent(phoneNumber)
    const response = await authenticatedFetch(
      `/api/dashboard/external/google-calendar-logs/${encodedPhone}?page=${page}&per_page=${perPage}`
    )
    return response.json()
  },

  /**
   * Get transcript for a specific call
   */
  async getGoogleCalendarTranscript(
    phoneNumber: string,
    callId: string
  ): Promise<TranscriptResponse> {
    const encodedPhone = encodeURIComponent(phoneNumber)
    const encodedCallId = encodeURIComponent(callId)
    const response = await authenticatedFetch(
      `/api/dashboard/external/google-calendar-transcript/${encodedPhone}/${encodedCallId}`
    )
    return response.json()
  },
}


