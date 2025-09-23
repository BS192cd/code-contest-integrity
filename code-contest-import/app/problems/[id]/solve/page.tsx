"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CodeEditor } from "@/components/code-editor"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Code2, 
  Play, 
  Send, 
  ArrowLeft, 
  Clock, 
  MemoryStick, 
  CheckCircle, 
  XCircle, 
  Eye,
  BookOpen,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Mock problem data
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
  testCases: [
    {
      id: 1,
      input: "[2,7,11,15]\n9",
      expectedOutput: "[0,1]",
      status: "pending" as const,
      actualOutput: "",
      executionTime: "",
      memory: "",
    },
    {
      id: 2,
      input: "[3,2,4]\n6",
      expectedOutput: "[1,2]",
      status: "pending" as const,
      actualOutput: "",
      executionTime: "",
      memory: "",
    },
  ],
  timeLimit: 2000,
  memoryLimit: 128
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

export default function ProblemSolvePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [language, setLanguage] = useState("python")
  const [code, setCode] = useState(defaultCode.python)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState(mockProblem.testCases)
  const [customInput, setCustomInput] = useState("")
  const [customOutput, setCustomOutput] = useState("")

  useEffect(() => {
    setCode(defaultCode[language as keyof typeof defaultCode])
  }, [language])

  const handleRunCode = async () => {
    setIsRunning(true)
    try {
      // Simulate code execution
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate test results
      const results = mockProblem.testCases.map((testCase) => ({
        ...testCase,
        status: Math.random() > 0.3 ? "passed" : ("failed" as const),
        actualOutput: Math.random() > 0.3 ? testCase.expectedOutput : "incorrect output",
        executionTime: `${Math.floor(Math.random() * 5) + 1}ms`,
        memory: `${(Math.random() * 10 + 40).toFixed(1)} MB`,
      }))

      setTestResults(results)
      toast({
        title: "Code executed successfully",
        description: `${results.filter((r) => r.status === "passed").length}/${results.length} test cases passed`,
      })
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
      // Simulate submission
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast({
        title: "Solution submitted!",
        description: "Your solution has been submitted for evaluation.",
      })
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

  const handleRunCustomInput = () => {
    if (!customInput.trim()) {
      toast({
        title: "Input required",
        description: "Please provide input to test your code.",
        variant: "destructive",
      })
      return
    }

    setCustomOutput("Processing...")
    
    // Simulate custom input execution
    setTimeout(() => {
      setCustomOutput(`Output for input: ${customInput}\n[0,1]`)
      toast({
        title: "Custom test completed",
        description: "Your code has been tested with custom input.",
      })
    }, 1500)
  }

  const handleViewProblem = () => {
    router.push(`/problems/${params.id}/view`)
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
        <DashboardHeader onMenuToggle={() => {}} />

        <div className="flex h-[calc(100vh-4rem)]">
          <ResizablePanelGroup direction="horizontal">
            {/* Problem Statement Panel */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full border-r border-border">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" onClick={handleBackToProblems}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold">{mockProblem.title}</h2>
                          <Badge variant="outline" className={cn("text-xs", getDifficultyColor(mockProblem.difficulty))}>
                            {mockProblem.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {mockProblem.timeLimit}ms
                          </div>
                          <div className="flex items-center gap-1">
                            <MemoryStick className="h-3 w-3" />
                            {mockProblem.memoryLimit}MB
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleViewProblem}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[calc(100%-5rem)]">
                  <div className="p-4 space-y-6">
                    {/* Problem Description */}
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Problem
                      </h3>
                      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
                        <p className="whitespace-pre-line text-sm">{mockProblem.description}</p>
                      </div>
                    </div>

                    {/* Examples */}
                    <div>
                      <h3 className="font-medium mb-3">Examples</h3>
                      <div className="space-y-4">
                        {mockProblem.examples.map((example, index) => (
                          <div key={index} className="space-y-2">
                            <div className="text-sm font-medium">Example {index + 1}:</div>
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Input:</div>
                                <div className="bg-muted p-2 rounded text-xs font-mono">{example.input}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Output:</div>
                                <div className="bg-muted p-2 rounded text-xs font-mono">{example.output}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Explanation:</div>
                                <div className="text-xs">{example.explanation}</div>
                              </div>
                            </div>
                            {index < mockProblem.examples.length - 1 && <Separator />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Code Editor Panel */}
            <ResizablePanel defaultSize={60} minSize={40}>
              <div className="h-full flex flex-col">
                {/* Editor Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
                    </div>
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

                {/* Editor Content */}
                <div className="flex-1 flex flex-col">
                  <ResizablePanelGroup direction="vertical">
                    {/* Code Editor */}
                    <ResizablePanel defaultSize={60} minSize={40}>
                      <div className="h-full p-4">
                        <CodeEditor
                          language={language}
                          value={code}
                          onChange={setCode}
                          className="h-full"
                        />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Test Results Panel */}
                    <ResizablePanel defaultSize={40} minSize={25}>
                      <div className="h-full border-t border-border">
                        <Tabs defaultValue="testcases" className="h-full flex flex-col">
                          <TabsList className="m-4 mb-0">
                            <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                            <TabsTrigger value="custom">Custom Input</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="testcases" className="flex-1 m-0">
                            <ScrollArea className="h-full">
                              <div className="p-4 space-y-3">
                                {testResults.map((testCase, index) => (
                                  <Card key={testCase.id} className="p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">Test Case {index + 1}</span>
                                      <div className="flex items-center gap-2">
                                        {testCase.status === "passed" && (
                                          <CheckCircle className="h-4 w-4 text-green-400" />
                                        )}
                                        {testCase.status === "failed" && (
                                          <XCircle className="h-4 w-4 text-red-400" />
                                        )}
                                        <Badge
                                          variant={testCase.status === "passed" ? "default" : "destructive"}
                                          className="text-xs"
                                        >
                                          {testCase.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                      <div>
                                        <div className="text-muted-foreground mb-1">Input:</div>
                                        <div className="bg-muted p-2 rounded font-mono">{testCase.input}</div>
                                      </div>
                                      <div>
                                        <div className="text-muted-foreground mb-1">Expected:</div>
                                        <div className="bg-muted p-2 rounded font-mono">{testCase.expectedOutput}</div>
                                      </div>
                                      {testCase.actualOutput && (
                                        <div>
                                          <div className="text-muted-foreground mb-1">Your Output:</div>
                                          <div className="bg-muted p-2 rounded font-mono">{testCase.actualOutput}</div>
                                        </div>
                                      )}
                                      {testCase.executionTime && (
                                        <div className="flex gap-4 text-muted-foreground">
                                          <span>Runtime: {testCase.executionTime}</span>
                                          <span>Memory: {testCase.memory}</span>
                                        </div>
                                      )}
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="custom" className="flex-1 m-0">
                            <div className="p-4 h-full flex flex-col space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">Custom Input:</label>
                                <textarea
                                  value={customInput}
                                  onChange={(e) => setCustomInput(e.target.value)}
                                  className="w-full h-20 p-2 border border-border rounded bg-muted font-mono text-sm resize-none"
                                  placeholder="Enter your test input here..."
                                />
                              </div>
                              <Button onClick={handleRunCustomInput} className="w-fit">
                                <Play className="h-4 w-4 mr-2" />
                                Run Custom Test
                              </Button>
                              {customOutput && (
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Output:</label>
                                  <div className="w-full p-2 border border-border rounded bg-muted font-mono text-sm whitespace-pre-wrap">
                                    {customOutput}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </ProtectedRoute>
  )
}