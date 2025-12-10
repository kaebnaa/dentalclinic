"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Appointment } from "@/lib/mock-data"

export default function DoctorSchedulePage() {
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
      const doctorAppointments = allAppointments.filter(
        (apt) => apt.branchId === user?.branchId && apt.status === "scheduled",
      )
      setAppointments(doctorAppointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
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

  const groupedByDate = appointments.reduce(
    (acc, apt) => {
      if (!acc[apt.date]) {
        acc[apt.date] = []
      }
      acc[apt.date].push(apt)
      return acc
    },
    {} as Record<string, Appointment[]>,
  )

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">My Schedule</h1>
            <p className="text-muted-foreground">View your upcoming appointments by date</p>
          </div>

          {Object.keys(groupedByDate).length === 0 ? (
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
                <p className="text-muted-foreground">No upcoming appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByDate).map(([date, apts]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle>
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                    <CardDescription>{apts.length} appointments scheduled</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {apts
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((apt) => (
                          <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="text-base font-semibold">
                                {apt.time}
                              </Badge>
                              <div>
                                <p className="font-semibold">{apt.patientName}</p>
                                <p className="text-sm text-muted-foreground">{apt.service}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">{apt.status}</Badge>
                          </div>
                        ))}
                    </div>
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
