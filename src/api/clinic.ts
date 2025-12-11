import { API_BASE_URL } from "./config"
import { authAPI } from "./auth"

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

// ============ Type Definitions ============

export interface IntegrationInfo {
  integration_id: number
  integration_name: string
  service_name: string
  twilio_phone_number?: string | null
  developer_api_key?: string | null
  shepherd_provider_name?: string | null
  shepherd_clinic_id?: string | null
}

export interface FormInfo {
  form_id: number
  form_name: string
}

export interface ClinicAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
}

export interface ClinicScheduleDay {
  open: string
  close: string
  closed?: boolean
}

export interface ClinicSchedule {
  Monday?: ClinicScheduleDay
  Tuesday?: ClinicScheduleDay
  Wednesday?: ClinicScheduleDay
  Thursday?: ClinicScheduleDay
  Friday?: ClinicScheduleDay
  Saturday?: ClinicScheduleDay
  Sunday?: ClinicScheduleDay
}

export interface ClinicResponse {
  clinic_id: number
  clinic_name: string
  email: string
  phone?: string | null
  address?: ClinicAddress | null
  created_at: string
  service_id?: number | null
  fax?: string | null
  website_url?: string | null
  csid?: string | null
  logo_url?: string | null
  admin_name?: string | null
  admin_mobile?: string | null
  admin_user_id?: number | null
  clinic_schedule?: ClinicSchedule | null
  integrations: IntegrationInfo[]
  forms: FormInfo[]
}

export interface ClinicListResponse {
  clinics: ClinicResponse[]
  total: number
}

export interface ClinicDetailResponse {
  clinic: Record<string, unknown>
  users: Array<Record<string, unknown>>
  integrations: Array<Record<string, unknown>>
  forms: Array<Record<string, unknown>>
  twilio_numbers: Array<Record<string, unknown>>
}

export interface ClinicCreateRequest {
  full_name: string
  email: string
  clinic_name: string
  phone: string
  mobile_number: string
  file?: File
  address_street?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  fax?: string
  website_url?: string
  csid?: string
  integration_access?: string
  form_access?: string
  twilio_numbers?: string
  developer_api_keys?: string
  shepherd_provider_names?: string
  shepherd_clinic_ids?: string
  clinic_schedule?: string
}

export interface ClinicUpdateRequest {
  clinic_name: string
  email: string
  phone?: string
  address_street?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  fax?: string
  website_url?: string
  csid?: string
  integration_access?: string
  form_access?: string
  twilio_numbers?: string
  developer_api_keys?: string
  shepherd_provider_names?: string
  shepherd_clinic_ids?: string
  clinic_schedule?: string
  file?: File
}

export interface ClinicCreateResponse {
  message: string
  clinic_id: number
  user_id: number
  integrations_assigned: number
  forms_assigned: number
}

export interface ClinicUpdateResponse {
  message: string
  clinic_id: number
  integrations_assigned: number
  forms_assigned: number
}

// ============ API Functions ============

export const clinicAPI = {
  /**
   * Get all clinics with their assigned integrations and forms
   */
  async getClinics(): Promise<ClinicListResponse> {
    const response = await authenticatedFetch("/api/clinic/clinics")
    return response.json()
  },

  /**
   * Get detailed information about a specific clinic
   */
  async getClinicDetails(clinicId: number): Promise<ClinicDetailResponse> {
    const response = await authenticatedFetch(`/api/clinic/clinic/${clinicId}`)
    return response.json()
  },

  /**
   * Create a new clinic with admin user
   */
  async createClinic(data: ClinicCreateRequest): Promise<ClinicCreateResponse> {
    const formData = new FormData()
    
    formData.append("full_name", data.full_name)
    formData.append("email", data.email)
    formData.append("clinic_name", data.clinic_name)
    formData.append("phone", data.phone)
    formData.append("mobile_number", data.mobile_number)
    
    if (data.file) formData.append("file", data.file)
    if (data.address_street) formData.append("address_street", data.address_street)
    if (data.address_city) formData.append("address_city", data.address_city)
    if (data.address_state) formData.append("address_state", data.address_state)
    if (data.address_zip) formData.append("address_zip", data.address_zip)
    if (data.fax) formData.append("fax", data.fax)
    if (data.website_url) formData.append("website_url", data.website_url)
    if (data.csid) formData.append("csid", data.csid)
    if (data.integration_access) formData.append("integration_access", data.integration_access)
    if (data.form_access) formData.append("form_access", data.form_access)
    if (data.twilio_numbers) formData.append("twilio_numbers", data.twilio_numbers)
    if (data.developer_api_keys) formData.append("developer_api_keys", data.developer_api_keys)
    if (data.shepherd_provider_names) formData.append("shepherd_provider_names", data.shepherd_provider_names)
    if (data.shepherd_clinic_ids) formData.append("shepherd_clinic_ids", data.shepherd_clinic_ids)
    if (data.clinic_schedule) formData.append("clinic_schedule", data.clinic_schedule)

    const response = await authenticatedFetch("/api/clinic/create-clinic", {
      method: "POST",
      body: formData,
    })
    return response.json()
  },

  /**
   * Update clinic details and access
   */
  async updateClinic(clinicId: number, data: ClinicUpdateRequest): Promise<ClinicUpdateResponse> {
    const formData = new FormData()
    
    formData.append("clinic_name", data.clinic_name)
    formData.append("email", data.email)
    
    if (data.phone) formData.append("phone", data.phone)
    if (data.address_street) formData.append("address_street", data.address_street)
    if (data.address_city) formData.append("address_city", data.address_city)
    if (data.address_state) formData.append("address_state", data.address_state)
    if (data.address_zip) formData.append("address_zip", data.address_zip)
    if (data.fax) formData.append("fax", data.fax)
    if (data.website_url) formData.append("website_url", data.website_url)
    if (data.csid) formData.append("csid", data.csid)
    if (data.integration_access) formData.append("integration_access", data.integration_access)
    if (data.form_access) formData.append("form_access", data.form_access)
    if (data.twilio_numbers) formData.append("twilio_numbers", data.twilio_numbers)
    if (data.developer_api_keys) formData.append("developer_api_keys", data.developer_api_keys)
    if (data.shepherd_provider_names) formData.append("shepherd_provider_names", data.shepherd_provider_names)
    if (data.shepherd_clinic_ids) formData.append("shepherd_clinic_ids", data.shepherd_clinic_ids)
    if (data.clinic_schedule) formData.append("clinic_schedule", data.clinic_schedule)
    if (data.file) formData.append("file", data.file)

    const response = await authenticatedFetch(`/api/clinic/update-clinic/${clinicId}`, {
      method: "PUT",
      body: formData,
    })
    return response.json()
  },

  /**
   * Delete a clinic
   */
  async deleteClinic(clinicId: number): Promise<{ message: string }> {
    const response = await authenticatedFetch(`/api/clinic/delete-clinic/${clinicId}`, {
      method: "DELETE",
    })
    return response.json()
  },

  /**
   * Resend onboarding email to a user
   */
  async resendOnboarding(userId: number): Promise<{ message: string }> {
    const response = await authenticatedFetch(`/api/clinic/resend-onboarding/${userId}`, {
      method: "POST",
    })
    return response.json()
  },
}
