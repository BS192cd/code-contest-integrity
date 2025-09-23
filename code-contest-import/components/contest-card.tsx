"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, Trophy, Timer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Contest {
  id: number
  title: string
  description: string
  duration: string
  participants: number
  maxParticipants?: number
  status: "upcoming" | "active" | "ended"
  startTime?: string
  endTime?: string
  difficulty: "Easy" | "Medium" | "Hard" | "Expert"
  prize?: string
}

interface ContestCardProps {
  contest: Contest
}

export function ContestCard({ contest }: ContestCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [progress, setProgress] = useState<number>(0)
  const [isJoined, setIsJoined] = useState<boolean>(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (contest.status === "active" && contest.endTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const end = new Date(contest.endTime!).getTime()
        const distance = end - now

        if (distance > 0) {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)

          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)

          // Calculate progress (assuming 3 hour contest)
          const totalDuration = 3 * 60 * 60 * 1000 // 3 hours in ms
          const elapsed = totalDuration - distance
          setProgress((elapsed / totalDuration) * 100)
        } else {
          setTimeLeft("Contest Ended")
          setProgress(100)
        }
      }, 1000)

      return () => clearInterval(interval)
    } else if (contest.status === "upcoming" && contest.startTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const start = new Date(contest.startTime!).getTime()
        const distance = start - now

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24))
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h ${minutes}m`)
          } else {
            setTimeLeft(`${hours}h ${minutes}m`)
          }
        } else {
          setTimeLeft("Starting Soon")
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [contest.status, contest.endTime, contest.startTime])

  const handleJoinContest = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsJoined(true)
      toast({
        title: "Successfully joined!",
        description: `You've joined ${contest.title}. Good luck!`,
      })
    } catch (error) {
      toast({
        title: "Failed to join contest",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleContestAction = () => {
    if (contest.status === "active") {
      router.push(`/contest/${contest.id}`)
    } else if (contest.status === "ended") {
      router.push(`/contest/${contest.id}/results`)
    }
  }

  const handleViewLeaderboard = () => {
    router.push(`/contest/${contest.id}/leaderboard`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "secondary"
      case "Medium":
        return "default"
      case "Hard":
        return "destructive"
      case "Expert":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400"
      case "upcoming":
        return "text-blue-400"
      case "ended":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-balance">{contest.title}</CardTitle>
            <CardDescription className="mt-1 text-pretty">{contest.description}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getDifficultyColor(contest.difficulty)} className="text-xs">
              {contest.difficulty}
            </Badge>
            <div className={`text-xs font-medium ${getStatusColor(contest.status)}`}>
              {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{contest.participants}</span>
              {contest.maxParticipants && <span>/{contest.maxParticipants}</span>}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{contest.duration}</span>
            </div>
          </div>
          {contest.prize && (
            <div className="flex items-center gap-1 text-primary">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">{contest.prize}</span>
            </div>
          )}
        </div>

        {contest.status === "active" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time Remaining</span>
              <div className="flex items-center gap-1 font-mono text-primary">
                <Timer className="h-3 w-3" />
                {timeLeft}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {contest.status === "upcoming" && timeLeft && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Starts in</span>
            <div className="flex items-center gap-1 font-mono text-accent">
              <Timer className="h-3 w-3" />
              {timeLeft}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {contest.status === "upcoming" && (
            <Button className="flex-1" onClick={handleJoinContest} disabled={isJoined}>
              {isJoined ? "Joined" : "Join Contest"}
            </Button>
          )}
          {contest.status === "active" && (
            <Button className="flex-1" variant={isJoined ? "default" : "outline"} onClick={handleContestAction}>
              {isJoined ? "Continue Contest" : "Join Now"}
            </Button>
          )}
          {contest.status === "ended" && (
            <Button className="flex-1 bg-transparent" variant="outline" onClick={handleContestAction}>
              View Results
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleViewLeaderboard}>
            <Trophy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
