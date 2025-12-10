"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && isMounted) {
      if (!user) {
        router.push("/login")
      } else if (user.role === "patient") {
        router.push("/dashboard/patient")
      } else if (user.role === "doctor") {
        router.push("/dashboard/doctor")
      } else if (user.role === "admin") {
        router.push("/dashboard/admin")
      }
    }
  }, [user, isLoading, router, isMounted])

  if (isLoading || !isMounted) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return <DashboardLayout>{/* Redirecting... */}</DashboardLayout>
}
