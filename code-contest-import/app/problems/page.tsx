"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, AlertCircle, Search } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface ProblemItem {
  _id: string
  title: string
  description?: string
  statement?: string
  difficulty: string
  category?: string
  tags?: string[]
  statistics?: {
    totalSubmissions?: number
    acceptanceRate?: number
  }
}

export default function ProblemsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProblems = async () => {
      setIsLoading(true)
      try {
        const response = await apiClient.getProblems({
          page: 1,
          limit: 100,
          difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
        })
        if (response.success) {
          const list = (response.data || []) as ProblemItem[]
          setProblems(list)
        }
      } catch (err: any) {
        console.error(err)
        toast({
          title: "Failed to load problems",
          description: "Please try again later",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProblems()
  }, [difficultyFilter, categoryFilter, toast])

  const getStatusIcon = (solved: boolean, attempted: boolean) => {
    if (solved) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (attempted) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <div className="h-4 w-4" />
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "hard":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Practice Problems</h1>
              <p className="text-muted-foreground mt-2">
                Sharpen your coding skills with our curated collection of algorithmic challenges.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
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
                <div className="col-span-6">Title</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-3">Topics</div>
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
                </div>
              ) : (
                <div>
                  {filteredProblems.map((problem, index) => (
                    <div
                      key={problem._id}
                      onClick={() => router.push(`/problems/${problem._id}/solve`)}
                      className={cn(
                        "grid grid-cols-12 gap-4 p-4 border-b last:border-b-0",
                        "cursor-pointer hover:bg-muted/50 transition-colors"
                      )}
                    >
                      {/* Status */}
                      <div className="col-span-1 flex items-center justify-center">
                        {getStatusIcon(false, false)}
                      </div>

                      {/* Title */}
                      <div className="col-span-6 flex items-center">
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
                      <div className="col-span-3 flex items-center gap-2 flex-wrap">
                        {problem.tags?.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {problem.tags && problem.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{problem.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            {!isLoading && filteredProblems.length > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                Showing {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
