"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, Flame, ExternalLink } from "lucide-react"

interface Student {
  rank: number
  userId: string
  username: string
  fullName: string
  avatar: string
  score: number
  problemsSolved: number
  contestsParticipated: number
  averageScore: number
  lastSubmission: string
  streak: number
  badges: string[]
}

interface StudentProfileCardProps {
  student: Student
}

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  const progressToNextRank = ((student.score % 1000) / 1000) * 100

  return (
    <Card className="sticky top-6">
      <CardHeader className="text-center">
        <Avatar className="h-16 w-16 mx-auto mb-2">
          <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.fullName} />
          <AvatarFallback className="text-lg">
            {student.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-lg">{student.fullName}</CardTitle>
        <CardDescription>@{student.username}</CardDescription>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="font-bold text-primary">Rank #{student.rank}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress to next rank</span>
            <span className="font-medium">{Math.round(progressToNextRank)}%</span>
          </div>
          <Progress value={progressToNextRank} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{student.score.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Score</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{student.problemsSolved}</div>
            <div className="text-xs text-muted-foreground">Problems Solved</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{student.averageScore.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Average Score</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{student.contestsParticipated}</div>
            <div className="text-xs text-muted-foreground">Contests</div>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium">Current Streak</span>
          </div>
          <div className="text-lg font-bold text-orange-500">{student.streak} days</div>
        </div>

        {/* Badges */}
        {student.badges.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Achievements</div>
            <div className="flex flex-wrap gap-1">
              {student.badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Recent Activity</div>
          <div className="text-sm text-muted-foreground">Last submission: {student.lastSubmission}</div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button className="w-full" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Profile
          </Button>
          <Button variant="outline" className="w-full bg-transparent" size="sm">
            <Target className="h-4 w-4 mr-2" />
            Compare Performance
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
