"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BranchMap } from "@/components/branch-map"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SERVICES, TIME_SLOTS, type Branch, type Appointment } from "@/lib/mock-data"

export default function BookAppointmentPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState({
    service: "",
    date: "",
    time: "",
    notes: "",
  })
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "patient")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleSubmit = () => {
    if (!selectedBranch || !formData.service || !formData.date || !formData.time) {
      return
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: user!.id,
      patientName: user!.name,
      doctorId: "doc-1",
      doctorName: "Dr. Sarah Smith",
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      date: formData.date,
      time: formData.time,
      service: formData.service,
      status: "scheduled",
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    }

    const stored = localStorage.getItem("appointments")
    const appointments = stored ? JSON.parse(stored) : []
    appointments.push(newAppointment)
    localStorage.setItem("appointments", JSON.stringify(appointments))

    setSuccess(true)
    setTimeout(() => {
      router.push("/dashboard/patient/appointments")
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

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
            <p className="text-muted-foreground">Choose your preferred location and schedule your visit</p>
          </div>

          {success && (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <AlertDescription className="text-green-900">
                Appointment booked successfully! Redirecting to your appointments...
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1">
                  <div className={`h-2 rounded-full ${step >= s ? "bg-blue-600" : "bg-gray-200"}`} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={step >= 1 ? "text-blue-600 font-medium" : "text-muted-foreground"}>Select Branch</span>
              <span className={step >= 2 ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                Choose Service & Date
              </span>
              <span className={step >= 3 ? "text-blue-600 font-medium" : "text-muted-foreground"}>Confirm</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <BranchMap onSelectBranch={setSelectedBranch} selectedBranchId={selectedBranch?.id} />
              {selectedBranch && (
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} size="lg">
                    Continue
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>Select service, date, and time for your appointment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <select
                    id="service"
                    className="w-full p-2 border rounded-md"
                    value={formData.service}
                    onChange={(e) => setFormData((prev) => ({ ...prev, service: e.target.value }))}
                  >
                    <option value="">Select a service</option>
                    {SERVICES.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <select
                      id="time"
                      className="w-full p-2 border rounded-md"
                      value={formData.time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                    >
                      <option value="">Select a time</option>
                      {TIME_SLOTS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific concerns or requirements..."
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!formData.service || !formData.date || !formData.time}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && selectedBranch && (
            <Card>
              <CardHeader>
                <CardTitle>Confirm Your Appointment</CardTitle>
                <CardDescription>Please review your booking details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Branch</h3>
                    <p>{selectedBranch.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedBranch.address}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Service</h3>
                      <p>{formData.service}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Date & Time</h3>
                      <p>
                        {formData.date} at {formData.time}
                      </p>
                    </div>
                  </div>

                  {formData.notes && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <p className="text-sm">{formData.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit}>Confirm Booking</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
