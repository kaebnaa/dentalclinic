"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Appointment } from "@/lib/mock-data"
import { BRANCHES } from "@/lib/mock-data"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [stats, setStats] = useState({
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    todayAppointments: 0,
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const appointmentsStored = localStorage.getItem("appointments")
    const treatmentsStored = localStorage.getItem("treatments")

    if (appointmentsStored) {
      const appointments: Appointment[] = JSON.parse(appointmentsStored)
      const today = new Date().toISOString().split("T")[0]

      setStats({
        totalAppointments: appointments.length,
        scheduledAppointments: appointments.filter((apt) => apt.status === "scheduled").length,
        completedAppointments: appointments.filter((apt) => apt.status === "completed").length,
        cancelledAppointments: appointments.filter((apt) => apt.status === "cancelled").length,
        todayAppointments: appointments.filter((apt) => apt.date === today).length,
        totalRevenue: treatmentsStored
          ? JSON.parse(treatmentsStored).reduce((sum: number, t: any) => sum + t.cost, 0)
          : 0,
      })
    }
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

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of all clinic operations</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Total Appointments</CardTitle>
                <CardDescription className="text-blue-100">All time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.totalAppointments}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Scheduled</CardTitle>
                <CardDescription className="text-green-100">Upcoming appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.scheduledAppointments}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Completed</CardTitle>
                <CardDescription className="text-purple-100">Finished treatments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.completedAppointments}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Today</CardTitle>
                <CardDescription className="text-orange-100">Today's appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.todayAppointments}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Total Revenue</CardTitle>
                <CardDescription className="text-cyan-100">From treatments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Cancelled</CardTitle>
                <CardDescription className="text-red-100">Cancelled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats.cancelledAppointments}</div>
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
                  onClick={() => router.push("/dashboard/admin/appointments")}
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
                  Manage Appointments
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/admin/branches")}
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Branch Management
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/admin/analytics")}
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  View Analytics
                </Button>
                <Button
                  onClick={() => router.push("/dashboard/admin/audit")}
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
                  Audit Logs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Branch Locations</CardTitle>
                <CardDescription>All clinic branches</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {BRANCHES.map((branch) => (
                  <div key={branch.id} className="p-3 border rounded-lg">
                    <p className="font-semibold">{branch.name}</p>
                    <p className="text-sm text-muted-foreground">{branch.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">{branch.phone}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
