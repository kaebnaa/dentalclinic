"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Appointment } from "@/lib/mock-data"

export default function TreatmentPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading } = useAuth()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [treatmentData, setTreatmentData] = useState({
    diagnosis: "",
    treatment: "",
    prescription: "",
    cost: "",
    notes: "",
  })
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "doctor")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const stored = localStorage.getItem("appointments")
    if (stored) {
      const allAppointments: Appointment[] = JSON.parse(stored)
      const apt = allAppointments.find((a) => a.id === params.id)
      if (apt) {
        setAppointment(apt)
      }
    }
  }, [params.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const treatments = JSON.parse(localStorage.getItem("treatments") || "[]")
    treatments.push({
      id: `treatment-${Date.now()}`,
      patientId: appointment?.patientId,
      doctorId: user?.id,
      doctorName: user?.name,
      date: new Date().toISOString().split("T")[0],
      ...treatmentData,
      cost: Number(treatmentData.cost),
    })
    localStorage.setItem("treatments", JSON.stringify(treatments))

    const stored = localStorage.getItem("appointments")
    if (stored) {
      const allAppointments: Appointment[] = JSON.parse(stored)
      const updated = allAppointments.map((apt) =>
        apt.id === params.id ? { ...apt, status: "completed" as const } : apt,
      )
      localStorage.setItem("appointments", JSON.stringify(updated))
    }

    setSuccess(true)
    setTimeout(() => {
      router.push("/dashboard/doctor/appointments")
    }, 2000)
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

  if (!appointment) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground">Appointment not found</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Treatment Record</h1>
            <p className="text-muted-foreground">Document treatment details for {appointment.patientName}</p>
          </div>

          {success && (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <AlertDescription className="text-green-900">
                Treatment record saved successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{appointment.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium">{appointment.service}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{appointment.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{appointment.time}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treatment Information</CardTitle>
              <CardDescription>Complete the treatment details below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis..."
                    value={treatmentData.diagnosis}
                    onChange={(e) => setTreatmentData((prev) => ({ ...prev, diagnosis: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment Performed *</Label>
                  <Textarea
                    id="treatment"
                    placeholder="Describe the treatment..."
                    value={treatmentData.treatment}
                    onChange={(e) => setTreatmentData((prev) => ({ ...prev, treatment: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prescription">Prescription</Label>
                  <Textarea
                    id="prescription"
                    placeholder="Medications prescribed (if any)..."
                    value={treatmentData.prescription}
                    onChange={(e) => setTreatmentData((prev) => ({ ...prev, prescription: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Treatment Cost ($) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={treatmentData.cost}
                    onChange={(e) => setTreatmentData((prev) => ({ ...prev, cost: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional observations or follow-up instructions..."
                    value={treatmentData.notes}
                    onChange={(e) => setTreatmentData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    Save Treatment Record
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard/doctor/appointments")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
