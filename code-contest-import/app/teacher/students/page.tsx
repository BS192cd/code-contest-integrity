"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Search, Plus, Eye, Trophy, CheckCircle, Clock, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

export default function StudentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const [newStudent, setNewStudent] = useState({
    username: "" // Only need student ID/username
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, statusFilter])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all students using the correct endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStudents(data.data || [])
        }
      } else {
        console.error("Failed to fetch students:", response.status)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student._id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter (you can add more status logic here)
    if (statusFilter !== "all") {
      // Add status filtering logic if needed
    }

    setFilteredStudents(filtered)
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Redirect to classes page to add student to a specific class
    alert("To add a student, please go to a specific class and use the 'Add Students' button there.")
    setShowAddModal(false)
    router.push('/teacher/classes')
  }

  const handleViewStudent = (studentId: string) => {
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
                  <h1 className="text-3xl font-bold">Students</h1>
                  <p className="text-muted-foreground mt-2">
                    Manage and monitor student progress
                  </p>
                </div>
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Student by ID
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Student to a Class</DialogTitle>
                      <DialogDescription>
                        To add students, please go to a specific class first. This page shows all students in the system.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">How to Add Students:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Go to <strong>Classes</strong> page</li>
                          <li>Select or create a class</li>
                          <li>Click <strong>"Add Students"</strong> button</li>
                          <li>Enter the student's ID (shown below their email on this page)</li>
                          <li>Student will be added to that specific class</li>
                        </ol>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={() => {
                          setShowAddModal(false)
                          router.push('/teacher/classes')
                        }}>
                          Go to Classes
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search students..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                    }}>Clear Filters</Button>
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm || statusFilter !== "all" ? "No students found" : "No students yet"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your filters" 
                        : "Add your first student to get started"
                      }
                    </p>
                    {!searchTerm && statusFilter === "all" && (
                      <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredStudents.map((student) => {
                    const stats = student.statistics || {}
                    return (
                      <Card key={student._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>
                                  {(student.fullName || student.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{student.fullName || student.name}</h3>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                                <p className="text-xs text-muted-foreground font-mono mt-1">
                                  ID: {student._id}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Trophy className="h-4 w-4" />
                                    @{student.username}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    {stats.problemsSolved || 0} solved
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(student.updatedAt || student.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-2xl font-bold">{stats.averageScore || 0}%</p>
                                <p className="text-sm text-muted-foreground">Average Score</p>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => handleViewStudent(student._id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Summary */}
              {!isLoading && filteredStudents.length > 0 && (
                <div className="mt-8 text-center text-sm text-muted-foreground">
                  Showing {filteredStudents.length} of {students.length} students
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
