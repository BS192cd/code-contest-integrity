"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { CreateContestModal } from "@/components/create-contest-modal"
import { ContestManagementTable } from "@/components/contest-management-table"
import { PlagiarismMonitor } from "@/components/plagiarism-monitor"
import { LiveContestMonitor } from "@/components/live-contest-monitor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Trophy,
  AlertTriangle,
  TrendingUp,
  Eye,
  Settings,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react"

const mockAdminStats = {
  totalStudents: 1247,
  activeContests: 8,
  pendingReviews: 23,
  flaggedSubmissions: 7,
  averageScore: 78.5,
  completionRate: 84.2,
  trends: {
    studentsGrowth: 12,
    contestParticipation: 8.5,
    scoreImprovement: 3.2,
  },
}

const mockRecentActivity = [
  {
    id: 1,
    type: "contest_created",
    message: "New contest 'Algorithm Sprint #45' created",
    timestamp: "2 minutes ago",
    user: "Prof. Johnson",
  },
  {
    id: 2,
    type: "plagiarism_detected",
    message: "High similarity detected in submission #12345",
    timestamp: "15 minutes ago",
    severity: "high",
  },
  {
    id: 3,
    type: "contest_ended",
    message: "Weekly Challenge #42 has ended with 156 participants",
    timestamp: "1 hour ago",
  },
  {
    id: 4,
    type: "grade_updated",
    message: "Manual grade adjustment for student alice_codes",
    timestamp: "2 hours ago",
    user: "Prof. Smith",
  },
]

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "contest_created":
        return <Trophy className="h-4 w-4 text-blue-400" />
      case "plagiarism_detected":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case "contest_ended":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "grade_updated":
        return <Settings className="h-4 w-4 text-yellow-400" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
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
                <h1 className="text-3xl font-bold text-balance">Teacher Dashboard</h1>
                <p className="text-muted-foreground mt-2 text-pretty">
                  Manage contests, monitor student progress, and oversee platform activities.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CreateContestModal />
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Reports
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Students</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{mockAdminStats.totalStudents.toLocaleString()}</div>
                  <div className="text-xs text-green-400 mt-1">+{mockAdminStats.trends.studentsGrowth}% this month</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Active Contests</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{mockAdminStats.activeContests}</div>
                  <div className="text-xs text-blue-400 mt-1">
                    +{mockAdminStats.trends.contestParticipation}% participation
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Pending Reviews</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{mockAdminStats.pendingReviews}</div>
                  <div className="text-xs text-yellow-400 mt-1">Requires attention</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Flagged Submissions</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{mockAdminStats.flaggedSubmissions}</div>
                  <div className="text-xs text-red-400 mt-1">High priority</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Tabs defaultValue="contests" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="contests">Contest Management</TabsTrigger>
                    <TabsTrigger value="plagiarism">Plagiarism Monitor</TabsTrigger>
                    <TabsTrigger value="live">Live Monitoring</TabsTrigger>
                    <TabsTrigger value="grades">Grade Management</TabsTrigger>
                  </TabsList>

                  <TabsContent value="contests" className="space-y-4">
                    <ContestManagementTable />
                  </TabsContent>

                  <TabsContent value="plagiarism" className="space-y-4">
                    <PlagiarismMonitor />
                  </TabsContent>

                  <TabsContent value="live" className="space-y-4">
                    <LiveContestMonitor />
                  </TabsContent>

                  <TabsContent value="grades" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Grade Management</CardTitle>
                        <CardDescription>Review and adjust student grades</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Grade management interface would go here</p>
                          <p className="text-sm mt-2">Bulk actions, manual overrides, and grade analytics</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Recent Activity Sidebar */}
              <div>
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest platform events and notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockRecentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-pretty">{activity.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                            {activity.user && (
                              <Badge variant="outline" className="text-xs">
                                {activity.user}
                              </Badge>
                            )}
                            {activity.severity === "high" && (
                              <Badge variant="destructive" className="text-xs">
                                High Priority
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full bg-transparent" size="sm">
                      View All Activity
                    </Button>
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">System Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Server Performance</span>
                        <span className="font-medium">98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Database Health</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Code Execution</span>
                        <span className="font-medium">99%</span>
                      </div>
                      <Progress value={99} className="h-2" />
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        All systems operational
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
