"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Users, Plus, Edit, Trash2, BookOpen, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MyClassesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    semester: "",
    year: new Date().getFullYear().toString()
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setIsLoading(true)
      const { apiClient } = await import('@/lib/api-client')
      const response = await apiClient.getClasses()
      
      if (response.success) {
        setClasses(response.data || [])
      }
    } catch (error: any) {
      console.error("Failed to fetch classes:", error)
      
      // Check if it's an auth error
      if (error.message?.includes('Access denied') || error.message?.includes('403')) {
        alert("You need to be logged in as a teacher to access this page. Redirecting to login...")
        router.push('/auth/login')
      } else {
        alert(error.message || "Failed to load classes")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)

    try {
      const { apiClient } = await import('@/lib/api-client')
      const response = await apiClient.createClass({
        name: newClass.name,
        description: newClass.description
      })
      
      if (response.success) {
        alert("Class created successfully!")
        setShowAddModal(false)
        setNewClass({ name: "", description: "", semester: "", year: new Date().getFullYear().toString() })
        fetchClasses() // Refresh the list
      }
    } catch (error: any) {
      console.error("Failed to add class:", error)
      alert(error.message || "Failed to add class. Please try again.")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteClass = async (classId: string) => {
    if (confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      try {
        const { apiClient } = await import('@/lib/api-client')
        const response = await apiClient.deleteClass(classId)
        
        if (response.success) {
          alert("Class deleted successfully!")
          fetchClasses() // Refresh the list
        }
      } catch (error: any) {
        console.error("Failed to delete class:", error)
        alert(error.message || "Failed to delete class. Please try again.")
      }
    }
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
                  <h1 className="text-3xl font-bold">My Classes</h1>
                  <p className="text-muted-foreground mt-2">
                    Manage your classes and course sections
                  </p>
                </div>
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Class</DialogTitle>
                      <DialogDescription>
                        Add a new class or course section
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddClass} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Class Name *</Label>
                        <Input
                          id="name"
                          value={newClass.name}
                          onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                          placeholder="e.g., Data Structures & Algorithms"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={newClass.description}
                          onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                          placeholder="Brief description of the class"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="semester">Semester *</Label>
                          <Input
                            id="semester"
                            value={newClass.semester}
                            onChange={(e) => setNewClass({...newClass, semester: e.target.value})}
                            placeholder="e.g., Fall, Spring"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">Year *</Label>
                          <Input
                            id="year"
                            type="number"
                            value={newClass.year}
                            onChange={(e) => setNewClass({...newClass, year: e.target.value})}
                            placeholder="2024"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={isAdding}>
                          {isAdding ? "Creating..." : "Create Class"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Classes Grid */}
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading classes...</p>
                </div>
              ) : classes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first class to get started
                    </p>
                    <Button onClick={() => setShowAddModal(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Class
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {classes.map((classItem) => (
                    <Card key={classItem._id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{classItem.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {classItem.description || "No description"}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{classItem.semester} {classItem.year}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-2xl font-bold">{classItem.students?.length || 0}</p>
                              <p className="text-xs text-muted-foreground">Students</p>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-2xl font-bold">{classItem.contests?.length || 0}</p>
                              <p className="text-xs text-muted-foreground">Contests</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => router.push(`/teacher/classes/${classItem._id}`)}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.push(`/teacher/classes/${classItem._id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClass(classItem._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
