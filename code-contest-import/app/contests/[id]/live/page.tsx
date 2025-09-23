"use client"

import { RealTimeLeaderboard } from "@/components/real-time-leaderboard"
import { LiveSubmissionFeed } from "@/components/live-submission-feed"
import { ContestTimer } from "@/components/contest-timer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Code, Trophy, Activity } from "lucide-react"

export default function ContestLivePage({ params }: { params: { id: string } }) {
  const contestId = params.id

  // Mock contest data
  const contestData = {
    title: "Weekly Programming Challenge #42",
    participants: 156,
    totalSubmissions: 1247,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Started 2 hours ago
    endTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // Ends in 1 hour
    problems: 8,
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">{contestData.title}</h1>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
        <p className="text-muted-foreground">Real-time contest monitoring and live updates</p>
      </div>

      {/* Contest Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contestData.participants}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contestData.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Total attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contestData.problems}</div>
            <p className="text-xs text-muted-foreground">Available challenges</p>
          </CardContent>
        </Card>

        <ContestTimer startTime={contestData.startTime} endTime={contestData.endTime} />
      </div>

      {/* Live Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeLeaderboard contestId={contestId} />
        <LiveSubmissionFeed contestId={contestId} />
      </div>
    </div>
  )
}
