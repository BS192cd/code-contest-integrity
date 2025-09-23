"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { CodeEditor } from "@/components/code-editor"
import { TestResults } from "@/components/test-results"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
  testCases?: { input: string; expectedOutput: string; isPublic?: boolean }[]
  timeLimit?: number
  memoryLimit?: number
  solutionTemplate?: Record<string, string>
}

const defaultCode = {
  python: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Your solution here
    pass`,
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your solution here
};`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[0];
    }
}`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
        return {};
    }
};`,
}

export default function ProblemPage() {
  const params = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [language, setLanguage] = useState("python")
  const [code, setCode] = useState(defaultCode.python)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [problem, setProblem] = useState<ProblemDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setCode(defaultCode[language as keyof typeof defaultCode])
  }, [language])

  useEffect(() => {
    const loadProblem = async () => {
      if (!params?.id) return
      setLoading(true)
      try {
        const res = await apiClient.getProblem(String(params.id))
        if (res.success) {
          const p = res.data as any as ProblemDetails
          setProblem(p)
          setTestResults((p.testCases || []).filter(tc => (tc as any).isPublic))
          if (p.solutionTemplate && p.solutionTemplate[language as keyof typeof p.solutionTemplate]) {
            setCode(p.solutionTemplate[language as keyof typeof p.solutionTemplate] as string)
          }
        } else {
          throw new Error(res.error || 'Failed to load problem')
        }
      } catch (e: any) {
        console.error(e)
        toast({ title: 'Failed to load problem', description: 'Server unavailable', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    loadProblem()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id])

  const handleRunCode = async () => {
    setIsRunning(true)
    try {
      const runRes = await apiClient.runCode({ code, language, input: '', problemId: String(params.id) })
      if (runRes.success) {
        const data: any = runRes.data
        const results = data?.results || []
        setTestResults(results.length ? results : [])
        const passed = data?.passed ?? results.filter((r: any) => r.status === 'passed').length
        const total = data?.total ?? results.length
        toast({
          title: "Code executed successfully",
          description: `${passed}/${total} test cases passed`,
        })
      } else {
        throw new Error(runRes.error || 'Failed to run code')
      }
    } catch (error) {
      toast({
        title: "Execution failed",
        description: "There was an error running your code.",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await apiClient.submitSolution({
        code,
        language,
        problemId: String(params.id),
      })
      if (res.success) {
        toast({
          title: "Solution submitted!",
          description: "Your solution has been submitted for evaluation.",
        })
      } else {
        throw new Error(res.error || 'Submission failed')
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "secondary"
      case "Medium":
        return "default"
      case "Hard":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
          {/* Problem Description */}
          <div className="w-full lg:w-1/2 border-r border-border">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{problem?.title || (loading ? 'Loading...' : 'Problem')}</h1>
                    {problem?.difficulty && (
                      <Badge variant={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                    )}
                    {problem?.category && (
                      <Badge variant="outline">{problem.category}</Badge>
                    )}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="text-pretty leading-relaxed">{problem?.description || problem?.statement}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Examples</h3>
                  {(problem?.examples || []).map((example, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 space-y-2">
                        <div>
                          <strong>Input:</strong>
                          <code className="ml-2 px-2 py-1 bg-muted rounded text-sm font-mono">{example.input}</code>
                        </div>
                        <div>
                          <strong>Output:</strong>
                          <code className="ml-2 px-2 py-1 bg-muted rounded text-sm font-mono">{example.output}</code>
                        </div>
                        <div>
                          <strong>Explanation:</strong>
                          <span className="ml-2 text-sm text-muted-foreground">{example.explanation}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Constraints</h3>
                  {(problem?.constraints ? String(problem.constraints).split('\n') : []).map((constraint, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                      <code className="font-mono">{constraint}</code>
                    </li>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Code Editor and Results */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleRunCode} disabled={isRunning}>
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? "Running..." : "Run"}
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <Tabs defaultValue="code" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="results">Test Results</TabsTrigger>
                </TabsList>

                <TabsContent value="code" className="flex-1 m-4 mt-2">
                  <CodeEditor language={language} value={code} onChange={setCode} className="h-full" />
                </TabsContent>

                <TabsContent value="results" className="flex-1 m-4 mt-2">
                  <TestResults testCases={testResults} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
