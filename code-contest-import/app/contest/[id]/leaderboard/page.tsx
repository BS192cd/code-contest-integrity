"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal, Award, RefreshCw, Clock, User } from "lucide-react"
import Link from "next/link"

export default function ContestLeaderboardPage({ params }: { params: { id: string } }) {
  const [isLive, setIsLive] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: "Alice Johnson", score: 280, solved: 2, lastSubmission: "5m ago", status: "active" },
    { rank: 2, name: "Bob Smith", score: 250, solved: 2, lastSubmission: "12m ago", status: "active" },
    { rank: 3, name: "Carol Davis", score: 200, solved: 1, lastSubmission: "8m ago", status: "active" },
    { rank: 4, name: "David Wilson", score: 180, solved: 1, lastSubmission: "15m ago", status: "idle" },
    { rank: 5, name: "Eve Brown", score: 150, solved: 1, lastSubmission: "20m ago", status: "idle" },
    { rank: 6, name: "Frank Miller", score: 120, solved: 1, lastSubmission: "25m ago", status: "idle" },
    { rank: 7, name: "Grace Lee", score: 100, solved: 1, lastSubmission: "30m ago", status: "active" },
    { rank: 8, name: "Henry Chen", score: 80, solved: 0, lastSubmission: "35m ago", status: "idle" },
  ])

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setLastUpdated(new Date())
        // Simulate minor score changes
        setLeaderboard((prev) =>
          prev
            .map((participant) => ({
              ...participant,
              score: participant.score + Math.floor(Math.random() * 10) - 5,
            }))
            .sort((a, b) => b.score - a.score)
            .map((participant, index) => ({
              ...participant,
              rank: index + 1,
            })),
        )
      }, 30000) // Update every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isLive])

  const refreshLeaderboard = () => {
    setLastUpdated(new Date())
    // Simulate refresh
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Live Leaderboard</h1>
              <p className="text-muted-foreground">Weekly Programming Challenge #1</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isLive ? "default" : "secondary"} className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                {isLive ? "Live" : "Paused"}
              </Badge>
              <Button variant="outline" size="sm" onClick={refreshLeaderboard}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Participants</p>
                  <p className="text-2xl font-bold">{leaderboard.filter((p) => p.status === "active").length}</p>
                </div>
                <User className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold">{leaderboard.length}</p>
                </div>
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time Remaining</p>
                  <p className="text-2xl font-bold">1h 23m</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-bold">{lastUpdated.toLocaleTimeString()}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Current Rankings
            </CardTitle>
            <CardDescription>Live updates every 30 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Problems Solved</TableHead>
                  <TableHead>Last Submission</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((participant) => (
                  <TableRow key={participant.name} className={participant.status === "active" ? "bg-green-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {participant.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {participant.rank === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                        {participant.rank === 3 && <Award className="h-4 w-4 text-amber-600" />}#{participant.rank}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{participant.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{participant.score} pts</Badge>
                    </TableCell>
                    <TableCell>{participant.solved}/3</TableCell>
                    <TableCell className="text-muted-foreground">{participant.lastSubmission}</TableCell>
                    <TableCell>
                      <Badge variant={participant.status === "active" ? "default" : "secondary"}>
                        {participant.status === "active" ? "Active" : "Idle"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Link href={`/contest/${params.id}`}>
            <Button variant="outline">Back to Contest</Button>
          </Link>
          <Link href={`/contest/${params.id}/results`}>
            <Button>View Final Results</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
