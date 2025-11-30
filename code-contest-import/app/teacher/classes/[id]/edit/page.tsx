"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { ArrowLeft } from "lucide-react"

export default function EditClassPage() {
  const params = useParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  useEffect(() => {
    if (params.id) {
      fetchClass()
    }
  }, [params.id])

  const fetchClass = async () => {
    try {
      setLoading(true)
      setError("")
      const { apiClient } = await import('@/lib/api-client')
      const response = await apiClient.getClass(params.id as string)
      
      if (response.success) {
        setFormData({
          name: response.data.name || "",
          description: response.data.description || ""
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert("Please enter a class name")
      return
    }

    setIsSubmitting(true)

    try {
      const { apiClient } = await import('@/lib/api-client')
      const response = await apiClient.updateClass(params.id as string, {
        name: formData.name,
        description: formData.description
      })

      if (response.success) {
        alert("Class updated successfully!")
        router.push(`/teacher/classes/${params.id}`)
      }
    } catch (error: any) {
      console.error("Failed to update class:", error)
      alert(error.message || "Failed to update class. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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

  if (error) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-background">
          <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex">
            <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-6">
              <div className="max-w-2xl mx-auto">
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
                    <p className="text-muted-foreground mb-4">{error}</p>
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
            <div className="max-w-2xl mx-auto">
              <Button 
                variant="ghost" 
                onClick={() => router.push(`/teacher/classes/${params.id}`)}
                className="mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Class
              </Button>

              <Card>
                <CardHeader>
                  <CardTitle>Edit Class</CardTitle>
                  <CardDescription>
                    Update class information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Class Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Data Structures & Algorithms"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter a descriptive name for your class
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the class..."
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground">
                        Optional: Add details about the class content or objectives
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.push(`/teacher/classes/${params.id}`)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
