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
import { Code2, Clock, MemoryStick, ArrowLeft, Play, BookOpen, Target } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock problem data - in real app, this would come from API
const mockProblem = {
  id: 1,
  title: "Two Sum",
  difficulty: "Easy",
  category: "Array",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
  ],
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "-10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists.",
  ],
  hints: [
    "A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.",
    "So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter. Can we change our array somehow so that this search becomes faster?",
    "The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?"
  ],
  editorial: `The Two Sum problem is a classic algorithmic challenge that demonstrates the power of hash tables.

**Approach 1: Brute Force**
The brute force approach is to try every possible pair of numbers. For each element, check if there exists another element that adds up to the target.

Time Complexity: O(n²)
Space Complexity: O(1)

**Approach 2: Hash Table (Optimal)**
We can solve this in one pass using a hash table. For each element, we check if the complement (target - current element) exists in the hash table.

Time Complexity: O(n)
Space Complexity: O(n)

This optimization reduces the lookup time from O(n) to O(1) by trading space for time.`,
  submissions: {
    total: 2847,
    accepted: 1923,
    acceptanceRate: 67.5
  },
  timeLimit: 2000, // ms
  memoryLimit: 128 // MB
}

export default function ProblemViewPage() {
  const params = useParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const handleSolveProblem = () => {
    router.push(`/problems/${params.id}/solve`)
  }

  const handleBackToProblems = () => {
    router.push('/problems')
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
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={handleBackToProblems}>
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
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {mockProblem.submissions.acceptanceRate}% acceptance rate
                      </div>
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
                  <TabsTrigger value="editorial">Editorial</TabsTrigger>
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

                  {/* Hints */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hints</CardTitle>
                      <CardDescription>Click to reveal hints when you need them</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mockProblem.hints.map((hint, index) => (
                        <details key={index} className="group">
                          <summary className="cursor-pointer hover:text-primary transition-colors">
                            <span className="font-medium">Hint {index + 1}</span>
                          </summary>
                          <div className="mt-2 text-sm text-muted-foreground pl-4 border-l-2 border-muted">
                            {hint}
                          </div>
                        </details>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="editorial" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Editorial Solution</CardTitle>
                      <CardDescription>Learn the optimal approach to solve this problem</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-neutral dark:prose-invert max-w-none">
                        <div className="whitespace-pre-line">{mockProblem.editorial}</div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="submissions">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Submissions</CardTitle>
                      <CardDescription>View your submission history for this problem</CardDescription>
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