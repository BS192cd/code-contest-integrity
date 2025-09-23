"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ContestCard } from "@/components/contest-card"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Clock, TrendingUp } from "lucide-react"

const mockContests = [
  {
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
  },
  {
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
  },
  {
    id: 3,
    title: "Monthly Championship",
    description: "The ultimate coding competition with challenging problems across all domains.",
    duration: "4 hours",
    participants: 0,
    maxParticipants: 1000,
    status: "upcoming" as const,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    difficulty: "Expert" as const,
    prize: "$2000",
  },
  {
    id: 4,
    title: "Beginner Bootcamp",
    description: "Perfect for newcomers to competitive programming. Learn the basics!",
    duration: "2 hours",
    participants: 0,
    maxParticipants: 300,
    status: "upcoming" as const,
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty: "Easy" as const,
  },
  {
    id: 5,
    title: "Data Structures Deep Dive",
    description: "Advanced problems focusing on trees, graphs, and complex data structures.",
    duration: "3 hours",
    participants: 234,
    status: "ended" as const,
    difficulty: "Hard" as const,
    prize: "$750",
  },
]

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-6 md:ml-0">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-balance">Student Dashboard</h1>
                <p className="text-muted-foreground mt-2 text-pretty">
                  Join live contests, practice problems, and compete with developers worldwide.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contests Joined</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">89</div>
                    <p className="text-xs text-muted-foreground">+12 from last week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">#247</div>
                    <p className="text-xs text-muted-foreground">↑15 positions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7 days</div>
                    <p className="text-xs text-muted-foreground">Keep it up!</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-3 mb-8">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Weekly Progress</CardTitle>
                    <CardDescription>Your coding activity this week</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Problems Solved</span>
                        <span>12/15</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Contest Participation</span>
                        <span>2/3</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Study Time</span>
                        <span>8.5/10 hours</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>Recent milestones</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        🏆
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">First Place</p>
                        <p className="text-xs text-muted-foreground">Weekly Challenge #41</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        🎯
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">Problem Solver</p>
                        <p className="text-xs text-muted-foreground">Solved 50+ problems</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        🔥
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">Streak Master</p>
                        <p className="text-xs text-muted-foreground">7-day study streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Available Contests</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockContests.map((contest) => (
                  <ContestCard key={contest.id} contest={contest} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
