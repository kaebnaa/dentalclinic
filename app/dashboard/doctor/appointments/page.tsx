"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { Appointment } from "@/lib/mock-data"

export default function DoctorAppointmentsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<"all" | "scheduled" | "completed">("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "doctor")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const stored = localStorage.getItem("appointments")
    if (stored) {
      const allAppointments: Appointment[] = JSON.parse(stored)
      const doctorAppointments = allAppointments.filter((apt) => apt.branchId === user?.branchId)
      setAppointments(
        doctorAppointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      )
    }
  }, [user])

  const handleMarkCompleted = (id: string) => {
    const stored = localStorage.getItem("appointments")
    if (stored) {
      const allAppointments: Appointment[] = JSON.parse(stored)
      const updated = allAppointments.map((apt) => (apt.id === id ? { ...apt, status: "completed" as const } : apt))
      localStorage.setItem("appointments", JSON.stringify(updated))
      setAppointments(updated.filter((apt) => apt.branchId === user?.branchId))
    }
  }

  const handleMarkNoShow = (id: string) => {
    const stored = localStorage.getItem("appointments")
    if (stored) {
      const allAppointments: Appointment[] = JSON.parse(stored)
      const updated = allAppointments.map((apt) => (apt.id === id ? { ...apt, status: "no-show" as const } : apt))
      localStorage.setItem("appointments", JSON.stringify(updated))
      setAppointments(updated.filter((apt) => apt.branchId === user?.branchId))
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

  const filteredAppointments = appointments.filter((apt) => {
    const matchesFilter = filter === "all" || apt.status === filter
    const matchesSearch =
      searchTerm === "" ||
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    "no-show": "bg-gray-100 text-gray-700",
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Appointments</h1>
            <p className="text-muted-foreground">Manage your patient appointments</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by patient name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
                All
              </Button>
              <Button variant={filter === "scheduled" ? "default" : "outline"} onClick={() => setFilter("scheduled")}>
                Scheduled
              </Button>
              <Button variant={filter === "completed" ? "default" : "outline"} onClick={() => setFilter("completed")}>
                Completed
              </Button>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
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
                <p className="text-muted-foreground">No appointments found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <Card key={apt.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{apt.patientName}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {apt.service} • {apt.branchName}
                        </p>
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
                          <span className="font-medium text-foreground">Patient Notes:</span> {apt.notes}
                        </p>
                      </div>
                    )}

                    {apt.status === "scheduled" && (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => router.push(`/dashboard/doctor/treatment/${apt.id}`)}
                        >
                          Start Treatment
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleMarkCompleted(apt.id)}>
                          Mark Completed
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleMarkNoShow(apt.id)}>
                          No Show
                        </Button>
                      </div>
                    )}

                    {apt.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/doctor/treatment/${apt.id}`)}
                      >
                        View Treatment Details
                      </Button>
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
