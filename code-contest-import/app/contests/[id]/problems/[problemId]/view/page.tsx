"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Code2, Clock, MemoryStick, ArrowLeft, Play, BookOpen, Target, Timer } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock contest and problem data
const mockContest = {
  id: 1,
  title: "Weekly Challenge #42",
  timeLeft: "2h 34m",
  status: "active" as const,
}

const mockProblem = {
  id: 1,
  title: "Dynamic Array Manipulation",
  difficulty: "Easy",
  category: "Array",
  points: 100,
  description: `Given an array of integers, implement a dynamic array that supports the following operations:

1. Insert an element at a specific index
2. Delete an element at a specific index  
3. Find the maximum element in the array
4. Sort the array in ascending order

Return the final state of the array after all operations.`,
  examples: [
    {
      input: "operations = [['insert', 0, 5], ['insert', 1, 3], ['insert', 2, 8], ['max'], ['sort']]",
      output: "[3, 5, 8]",
      explanation: "After inserting 5, 3, 8 at indices 0, 1, 2 respectively, max returns 8, then sort arranges in ascending order.",
    },
    {
      input: "operations = [['insert', 0, 1], ['insert', 1, 4], ['delete', 0], ['insert', 0, 7]]",
      output: "[7, 4]",
      explanation: "Insert 1, insert 4, delete element at index 0 (removes 1), insert 7 at index 0.",
    },
  ],
  constraints: [
    "1 ≤ operations.length ≤ 10⁴",
    "Each operation is valid",
    "-10⁹ ≤ element values ≤ 10⁹",
  ],
  hints: [
    "Think about how to efficiently handle insertions and deletions.",
    "Consider using a list or vector data structure.",
    "Remember that indices shift when elements are inserted or deleted."
  ],
  timeLimit: 2000,
  memoryLimit: 128
}

export default function ContestProblemViewPage() {
  const params = useParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const handleSolveProblem = () => {
    router.push(`/contests/${params.id}/problems/${params.problemId}/solve`)
  }

  const handleBackToContest = () => {
    router.push(`/contests/${params.id}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 border-green-400"
      case "Medium":
        return "text-yellow-400 border-yellow-400"
      case "Hard":
        return "text-red-400 border-red-400"
      default:
        return "text-muted-foreground border-muted-foreground"
    }
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Contest Header */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-primary">{mockContest.title}</h3>
                    <p className="text-sm text-muted-foreground">Contest Mode - Problem View</p>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <Timer className="h-4 w-4" />
                    <span className="font-mono font-medium">{mockContest.timeLeft}</span>
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={handleBackToContest}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{mockProblem.title}</h1>
                      <Badge variant="outline" className={cn("text-xs", getDifficultyColor(mockProblem.difficulty))}>
                        {mockProblem.difficulty}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {mockProblem.category}
                      </Badge>
                      <Badge variant="default" className="text-xs bg-primary">
                        {mockProblem.points} points
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {mockProblem.timeLimit}ms time limit
                      </div>
                      <div className="flex items-center gap-1">
                        <MemoryStick className="h-3 w-3" />
                        {mockProblem.memoryLimit}MB memory limit
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={handleSolveProblem}>
                  <Code2 className="h-4 w-4 mr-2" />
                  Start Solving
                </Button>
              </div>

              {/* Problem Content */}
              <Tabs defaultValue="problem" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="problem">Problem</TabsTrigger>
                  <TabsTrigger value="submissions">My Submissions</TabsTrigger>
                </TabsList>

                <TabsContent value="problem" className="space-y-6">
                  {/* Problem Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Problem Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="prose prose-neutral dark:prose-invert max-w-none">
                        <p className="whitespace-pre-line">{mockProblem.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Examples */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Examples</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {mockProblem.examples.map((example, index) => (
                        <div key={index}>
                          <h4 className="font-medium mb-3">Example {index + 1}:</h4>
                          <div className="grid gap-3">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">Input:</div>
                              <div className="bg-muted p-3 rounded-md font-mono text-sm">{example.input}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">Output:</div>
                              <div className="bg-muted p-3 rounded-md font-mono text-sm">{example.output}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">Explanation:</div>
                              <div className="text-sm">{example.explanation}</div>
                            </div>
                          </div>
                          {index < mockProblem.examples.length - 1 && <Separator className="mt-6" />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Constraints */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Constraints</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {mockProblem.constraints.map((constraint, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1.5">•</span>
                            <code className="text-sm">{constraint}</code>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Hints - Contest Mode Limited */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hints</CardTitle>
                      <CardDescription>Contest mode - hints available after 30 minutes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4 text-muted-foreground">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Hints will be available after 30 minutes into the contest</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="submissions">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Submissions</CardTitle>
                      <CardDescription>View your submission history for this contest problem</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <Code2 className="h-12 w-12 mx-auto mb-4" />
                        <p>No submissions yet</p>
                        <p className="text-sm">Start solving to see your submissions here</p>
                        <Button className="mt-4" onClick={handleSolveProblem}>
                          <Play className="h-4 w-4 mr-2" />
                          Start Solving
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}