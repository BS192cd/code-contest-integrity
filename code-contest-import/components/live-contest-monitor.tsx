"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, Activity, Clock, Pause, Play, Square } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const mockLiveContests = [
  {
    id: 1,
    title: "Weekly Challenge #42",
    participants: 156,
    submissions: 234,
    timeLeft: "1h 23m",
    progress: 67,
    status: "active",
  },
  {
    id: 2,
    title: "Algorithm Sprint",
    participants: 89,
    submissions: 145,
    timeLeft: "45m",
    progress: 85,
    status: "active",
  },
]

const mockSubmissionActivity = [
  { time: "14:00", submissions: 12 },
  { time: "14:15", submissions: 28 },
  { time: "14:30", submissions: 45 },
  { time: "14:45", submissions: 38 },
  { time: "15:00", submissions: 52 },
  { time: "15:15", submissions: 41 },
  { time: "15:30", submissions: 35 },
]

export function LiveContestMonitor() {
  const [contests, setContests] = useState(mockLiveContests)
  const [submissionData, setSubmissionData] = useState(mockSubmissionActivity)
  const { toast } = useToast()

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setContests((prev) =>
        prev.map((contest) => ({
          ...contest,
          submissions: contest.submissions + Math.floor(Math.random() * 3),
          participants: contest.participants + (Math.random() > 0.8 ? 1 : 0),
        })),
      )

      // Update submission activity chart
      setSubmissionData((prev) => {
        const newData = [...prev]
        const lastEntry = newData[newData.length - 1]
        const currentTime = new Date()
        const timeStr = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, "0")}`

        newData.push({
          time: timeStr,
          submissions: Math.floor(Math.random() * 60) + 20,
        })

        return newData.slice(-7) // Keep only last 7 data points
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleContestAction = async (contestId: number, action: "pause" | "resume" | "end") => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setContests((prev) =>
        prev.map((contest) =>
          contest.id === contestId
            ? {
                ...contest,
                status: action === "end" ? "ended" : action === "pause" ? "paused" : "active",
              }
            : contest,
        ),
      )

      toast({
        title: `Contest ${action}${action === "end" ? "ed" : "d"}`,
        description: `The contest has been ${action}${action === "end" ? "ed" : "d"} successfully.`,
      })
    } catch (error) {
      toast({
        title: `Failed to ${action} contest`,
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Live Contest Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {contests.map((contest) => (
          <Card key={contest.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{contest.title}</CardTitle>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{contest.participants}</div>
                  <div className="text-xs text-muted-foreground">Participants</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{contest.submissions}</div>
                  <div className="text-xs text-muted-foreground">Submissions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{contest.timeLeft}</div>
                  <div className="text-xs text-muted-foreground">Time Left</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Contest Progress</span>
                  <span>{contest.progress}%</span>
                </div>
                <Progress value={contest.progress} className="h-2" />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContestAction(contest.id, contest.status === "active" ? "pause" : "resume")}
                >
                  {contest.status === "active" ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </>
                  )}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleContestAction(contest.id, "end")}>
                  <Square className="h-4 w-4 mr-1" />
                  End Contest
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submission Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Submission Activity</CardTitle>
          <CardDescription>Live submission trends across all active contests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={submissionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Participants</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {contests.reduce((sum, contest) => sum + contest.participants, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Submissions</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {contests.reduce((sum, contest) => sum + contest.submissions, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Response Time</span>
            </div>
            <div className="text-2xl font-bold mt-1">1.2s</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Success Rate</span>
            </div>
            <div className="text-2xl font-bold mt-1">94.5%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
