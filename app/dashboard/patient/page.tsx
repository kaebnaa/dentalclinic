"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Appointment } from "@/lib/mock-data"

export default function PatientDashboardPage() {
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
      setAppointments(userAppointments)
    }
  }, [user])

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  const upcomingAppointments = appointments.filter((apt) => apt.status === "scheduled")
  const pastAppointments = appointments.filter((apt) => apt.status === "completed")

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">Manage your appointments and dental records</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Upcoming</CardTitle>
                <CardDescription className="text-blue-100">Scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{upcomingAppointments.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Completed</CardTitle>
                <CardDescription className="text-green-100">Past visits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{pastAppointments.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Records</CardTitle>
                <CardDescription className="text-purple-100">Treatment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{pastAppointments.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push("/dashboard/patient/book")}
                  className="w-full justify-start"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Book New Appointment
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/patient/history")}
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  View Treatment History
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/patient/records")}
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Medical Records
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/patient/appointments")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400 mb-2"
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
                    <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                    <Button onClick={() => router.push("/dashboard/patient/book")} size="sm">
                      Book Your First Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 3).map((apt) => (
                      <div key={apt.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{apt.service}</p>
                            <p className="text-sm text-muted-foreground">{apt.doctorName}</p>
                          </div>
                          <Badge variant="secondary">{apt.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {apt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {apt.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
