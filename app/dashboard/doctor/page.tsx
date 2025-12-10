"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Appointment } from "@/lib/mock-data"

export default function DoctorDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "doctor")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const stored = localStorage.getItem("appointments")
    if (stored) {
      const allAppointments: Appointment[] = JSON.parse(stored)
      const todayAppointments = allAppointments.filter((apt) => {
        const aptDate = new Date(apt.date)
        const today = new Date()
        return (
          aptDate.toDateString() === today.toDateString() &&
          apt.status === "scheduled" &&
          apt.branchId === user?.branchId
        )
      })
      setAppointments(todayAppointments.sort((a, b) => a.time.localeCompare(b.time)))
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

  const completedToday = appointments.filter((apt) => apt.status === "completed").length
  const upcomingToday = appointments.filter((apt) => apt.status === "scheduled").length

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
            <p className="text-muted-foreground">
              {user.specialization} • License: {user.licenseNumber}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Today's Appointments</CardTitle>
                <CardDescription className="text-green-100">Scheduled for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{upcomingToday}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Completed</CardTitle>
                <CardDescription className="text-blue-100">Finished today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{completedToday}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Pending</CardTitle>
                <CardDescription className="text-purple-100">Awaiting treatment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{upcomingToday - completedToday}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Patients</CardTitle>
                <CardDescription className="text-orange-100">Total today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{appointments.length}</div>
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
                  onClick={() => router.push("/dashboard/doctor/appointments")}
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
                  View All Appointments
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/doctor/patients")}
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Patient Records
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/doctor/schedule")}
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
                  My Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Schedule</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/doctor/appointments")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
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
                    <p className="text-muted-foreground">No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{apt.patientName}</p>
                            <p className="text-sm text-muted-foreground">{apt.service}</p>
                          </div>
                          <Badge variant="secondary">{apt.time}</Badge>
                        </div>
                        {apt.notes && <p className="text-sm text-muted-foreground mt-2">Note: {apt.notes}</p>}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3 bg-transparent"
                          onClick={() => router.push(`/dashboard/doctor/appointments/${apt.id}`)}
                        >
                          View Details
                        </Button>
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
