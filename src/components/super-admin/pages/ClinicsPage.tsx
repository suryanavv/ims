import { useEffect, useState } from "react"
import {
    IconEdit,
    IconTrash,
    IconPlus,
    IconMail,
    IconRefresh,
} from "@tabler/icons-react"
import { clinicAPI, type ClinicResponse } from "@/api/clinic"
import { authAPI } from "@/api/auth"
import { ClinicEditForm } from "./ClinicEditForm"
import { Button } from "@/components/ui/button"

const baseButtonClass =
    "w-full text-sm font-medium neumorphic-pressed text-foreground rounded-lg shadow-none cursor-pointer transition-all duration-200 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"

export function ClinicsPage() {
    const [clinics, setClinics] = useState<ClinicResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [editingClinic, setEditingClinic] = useState<ClinicResponse | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    const fetchClinics = async () => {
        try {
            setLoading(true)
            const data = await clinicAPI.getClinics()
            setClinics(data.clinics)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load clinics")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void fetchClinics()
    }, [])

    const handleDelete = async (clinicId: number) => {
        if (!window.confirm("Are you sure you want to delete this clinic? This action cannot be undone.")) {
            return
        }

        try {
            setActionLoading(clinicId)
            await clinicAPI.deleteClinic(clinicId)
            setClinics((prev) => prev.filter((c) => c.clinic_id !== clinicId))
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete clinic")
        } finally {
            setActionLoading(null)
        }
    }

    const handleResendOnboarding = async (userId: number) => {
        try {
            setActionLoading(userId)
            await clinicAPI.resendOnboarding(userId)
            alert("Onboarding email sent successfully!")
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to resend onboarding")
        } finally {
            setActionLoading(null)
        }
    }

    const handleEditComplete = () => {
        setEditingClinic(null)
        setIsCreating(false)
        void fetchClinics()
    }

    // Show edit form if editing or creating
    if (editingClinic || isCreating) {
        return (
            <ClinicEditForm
                clinic={editingClinic}
                onClose={() => {
                    setEditingClinic(null)
                    setIsCreating(false)
                }}
                onSuccess={handleEditComplete}
            />
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading clinics...</div>
            </div>
        )
    }

    if (error) {
        const isSessionExpired = error.toLowerCase().includes("session expired") || error.toLowerCase().includes("not authenticated")

        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="text-destructive">{error}</div>
                {isSessionExpired ? (
                    <Button
                        onClick={async () => {
                            await authAPI.logout()
                            window.location.reload()
                        }}
                        className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2`}
                    >
                        <IconRefresh className="size-4" />
                        Login Again
                    </Button>
                ) : (
                    <Button
                        onClick={() => void fetchClinics()}
                        className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2`}
                    >
                        <IconRefresh className="size-4" />
                        Retry
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="px-4 lg:px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">
                        Onboarded Clinics {loading ? "" : `(${clinics.length})`}
                    </h2>
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="w-full text-sm font-medium neumorphic-pressed text-foreground rounded-lg shadow-none cursor-pointer transition-all duration-200 px-3 py-2 max-w-[160px]"
                    >
                        <IconPlus className="size-4" />
                        Add Clinic
                    </Button>
                </div>

                {/* Clinics Table */}
                <div className="neumorphic-inset rounded-lg p-4 border-0">
                    <div className="overflow-x-auto max-h-[79vh] overflow-y-auto bg-card rounded-lg">
                        {clinics.length > 0 ? (
                            <table className="w-full text-sm table-fixed">
                                <thead className="sticky top-0 z-10 bg-card">
                                    <tr className="border-b-2 border-muted/90 bg-muted/10">
                                        <th className="text-left font-medium py-3 px-4 w-1/5">Clinic Name</th>
                                        <th className="text-left font-medium py-3 px-4 w-1/5">Admin Email</th>
                                        <th className="text-left font-medium py-3 px-4 w-1/5">Phone</th>
                                        <th className="text-left font-medium py-3 px-4 w-1/5">Services</th>
                                        <th className="text-left font-medium py-3 px-4 w-1/5">Created</th>
                                        <th className="text-right font-medium py-3 px-4 w-1/5">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-muted/90">
                                    {clinics.map((clinic) => (
                                        <tr key={clinic.clinic_id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {clinic.logo_url ? (
                                                        <img
                                                            src={clinic.logo_url}
                                                            alt={clinic.clinic_name}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-xs font-medium text-primary">
                                                                {clinic.clinic_name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-sm">{clinic.clinic_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm" style={{ textTransform: "none" }}>{clinic.email}</td>
                                            <td className="py-3 px-4 text-sm">{clinic.phone || "-"}</td>
                                            <td className="py-3 px-4 text-sm">
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-flex w-fit items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 ">
                                                        Integrations: {clinic.integrations?.length || 0}
                                                    </span>
                                                    <span className="inline-flex w-fit items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 ">
                                                        Forms: {clinic.forms?.length || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {new Date(clinic.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {clinic.admin_user_id && (
                                                        <Button
                                                            onClick={() => void handleResendOnboarding(clinic.admin_user_id!)}
                                                            disabled={actionLoading === clinic.admin_user_id}
                                                            className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2 p-2 text-muted-foreground hover:text-foreground`}
                                                            title="Resend Onboarding Email"
                                                        >
                                                            <IconMail className="size-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        onClick={() => setEditingClinic(clinic)}
                                                        className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2 p-2 text-muted-foreground hover:text-foreground`}
                                                        title="Edit Clinic"
                                                    >
                                                        <IconEdit className="size-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => void handleDelete(clinic.clinic_id)}
                                                        disabled={actionLoading === clinic.clinic_id}
                                                        className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2 p-2 text-muted-foreground hover:bg-destructive`}
                                                        title="Delete Clinic"
                                                    >
                                                        <IconTrash className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-sm text-muted-foreground">No clinics found. Click "Add Clinic" to create one.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
