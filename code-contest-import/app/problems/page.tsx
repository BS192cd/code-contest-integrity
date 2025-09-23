"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, AlertCircle, Search, Filter, Eye, Code2 } from "lucide-react"

const mockProblems = [
  {
    id: 1,
    title: "Two Sum",
    description:
      "Given an array of integers, return indices of the two numbers such that they add up to a specific target.",
    difficulty: "Easy",
    category: "Array",
    solved: true,
    attempted: true,
    acceptance: 85,
    submissions: 1234567,
  },
  {
    id: 2,
    title: "Binary Tree Traversal",
    description: "Implement inorder, preorder, and postorder traversal of a binary tree.",
    difficulty: "Medium",
    category: "Tree",
    solved: false,
    attempted: true,
    acceptance: 67,
    submissions: 456789,
  },
  {
    id: 3,
    title: "Dynamic Programming Challenge",
    description: "Solve a complex optimization problem using dynamic programming techniques.",
    difficulty: "Hard",
    category: "Dynamic Programming",
    solved: false,
    attempted: false,
    acceptance: 34,
    submissions: 123456,
  },
  {
    id: 4,
    title: "Graph Shortest Path",
    description: "Find the shortest path between two nodes in a weighted graph using Dijkstra's algorithm.",
    difficulty: "Medium",
    category: "Graph",
    solved: true,
    attempted: true,
    acceptance: 56,
    submissions: 234567,
  },
  {
    id: 5,
    title: "String Pattern Matching",
    description: "Implement efficient string pattern matching using KMP algorithm.",
    difficulty: "Hard",
    category: "String",
    solved: false,
    attempted: false,
    acceptance: 42,
    submissions: 98765,
  },
]

export default function ProblemsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()
  const { toast } = useToast()

  const getStatusIcon = (solved: boolean, attempted: boolean) => {
    if (solved) return <CheckCircle className="h-4 w-4 text-green-400" />
    if (attempted) return <AlertCircle className="h-4 w-4 text-yellow-400" />
    return <XCircle className="h-4 w-4 text-muted-foreground" />
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "secondary"
      case "Medium":
        return "default"
      case "Hard":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const handleViewProblem = (problemId: number, problemTitle: string) => {
    router.push(`/problems/${problemId}/view`)
    toast({
      title: "Opening problem",
      description: `Loading ${problemTitle}...`,
    })
  }

  const handleSolveProblem = (problemId: number, problemTitle: string) => {
    router.push(`/problems/${problemId}/solve`)
    toast({
      title: "Starting solution",
      description: `Opening code editor for ${problemTitle}...`,
    })
  }

  const filteredProblems = mockProblems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = difficultyFilter === "all" || problem.difficulty === difficultyFilter
    const matchesCategory = categoryFilter === "all" || problem.category === categoryFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "solved" && problem.solved) ||
      (statusFilter === "attempted" && problem.attempted && !problem.solved) ||
      (statusFilter === "unsolved" && !problem.attempted)

    return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-balance">Practice Problems</h1>
                <p className="text-muted-foreground mt-2 text-pretty">
                  Sharpen your coding skills with our curated collection of algorithmic challenges.
                </p>
              </div>
              <Button>
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
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
                    <SelectTrigger className="w-full lg:w-40">
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
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Array">Array</SelectItem>
                      <SelectItem value="Tree">Tree</SelectItem>
                      <SelectItem value="Graph">Graph</SelectItem>
                      <SelectItem value="Dynamic Programming">DP</SelectItem>
                      <SelectItem value="String">String</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="solved">Solved</SelectItem>
                      <SelectItem value="attempted">Attempted</SelectItem>
                      <SelectItem value="unsolved">Unsolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Problems List */}
            <div className="space-y-4">
              {filteredProblems.map((problem) => (
                <Card key={problem.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {getStatusIcon(problem.solved, problem.attempted)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{problem.title}</h3>
                            <Badge variant={getDifficultyColor(problem.difficulty)} className="text-xs">
                              {problem.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {problem.category}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm text-pretty mb-3">{problem.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Acceptance: {problem.acceptance}%</span>
                            <span>Submissions: {problem.submissions.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProblem(problem.id, problem.title)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleSolveProblem(problem.id, problem.title)}
                        >
                          <Code2 className="h-3 w-3 mr-1" />
                          {problem.solved ? "Solve Again" : "Solve"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProblems.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No problems found</p>
                    <p className="text-sm">Try adjusting your search criteria or filters.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
