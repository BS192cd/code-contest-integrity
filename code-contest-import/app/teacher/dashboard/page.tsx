"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Users, Trophy, Plus, Eye, Edit, BarChart3, AlertTriangle, CheckCircle, Clock, Code2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

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
  const [contests, setContests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchContests()
    fetchAnalytics()
  }, [])

  const fetchContests = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getContests()
      if (response.success && response.data) {
        setContests(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch contests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      // Fetch all submissions to calculate analytics
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        const submissions = data.data
        
        // Calculate difficulty-based success rates
        const easySubmissions = submissions.filter((s: any) => s.problemId?.difficulty === 'easy')
        const mediumSubmissions = submissions.filter((s: any) => s.problemId?.difficulty === 'medium')
        const hardSubmissions = submissions.filter((s: any) => s.problemId?.difficulty === 'hard')
        
        const easySuccess = easySubmissions.length > 0 
          ? Math.round((easySubmissions.filter((s: any) => s.status === 'Accepted').length / easySubmissions.length) * 100)
          : 0
        const mediumSuccess = mediumSubmissions.length > 0
          ? Math.round((mediumSubmissions.filter((s: any) => s.status === 'Accepted').length / mediumSubmissions.length) * 100)
          : 0
        const hardSuccess = hardSubmissions.length > 0
          ? Math.round((hardSubmissions.filter((s: any) => s.status === 'Accepted').length / hardSubmissions.length) * 100)
          : 0
        
        setAnalytics({
          easySuccess,
          mediumSuccess,
          hardSuccess,
          totalSubmissions: submissions.length,
          acceptedSubmissions: submissions.filter((s: any) => s.status === 'Accepted').length
        })
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
  }

  const handleCreateContest = () => {
    router.push("/teacher/contests/create")
  }

  const handleViewContest = (contestId: string) => {
    router.push(`/teacher/contests/${contestId}`)
  }

  const handleEditContest = (contestId: string) => {
    router.push(`/teacher/contests/${contestId}/edit`)
  }

  const handleViewStudent = (studentId: number) => {
    router.push(`/teacher/students/${studentId}`)
  }

  const handleReviewCode = (alert: any) => {
    setSelectedAlert(alert)
    setShowReviewModal(true)
  }

  const handleFlagSubmission = async (alert: any) => {
    const confirmMessage = `⚠️ FLAG FOR PLAGIARISM\n\nThis will:\n• Set student's score to 0\n• Move student to lowest rank\n• Mark submission as flagged\n• Notify the student\n\nAre you sure you want to flag ${alert.student1} and ${alert.student2}?`
    
    if (confirm(confirmMessage)) {
      try {
        // Call API to flag submission and penalize students
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/flag`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            student1: alert.student1,
            student2: alert.student2,
            contestId: alert.contest,
            similarity: alert.similarity,
            penalty: {
              setScoreToZero: true,
              setRankToLowest: true,
              markAsFlagged: true,
              notifyStudent: true
            }
          })
        })
        
        const data = await response.json()
        
        if (data.success || response.ok) {
          alert(`✅ Submission flagged successfully!\n\n• ${alert.student1}: Score set to 0, Rank moved to lowest\n• ${alert.student2}: Score set to 0, Rank moved to lowest\n• Both students have been notified\n• Submissions marked with red flag`)
          
          // Refresh the page to show updated data
          window.location.reload()
        } else {
          throw new Error(data.error || "Failed to flag submission")
        }
      } catch (error: any) {
        console.error("Failed to flag submission:", error)
        
        // Show detailed error or fallback message
        if (error.message.includes("404") || error.message.includes("not found")) {
          alert("⚠️ Backend endpoint not implemented yet.\n\nTo implement this feature, your backend needs:\n\nPOST /api/submissions/flag\n\nThis endpoint should:\n1. Set student scores to 0\n2. Update rankings\n3. Mark submissions as flagged\n4. Send notifications to students")
        } else {
          alert(`Failed to flag submission: ${error.message}`)
        }
      }
    }
  }

  const getContestStatus = (contest: any) => {
    const now = new Date()
    const start = new Date(contest.startTime)
    const end = new Date(contest.endTime)
    
    if (now < start) return "upcoming"
    if (now > end) return "ended"
    return "active"
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
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading contests...</p>
                    </div>
                  ) : contests.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No contests yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first contest to get started
                        </p>
                        <Button onClick={handleCreateContest}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Contest
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6">
                      {contests.map((contest) => {
                        const status = getContestStatus(contest)
                        const participants = contest.participants?.length || 0
                        const maxParticipants = contest.maxParticipants || 100
                        
                        return (
                          <Card key={contest._id}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    {contest.title}
                                    <Badge
                                      variant={
                                        status === "active"
                                          ? "default"
                                          : status === "upcoming"
                                            ? "secondary"
                                            : "outline"
                                      }
                                    >
                                      {status}
                                    </Badge>
                                  </CardTitle>
                                  <CardDescription>
                                    {contest.description || "No description"}
                                  </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleViewContest(contest._id)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditContest(contest._id)}>
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
                                      value={(participants / maxParticipants) * 100}
                                      className="flex-1"
                                    />
                                    <span className="text-sm font-medium">
                                      {participants}/{maxParticipants}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Problems</p>
                                  <p className="text-2xl font-bold">{contest.problems?.length || 0}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Start Time</p>
                                  <p className="text-sm font-medium">
                                    {new Date(contest.startTime).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  <div className="flex items-center gap-1">
                                    {status === "active" && <Clock className="h-4 w-4 text-primary" />}
                                    {status === "ended" && <CheckCircle className="h-4 w-4 text-green-500" />}
                                    <span className="text-sm capitalize">{status}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
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
                        <CardTitle>Submission Statistics</CardTitle>
                        <CardDescription>Overall submission performance</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analytics ? (
                          <div className="space-y-6">
                            <div className="text-center">
                              <p className="text-4xl font-bold">{analytics.totalSubmissions}</p>
                              <p className="text-sm text-muted-foreground">Total Submissions</p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Accepted</span>
                                <span className="font-medium text-green-600">{analytics.acceptedSubmissions}</span>
                              </div>
                              <Progress 
                                value={analytics.totalSubmissions > 0 ? (analytics.acceptedSubmissions / analytics.totalSubmissions) * 100 : 0} 
                                className="h-2" 
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Rejected</span>
                                <span className="font-medium text-red-600">{analytics.totalSubmissions - analytics.acceptedSubmissions}</span>
                              </div>
                              <Progress 
                                value={analytics.totalSubmissions > 0 ? ((analytics.totalSubmissions - analytics.acceptedSubmissions) / analytics.totalSubmissions) * 100 : 0} 
                                className="h-2" 
                              />
                            </div>
                            <div className="pt-4 border-t">
                              <p className="text-center text-2xl font-bold">
                                {analytics.totalSubmissions > 0 
                                  ? Math.round((analytics.acceptedSubmissions / analytics.totalSubmissions) * 100)
                                  : 0}%
                              </p>
                              <p className="text-center text-sm text-muted-foreground">Overall Success Rate</p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                            <BarChart3 className="h-16 w-16 mb-4" />
                            <p>Loading analytics...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Problem Difficulty Analysis</CardTitle>
                        <CardDescription>Success rates by difficulty level</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {analytics ? (
                          <>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                  Easy Problems
                                </span>
                                <span className="font-medium">{analytics.easySuccess}% success rate</span>
                              </div>
                              <Progress value={analytics.easySuccess} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                  Medium Problems
                                </span>
                                <span className="font-medium">{analytics.mediumSuccess}% success rate</span>
                              </div>
                              <Progress value={analytics.mediumSuccess} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                  Hard Problems
                                </span>
                                <span className="font-medium">{analytics.hardSuccess}% success rate</span>
                              </div>
                              <Progress value={analytics.hardSuccess} className="h-2" />
                            </div>
                            <div className="pt-4 border-t">
                              <p className="text-sm text-muted-foreground text-center">
                                Students perform best on easy problems and face more challenges with harder ones
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            <p>Loading difficulty analysis...</p>
                          </div>
                        )}
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
                      {plagiarismAlerts.length === 0 ? (
                        <div className="text-center py-12">
                          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Plagiarism Detected</h3>
                          <p className="text-muted-foreground">
                            All submissions appear to be original work
                          </p>
                        </div>
                      ) : (
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
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleReviewCode(alert)}
                                  >
                                    <Code2 className="mr-2 h-4 w-4" />
                                    Review Code
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleFlagSubmission(alert)}
                                  >
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Flag Submission
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>

        {/* Review Code Modal */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Code Comparison - {selectedAlert?.similarity}% Similarity
              </DialogTitle>
              <DialogDescription>
                Comparing submissions from {selectedAlert?.student1} and {selectedAlert?.student2} in {selectedAlert?.contest}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Student 1 Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{selectedAlert?.student1}'s Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`function solve(arr) {
  // Sort the array
  arr.sort((a, b) => a - b);
  
  let result = 0;
  for (let i = 0; i < arr.length; i++) {
    result += arr[i] * (i + 1);
  }
  
  return result;
}

// Test cases
console.log(solve([1, 2, 3])); // 14
console.log(solve([5, 1, 3])); // 17`}</code>
                    </pre>
                  </CardContent>
                </Card>

                {/* Student 2 Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{selectedAlert?.student2}'s Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`function solve(array) {
  // Sort array in ascending order
  array.sort((x, y) => x - y);
  
  let sum = 0;
  for (let index = 0; index < array.length; index++) {
    sum += array[index] * (index + 1);
  }
  
  return sum;
}

// Testing
console.log(solve([1, 2, 3])); // Output: 14
console.log(solve([5, 1, 3])); // Output: 17`}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* Similarity Analysis */}
              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Similarity Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overall Similarity:</span>
                    <Badge variant="destructive">{selectedAlert?.similarity}%</Badge>
                  </div>
                  <Progress value={selectedAlert?.similarity || 0} className="h-2" />
                  <div className="pt-2 space-y-1 text-sm text-muted-foreground">
                    <p>• Similar variable naming patterns</p>
                    <p>• Identical algorithm structure</p>
                    <p>• Same comment style and placement</p>
                    <p>• Matching test cases</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                  Close
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleFlagSubmission(selectedAlert)
                    setShowReviewModal(false)
                  }}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Flag as Plagiarism
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
