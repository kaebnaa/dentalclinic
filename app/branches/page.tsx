"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BranchMap } from "@/components/branch-map"
import { Button } from "@/components/ui/button"
import type { Branch } from "@/lib/mock-data"

export default function BranchesPage() {
  const router = useRouter()
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch)
  }

  const handleContinue = () => {
    if (selectedBranch) {
      localStorage.setItem("selected_branch", JSON.stringify(selectedBranch))
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">DentalCare+</span>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Choose Your Preferred Location</h1>
            <p className="text-lg text-muted-foreground">
              Select the branch closest to you for easier appointment scheduling
            </p>
          </div>

          <BranchMap onSelectBranch={handleSelectBranch} selectedBranchId={selectedBranch?.id} />

          {selectedBranch && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleContinue} size="lg">
                Continue with {selectedBranch.name}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
