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
  testCases: [
    {
      id: 1,
      input: "[2,7,11,15]\n9",
      expectedOutput: "[0,1]",
      status: "passed" as const,
      actualOutput: "[0,1]",
      executionTime: "2ms",
      memory: "42.1 MB",
    },
    {
      id: 2,
      input: "[3,2,4]\n6",
      expectedOutput: "[1,2]",
      status: "passed" as const,
      actualOutput: "[1,2]",
      executionTime: "1ms",
      memory: "41.8 MB",
    },
    {
      id: 3,
      input: "[3,3]\n6",
      expectedOutput: "[0,1]",
      status: "failed" as const,
      actualOutput: "[1,0]",
      executionTime: "3ms",
      memory: "42.3 MB",
    },
  ],
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
  const [testResults, setTestResults] = useState(mockProblem.testCases)
  const { toast } = useToast()

  useEffect(() => {
    setCode(defaultCode[language as keyof typeof defaultCode])
  }, [language])

  const handleRunCode = async () => {
    setIsRunning(true)
    try {
      // Simulate code execution
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate test results
      const results = mockProblem.testCases.map((testCase, index) => ({
        ...testCase,
        status: Math.random() > 0.3 ? "passed" : ("failed" as const),
        actualOutput: testCase.expectedOutput,
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
                    <h1 className="text-2xl font-bold">{mockProblem.title}</h1>
                    <Badge variant={getDifficultyColor(mockProblem.difficulty)}>{mockProblem.difficulty}</Badge>
                    <Badge variant="outline">{mockProblem.category}</Badge>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="text-pretty leading-relaxed">{mockProblem.description}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Examples</h3>
                  {mockProblem.examples.map((example, index) => (
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
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {mockProblem.constraints.map((constraint, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                        <code className="font-mono">{constraint}</code>
                      </li>
                    ))}
                  </ul>
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
