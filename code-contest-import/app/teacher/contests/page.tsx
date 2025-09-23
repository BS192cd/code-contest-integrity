"use client"

import { useState } from "react"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Eye, Edit, Trash2, Users, Clock, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"

const mockContests = [
  {
    id: 1,
    title: "Data Structures Quiz",
    status: "active",
    participants: 45,
    totalStudents: 60,
    endTime: "2h 15m",
    submissions: 38,
    avgScore: 78,
    createdAt: "2024-03-15",
    duration: "3 hours",
  },
  {
    id: 2,
    title: "Algorithm Challenge",
    status: "upcoming",
    participants: 0,
    totalStudents: 60,
    startTime: "Tomorrow 2:00 PM",
    submissions: 0,
    avgScore: 0,
    createdAt: "2024-03-14",
    duration: "2 hours",
  },
  {
    id: 3,
    title: "Final Exam Practice",
    status: "ended",
    participants: 58,
    totalStudents: 60,
    submissions: 58,
    avgScore: 85,
    createdAt: "2024-03-10",
    duration: "4 hours",
  },
  {
    id: 4,
    title: "Midterm Review",
    status: "draft",
    participants: 0,
    totalStudents: 0,
    submissions: 0,
    avgScore: 0,
    createdAt: "2024-03-12",
    duration: "2.5 hours",
  },
]

export default function TeacherContestsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleCreateContest = () => {
    router.push("/teacher/contests/create")
  }

  const handleViewContest = (contestId: number) => {
    router.push(`/teacher/contests/${contestId}`)
  }

  const handleEditContest = (contestId: number) => {
    router.push(`/teacher/contests/${contestId}/edit`)
  }

  const filteredContests = mockContests.filter((contest) =>
    contest.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeContests = filteredContests.filter((c) => c.status === "active")
  const upcomingContests = filteredContests.filter((c) => c.status === "upcoming")
  const endedContests = filteredContests.filter((c) => c.status === "ended")
  const draftContests = filteredContests.filter((c) => c.status === "draft")

  const ContestCard = ({ contest }: { contest: (typeof mockContests)[0] }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {contest.title}
              <Badge
                variant={
                  contest.status === "active"
                    ? "default"
                    : contest.status === "upcoming"
                      ? "secondary"
                      : contest.status === "ended"
                        ? "outline"
                        : "destructive"
                }
              >
                {contest.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              Created on {new Date(contest.createdAt).toLocaleDateString()} • Duration: {contest.duration}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleViewContest(contest.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleEditContest(contest.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {contest.participants}/{contest.totalStudents}
              </p>
              <p className="text-xs text-muted-foreground">Participants</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{contest.submissions}</p>
              <p className="text-xs text-muted-foreground">Submissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{contest.avgScore}%</p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {contest.status === "active"
                  ? contest.endTime
                  : contest.status === "upcoming"
                    ? contest.startTime
                    : contest.status === "ended"
                      ? "Completed"
                      : "Draft"}
              </p>
              <p className="text-xs text-muted-foreground">Status</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

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
                  <h1 className="text-3xl font-bold text-balance">Contest Management</h1>
                  <p className="text-muted-foreground mt-2 text-pretty">
                    Create, manage, and monitor your coding contests.
                  </p>
                </div>
                <Button onClick={handleCreateContest}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Contest
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="all">All ({filteredContests.length})</TabsTrigger>
                  <TabsTrigger value="active">Active ({activeContests.length})</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming ({upcomingContests.length})</TabsTrigger>
                  <TabsTrigger value="ended">Ended ({endedContests.length})</TabsTrigger>
                  <TabsTrigger value="drafts">Drafts ({draftContests.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {filteredContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                  {activeContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                  {upcomingContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </TabsContent>

                <TabsContent value="ended" className="space-y-4">
                  {endedContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </TabsContent>

                <TabsContent value="drafts" className="space-y-4">
                  {draftContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
