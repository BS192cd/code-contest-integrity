"use client"

import { useState, useEffect } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, Clock, Code } from "lucide-react"
import { cn } from "@/lib/utils"

interface Submission {
  id: string
  studentName: string
  studentAvatar?: string
  problemTitle: string
  language: string
  status: "accepted" | "wrong_answer" | "time_limit" | "runtime_error" | "pending"
  score: number
  timestamp: string
  executionTime?: number
}

interface LiveSubmissionFeedProps {
  contestId: string
  className?: string
}

export function LiveSubmissionFeed({ contestId, className }: LiveSubmissionFeedProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])

  const { isConnected } = useWebSocket(`ws://localhost:3001/contest/${contestId}/submissions`, {
    onMessage: (data) => {
      if (data.type === "new_submission") {
        setSubmissions((prev) => [data.submission, ...prev.slice(0, 19)]) // Keep last 20
      }
    },
  })

  // Mock initial submissions
  useEffect(() => {
    const mockSubmissions: Submission[] = [
      {
        id: "1",
        studentName: "Alice Johnson",
        studentAvatar: "/placeholder.svg?height=32&width=32",
        problemTitle: "Two Sum",
        language: "Python",
        status: "accepted",
        score: 100,
        timestamp: "2 min ago",
        executionTime: 45,
      },
      {
        id: "2",
        studentName: "Bob Smith",
        studentAvatar: "/placeholder.svg?height=32&width=32",
        problemTitle: "Binary Search",
        language: "JavaScript",
        status: "wrong_answer",
        score: 0,
        timestamp: "3 min ago",
        executionTime: 120,
      },
      {
        id: "3",
        studentName: "Carol Davis",
        studentAvatar: "/placeholder.svg?height=32&width=32",
        problemTitle: "Merge Sort",
        language: "Java",
        status: "accepted",
        score: 85,
        timestamp: "5 min ago",
        executionTime: 200,
      },
      {
        id: "4",
        studentName: "David Wilson",
        studentAvatar: "/placeholder.svg?height=32&width=32",
        problemTitle: "Graph Traversal",
        language: "C++",
        status: "time_limit",
        score: 30,
        timestamp: "7 min ago",
      },
      {
        id: "5",
        studentName: "Eve Brown",
        studentAvatar: "/placeholder.svg?height=32&width=32",
        problemTitle: "Dynamic Programming",
        language: "Python",
        status: "pending",
        score: 0,
        timestamp: "8 min ago",
      },
    ]
    setSubmissions(mockSubmissions)
  }, [])

  const getStatusIcon = (status: Submission["status"]) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "wrong_answer":
      case "runtime_error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "time_limit":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Code className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: Submission["status"]) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "wrong_answer":
      case "runtime_error":
        return "bg-red-100 text-red-800 border-red-200"
      case "time_limit":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: Submission["status"]) => {
    switch (status) {
      case "accepted":
        return "Accepted"
      case "wrong_answer":
        return "Wrong Answer"
      case "time_limit":
        return "Time Limit"
      case "runtime_error":
        return "Runtime Error"
      case "pending":
        return "Judging..."
      default:
        return "Unknown"
    }
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Live Submissions
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
          <span className="text-sm text-muted-foreground">{submissions.length} submissions</span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={submission.studentAvatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {submission.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium truncate">{submission.studentName}</h4>
                    <span className="text-xs text-muted-foreground">{submission.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="truncate">{submission.problemTitle}</span>
                    <Badge variant="outline" className="text-xs">
                      {submission.language}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(submission.status)}
                  <Badge className={getStatusColor(submission.status)}>{getStatusText(submission.status)}</Badge>
                  {submission.status === "accepted" && <Badge variant="outline">{submission.score}pts</Badge>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
