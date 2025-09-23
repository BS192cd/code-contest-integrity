"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play } from "lucide-react"
import { SubmissionsList } from "@/components/submission-review"

export default function ProblemSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleBack = () => {
    router.back()
  }

  const handleSolve = () => {
    if (params?.problemId) {
      router.push(`/problems/${params.problemId}/solve`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">My Submissions</h1>
                  <p className="text-sm text-muted-foreground">Problem #{String(params?.problemId)}</p>
                </div>
              </div>
              <Button onClick={handleSolve}>
                <Play className="h-4 w-4 mr-2" />
                Solve Problem
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Submission History</CardTitle>
                <CardDescription>Latest submissions shown first</CardDescription>
              </CardHeader>
              <CardContent>
                <SubmissionsList problemId={String(params?.problemId)} onSolveClick={handleSolve} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}


