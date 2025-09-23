"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Users, Trophy, Plus, Eye, Edit, BarChart3, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

const mockContests = [
  {
    id: 1,
    title: "Data Structures Quiz",
    status: "active",
    participants: 45,
    totalStudents: 60,
    endTime: "2h 15m",
    submissions: 38,
    avgScore: 78,
  },
  {
    id: 2,
    title: "Algorithm Challenge",
    status: "upcoming",
    participants: 0,
    totalStudents: 60,
    startTime: "Tomorrow 2:00 PM",
    submissions: 0,
    avgScore: 0,
  },
  {
    id: 3,
    title: "Final Exam Practice",
    status: "ended",
    participants: 58,
    totalStudents: 60,
    submissions: 58,
    avgScore: 85,
  },
]

const mockStudents = [
  { id: 1, name: "Alice Johnson", score: 95, rank: 1, submissions: 12, lastActive: "2 hours ago" },
  { id: 2, name: "Bob Smith", score: 87, rank: 2, submissions: 10, lastActive: "1 day ago" },
  { id: 3, name: "Carol Davis", score: 82, rank: 3, submissions: 8, lastActive: "3 hours ago" },
  { id: 4, name: "David Wilson", score: 76, rank: 4, submissions: 6, lastActive: "5 hours ago" },
  { id: 5, name: "Eva Brown", score: 71, rank: 5, submissions: 9, lastActive: "1 hour ago" },
]

const plagiarismAlerts = [
  { id: 1, student1: "John Doe", student2: "Jane Smith", similarity: 89, contest: "Weekly Challenge #42" },
  { id: 2, student1: "Mike Johnson", student2: "Sarah Wilson", similarity: 76, contest: "Algorithm Sprint" },
]

export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleCreateContest = () => {
    router.push("/teacher/contests/create")
  }

  const handleViewContest = (contestId: number) => {
    router.push(`/teacher/contests/${contestId}`)
  }

  const handleViewStudent = (studentId: number) => {
    router.push(`/teacher/students/${studentId}`)
  }

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-6 md:ml-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-balance">Teacher Dashboard</h1>
                  <p className="text-muted-foreground mt-2 text-pretty">
                    Manage contests, monitor student progress, and analyze performance.
                  </p>
                </div>
                <Button onClick={handleCreateContest}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Contest
                </Button>
              </div>

              {/* Overview Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">127</div>
                    <p className="text-xs text-muted-foreground">+5 new this month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Contests</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">2 ending today</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">82%</div>
                    <p className="text-xs text-muted-foreground">+3% from last week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Plagiarism Alerts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">2</div>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="contests" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="contests">Contests</TabsTrigger>
                  <TabsTrigger value="students">Students</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="plagiarism">Plagiarism</TabsTrigger>
                </TabsList>

                <TabsContent value="contests" className="space-y-6">
                  <div className="grid gap-6">
                    {mockContests.map((contest) => (
                      <Card key={contest.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {contest.title}
                                <Badge
                                  variant={
                                    contest.status === "active"
                                      ? "default"
                                      : contest.status === "upcoming"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {contest.status}
                                </Badge>
                              </CardTitle>
                              <CardDescription>
                                {contest.status === "active" && `Ends in ${contest.endTime}`}
                                {contest.status === "upcoming" && `Starts ${contest.startTime}`}
                                {contest.status === "ended" && "Contest completed"}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewContest(contest.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">Participation</p>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={(contest.participants / contest.totalStudents) * 100}
                                  className="flex-1"
                                />
                                <span className="text-sm font-medium">
                                  {contest.participants}/{contest.totalStudents}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Submissions</p>
                              <p className="text-2xl font-bold">{contest.submissions}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Avg Score</p>
                              <p className="text-2xl font-bold">{contest.avgScore}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <div className="flex items-center gap-1">
                                {contest.status === "active" && <Clock className="h-4 w-4 text-primary" />}
                                {contest.status === "ended" && <CheckCircle className="h-4 w-4 text-green-500" />}
                                <span className="text-sm capitalize">{contest.status}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="students" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Performance</CardTitle>
                      <CardDescription>Top performing students in your classes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockStudents.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <Badge
                                variant="outline"
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                              >
                                #{student.rank}
                              </Badge>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {student.submissions} submissions • Last active {student.lastActive}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-bold text-lg">{student.score}%</p>
                                <p className="text-sm text-muted-foreground">Average Score</p>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => handleViewStudent(student.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Trends</CardTitle>
                        <CardDescription>Class performance over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                          <BarChart3 className="h-16 w-16 mb-4" />
                          <p>Performance chart would be displayed here</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Problem Difficulty Analysis</CardTitle>
                        <CardDescription>Success rates by difficulty level</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Easy Problems</span>
                            <span>92% success rate</span>
                          </div>
                          <Progress value={92} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Medium Problems</span>
                            <span>67% success rate</span>
                          </div>
                          <Progress value={67} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Hard Problems</span>
                            <span>34% success rate</span>
                          </div>
                          <Progress value={34} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="plagiarism" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Plagiarism Alerts
                      </CardTitle>
                      <CardDescription>Suspicious similarities detected in student submissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {plagiarismAlerts.map((alert) => (
                          <div key={alert.id} className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-destructive">{alert.similarity}% similarity detected</p>
                                <p className="text-sm text-muted-foreground">
                                  Between {alert.student1} and {alert.student2} in {alert.contest}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Review Code
                                </Button>
                                <Button variant="destructive" size="sm">
                                  Flag Submission
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
