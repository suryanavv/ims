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

export const dashboardAPI = {
  async getUserServices(): Promise<DashboardUserServicesResponse> {
    const response = await authenticatedFetch("/api/dashboard/user-services")
    return response.json()
  },
}


