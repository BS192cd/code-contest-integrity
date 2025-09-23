"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, XCircle, User, Clock, Code, MessageSquare, RotateCcw, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Submission {
  id: string
  userId: string
  username: string
  problemId: number
  problemTitle: string
  contestId?: number
  contestTitle?: string
  language: string
  code: string
  status: "accepted" | "wrong_answer" | "time_limit" | "runtime_error"
  score: number
  submissionTime: string
  executionTime: string
  memory: string
  plagiarismScore: number
  testCases: {
    id: number
    status: "passed" | "failed"
    input: string
    expectedOutput: string
    actualOutput: string
    executionTime: string
  }[]
  similarSubmissions?: {
    id: string
    username: string
    similarity: number
    matchedLines: number[]
  }[]
}

interface SubmissionReviewProps {
  submission: Submission
}

export function SubmissionReview({ submission }: SubmissionReviewProps) {
  const [comment, setComment] = useState("")
  const [manualScore, setManualScore] = useState(submission.score.toString())
  const [isRerunning, setIsRerunning] = useState(false)
  const { toast } = useToast()

  const handleRerun = async () => {
    setIsRerunning(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      toast({
        title: "Tests re-run successfully",
        description: "Submission has been re-evaluated with updated test cases.",
      })
    } catch (error) {
      toast({
        title: "Failed to re-run tests",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsRerunning(false)
    }
  }

  const handleRegrade = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Score updated",
        description: `Manual score of ${manualScore} has been applied.`,
      })
    } catch (error) {
      toast({
        title: "Failed to update score",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({
        title: "Comment added",
        description: "Your feedback has been saved.",
      })
      setComment("")
    } catch (error) {
      toast({
        title: "Failed to add comment",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "wrong_answer":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "time_limit":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "runtime_error":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "text-green-400"
      case "wrong_answer":
        return "text-red-400"
      case "time_limit":
        return "text-yellow-400"
      case "runtime_error":
        return "text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getPlagiarismSeverity = (score: number) => {
    if (score >= 80) return { color: "destructive", label: "High Risk" }
    if (score >= 50) return { color: "default", label: "Medium Risk" }
    if (score >= 20) return { color: "secondary", label: "Low Risk" }
    return { color: "outline", label: "No Risk" }
  }

  const plagiarismSeverity = getPlagiarismSeverity(submission.plagiarismScore)

  return (
    <div className="space-y-6">
      {/* Submission Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(submission.status)}
                Submission #{submission.id}
              </CardTitle>
              <CardDescription>
                {submission.problemTitle} • {submission.contestTitle && `${submission.contestTitle} • `}
                Submitted {submission.submissionTime}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{submission.language}</Badge>
              <Badge className={getStatusColor(submission.status)}>
                {submission.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Student</div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {submission.username}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-lg font-bold text-primary">{submission.score}/100</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Execution Time</div>
              <div>{submission.executionTime}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Memory</div>
              <div>{submission.memory}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="code" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="code">Code Review</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="plagiarism">Plagiarism Analysis</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Submitted Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm font-mono overflow-x-auto">
                  <code>{submission.code}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Case Results</CardTitle>
              <CardDescription>
                {submission.testCases.filter((tc) => tc.status === "passed").length}/{submission.testCases.length} test
                cases passed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {submission.testCases.map((testCase) => (
                    <div key={testCase.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {testCase.status === "passed" ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span className="font-medium">Test Case {testCase.id}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{testCase.executionTime}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="font-medium mb-1">Input:</div>
                          <pre className="bg-background p-2 rounded border font-mono">{testCase.input}</pre>
                        </div>
                        <div>
                          <div className="font-medium mb-1">Expected:</div>
                          <pre className="bg-background p-2 rounded border font-mono">{testCase.expectedOutput}</pre>
                        </div>
                        <div>
                          <div className="font-medium mb-1">Actual:</div>
                          <pre
                            className={`p-2 rounded border font-mono ${
                              testCase.status === "passed"
                                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                                : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                            }`}
                          >
                            {testCase.actualOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plagiarism" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Plagiarism Analysis</span>
                <Badge variant={plagiarismSeverity.color}>{plagiarismSeverity.label}</Badge>
              </CardTitle>
              <CardDescription>Similarity analysis with other submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Similarity Score</span>
                  <span className="text-sm font-bold">{submission.plagiarismScore}%</span>
                </div>
                <Progress value={submission.plagiarismScore} className="h-2" />
              </div>

              {submission.similarSubmissions && submission.similarSubmissions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Similar Submissions</h4>
                  {submission.similarSubmissions.map((similar) => (
                    <div key={similar.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{similar.username}</div>
                          <div className="text-sm text-muted-foreground">
                            {similar.matchedLines.length} matching lines
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{similar.similarity}%</div>
                          <Button variant="outline" size="sm" className="mt-1 bg-transparent">
                            Compare
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {submission.plagiarismScore >= 50 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">High Similarity Detected</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This submission shows significant similarity to other submissions. Manual review is recommended.
                  </p>
                  <Button variant="destructive" size="sm" className="mt-3">
                    Report as Plagiarism
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Re-evaluate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleRerun} disabled={isRerunning} className="w-full">
                  {isRerunning ? "Re-running Tests..." : "Re-run Tests"}
                </Button>
                <p className="text-sm text-muted-foreground">Re-execute the submission with current test cases</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Manual Grading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={manualScore}
                    onChange={(e) => setManualScore(e.target.value)}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="Score (0-100)"
                  />
                  <Button onClick={handleRegrade}>Update</Button>
                </div>
                <p className="text-sm text-muted-foreground">Override the automated score with manual evaluation</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Add Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add instructor feedback for the student..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
              <Button onClick={handleAddComment} disabled={!comment.trim()}>
                Add Comment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
