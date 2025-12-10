"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Appointment } from "@/lib/mock-data"

export default function DoctorPatientsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<{ name: string; id: string; appointmentCount: number }[]>([])

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

      const patientMap = new Map<string, { name: string; id: string; appointmentCount: number }>()

      doctorAppointments.forEach((apt) => {
        if (patientMap.has(apt.patientId)) {
          const patient = patientMap.get(apt.patientId)!
          patient.appointmentCount++
        } else {
          patientMap.set(apt.patientId, {
            name: apt.patientName,
            id: apt.patientId,
            appointmentCount: 1,
          })
        }
      })

      setPatients(Array.from(patientMap.values()).sort((a, b) => a.name.localeCompare(b.name)))
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

  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Patient Records</h1>
            <p className="text-muted-foreground">View and manage patient information</p>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredPatients.length === 0 ? (
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p className="text-muted-foreground">No patient records found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/doctor/patients`)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Total Appointments:</span> {patient.appointmentCount}
                    </p>
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
