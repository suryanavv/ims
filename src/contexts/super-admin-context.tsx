import { createContext, useContext, useState, type ReactNode } from "react"

export type SuperAdminSection = "overview" | "clinics" | "logs"

interface SuperAdminContextType {
    isOpen: boolean
    activeSection: SuperAdminSection
    selectedClinicId: number | null
    open: () => void
    close: () => void
    setSection: (section: SuperAdminSection) => void
    selectClinic: (id: number | null) => void
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined)

interface SuperAdminProviderProps {
    children: ReactNode
}

export function SuperAdminProvider({ children }: SuperAdminProviderProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeSection, setActiveSection] = useState<SuperAdminSection>("overview")
    const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null)

    const open = () => {
        setIsOpen(true)
        setActiveSection("overview")
    }

    const close = () => {
        setIsOpen(false)
        setSelectedClinicId(null)
    }

    const setSection = (section: SuperAdminSection) => {
        setActiveSection(section)
        // Clear selected clinic when changing sections (unless going to clinics)
        if (section !== "clinics") {
            setSelectedClinicId(null)
        }
    }

    const selectClinic = (id: number | null) => {
        setSelectedClinicId(id)
    }

    return (
        <SuperAdminContext.Provider
            value={{
                isOpen,
                activeSection,
                selectedClinicId,
                open,
                close,
                setSection,
                selectClinic,
            }}
        >
            {children}
        </SuperAdminContext.Provider>
    )
}

export function useSuperAdmin(): SuperAdminContextType {
    const context = useContext(SuperAdminContext)
    if (context === undefined) {
        throw new Error("useSuperAdmin must be used within a SuperAdminProvider")
    }
    return context
}
