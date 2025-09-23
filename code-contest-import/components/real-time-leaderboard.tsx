"use client"

import { useState, useEffect } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  id: string
  name: string
  score: number
  rank: number
  previousRank: number
  avatar?: string
  lastSubmission: string
  problemsSolved: number
}

interface RealTimeLeaderboardProps {
  contestId: string
  className?: string
}

export function RealTimeLeaderboard({ contestId, className }: RealTimeLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [updates, setUpdates] = useState<string[]>([])

  const { isConnected, lastMessage } = useWebSocket(`ws://localhost:3001/contest/${contestId}/leaderboard`, {
    onMessage: (data) => {
      if (data.type === "leaderboard_update") {
        setLeaderboard(data.leaderboard)
        setUpdates((prev) => [`${data.student} submitted solution - Rank changed!`, ...prev.slice(0, 4)])
      }
    },
  })

  // Mock initial data
  useEffect(() => {
    setLeaderboard([
      {
        id: "1",
        name: "Alice Johnson",
        score: 2850,
        rank: 1,
        previousRank: 2,
        avatar: "/placeholder.svg?height=32&width=32",
        lastSubmission: "2 min ago",
        problemsSolved: 8,
      },
      {
        id: "2",
        name: "Bob Smith",
        score: 2720,
        rank: 2,
        previousRank: 1,
        avatar: "/placeholder.svg?height=32&width=32",
        lastSubmission: "5 min ago",
        problemsSolved: 7,
      },
      {
        id: "3",
        name: "Carol Davis",
        score: 2650,
        rank: 3,
        previousRank: 3,
        avatar: "/placeholder.svg?height=32&width=32",
        lastSubmission: "8 min ago",
        problemsSolved: 7,
      },
      {
        id: "4",
        name: "David Wilson",
        score: 2580,
        rank: 4,
        previousRank: 5,
        avatar: "/placeholder.svg?height=32&width=32",
        lastSubmission: "12 min ago",
        problemsSolved: 6,
      },
      {
        id: "5",
        name: "Eve Brown",
        score: 2520,
        rank: 5,
        previousRank: 4,
        avatar: "/placeholder.svg?height=32&width=32",
        lastSubmission: "15 min ago",
        problemsSolved: 6,
      },
    ])
  }, [])

  const getRankChangeIcon = (current: number, previous: number) => {
    if (current < previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (current > previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getRankChangeColor = (current: number, previous: number) => {
    if (current < previous) return "text-green-600"
    if (current > previous) return "text-red-600"
    return "text-muted-foreground"
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Live Leaderboard
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
          <span className="text-sm text-muted-foreground">{isConnected ? "Live" : "Disconnected"}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recent Updates */}
        {updates.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-2">Recent Updates</h4>
            <div className="space-y-1">
              {updates.map((update, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  • {update}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-300",
                index === 0 && "bg-yellow-50 border-yellow-200",
                index === 1 && "bg-gray-50 border-gray-200",
                index === 2 && "bg-orange-50 border-orange-200",
              )}
            >
              <div className="flex items-center gap-2 min-w-[60px]">
                <span
                  className={cn(
                    "font-bold text-lg",
                    index === 0 && "text-yellow-600",
                    index === 1 && "text-gray-600",
                    index === 2 && "text-orange-600",
                  )}
                >
                  #{entry.rank}
                </span>
                {getRankChangeIcon(entry.rank, entry.previousRank)}
              </div>

              <Avatar className="h-8 w-8">
                <AvatarImage src={entry.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {entry.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{entry.name}</h4>
                  <Badge variant="outline">{entry.score} pts</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{entry.problemsSolved} problems solved</span>
                  <span>{entry.lastSubmission}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
