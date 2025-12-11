import { useEffect, useState } from "react"
import {
    IconPhone,
    IconEye,
    IconX,
    IconChevronLeft,
    IconDownload,
} from "@tabler/icons-react"
import {
    dashboardAPI,
    type GoogleCalendarClinic,
    type CallLog,
    type TranscriptMessage,
} from "@/api/dashboard"
import { Button } from "@/components/ui/button"

const baseButtonClass =
    "w-full text-sm font-medium neumorphic-pressed text-foreground rounded-lg shadow-none cursor-pointer transition-all duration-200 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"

export function CallLogsPage() {
    const [clinics, setClinics] = useState<GoogleCalendarClinic[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const clinicsPerPage = 100
    const logsPerPage = 100
    const [stats, setStats] = useState<{ total_clinics: number; total_calls: number; total_scheduled: number; total_cancelled: number }>({
        total_clinics: 0,
        total_calls: 0,
        total_scheduled: 0,
        total_cancelled: 0,
    })

    // Selected clinic for logs view
    const [selectedClinic, setSelectedClinic] = useState<GoogleCalendarClinic | null>(null)
    const [logs, setLogs] = useState<CallLog[]>([])
    const [logsLoading, setLogsLoading] = useState(false)
    const [logsStats, setLogsStats] = useState<{ total?: number; scheduled?: number; cancelled?: number; rescheduled?: number; failure?: number; unknown?: number }>({})

    // Transcript modal
    const [selectedLog, setSelectedLog] = useState<CallLog | null>(null)
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
    const [transcriptLoading, setTranscriptLoading] = useState(false)

    // Fetch clinics list
    useEffect(() => {
        let isMounted = true

        const fetchClinics = async () => {
            try {
                setLoading(true)
                const data = await dashboardAPI.getGoogleCalendarClinics(1, clinicsPerPage)
                if (isMounted) {
                    const statsData = (data as any)?.stats

                    setClinics((data as any)?.clinics || [])
                    if (statsData) {
                        setStats({
                            total_clinics: statsData.total_clinics ?? 0,
                            total_calls: statsData.total_calls ?? 0,
                            total_scheduled: statsData.total_scheduled ?? 0,
                            total_cancelled: statsData.total_cancelled ?? 0,
                        })
                    }
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Failed to load clinics")
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        void fetchClinics()

        return () => {
            isMounted = false
        }
    }, [])

    // Fetch logs when a clinic is selected
    useEffect(() => {
        if (!selectedClinic) return
        let isMounted = true

        const fetchLogs = async () => {
            try {
                setLogsLoading(true)
                const data = await dashboardAPI.getGoogleCalendarLogs(
                    selectedClinic.phone_number,
                    1,
                    logsPerPage
                )
                if (isMounted) {
                    setLogs(data.logs || [])
                    const statsData = (data as any)?.stats
                    if (statsData) {
                        setLogsStats({
                            total: statsData.total ?? 0,
                            scheduled: statsData.scheduled ?? 0,
                            cancelled: statsData.cancelled ?? 0,
                            rescheduled: statsData.rescheduled ?? 0,
                            failure: statsData.failure ?? 0,
                            unknown: statsData.unknown ?? 0,
                        })
                    } else {
                        setLogsStats({})
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setLogs([])
                    setLogsStats({})
                    const message =
                        err instanceof Error
                            ? err.message
                            : typeof err === "string"
                                ? err
                                : "Failed to load logs"
                    console.error("Failed to load logs:", err)
                    setError(message)
                }
            } finally {
                if (isMounted) {
                    setLogsLoading(false)
                }
            }
        }

        void fetchLogs()

        return () => {
            isMounted = false
        }
    }, [selectedClinic])

    // Fetch transcript when a log is selected
    const handleViewTranscript = async (log: CallLog) => {
        if (!selectedClinic) return

        setSelectedLog(log)

        // If transcript is already included in the log payload, use it directly
        const inlineTranscript = (log as any)?.transcript as Array<{ role: string; message?: string; content?: string }> | undefined
        if (inlineTranscript && Array.isArray(inlineTranscript)) {
            setTranscript(
                inlineTranscript.map((t) => ({
                    role: t.role,
                    content: t.message ?? t.content ?? "",
                    timestamp: (t as any)?.timestamp,
                }))
            )
            return
        }

        // Fallback to API fetch when a call_id exists
        const callId = (log as any)?.call_id || log.call_id
        if (!callId) {
            setTranscript([])
            return
        }

        setTranscriptLoading(true)
        try {
            const data = await dashboardAPI.getGoogleCalendarTranscript(
                selectedClinic.phone_number,
                callId
            )
            setTranscript(data.transcript || [])
        } catch (err) {
            console.error("Failed to load transcript:", err)
            setTranscript([])
        } finally {
            setTranscriptLoading(false)
        }
    }

    const handleDownloadTranscript = () => {
        if (!selectedLog || !transcript.length) return

        const content = JSON.stringify(
            {
                call_id: selectedLog.call_id,
                phone_number: selectedClinic?.phone_number,
                transcript: transcript,
            },
            null,
            2
        )

        const blob = new Blob([content], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `transcript_${selectedLog.call_id}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Render transcript modal
    const renderTranscriptModal = () => {
        if (!selectedLog) return null

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-background rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold">Call Transcript</h3>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                onClick={handleDownloadTranscript}
                                disabled={transcriptLoading || transcript.length === 0}
                                className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2 p-2`}
                                title="Download Transcript"
                            >
                                <IconDownload className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2 p-2`}
                            >
                                <IconX className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        {transcriptLoading ? (
                            <div className="text-center text-muted-foreground py-8">
                                Loading transcript...
                            </div>
                        ) : transcript.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No transcript available for this call.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {transcript.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-lg ${msg.role === "user" || msg.role === "caller"
                                            ? "bg-muted/50 ml-8"
                                            : "bg-primary/10 mr-8"
                                            }`}
                                    >
                                        <div className="text-xs font-medium text-muted-foreground mb-1 uppercase">
                                            {msg.role}
                                        </div>
                                        <div className="text-sm">{msg.content}</div>
                                        {msg.timestamp && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {msg.timestamp}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Render logs view for selected clinic
    if (selectedClinic) {
        return (
            <div className="p-6 space-y-6">
                {renderTranscriptModal()}

                {/* Header with back button */}
                <div className="flex items-center gap-4">
                    <Button
                            type="button"
                            onClick={() => {
                            setSelectedClinic(null)
                            setLogs([])
                        }}
                        className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2 p-2`}
                    >
                        <IconChevronLeft className="size-5" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-semibold">
                            Call Logs: {selectedClinic.clinic_name || selectedClinic.phone_number}
                        </h2>
                        <p className="text-sm text-muted-foreground">{selectedClinic.phone_number}</p>
                    </div>
                </div>

                {/* Logs Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {[
                        { key: "total", title: "Total", value: logsStats.total ?? logs.length },
                        { key: "scheduled", title: "Scheduled", value: logsStats.scheduled ?? 0 },
                        { key: "rescheduled", title: "Rescheduled", value: logsStats.rescheduled ?? 0 },
                        { key: "cancelled", title: "Cancelled", value: logsStats.cancelled ?? 0 },
                        { key: "failure", title: "Failure", value: logsStats.failure ?? 0 },
                        { key: "unknown", title: "Unknown", value: logsStats.unknown ?? 0 },
                    ].map((card) => (
                        <div
                            key={card.key}
                            className="neumorphic-inset p-4 neumorphic-hover transition-all duration-200"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    {card.title}
                                </div>
                                <div className="text-2xl font-bold tabular-nums sm:text-3xl md:text-4xl">
                                    {card.value ?? 0}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logs Table */}
            <div className="neumorphic-inset rounded-2xl overflow-hidden">
                    {logsLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No call logs found for this clinic.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Timestamp
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Duration
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Details
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {logs.map((log, idx) => {
                                        const status = (log as any)?.status || log.status || "unknown"
                                        const timestamp = (log as any)?.timestamp || (log as any)?.call_time || "-"
                                        const duration = (log as any)?.duration || (log.duration ? `${log.duration}s` : "-")
                                        const details = (log as any)?.details || (log as any)?.call_id || log.call_id || "-"

                                        const badgeClasses =
                                            status === "scheduled"
                                                ? "bg-blue-100"
                                                : status === "cancelled"
                                                    ? "bg-orange-100"
                                                    : status === "failure" || status === "failed"
                                                        ? "bg-red-100"
                                                        : status === "rescheduled"
                                                            ? "bg-purple-100"
                                                            : "bg-green-100"

                                        return (
                                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${badgeClasses}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {timestamp}
                                                </td>
                                                <td className="px-4 py-3 text-sm">{duration}</td>
                                                <td className="px-4 py-3 text-sm">{details}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end">
                                                        <Button
                                                            type="button"
                                                            onClick={() => void handleViewTranscript(log)}
                                                            className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2 px-3 py-1.5`}
                                                            title="View Transcript"
                                                        >
                                                            <IconEye className="size-4" />
                                                            View Transcript
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Main clinics list view
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading call logs...</div>
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

    return (
        <div className="pt-6 space-y-6">
            {/* Summary Cards */}
            <div className="px-4 lg:px-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { key: "total_clinics", title: "Total Clinics", value: stats.total_clinics },
                        { key: "total_calls", title: "Total Calls", value: stats.total_calls },
                        { key: "total_scheduled", title: "Scheduled", value: stats.total_scheduled },
                        { key: "total_cancelled", title: "Cancelled", value: stats.total_cancelled },
                    ].map((card) => (
                        <div
                            key={card.key}
                            className="neumorphic-inset p-4 neumorphic-hover transition-all duration-200"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    {card.title}
                                </div>
                                <div className="text-2xl font-bold tabular-nums sm:text-3xl md:text-4xl lg:text-5xl">
                                    {card.value ?? 0}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Clinics Table */}
            <div className="-mt-2 px-4 lg:px-6">
                <div className="neumorphic-inset rounded-lg p-4 border-0">
                    <div className="overflow-x-auto max-h-[69vh] overflow-y-auto bg-card rounded-lg">
                        {clinics.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10 bg-card">
                                    <tr className="border-b-2 border-muted/90 bg-muted/10">
                                        <th className="text-left font-medium py-3 px-4 w-1/4">Clinic Name</th>
                                        <th className="text-left font-medium py-3 px-4 w-1/4">Phone</th>
                                        <th className="text-left font-medium py-3 px-4 w-1/4">Total Calls</th>
                                        <th className="text-right font-medium py-3 px-4 w-1/4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-muted/90">
                                    {clinics.map((clinic, idx) => (
                                        <tr
                                            key={clinic.phone_number || idx}
                                            className="hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <IconPhone className="size-4 text-muted-foreground" />
                                                    <span className="font-medium">{clinic.clinic_name || "-"}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm">{clinic.phone_number || "-"}</td>
                                            <td className="py-3 px-4">
                                                {/* <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"> */}
                                                    {clinic.total_calls || 0}
                                                {/* </span> */}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                            onClick={() => {
                                                            setSelectedClinic(clinic)
                                                        }}
                                                        className={`${baseButtonClass} w-auto inline-flex items-center justify-center gap-2 px-3 py-1.5`}
                                                    >
                                                        View Logs
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-sm text-muted-foreground">No clinics with call data found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}
