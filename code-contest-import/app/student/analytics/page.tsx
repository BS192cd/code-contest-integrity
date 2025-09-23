"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Trophy, Target, Clock, Code, TrendingUp, Award } from "lucide-react"

const performanceData = [
  { date: "2024-01", score: 65, problems: 12 },
  { date: "2024-02", score: 72, problems: 18 },
  { date: "2024-03", score: 78, problems: 24 },
  { date: "2024-04", score: 85, problems: 32 },
  { date: "2024-05", score: 88, problems: 38 },
  { date: "2024-06", score: 92, problems: 45 },
]

const languageData = [
  { name: "Python", value: 45, color: "#3776ab" },
  { name: "JavaScript", value: 25, color: "#f7df1e" },
  { name: "Java", value: 20, color: "#ed8b00" },
  { name: "C++", value: 10, color: "#00599c" },
]

const difficultyData = [
  { difficulty: "Easy", solved: 28, total: 35 },
  { difficulty: "Medium", solved: 15, total: 25 },
  { difficulty: "Hard", solved: 5, total: 15 },
]

export default function StudentAnalyticsPage() {
  const { data: studentStats, isLoading } = useQuery({
    queryKey: ["student-analytics"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        totalProblems: 48,
        contestsParticipated: 12,
        averageScore: 88,
        currentRank: 15,
        totalStudents: 150,
        streak: 7,
        achievements: [
          { name: "First Contest", icon: "🏆", date: "2024-01-15" },
          { name: "Problem Solver", icon: "🧩", date: "2024-02-20" },
          { name: "Speed Demon", icon: "⚡", date: "2024-03-10" },
          { name: "Consistency King", icon: "👑", date: "2024-04-05" },
        ],
      }
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Analytics</h1>
        <p className="text-muted-foreground">Track your coding progress and performance insights</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats?.totalProblems}</div>
            <p className="text-xs text-muted-foreground">+5 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{studentStats?.currentRank}</div>
            <p className="text-xs text-muted-foreground">out of {studentStats?.totalStudents} students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats?.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats?.streak} days</div>
            <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Your score progression over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Language Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Language Usage</CardTitle>
            <CardDescription>Distribution of programming languages used</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Difficulty Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Problem Difficulty Progress</CardTitle>
            <CardDescription>Your progress across different difficulty levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {difficultyData.map((item) => (
              <div key={item.difficulty} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.difficulty}</span>
                  <span className="text-muted-foreground">
                    {item.solved}/{item.total}
                  </span>
                </div>
                <Progress value={(item.solved / item.total) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentStats?.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Earned on {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    <Award className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
