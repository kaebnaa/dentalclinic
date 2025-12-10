"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Appointment } from "@/lib/mock-data"
import { BRANCHES } from "@/lib/mock-data"

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [analytics, setAnalytics] = useState({
    appointmentsByBranch: {} as Record<string, number>,
    appointmentsByStatus: {} as Record<string, number>,
    revenueByMonth: 0,
    averageAppointmentValue: 0,
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

      const byBranch = appointments.reduce(
        (acc, apt) => {
          acc[apt.branchName] = (acc[apt.branchName] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const byStatus = appointments.reduce(
        (acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      let totalRevenue = 0
      if (treatmentsStored) {
        const treatments = JSON.parse(treatmentsStored)
        totalRevenue = treatments.reduce((sum: number, t: any) => sum + t.cost, 0)
      }

      setAnalytics({
        appointmentsByBranch: byBranch,
        appointmentsByStatus: byStatus,
        revenueByMonth: totalRevenue,
        averageAppointmentValue: appointments.length > 0 ? totalRevenue / appointments.length : 0,
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
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Performance insights and statistics</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Revenue and value metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-900">${analytics.revenueByMonth.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">Average Appointment Value</p>
                  <p className="text-3xl font-bold text-blue-900">${analytics.averageAppointmentValue.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointments by Status</CardTitle>
                <CardDescription>Distribution of appointment statuses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics.appointmentsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium capitalize">{status}</span>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Appointments by Branch</CardTitle>
                <CardDescription>Distribution across all clinic locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {BRANCHES.map((branch) => (
                    <div key={branch.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{branch.name}</p>
                        <span className="text-2xl font-bold text-blue-600">
                          {analytics.appointmentsByBranch[branch.name] || 0}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{branch.address}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
