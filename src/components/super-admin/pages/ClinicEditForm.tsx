import { useState, useEffect } from "react"
import { IconArrowLeft, IconUpload, IconCheck } from "@tabler/icons-react"
import {
    clinicAPI,
    type ClinicResponse,
    type ClinicUpdateRequest,
    type ClinicCreateRequest,
} from "@/api/clinic"
import { Button } from "@/components/ui/button"
import { TimePicker } from "@/components/ui/time-picker"

const baseButtonClass =
    "w-full text-sm font-medium neumorphic-pressed text-foreground rounded-lg shadow-none cursor-pointer transition-all duration-200 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
const inputClass =
    "w-full px-3 py-2 text-sm neumorphic-inset rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
const selectClass =
    "w-full px-3 py-2 text-sm neumorphic-inset rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"

const to12Hour = (time24: string) => {
    if (!time24) return "09:00 AM"
    const [hStr, mStr = "00"] = time24.split(":")
    let hours = parseInt(hStr, 10)
    const minutes = mStr.padStart(2, "0")
    const period = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    if (hours === 0) hours = 12
    return `${hours.toString().padStart(2, "0")}:${minutes} ${period}`
}

const to24Hour = (time12: string) => {
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
    if (!match) return time12
    let hours = parseInt(match[1], 10)
    const minutes = match[2]
    const period = match[3].toUpperCase()
    if (period === "PM" && hours !== 12) hours += 12
    if (period === "AM" && hours === 12) hours = 0
    return `${hours.toString().padStart(2, "0")}:${minutes}`
}

const formatPhoneDisplay = (phone?: string) => {
    if (!phone) return ""
    // Strip non-digits and format as +1(XXX)XXX-XXXX when possible
    const digits = phone.replace(/\D/g, "")
    if (digits.length === 11 && digits.startsWith("1")) {
        const area = digits.slice(1, 4)
        const mid = digits.slice(4, 7)
        const last = digits.slice(7)
        return `+1 (${area})${mid}-${last}`
    }
    if (digits.length === 10) {
        const area = digits.slice(0, 3)
        const mid = digits.slice(3, 6)
        const last = digits.slice(6)
        return `+1 (${area})${mid}-${last}`
    }
    return phone
}
// US States for dropdown
const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming"
]

// Service Access Configuration
interface IntegrationItem {
    id: string
    name: string
    hasDetails?: boolean
    needsTwilio?: boolean
}

const INTEGRATIONS_CONFIG: Record<string, IntegrationItem[]> = {
    Dental: [{ id: "open-dental", name: "Open Dental" }],
    Medical: [
        { id: "eclinicalworks", name: "eClinicalWorks" },
        { id: "epic", name: "Epic" },
        { id: "tebra", name: "Tebra" },
        { id: "shepherd", name: "Shepherd", hasDetails: true, needsTwilio: true },
        { id: "athena-health", name: "Athena Health" },
    ],
    Other: [
        { id: "google-calendar", name: "Google Calendar" },
        { id: "account-receivable", name: "Account Receivable", needsTwilio: true },
    ],
}

const FORMS_CONFIG = [
    { id: "ce-form", name: "CE Form" },
    { id: "clin-insights", name: "Clin Insights" },
    { id: "i-693", name: "I-693" },
]

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

interface ClinicEditFormProps {
    clinic: ClinicResponse | null
    onClose: () => void
    onSuccess: () => void
}

interface ScheduleDay {
    open: string
    close: string
    closed: boolean
}

type WeekSchedule = Record<string, ScheduleDay>

export function ClinicEditForm({ clinic, onClose, onSuccess }: ClinicEditFormProps) {
    const isEditing = clinic !== null

    // Admin Information
    const [firstName, setFirstName] = useState("")
    const [middleName, setMiddleName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [mobileNumber, setMobileNumber] = useState("")
    const [faxNumber, setFaxNumber] = useState("")

    // Clinic Information
    const [clinicName, setClinicName] = useState("")
    const [websiteUrl, setWebsiteUrl] = useState("")
    const [csid, setCsid] = useState("")
    const [streetAddress, setStreetAddress] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [zipCode, setZipCode] = useState("")
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    // Service Access
    const [selectedIntegrations, setSelectedIntegrations] = useState<Set<string>>(new Set())
    const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set())

    // Schedule
    const [schedule, setSchedule] = useState<WeekSchedule>(() => {
        const initial: WeekSchedule = {}
        for (const day of DAYS_OF_WEEK) {
            initial[day] = {
                open: "09:00",
                close: "17:00",
                closed: day === "Saturday" || day === "Sunday",
            }
        }
        return initial
    })

    // Twilio Numbers (integration_id -> phone_number)
    const [twilioNumbers, setTwilioNumbers] = useState<Record<string, string>>({})

    // Shepherd Details
    const [shepherdProviderName, setShepherdProviderName] = useState("")
    const [shepherdClinicId, setShepherdClinicId] = useState("")

    // Form state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const normalizeScheduleKey = (key: string) => {
        const map: Record<string, string> = {
            Mon: "Monday",
            Tue: "Tuesday",
            Wed: "Wednesday",
            Thu: "Thursday",
            Fri: "Friday",
            Sat: "Saturday",
            Sun: "Sunday",
        }
        return map[key] || key
    }

    const normalizeIntegrationKey = (raw?: string) => {
        if (!raw) return ""
        const key = raw.toLowerCase().replace(/\s+/g, "-")
        if (key === "ar") return "account-receivable"
        return key
    }

    // Initialize form with existing clinic data
    useEffect(() => {
        if (clinic) {
            // Parse admin name
            const nameParts = (clinic.admin_name || "").split(" ")
            setFirstName(nameParts[0] || "")
            setLastName(nameParts.slice(1).join(" ") || "")

            setEmail(clinic.email)
            setMobileNumber(formatPhoneDisplay(clinic.admin_mobile || ""))
            setFaxNumber(clinic.fax || "")
            setClinicName(clinic.clinic_name)
            setWebsiteUrl(clinic.website_url || "")
            setCsid(clinic.csid || "")
            setStreetAddress(clinic.address?.street || "")
            setCity(clinic.address?.city || "")
            setState(clinic.address?.state || "")
            setZipCode(clinic.address?.zip || "")
            setLogoPreview(clinic.logo_url || null)

            // Set selected integrations
            const intIds = new Set<string>()
            for (const integration of clinic.integrations || []) {
                const key = normalizeIntegrationKey(integration.integration_name)
                if (key) intIds.add(key)

                // Set Twilio number if available
                if (integration.twilio_phone_number) {
                    setTwilioNumbers((prev) => ({
                        ...prev,
                        [key]: formatPhoneDisplay(integration.twilio_phone_number || ""),
                    }))
                }

                // Set Shepherd details
                if (key === "shepherd") {
                    setShepherdProviderName(integration.shepherd_provider_name || "")
                    setShepherdClinicId(integration.shepherd_clinic_id || "")
                }
            }
            setSelectedIntegrations(intIds)

            // Set selected forms
            const formIds = new Set<string>()
            for (const form of clinic.forms || []) {
                const key = form.form_name?.toLowerCase().replace(/\s+/g, "-")
                if (key) formIds.add(key)
            }
            setSelectedForms(formIds)

            // Set schedule
            if (clinic.clinic_schedule) {
                const sched: WeekSchedule = {}
                for (const day of DAYS_OF_WEEK) {
                    // clinic API returns abbreviated keys (e.g., Mon). Normalize to full.
                    const dayData =
                        clinic.clinic_schedule[day as keyof typeof clinic.clinic_schedule] ||
                        clinic.clinic_schedule[Object.keys(clinic.clinic_schedule).find((k) => normalizeScheduleKey(k) === day) as keyof typeof clinic.clinic_schedule]
                    if (dayData) {
                        sched[day] = {
                            open: dayData.open || "09:00",
                            close: dayData.close || "17:00",
                            closed: dayData.closed || false,
                        }
                    } else {
                        sched[day] = {
                            open: "09:00",
                            close: "17:00",
                            closed: day === "Saturday" || day === "Sunday",
                        }
                    }
                }
                setSchedule(sched)
            }
        }
    }, [clinic])

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const toggleIntegration = (id: string) => {
        setSelectedIntegrations((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
                // Clear Twilio number if integration is removed
                setTwilioNumbers((t) => {
                    const copy = { ...t }
                    delete copy[id]
                    return copy
                })
            } else {
                next.add(id)
            }
            return next
        })
    }

    const toggleForm = (id: string) => {
        setSelectedForms((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const updateSchedule = (
        day: string,
        field: "open" | "close" | "closed",
        value: string | boolean
    ) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value,
            },
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ")

            // Build integration access string
            const integrationAccessList: string[] = []
            for (const [, items] of Object.entries(INTEGRATIONS_CONFIG)) {
                for (const item of items) {
                    if (selectedIntegrations.has(item.id)) {
                        integrationAccessList.push(item.name)
                    }
                }
            }
            const integrationAccess = integrationAccessList.join(",")

            // Build form access string
            const formAccessList: string[] = []
            for (const form of FORMS_CONFIG) {
                if (selectedForms.has(form.id)) {
                    formAccessList.push(form.name)
                }
            }
            const formAccess = formAccessList.join(",")

            // Build Twilio numbers JSON
            const twilioNumbersJson = JSON.stringify(twilioNumbers)

            // Build Shepherd details JSON
            const shepherdProviderNamesJson = JSON.stringify({ shepherd: shepherdProviderName })
            const shepherdClinicIdsJson = JSON.stringify({ shepherd: shepherdClinicId })

            // Build schedule JSON
            const scheduleJson = JSON.stringify(schedule)

            if (isEditing && clinic) {
                const updateData: ClinicUpdateRequest = {
                    clinic_name: clinicName,
                    email: email,
                    phone: mobileNumber,
                    address_street: streetAddress,
                    address_city: city,
                    address_state: state,
                    address_zip: zipCode,
                    fax: faxNumber,
                    website_url: websiteUrl,
                    csid: csid,
                    integration_access: integrationAccess,
                    form_access: formAccess,
                    twilio_numbers: twilioNumbersJson,
                    shepherd_provider_names: shepherdProviderNamesJson,
                    shepherd_clinic_ids: shepherdClinicIdsJson,
                    clinic_schedule: scheduleJson,
                    file: logoFile || undefined,
                }

                await clinicAPI.updateClinic(clinic.clinic_id, updateData)
            } else {
                const createData: ClinicCreateRequest = {
                    full_name: fullName,
                    email: email,
                    clinic_name: clinicName,
                    phone: mobileNumber,
                    mobile_number: mobileNumber,
                    address_street: streetAddress,
                    address_city: city,
                    address_state: state,
                    address_zip: zipCode,
                    fax: faxNumber,
                    website_url: websiteUrl,
                    csid: csid,
                    integration_access: integrationAccess,
                    form_access: formAccess,
                    twilio_numbers: twilioNumbersJson,
                    shepherd_provider_names: shepherdProviderNamesJson,
                    shepherd_clinic_ids: shepherdClinicIdsJson,
                    clinic_schedule: scheduleJson,
                    file: logoFile || undefined,
                }

                await clinicAPI.createClinic(createData)
            }

            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save clinic")
        } finally {
            setLoading(false)
        }
    }

    // Check which integrations need Twilio numbers
    const integrationsNeedingTwilio = Array.from(selectedIntegrations).filter((id) => {
        for (const [, items] of Object.entries(INTEGRATIONS_CONFIG)) {
            const item = items.find((i) => i.id === id)
            if (item?.needsTwilio) return true
        }
        return false
    })

    const showShepherdDetails = selectedIntegrations.has("shepherd")

    return (
        <div className="p-6 flex flex-col items-start">
            <div className="w-full max-w-5xl mb-4 flex justify-start">
                <Button
                    type="button"
                    onClick={onClose}
                    className={`${baseButtonClass} w-fit inline-flex items-center justify-center gap-2 p-2`}
                >
                    <IconArrowLeft className="size-5" />
                    Back to Clinics
                </Button>
            </div>

            {error && (
                <div className="w-full max-w-3xl mb-6 p-4 rounded-lg bg-destructive/10 text-destructive">
                    {error}
                </div>
            )}

            <div className="w-full max-w-3xl space-y-6">
                <h2 className="text-xl font-semibold text-center">
                    {isEditing ? `Edit Clinic: ${clinic?.clinic_name}` : "Add New Clinic"}
                </h2>

                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
                <div className="neumorphic-inset rounded-2xl p-6 space-y-8">
                {/* Admin Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Admin Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                First Name <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Middle Name</label>
                            <input
                                type="text"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Last Name <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Email <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Mobile Number <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="tel"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                placeholder="+1 (123) 456-7890"
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Fax Number</label>
                        <input
                            type="tel"
                            value={faxNumber}
                            onChange={(e) => setFaxNumber(e.target.value)}
                            placeholder="Enter fax number"
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Clinic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Clinic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Clinic Name <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                value={clinicName}
                                onChange={(e) => setClinicName(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Website URL</label>
                            <input
                                type="url"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                placeholder="https://example.com"
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">CSID</label>
                        <input
                            type="text"
                            value={csid}
                            onChange={(e) => setCsid(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Street Address <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                City <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                State <span className="text-destructive">*</span>
                            </label>
                            <select
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className={selectClass}
                                required
                            >
                                <option value="">Select State</option>
                                {US_STATES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Zip Code <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Clinic Logo</label>
                        <div className="neumorphic-inset rounded-2xl p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-center gap-3">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="w-16 h-16 rounded-lg object-cover border"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                                        No file chosen
                                    </div>
                                )}
                            </div>
                            <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer hover:bg-muted transition-colors text-sm text-foreground text-center">
                                <IconUpload className="size-5" />
                                <span className="font-medium">Drag &amp; drop your logo, or click to choose</span>
                                <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Service Access */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Service Access</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Integrations */}
                        <div className="space-y-4">
                            {Object.entries(INTEGRATIONS_CONFIG).map(([category, items]) => (
                                <div key={category}>
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                        {category}
                                    </h4>
                                    <div className="space-y-2">
                                        {items.map((item) => (
                                            <label
                                                key={item.id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIntegrations.has(item.id)}
                                                    onChange={() => toggleIntegration(item.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm">{item.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Forms */}
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                Medical Forms
                            </h4>
                            <div className="space-y-2">
                                {FORMS_CONFIG.map((form) => (
                                    <label
                                        key={form.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedForms.has(form.id)}
                                            onChange={() => toggleForm(form.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm">{form.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <IconCheck className="size-4 text-green-500" />
                        Selected: {selectedIntegrations.size} integration(s) + {selectedForms.size} form(s)
                    </div>
                </div>

                {/* Clinic Configuration (Schedule) */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Clinic Configuration</h3>
                    <div className="space-y-3 max-w-md">
                        {DAYS_OF_WEEK.map((day) => (
                            <div
                                key={day}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3 neumorphic-inset rounded-lg neumorphic-hover neumorphic-active transition-all duration-200"
                            >
                                <div className="w-full sm:w-24 font-medium text-sm">{day}</div>
                                {schedule[day]?.closed ? (
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">Closed</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <TimePicker
                                            value={to12Hour(schedule[day]?.open || "09:00")}
                                            onChange={(val) => updateSchedule(day, "open", to24Hour(val))}
                                            className="w-fit"
                                        />
                                        <span className="text-sm text-muted-foreground">to</span>
                                        <TimePicker
                                            value={to12Hour(schedule[day]?.close || "17:00")}
                                            onChange={(val) => updateSchedule(day, "close", to24Hour(val))}
                                            className="w-fit"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 flex justify-end">
                                    <Button
                                        onClick={() => updateSchedule(day, "closed", !schedule[day]?.closed)}
                                        className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2 px-3 py-2 text-xs ${schedule[day]?.closed ? "" : "hover:bg-destructive"}`}
                                    >
                                        {schedule[day]?.closed ? "Open" : "Close"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Twilio Phone Numbers (if needed) */}
                {integrationsNeedingTwilio.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Twilio Phone Numbers</h3>
                        <p className="text-sm text-muted-foreground">
                            Each voice agent integration requires its own Twilio phone number
                        </p>
                        <div className="space-y-4">
                            {integrationsNeedingTwilio.map((integrationId) => {
                                // Find the display name
                                let displayName = integrationId
                                for (const [, items] of Object.entries(INTEGRATIONS_CONFIG)) {
                                    const item = items.find((i) => i.id === integrationId)
                                    if (item) {
                                        displayName = item.name
                                        break
                                    }
                                }
                                return (
                                    <div key={integrationId} className="flex flex-col md:flex-row md:items-center md:gap-3">
                                        <label className="block text-sm font-medium mb-1 md:mb-0 md:w-48">
                                            {displayName} <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={twilioNumbers[integrationId] || ""}
                                            onChange={(e) =>
                                                setTwilioNumbers((prev) => ({
                                                    ...prev,
                                                    [integrationId]: e.target.value,
                                                }))
                                            }
                                            placeholder="+1(630)522-7689"
                                            className={inputClass}
                                            disabled
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Shepherd Details */}
                {showShepherdDetails && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Shepherd Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Shepherd Provider Name
                                </label>
                                <input
                                    type="text"
                                    value={shepherdProviderName}
                                    onChange={(e) => setShepherdProviderName(e.target.value)}
                                    placeholder="Enter provider name"
                                    className={inputClass}
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Shepherd Clinic ID
                                </label>
                                <input
                                    type="text"
                                    value={shepherdClinicId}
                                    onChange={(e) => setShepherdClinicId(e.target.value)}
                                    placeholder="Enter clinic id"
                                    className={inputClass}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                )}

                </div>
                {/* Submit Button */}
                <div className="flex items-center justify-end gap-4">
                    <Button
                        type="button"
                        onClick={onClose}
                        className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2 px-6 py-2 hover:bg-destructive`}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2 px-6 py-2`}
                    >
                        {loading ? "Saving..." : isEditing ? "Update Clinic" : "Create Clinic"}
                    </Button>
                </div>
                </form>
            </div>
                
        </div>
    )
}
