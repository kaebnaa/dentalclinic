"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BRANCHES } from "@/lib/mock-data"

export default function BranchManagementPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

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
            <h1 className="text-3xl font-bold mb-2">Branch Management</h1>
            <p className="text-muted-foreground">Manage all clinic locations</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {BRANCHES.map((branch) => (
              <Card key={branch.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{branch.name}</CardTitle>
                      <CardDescription className="mt-1">{branch.address}</CardDescription>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Contact</p>
                    <p className="text-sm font-medium">{branch.phone}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Working Hours</p>
                    <p className="text-sm font-medium">{branch.workingHours}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Services Offered</p>
                    <div className="flex flex-wrap gap-1">
                      {branch.services.map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Coordinates</p>
                    <p className="text-xs font-mono">
                      {branch.coordinates.lat}, {branch.coordinates.lng}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
