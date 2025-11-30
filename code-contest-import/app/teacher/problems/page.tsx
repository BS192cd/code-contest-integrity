"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Search, Plus, Edit, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"

export default function ProblemsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [problems, setProblems] = useState<any[]>([])
  const [filteredProblems, setFilteredProblems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const router = useRouter()

  useEffect(() => {
    fetchProblems()
  }, [])

  useEffect(() => {
    filterProblems()
  }, [problems, searchTerm, difficultyFilter, categoryFilter])

  const fetchProblems = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getProblems({
        page: 1,
        limit: 100
      })
      if (response.success && response.data) {
        setProblems(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch problems:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (solved: boolean, attempted: boolean) => {
    if (solved) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (attempted) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <div className="h-4 w-4" />
  }

  const filterProblems = () => {
    let filtered = problems

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(problem => 
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(problem => problem.difficulty === difficultyFilter)
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(problem => problem.category === categoryFilter)
    }

    setFilteredProblems(filtered)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Problems</h1>
                  <p className="text-muted-foreground mt-2">
                    Manage and organize coding problems for your contests
                  </p>
                </div>
                <Button onClick={() => router.push("/teacher/problems/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Problem
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search problems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Array">Array</SelectItem>
                    <SelectItem value="String">String</SelectItem>
                    <SelectItem value="Dynamic Programming">DP</SelectItem>
                    <SelectItem value="Graph">Graph</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Problems Table */}
              <div className="border rounded-lg overflow-hidden bg-card">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-5">Title</div>
                  <div className="col-span-2">Difficulty</div>
                  <div className="col-span-2">Topics</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>

                {/* Table Body */}
                {isLoading ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4">Loading problems...</p>
                  </div>
                ) : filteredProblems.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No problems found</p>
                    {!searchTerm && difficultyFilter === "all" && categoryFilter === "all" && (
                      <Button 
                        onClick={() => router.push("/teacher/problems/create")}
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Problem
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    {filteredProblems.map((problem, index) => (
                      <div
                        key={problem._id}
                        className={cn(
                          "grid grid-cols-12 gap-4 p-4 border-b last:border-b-0",
                          "hover:bg-muted/50 transition-colors"
                        )}
                      >
                        {/* Status */}
                        <div className="col-span-1 flex items-center justify-center">
                          {getStatusIcon(false, false)}
                        </div>

                        {/* Title */}
                        <div 
                          className="col-span-5 flex items-center cursor-pointer"
                          onClick={() => router.push(`/problems/${problem._id}/solve`)}
                        >
                          <span className="text-muted-foreground mr-3 text-sm w-8">
                            {index + 1}.
                          </span>
                          <span className="font-medium hover:text-primary transition-colors">
                            {problem.title}
                          </span>
                        </div>

                        {/* Difficulty */}
                        <div className="col-span-2 flex items-center">
                          <span className={cn("text-sm font-medium", getDifficultyColor(problem.difficulty))}>
                            {problem.difficulty}
                          </span>
                        </div>

                        {/* Topics */}
                        <div className="col-span-2 flex items-center gap-2 flex-wrap">
                          {problem.tags && problem.tags.length > 0 ? (
                            problem.tags.slice(0, 2).map((tag: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))
                          ) : problem.category ? (
                            <Badge variant="secondary" className="text-xs">
                              {problem.category}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/teacher/problems/${problem._id}/edit`)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {!isLoading && filteredProblems.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  Showing {filteredProblems.length} of {problems.length} problems
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
