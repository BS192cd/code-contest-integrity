"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { ArrowLeft, Trophy, Code, Clock, CheckCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function StudentDetailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [student, setStudent] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  useEffect(() => {
    fetchStudentData()
  }, [studentId])

  const fetchStudentData = async () => {
    try {
      setIsLoading(true)
      // Fetch student profile using correct endpoint
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      const userData = await userResponse.json()
      
      if (userData.success) {
        setStudent(userData.data)
      }

      // Fetch student submissions
      const submissionsResponse = await apiClient.getSubmissions({ userId: studentId, limit: 10 })
      if (submissionsResponse.success) {
        setSubmissions(submissionsResponse.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch student data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-background">
          <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex">
            <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-6 md:ml-0">
              <div className="max-w-7xl mx-auto">
                <p className="text-center py-12">Loading student data...</p>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!student) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-background">
          <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex">
            <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-6 md:ml-0">
              <div className="max-w-7xl mx-auto text-center py-12">
                <p className="mb-4">Student not found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const stats = student.statistics || {}
  const acceptanceRate = stats.totalSubmissions > 0 
    ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100) 
    : 0

  // Create safe performance data with defaults
  const performanceByDifficulty = student.performanceByDifficulty || {
    easy: { solved: 0, total: 0, percentage: 0 },
    medium: { solved: 0, total: 0, percentage: 0 },
    hard: { solved: 0, total: 0, percentage: 0 }
  }

  // Create safe recent submissions with defaults
  const recentSubmissions = student.recentSubmissions || []

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-6 md:ml-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold">{student.fullName || student.name || "Student"}</h1>
                  <Badge variant="outline" className="text-lg">
                    Rank #{student.rank || "N/A"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {student.email} • @{student.username} • Last active {student.lastActive || new Date(student.updatedAt || student.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    ID: {studentId}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(studentId)
                      alert("Student ID copied to clipboard!")
                    }}
                  >
                    Copy ID
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageScore || student.score || 0}%</div>
                    <p className="text-xs text-muted-foreground">Across all contests</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                    <Code className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSubmissions || student.totalSubmissions || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.acceptedSubmissions || student.acceptedSubmissions || 0} accepted
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contests</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.contestsParticipated || student.contestsParticipated || 0}</div>
                    <p className="text-xs text-muted-foreground">Participated</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {acceptanceRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">Acceptance rate</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance by Difficulty</CardTitle>
                    <CardDescription>Problems solved by difficulty level</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Easy</span>
                        <span>{performanceByDifficulty.easy.solved}/{performanceByDifficulty.easy.total}</span>
                      </div>
                      <Progress value={performanceByDifficulty.easy.percentage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Medium</span>
                        <span>{performanceByDifficulty.medium.solved}/{performanceByDifficulty.medium.total}</span>
                      </div>
                      <Progress value={performanceByDifficulty.medium.percentage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Hard</span>
                        <span>{performanceByDifficulty.hard.solved}/{performanceByDifficulty.hard.total}</span>
                      </div>
                      <Progress value={performanceByDifficulty.hard.percentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest submissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentSubmissions.length > 0 ? (
                        recentSubmissions.map((submission: any) => (
                          <div key={submission.id || submission._id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{submission.problem || submission.problemId?.title || "Unknown Problem"}</p>
                              <p className="text-sm text-muted-foreground">
                                {submission.time || new Date(submission.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={submission.status === "Accepted" ? "default" : "destructive"}>
                                {submission.status || "Pending"}
                              </Badge>
                              <span className="text-sm font-medium">{submission.score || 0}%</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          No recent submissions
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
