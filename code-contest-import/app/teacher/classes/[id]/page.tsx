"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Users, Trophy, ArrowLeft, Edit, UserPlus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [classData, setClassData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [showAssignContestDialog, setShowAssignContestDialog] = useState(false)
  const [availableContests, setAvailableContests] = useState<any[]>([])
  const [selectedContests, setSelectedContests] = useState<string[]>([])
  const [isAssigningContest, setIsAssigningContest] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchClass()
      fetchAvailableContests()
    }
  }, [params.id])

  const fetchClass = async () => {
    try {
      setLoading(true)
      setError("")
      const { apiClient } = await import('@/lib/api-client')
      
      // Ensure token is set
      const token = localStorage.getItem('auth_token')
      if (token) {
        apiClient.setToken(token)
      }
      
      const response = await apiClient.getClass(params.id as string)
      
      if (response.success) {
        setClassData(response.data)
      } else {
        setError("Failed to load class")
      }
    } catch (err: any) {
      console.error("Failed to fetch class:", err)
      setError(err.message || "Failed to load class")
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableContests = async () => {
    try {
      const { apiClient } = await import('@/lib/api-client')
      const token = localStorage.getItem('auth_token')
      if (token) {
        apiClient.setToken(token)
      }
      
      const response = await apiClient.getContests({ limit: 100 })
      if (response.success) {
        setAvailableContests(response.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch contests:", error)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!studentId.trim()) {
      alert("Please enter a student ID")
      return
    }

    setIsAddingStudent(true)

    try {
      const { apiClient } = await import('@/lib/api-client')
      
      // Make sure token is set
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert("You need to be logged in to add students. Please login again.")
        router.push('/auth/login')
        return
      }
      apiClient.setToken(token)
      
      const response = await apiClient.addStudentsToClass(params.id as string, [studentId])
      
      if (response.success) {
        alert("Student added successfully!")
        setShowAddStudentDialog(false)
        setStudentId("")
        fetchClass() // Refresh class data
      }
    } catch (error: any) {
      console.error("Failed to add student:", error)
      
      // Check if it's an auth error
      if (error.message?.includes('Access denied') || error.message?.includes('Required roles')) {
        alert("Authentication error. Please logout and login again as a teacher.")
        router.push('/auth/login')
      } else {
        alert(error.message || "Failed to add student. Please check the student ID and try again.")
      }
    } finally {
      setIsAddingStudent(false)
    }
  }

  const handleAssignContest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedContests.length === 0) {
      alert("Please select at least one contest")
      return
    }

    setIsAssigningContest(true)

    try {
      const { apiClient } = await import('@/lib/api-client')
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert("You need to be logged in. Please login again.")
        router.push('/auth/login')
        return
      }
      apiClient.setToken(token)
      
      const response = await apiClient.assignContestsToClass(params.id as string, selectedContests)
      
      if (response.success) {
        alert("Contest(s) assigned successfully!")
        setShowAssignContestDialog(false)
        setSelectedContests([])
        fetchClass() // Refresh class data
      }
    } catch (error: any) {
      console.error("Failed to assign contest:", error)
      alert(error.message || "Failed to assign contest. Please try again.")
    } finally {
      setIsAssigningContest(false)
    }
  }

  const toggleContestSelection = (contestId: string) => {
    setSelectedContests(prev => 
      prev.includes(contestId)
        ? prev.filter(id => id !== contestId)
        : [...prev, contestId]
    )
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-background">
          <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex">
            <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading class...</p>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !classData) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-background">
          <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex">
            <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-6">
              <div className="max-w-7xl mx-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/teacher/classes')}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Classes
                </Button>
                <Card>
                  <CardContent className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">Class not found</h3>
                    <p className="text-muted-foreground mb-4">
                      {error || "The class you're looking for doesn't exist"}
                    </p>
                    <Button onClick={() => router.push('/teacher/classes')}>
                      Go to Classes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-6 md:ml-0">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/teacher/classes')}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Classes
                </Button>
                
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
                    <p className="text-muted-foreground">
                      {classData.description || "No description"}
                    </p>
                  </div>
                  <Button onClick={() => router.push(`/teacher/classes/${params.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Class
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Students
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{classData.students?.length || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Contests
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{classData.contests?.length || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Students Section */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Students</CardTitle>
                      <CardDescription>
                        Students enrolled in this class
                      </CardDescription>
                    </div>
                    <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Students
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Student to Class</DialogTitle>
                          <DialogDescription>
                            Enter the student's ID to add them to this class
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddStudent} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="studentId">Student ID</Label>
                            <Input
                              id="studentId"
                              value={studentId}
                              onChange={(e) => setStudentId(e.target.value)}
                              placeholder="Enter student ID (e.g., 507f1f77bcf86cd799439011)"
                              required
                            />
                            <p className="text-sm text-muted-foreground">
                              You can find student IDs in the Students page
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={isAddingStudent}>
                              {isAddingStudent ? "Adding..." : "Add Student"}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setShowAddStudentDialog(false)
                                setStudentId("")
                              }}
                              disabled={isAddingStudent}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {classData.students && classData.students.length > 0 ? (
                    <div className="space-y-2">
                      {classData.students.map((student: any) => (
                        <div 
                          key={student._id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                        >
                          <div>
                            <p className="font-medium">{student.fullName || student.username}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push(`/teacher/students/${student._id}`)}
                          >
                            View Profile
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No students enrolled yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contests Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Contests</CardTitle>
                      <CardDescription>
                        Contests assigned to this class
                      </CardDescription>
                    </div>
                    <Dialog open={showAssignContestDialog} onOpenChange={setShowAssignContestDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trophy className="mr-2 h-4 w-4" />
                          Assign Contest
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Assign Contests to Class</DialogTitle>
                          <DialogDescription>
                            Select one or more contests to assign to this class
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAssignContest} className="space-y-4">
                          <div className="space-y-3">
                            {availableContests.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No contests available. Create a contest first.
                              </p>
                            ) : (
                              availableContests.map((contest) => {
                                const isAlreadyAssigned = classData?.contests?.some(
                                  (c: any) => c._id === contest._id
                                )
                                return (
                                  <div
                                    key={contest._id}
                                    className={`flex items-start space-x-3 p-3 border rounded-lg ${
                                      isAlreadyAssigned ? 'bg-muted opacity-60' : 'hover:bg-accent'
                                    }`}
                                  >
                                    <Checkbox
                                      id={contest._id}
                                      checked={selectedContests.includes(contest._id)}
                                      onCheckedChange={() => toggleContestSelection(contest._id)}
                                      disabled={isAlreadyAssigned}
                                    />
                                    <div className="flex-1">
                                      <label
                                        htmlFor={contest._id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                      >
                                        {contest.title}
                                        {isAlreadyAssigned && (
                                          <Badge variant="secondary" className="ml-2">
                                            Already Assigned
                                          </Badge>
                                        )}
                                      </label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {contest.description || 'No description'}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(contest.startTime).toLocaleDateString()} - {new Date(contest.endTime).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button 
                              type="submit" 
                              disabled={isAssigningContest || selectedContests.length === 0}
                            >
                              {isAssigningContest ? "Assigning..." : `Assign ${selectedContests.length} Contest(s)`}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setShowAssignContestDialog(false)
                                setSelectedContests([])
                              }}
                              disabled={isAssigningContest}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {classData.contests && classData.contests.length > 0 ? (
                    <div className="space-y-2">
                      {classData.contests.map((contest: any) => (
                        <div 
                          key={contest._id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                        >
                          <div>
                            <p className="font-medium">{contest.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(contest.startTime).toLocaleDateString()} - {new Date(contest.endTime).toLocaleDateString()}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push(`/teacher/contests/${contest._id}`)}
                          >
                            View Contest
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No contests assigned yet
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
