"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Appointment } from "@/lib/mock-data"

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  user: string
  timestamp: string
  details: string
}

export default function AuditLogsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const appointmentsStored = localStorage.getItem("appointments")
    const treatmentsStored = localStorage.getItem("treatments")

    const auditLogs: AuditLog[] = []

    if (appointmentsStored) {
      const appointments: Appointment[] = JSON.parse(appointmentsStored)
      appointments.forEach((apt) => {
        auditLogs.push({
          id: `log-apt-${apt.id}`,
          action: "CREATE",
          entity: "Appointment",
          entityId: apt.id,
          user: apt.patientName,
          timestamp: apt.createdAt,
          details: `Appointment booked for ${apt.service} at ${apt.branchName}`,
        })

        if (apt.status === "completed") {
          auditLogs.push({
            id: `log-complete-${apt.id}`,
            action: "UPDATE",
            entity: "Appointment",
            entityId: apt.id,
            user: apt.doctorName,
            timestamp: new Date().toISOString(),
            details: `Appointment marked as completed`,
          })
        }
      })
    }

    if (treatmentsStored) {
      const treatments = JSON.parse(treatmentsStored)
      treatments.forEach((treatment: any) => {
        auditLogs.push({
          id: `log-treat-${treatment.id}`,
          action: "CREATE",
          entity: "Treatment",
          entityId: treatment.id,
          user: treatment.doctorName,
          timestamp: new Date().toISOString(),
          details: `Treatment record created - ${treatment.diagnosis}`,
        })
      })
    }

    setLogs(auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
  }, [])

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  const actionColors = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
            <p className="text-muted-foreground">System activity and change history</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>All system actions and modifications</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-muted-foreground">No audit logs available</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge className={actionColors[log.action as keyof typeof actionColors]}>{log.action}</Badge>
                          <span className="font-semibold">{log.entity}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{log.details}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">User:</span> {log.user} • <span className="font-medium">ID:</span>{" "}
                        {log.entityId}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
