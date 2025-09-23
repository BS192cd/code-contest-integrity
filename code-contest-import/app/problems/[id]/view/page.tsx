"use client"

import { useParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmissionsList } from "@/components/submission-review"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Code2, Clock, MemoryStick, ArrowLeft, Play, BookOpen, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

interface ProblemDetails {
  _id: string
  title: string
  difficulty: string
  category?: string
  description?: string
  statement?: string
  constraints?: string
  examples?: { input: string; output: string; explanation?: string }[]
  hints?: { level?: number; content: string }[] | string[]
  editorialUrl?: string | null
  statistics?: { acceptanceRate?: number }
  timeLimit?: number
  memoryLimit?: number
}

export default function ProblemViewPage() {
  const params = useParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [problem, setProblem] = useState<ProblemDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const load = async () => {
      if (!params?.id) return
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.getProblem(String(params.id))
        if (res.success) {
          setProblem(res.data as any)
        } else {
          throw new Error(res.error || 'Failed to load problem')
        }
      } catch (e: any) {
        console.error(e)
        setError(e.message || 'Failed to load problem')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params?.id])
  
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
                      <h1 className="text-2xl font-bold">{problem?.title || (loading ? 'Loading...' : 'Problem')}</h1>
                      {problem?.difficulty && (
                        <Badge variant="outline" className={cn("text-xs", getDifficultyColor(problem.difficulty))}>
                          {problem.difficulty}
                      </Badge>
                      )}
                      {problem?.category && (
                      <Badge variant="secondary" className="text-xs">
                          {problem.category}
                      </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {typeof problem?.statistics?.acceptanceRate === 'number' ? `${Math.round(problem.statistics.acceptanceRate)}% acceptance rate` : '—'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {problem?.timeLimit ? `${problem.timeLimit}ms time limit` : '—'}
                      </div>
                      <div className="flex items-center gap-1">
                        <MemoryStick className="h-3 w-3" />
                        {problem?.memoryLimit ? `${problem.memoryLimit}MB memory limit` : '—'}
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
                        <p className="whitespace-pre-line">{problem?.description || problem?.statement}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Examples */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Examples</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {(problem?.examples || []).map((example, index) => (
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
                          {index < (problem?.examples?.length || 0) - 1 && <Separator className="mt-6" />}
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
                        {(problem?.constraints ? String(problem.constraints).split('\n') : []).map((constraint, index) => (
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
                      {(Array.isArray(problem?.hints) ? (problem!.hints as any[]) : []).map((hint: any, index: number) => (
                        <details key={index} className="group">
                          <summary className="cursor-pointer hover:text-primary transition-colors">
                            <span className="font-medium">Hint {index + 1}</span>
                          </summary>
                          <div className="mt-2 text-sm text-muted-foreground pl-4 border-l-2 border-muted">
                            {typeof hint === 'string' ? hint : hint.content}
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
                        {problem?.editorialUrl ? (
                          <a href={problem.editorialUrl} target="_blank" rel="noreferrer" className="text-primary underline">View editorial</a>
                        ) : (
                          <div className="text-muted-foreground">No editorial available.</div>
                        )}
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
                      <SubmissionsList problemId={String(params.id)} onSolveClick={handleSolveProblem} />
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