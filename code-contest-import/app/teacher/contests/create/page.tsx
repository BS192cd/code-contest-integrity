"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Clock, Users, Trophy, Plus, X, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"

export default function CreateContestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [availableProblems, setAvailableProblems] = useState<any[]>([])
  const [selectedProblems, setSelectedProblems] = useState<string[]>([])
  const [showProblemSelector, setShowProblemSelector] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    duration: 120,
    maxParticipants: 100,
    isPublic: true,
    enablePlagiarism: true,
    showLeaderboard: true
  })

  // Fetch available problems
  useEffect(() => {
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
    try {
      const response = await apiClient.getProblems()
      if (response.success && response.data) {
        setAvailableProblems(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch problems:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a contest title.",
        variant: "destructive"
      })
      return
    }
    
    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a contest description.",
        variant: "destructive"
      })
      return
    }
    
    if (formData.description.trim().length < 10) {
      toast({
        title: "Error",
        description: "Description must be at least 10 characters long.",
        variant: "destructive"
      })
      return
    }
    
    if (!formData.startTime) {
      toast({
        title: "Error",
        description: "Please select a start date and time.",
        variant: "destructive"
      })
      return
    }
    
    if (selectedProblems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one problem for the contest.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Calculate end time
      const startDate = new Date(formData.startTime)
      const endDate = new Date(startDate.getTime() + formData.duration * 60000)

      const contestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        duration: formData.duration,
        difficulty: "Medium",
        maxParticipants: formData.maxParticipants || 100,
        isPublic: formData.isPublic,
        registrationRequired: true,
        problems: selectedProblems.map((problemId, index) => ({
          problemId,
          points: 100,
          order: index
        })),
        rules: {
          allowedLanguages: ["python", "javascript", "java", "cpp", "c"],
          maxSubmissions: -1,
          penalty: {
            enabled: false,
            points: 0
          },
          plagiarismDetection: {
            enabled: formData.enablePlagiarism,
            threshold: 70
          }
        }
      }

      console.log("Creating contest with data:", contestData)

      const response = await apiClient.createContest(contestData)
      
      if (response.success) {
        toast({
          title: "Contest Created",
          description: "Your contest has been successfully created and scheduled.",
        })
        router.push("/teacher/dashboard")
      } else {
        throw new Error(response.error || "Failed to create contest")
      }
    } catch (error: any) {
      console.error("Failed to create contest:", error)
      
      let errorMessage = "Failed to create contest. "
      if (error.message) {
        if (error.message.includes("validation")) {
          errorMessage += "Please check all required fields."
        } else if (error.message.includes("duplicate")) {
          errorMessage += "A contest with this title already exists."
        } else {
          errorMessage += error.message
        }
      } else {
        errorMessage += "Please try again."
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleProblemSelection = (problemId: string) => {
    setSelectedProblems(prev => 
      prev.includes(problemId) 
        ? prev.filter(id => id !== problemId)
        : [...prev, problemId]
    )
  }

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex">
          <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <main className="flex-1 p-6 md:ml-0">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create New Contest</h1>
                <p className="text-muted-foreground">Set up a new coding contest for your students</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Contest Details
                    </CardTitle>
                    <CardDescription>Basic information about your contest</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Contest Title *</Label>
                        <Input 
                          id="title" 
                          placeholder="Weekly Programming Challenge #1" 
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes) *</Label>
                        <Input 
                          id="duration" 
                          type="number" 
                          placeholder="120" 
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Contest description and rules..." 
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date & Time *</Label>
                        <Input 
                          id="start-date" 
                          type="datetime-local" 
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-participants">Max Participants</Label>
                        <Input 
                          id="max-participants" 
                          type="number" 
                          placeholder="100"
                          value={formData.maxParticipants}
                          onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Contest Settings
                    </CardTitle>
                    <CardDescription>Configure contest behavior and rules</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Public Contest</Label>
                        <p className="text-sm text-muted-foreground">Allow anyone to participate</p>
                      </div>
                      <Switch 
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => setFormData({...formData, isPublic: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Plagiarism Detection</Label>
                        <p className="text-sm text-muted-foreground">Automatically scan submissions</p>
                      </div>
                      <Switch 
                        checked={formData.enablePlagiarism}
                        onCheckedChange={(checked) => setFormData({...formData, enablePlagiarism: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Leaderboard</Label>
                        <p className="text-sm text-muted-foreground">Display real-time rankings</p>
                      </div>
                      <Switch 
                        checked={formData.showLeaderboard}
                        onCheckedChange={(checked) => setFormData({...formData, showLeaderboard: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Problems ({selectedProblems.length} selected)
                    </CardTitle>
                    <CardDescription>Select problems from the problem bank</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search problems..." 
                        className="flex-1"
                      />
                    </div>

                    {availableProblems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Loading problems...</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {availableProblems.map((problem) => (
                          <div 
                            key={problem._id} 
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                            onClick={() => toggleProblemSelection(problem._id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedProblems.includes(problem._id)}
                              onChange={() => toggleProblemSelection(problem._id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{problem.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                  problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {problem.difficulty}
                                </span>
                                {problem.category && (
                                  <span className="text-xs text-muted-foreground">{problem.category}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedProblems.length === 0 && (
                      <p className="text-sm text-destructive">
                        * Please select at least one problem
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={isLoading || selectedProblems.length === 0}>
                    {isLoading ? "Creating..." : "Create Contest"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
