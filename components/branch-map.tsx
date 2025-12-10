"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BRANCHES, type Branch } from "@/lib/mock-data"

interface BranchMapProps {
  onSelectBranch?: (branch: Branch) => void
  selectedBranchId?: string
}

export function BranchMap({ onSelectBranch, selectedBranchId }: BranchMapProps) {
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 border">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">Find Your Nearest Clinic</h3>
              <p className="text-muted-foreground">We have 4 convenient locations to serve you better</p>
            </div>

            <div className="space-y-3">
              {BRANCHES.map((branch) => (
                <Card
                  key={branch.id}
                  className={`cursor-pointer transition-all ${
                    hoveredBranch === branch.id || selectedBranchId === branch.id
                      ? "border-blue-500 shadow-md"
                      : "hover:border-blue-300"
                  }`}
                  onMouseEnter={() => setHoveredBranch(branch.id)}
                  onMouseLeave={() => setHoveredBranch(null)}
                  onClick={() => onSelectBranch?.(branch)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{branch.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">{branch.address}</CardDescription>
                      </div>
                      {selectedBranchId === branch.id && <Badge variant="default">Selected</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {branch.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {branch.workingHours}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {branch.services.slice(0, 3).map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {branch.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{branch.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative bg-white rounded-lg border overflow-hidden h-[600px]">
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-4">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <div>
                  <p className="text-lg font-semibold text-gray-700">Interactive Map</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {hoveredBranch
                      ? BRANCHES.find((b) => b.id === hoveredBranch)?.name
                      : "Hover over a branch to see location"}
                  </p>
                </div>
                {(hoveredBranch || selectedBranchId) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-xs mx-auto">
                    <p className="text-sm font-medium text-blue-900">
                      {BRANCHES.find((b) => b.id === (hoveredBranch || selectedBranchId))?.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
