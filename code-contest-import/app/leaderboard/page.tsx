"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { PerformanceChart } from "@/components/performance-chart"
import { StudentProfileCard } from "@/components/student-profile-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Search, Trophy, TrendingUp, Users, Target } from "lucide-react"

const mockLeaderboardData = [
  {
    rank: 1,
    userId: "user_1",
    username: "alice_codes",
    fullName: "Alice Johnson",
    avatar: "/diverse-user-avatars.png",
    score: 2850,
    problemsSolved: 45,
    contestsParticipated: 12,
    averageScore: 95.2,
    lastSubmission: "2 hours ago",
    streak: 15,
    badges: ["Top Performer", "Speed Demon"],
    performance: [
      { date: "2024-01-01", score: 2100 },
      { date: "2024-01-15", score: 2300 },
      { date: "2024-02-01", score: 2500 },
      { date: "2024-02-15", score: 2700 },
      { date: "2024-03-01", score: 2850 },
    ],
  },
  {
    rank: 2,
    userId: "user_2",
    username: "bob_dev",
    fullName: "Bob Smith",
    avatar: "/diverse-user-avatars.png",
    score: 2720,
    problemsSolved: 42,
    contestsParticipated: 10,
    averageScore: 91.8,
    lastSubmission: "1 hour ago",
    streak: 8,
    badges: ["Consistent Coder"],
    performance: [
      { date: "2024-01-01", score: 1950 },
      { date: "2024-01-15", score: 2150 },
      { date: "2024-02-01", score: 2350 },
      { date: "2024-02-15", score: 2550 },
      { date: "2024-03-01", score: 2720 },
    ],
  },
  {
    rank: 3,
    userId: "user_3",
    username: "charlie_algo",
    fullName: "Charlie Brown",
    avatar: "/diverse-user-avatars.png",
    score: 2650,
    problemsSolved: 38,
    contestsParticipated: 15,
    averageScore: 88.5,
    lastSubmission: "30 minutes ago",
    streak: 12,
    badges: ["Algorithm Master", "Contest Veteran"],
    performance: [
      { date: "2024-01-01", score: 1800 },
      { date: "2024-01-15", score: 2000 },
      { date: "2024-02-01", score: 2200 },
      { date: "2024-02-15", score: 2450 },
      { date: "2024-03-01", score: 2650 },
    ],
  },
  // Add more mock data...
]

const mockContests = [
  { id: 1, title: "Weekly Challenge #42", date: "2024-03-01" },
  { id: 2, title: "Algorithm Sprint", date: "2024-02-28" },
  { id: 3, title: "Monthly Championship", date: "2024-02-15" },
]

export default function LeaderboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContest, setSelectedContest] = useState("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState("20")

  const filteredData = mockLeaderboardData.filter(
    (student) =>
      student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleExportCSV = () => {
    const csvContent = [
      ["Rank", "Username", "Full Name", "Score", "Problems Solved", "Contests", "Average Score"],
      ...filteredData.map((student) => [
        student.rank,
        student.username,
        student.fullName,
        student.score,
        student.problemsSolved,
        student.contestsParticipated,
        student.averageScore,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "leaderboard.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-balance">Leaderboard & Analytics</h1>
                <p className="text-muted-foreground mt-2 text-pretty">
                  Track student performance and analyze competitive programming progress.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Students</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">1,247</div>
                  <div className="text-xs text-green-400 mt-1">+12% from last month</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Active Contests</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">8</div>
                  <div className="text-xs text-blue-400 mt-1">2 ending today</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Avg Score</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">78.5</div>
                  <div className="text-xs text-green-400 mt-1">+3.2% improvement</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Submissions</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">15,432</div>
                  <div className="text-xs text-green-400 mt-1">+8% this week</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedContest} onValueChange={setSelectedContest}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Select contest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contests</SelectItem>
                      {mockContests.map((contest) => (
                        <SelectItem key={contest.id} value={contest.id.toString()}>
                          {contest.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full lg:w-48 bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Date Range
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                    </PopoverContent>
                  </Popover>

                  <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                    <SelectTrigger className="w-full lg:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs defaultValue="leaderboard" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
                <TabsTrigger value="comparison">Student Comparison</TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <LeaderboardTable
                      data={filteredData}
                      itemsPerPage={Number.parseInt(itemsPerPage)}
                      onStudentSelect={setSelectedStudent}
                    />
                  </div>
                  <div>
                    {selectedStudent && (
                      <StudentProfileCard student={filteredData.find((s) => s.userId === selectedStudent)!} />
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Trends</CardTitle>
                      <CardDescription>Student progress over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PerformanceChart data={mockLeaderboardData.slice(0, 5)} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Score Distribution</CardTitle>
                      <CardDescription>Distribution of student scores</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        Score distribution chart would go here
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Contest Participation</CardTitle>
                    <CardDescription>Student engagement across different contests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Contest participation chart would go here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Comparison Tool</CardTitle>
                    <CardDescription>Compare performance between multiple students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {mockLeaderboardData.slice(0, 3).map((student) => (
                          <Badge key={student.userId} variant="secondary" className="px-3 py-1">
                            {student.username}
                          </Badge>
                        ))}
                        <Button variant="outline" size="sm">
                          + Add Student
                        </Button>
                      </div>

                      <div className="h-64 flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
                        Comparison chart would go here
                      </div>
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
