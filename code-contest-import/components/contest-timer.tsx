"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Square } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContestTimerProps {
  startTime: string
  endTime: string
  className?: string
}

export function ContestTimer({ startTime, endTime, className }: ContestTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
    total: number
  }>({ hours: 0, minutes: 0, seconds: 0, total: 0 })

  const [status, setStatus] = useState<"upcoming" | "active" | "ended">("upcoming")

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const start = new Date(startTime).getTime()
      const end = new Date(endTime).getTime()

      if (now < start) {
        // Contest hasn't started
        const diff = start - now
        setStatus("upcoming")
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          total: diff,
        })
      } else if (now < end) {
        // Contest is active
        const diff = end - now
        setStatus("active")
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          total: diff,
        })
      } else {
        // Contest has ended
        setStatus("ended")
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 })
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [startTime, endTime])

  const getStatusIcon = () => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4" />
      case "active":
        return <Play className="h-4 w-4" />
      case "ended":
        return <Square className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "ended":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "upcoming":
        return "Starts in"
      case "active":
        return "Time remaining"
      case "ended":
        return "Contest ended"
    }
  }

  const formatTime = (value: number) => value.toString().padStart(2, "0")

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
          {status === "active" &&
            timeLeft.total < 300000 && ( // Last 5 minutes
              <Badge variant="destructive" className="animate-pulse">
                Final Minutes!
              </Badge>
            )}
        </div>

        {status !== "ended" && (
          <div className="flex items-center justify-center gap-2 text-2xl font-mono font-bold">
            <div className="text-center">
              <div
                className={cn(
                  "text-3xl",
                  status === "active" && timeLeft.total < 300000 && "text-red-600 animate-pulse",
                )}
              >
                {formatTime(timeLeft.hours)}
              </div>
              <div className="text-xs text-muted-foreground">HRS</div>
            </div>
            <div className="text-muted-foreground">:</div>
            <div className="text-center">
              <div
                className={cn(
                  "text-3xl",
                  status === "active" && timeLeft.total < 300000 && "text-red-600 animate-pulse",
                )}
              >
                {formatTime(timeLeft.minutes)}
              </div>
              <div className="text-xs text-muted-foreground">MIN</div>
            </div>
            <div className="text-muted-foreground">:</div>
            <div className="text-center">
              <div
                className={cn(
                  "text-3xl",
                  status === "active" && timeLeft.total < 300000 && "text-red-600 animate-pulse",
                )}
              >
                {formatTime(timeLeft.seconds)}
              </div>
              <div className="text-xs text-muted-foreground">SEC</div>
            </div>
          </div>
        )}

        {status === "ended" && (
          <div className="text-center text-muted-foreground">
            <Square className="h-8 w-8 mx-auto mb-2" />
            <p>Contest has concluded</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
