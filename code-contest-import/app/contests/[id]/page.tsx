"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Clock, Trophy, Timer, Code, CheckCircle, XCircle, AlertCircle, Eye, Code2 } from "lucide-react"

const mockContest = {
  id: 1,
  title: "Weekly Challenge #42",
  description:
    "Test your algorithmic skills with dynamic programming and graph theory problems. This contest features carefully curated problems that will challenge your problem-solving abilities.",
  duration: "3 hours",
  participants: 156,
  maxParticipants: 500,
  status: "active" as const,
  startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30m ago
  endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 2h 30m left
  difficulty: "Medium" as const,
  prize: "$500",
  problems: [
    {
      id: 1,
      title: "Dynamic Array Manipulation",
      difficulty: "Easy",
      points: 100,
      solved: 89,
      attempted: 134,
      status: "solved" as const,
    },
    {
      id: 2,
      title: "Graph Traversal Optimization",
      difficulty: "Medium",
      points: 200,
      solved: 45,
      attempted: 98,
      status: "attempted" as const,
    },
    {
      id: 3,
      title: "Advanced DP with Memoization",
      difficulty: "Hard",
      points: 300,
      solved: 12,
      attempted: 67,
      status: "unsolved" as const,
    },
  ],
}

const mockLeaderboard = [
  { rank: 1, username: "alice_codes", score: 600, solved: 3, lastSubmission: "2m ago" },
  { rank: 2, username: "bob_dev", score: 500, solved: 2, lastSubmission: "15m ago" },
  { rank: 3, username: "charlie_algo", score: 300, solved: 2, lastSubmission: "23m ago" },
  { rank: 4, username: "diana_prog", score: 300, solved: 1, lastSubmission: "45m ago" },
  { rank: 5, username: "eve_coder", score: 100, solved: 1, lastSubmission: "1h ago" },
]

export default function ContestPage() {
  const params = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(mockContest.endTime).getTime()
      const start = new Date(mockContest.startTime).getTime()
      const distance = end - now

      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)

        // Calculate progress
        const totalDuration = end - start
        const elapsed = now - start
        setProgress((elapsed / totalDuration) * 100)
      } else {
        setTimeLeft("Contest Ended")
        setProgress(100)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "solved":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "attempted":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />
    }
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Contest Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-balance">{mockContest.title}</h1>
                <p className="text-muted-foreground mt-2 text-pretty">{mockContest.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={getDifficultyColor(mockContest.difficulty)} className="text-sm">
                  {mockContest.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-primary">
                  <Trophy className="h-4 w-4" />
                  <span className="font-medium">{mockContest.prize}</span>
                </div>
              </div>
            </div>

            {/* Contest Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Participants</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {mockContest.participants}
                    <span className="text-sm text-muted-foreground font-normal">/{mockContest.maxParticipants}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Duration</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{mockContest.duration}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Time Left</span>
                  </div>
                  <div className="text-2xl font-bold mt-1 font-mono text-primary">{timeLeft}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Problems</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{mockContest.problems.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Contest Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs defaultValue="problems" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="problems">Problems</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                <TabsTrigger value="submissions">My Submissions</TabsTrigger>
              </TabsList>

              <TabsContent value="problems" className="space-y-4">
                <div className="grid gap-4">
                  {mockContest.problems.map((problem) => (
                    <Card key={problem.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {getStatusIcon(problem.status)}
                            <div>
                              <h3 className="font-semibold text-lg">{problem.title}</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <Badge variant={getDifficultyColor(problem.difficulty)} className="text-xs">
                                  {problem.difficulty}
                                </Badge>
                                <span>{problem.points} points</span>
                                <span>
                                  {problem.solved}/{problem.attempted} solved
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/contests/${params.id}/problems/${problem.id}/view`)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => router.push(`/contests/${params.id}/problems/${problem.id}/solve`)}
                            >
                              <Code2 className="h-3 w-3 mr-1" />
                              {problem.status === "solved" ? "Solve Again" : "Solve"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="leaderboard" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Leaderboard</CardTitle>
                    <CardDescription>Real-time rankings updated every 30 seconds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {mockLeaderboard.map((entry) => (
                          <div
                            key={entry.rank}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                {entry.rank}
                              </div>
                              <div>
                                <div className="font-medium">{entry.username}</div>
                                <div className="text-sm text-muted-foreground">
                                  {entry.solved} problems solved • Last: {entry.lastSubmission}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">{entry.score}</div>
                              <div className="text-xs text-muted-foreground">points</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="submissions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Submissions</CardTitle>
                    <CardDescription>Track your progress and submission history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No submissions yet. Start solving problems to see your progress here!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
