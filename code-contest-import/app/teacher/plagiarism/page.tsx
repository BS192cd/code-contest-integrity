"use client"

import { Suspense } from "react"
import { TeacherPlagiarismDashboard } from "@/components/teacher-plagiarism-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

function PlagiarismDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TeacherPlagiarismPage() {
  // In a real app, this would come from route params or context
  const contestId = "123"

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Plagiarism Detection</h1>
        <p className="text-muted-foreground">Monitor and analyze code submissions for potential plagiarism</p>
      </div>

      <Suspense fallback={<PlagiarismDashboardSkeleton />}>
        <TeacherPlagiarismDashboard contestId={contestId} />
      </Suspense>
    </div>
  )
}
