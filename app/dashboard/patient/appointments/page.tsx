"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Appointment } from "@/lib/mock-data"

export default function AppointmentsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "patient")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const stored = localStorage.getItem("appointments")
    if (stored) {
      const allAppointments: Appointment[] = JSON.parse(stored)
      const userAppointments = allAppointments.filter((apt) => apt.patientId === user?.id)
      setAppointments(
        userAppointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      )
    }
  }, [user])

  const handleCancel = (id: string) => {
    const stored = localStorage.getItem("appointments")
    if (stored) {
      const allAppointments: Appointment[] = JSON.parse(stored)
      const updated = allAppointments.map((apt) => (apt.id === id ? { ...apt, status: "cancelled" as const } : apt))
      localStorage.setItem("appointments", JSON.stringify(updated))
      setAppointments(updated.filter((apt) => apt.patientId === user?.id))
    }
  }

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    "no-show": "bg-gray-100 text-gray-700",
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
              <p className="text-muted-foreground">View and manage your scheduled appointments</p>
            </div>
            <Button onClick={() => router.push("/dashboard/patient/book")}>Book New Appointment</Button>
          </div>

          {appointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
                <p className="text-muted-foreground mb-4">Book your first appointment to get started</p>
                <Button onClick={() => router.push("/dashboard/patient/book")}>Book Appointment</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <Card key={apt.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{apt.service}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{apt.branchName}</p>
                      </div>
                      <Badge className={statusColors[apt.status]}>{apt.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>
                          <span className="font-medium">Doctor:</span> {apt.doctorName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          <span className="font-medium">Date:</span> {apt.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="w-4 h-4 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          <span className="font-medium">Time:</span> {apt.time}
                        </span>
                      </div>
                    </div>

                    {apt.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg mb-4">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Notes:</span> {apt.notes}
                        </p>
                      </div>
                    )}

                    {apt.status === "scheduled" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCancel(apt.id)}>
                          Cancel Appointment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
