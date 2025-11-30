"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { ArrowLeft, Edit, Users, Clock, Trophy } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function ViewContestPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [contest, setContest] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const contestId = params.id as string

  useEffect(() => {
    fetchContest()
  }, [contestId])

  const fetchContest = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getContest(contestId)
      if (response.success && response.data) {
        setContest(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch contest:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getContestStatus = () => {
    if (!contest) return "upcoming"
    const now = new Date()
    const start = new Date(contest.startTime)
    const end = new Date(contest.endTime)
    
    if (now < start) return "upcoming"
    if (now > end) return "ended"
    return "active"
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
                <p className="text-center py-12">Loading contest...</p>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!contest) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-background">
          <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex">
            <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-6 md:ml-0">
              <div className="max-w-7xl mx-auto">
                <p className="text-center py-12">Contest not found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const status = getContestStatus()
  const participants = contest.participants?.length || 0
  const maxParticipants = contest.maxParticipants || 100

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

              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{contest.title}</h1>
                    <Badge variant={status === "active" ? "default" : status === "upcoming" ? "secondary" : "outline"}>
                      {status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{contest.description || "No description"}</p>
                </div>
                <Button onClick={() => router.push(`/teacher/contests/${contestId}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Contest
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Participants</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{participants}/{maxParticipants}</div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((participants / maxParticipants) * 100)}% participation
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Duration</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime()) / (1000 * 60 * 60))} hours
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contest.startTime).toLocaleString()} - {new Date(contest.endTime).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Problems</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contest.problems?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Total problems</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Contest Problems</CardTitle>
                  <CardDescription>Problems included in this contest</CardDescription>
                </CardHeader>
                <CardContent>
                  {!contest.problems || contest.problems.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No problems added yet</p>
                  ) : (
                    <div className="space-y-4">
                      {contest.problems.map((problem: any, index: number) => (
                        <div
                          key={problem.problemId || problem._id || index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium">{problem.title || "Problem " + (index + 1)}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">
                                  {problem.points || 100} points
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Problem
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
