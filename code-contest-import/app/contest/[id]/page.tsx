"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Users, Trophy, Code, Send, Eye, Code2, Timer, Target, BarChart3, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock contest data
const contestData = {
  1: {
    id: 1,
    title: "Weekly Challenge #42",
    description: "Test your algorithmic skills with dynamic programming and graph theory problems.",
    duration: "3 hours",
    participants: 156,
    maxParticipants: 500,
    status: "active" as const,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 34 * 60 * 1000).toISOString(),
    difficulty: "Medium" as const,
    prize: "$500",
    problems: [
      {
        id: 1,
        title: "Two Sum Variant",
        difficulty: "Easy",
        points: 100,
        solved: false,
        description: "Given an array of integers and a target sum, find two numbers that add up to the target.",
      },
      {
        id: 2,
        title: "Binary Tree Path Sum",
        difficulty: "Medium",
        points: 200,
        solved: true,
        description: "Find all root-to-leaf paths in a binary tree that sum to a given target.",
      },
      {
        id: 3,
        title: "Graph Shortest Path",
        difficulty: "Hard",
        points: 300,
        solved: false,
        description: "Find the shortest path between two nodes in a weighted directed graph.",
      },
    ],
  },
  2: {
    id: 2,
    title: "Algorithm Sprint",
    description: "Fast-paced coding challenge focusing on optimization and time complexity.",
    duration: "1.5 hours",
    participants: 89,
    maxParticipants: 200,
    status: "active" as const,
    endTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    difficulty: "Hard" as const,
    prize: "$200",
    problems: [
      {
        id: 4,
        title: "Array Optimization",
        difficulty: "Medium",
        points: 150,
        solved: false,
        description: "Optimize array operations for maximum efficiency.",
      },
      {
        id: 5,
        title: "String Matching",
        difficulty: "Hard",
        points: 250,
        solved: false,
        description: "Implement efficient string matching algorithms.",
      },
    ],
  },
}

export default function ContestPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [timeLeft, setTimeLeft] = useState("")
  const [contestSidebarOpen, setContestSidebarOpen] = useState(true)

  const contestId = Number.parseInt(params.id as string)
  const contest = contestData[contestId as keyof typeof contestData]

  useEffect(() => {
    if (!contest) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const end = new Date(contest.endTime).getTime()
      const difference = end - now

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft("Contest Ended")
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [contest])

  if (!contest) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Contest Not Found</h1>
            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const handleSubmit = () => {
    if (!selectedProblem || !code.trim()) {
      toast({
        title: "Submission Error",
        description: "Please select a problem and write some code.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Code Submitted!",
      description: "Your solution is being evaluated...",
    })

    // Simulate submission processing
    setTimeout(() => {
      toast({
        title: "Submission Result",
        description: "Your solution passed 8/10 test cases. Score: 80/100",
      })
    }, 3000)
  }

  const handleViewResults = () => {
    router.push(`/contest/${contestId}/results`)
  }

  const handleViewLeaderboard = () => {
    router.push(`/contest/${contestId}/leaderboard`)
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

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-6 md:ml-0">
            <div className="max-w-7xl mx-auto">
              {/* Contest Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleBackToDashboard}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-balance">{contest.title}</h1>
                        <Badge variant="outline" className="text-xs">
                          {contest.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {contest.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-2 text-pretty">{contest.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleViewResults}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Results
                    </Button>
                    <Button variant="outline" onClick={handleViewLeaderboard}>
                      <Trophy className="mr-2 h-4 w-4" />
                      Leaderboard
                    </Button>
                  </div>
                </div>

                {/* Contest Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Time Left</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">{timeLeft}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Participants</span>
                      </div>
                      <p className="text-2xl font-bold">{contest.participants}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Prize Pool</span>
                      </div>
                      <p className="text-2xl font-bold">{contest.prize}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Problems</span>
                      </div>
                      <p className="text-2xl font-bold">{contest.problems.length}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Problems List */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Problems</CardTitle>
                    <CardDescription>Select a problem to solve</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contest.problems.map((problem) => (
                      <div
                        key={problem.id}
                        className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{problem.title}</h4>
                          {problem.solved && (
                            <Badge variant="outline" className="text-green-500 border-green-500">
                              Solved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{problem.description}</p>
                        <div className="flex items-center justify-between mb-3">
                          <Badge
                            variant={
                              problem.difficulty === "Easy"
                                ? "secondary"
                                : problem.difficulty === "Medium"
                                  ? "default"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {problem.difficulty}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Target className="h-3 w-3" />
                            <span>{problem.points} pts</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleViewProblem(problem.id, problem.title)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleSolveProblem(problem.id, problem.title)}
                          >
                            <Code2 className="h-3 w-3 mr-1" />
                            Solve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Code Editor */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          {selectedProblem
                            ? contest.problems.find((p) => p.id === selectedProblem)?.title
                            : "Select a Problem"}
                        </CardTitle>
                        <CardDescription>
                          {selectedProblem
                            ? contest.problems.find((p) => p.id === selectedProblem)?.description
                            : "Choose a problem from the list to start coding"}
                        </CardDescription>
                      </div>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder={selectedProblem ? "Write your solution here..." : "Select a problem to start coding"}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="min-h-96 font-mono"
                      disabled={!selectedProblem}
                    />
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        Language: {language.charAt(0).toUpperCase() + language.slice(1)}
                      </div>
                      <Button onClick={handleSubmit} disabled={!selectedProblem || !code.trim()}>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Solution
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
