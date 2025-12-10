"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

const COUNTRIES = [
  "United States", "Canada", "Mexico", "United Kingdom", "Australia",
  "Germany", "France", "Italy", "Spain", "Other"
]

export default function RegisterDetailsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    // Address fields (no zip code)
    streetAddress: "",
    apartmentUnit: "",
    city: "",
    state: "",
    country: "United States",
    // Emergency contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Redirect to first step if not logged in
    if (!user) {
      router.push("/register")
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      setError("Please complete step 1 first")
      router.push("/register")
      return
    }

    setIsLoading(true)

    try {
      // Combine address fields into a single address string (no zip code)
      const addressParts = [
        formData.streetAddress,
        formData.apartmentUnit && `Apt ${formData.apartmentUnit}`,
        formData.city,
        formData.state,
        formData.country
      ].filter(Boolean)
      
      const fullAddress = addressParts.join(", ")

      // Update user profile via API
      const response = await api.updateProfile({
        dateOfBirth: formData.dateOfBirth || undefined,
        address: fullAddress || undefined,
        gender: formData.gender || undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        emergencyContactRelation: formData.emergencyContactRelation || undefined,
      })

      if (response.message) {
        // Success - redirect to dashboard
        router.push("/dashboard")
      } else {
        setError(response.error || "Failed to update profile")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    }

    setIsLoading(false)
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4 py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">Step 2 of 2: Additional Information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={isLoading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input
                    id="streetAddress"
                    name="streetAddress"
                    placeholder="123 Main Street"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apartmentUnit">Apartment / Unit / Suite</Label>
                  <Input
                    id="apartmentUnit"
                    name="apartmentUnit"
                    placeholder="Apt 4B"
                    value={formData.apartmentUnit}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => handleSelectChange("state", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="state" className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleSelectChange("country", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="country" className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    placeholder="Jane Doe"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emergencyContactRelation">Relationship</Label>
                  <Select
                    value={formData.emergencyContactRelation}
                    onValueChange={(value) => handleSelectChange("emergencyContactRelation", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="emergencyContactRelation" className="w-full">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/dashboard")}
                disabled={isLoading}
              >
                Skip for Now
              </Button>
              <Button type="submit" className="flex-1" size="lg" disabled={isLoading}>
                {isLoading ? "Saving..." : "Complete Registration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

