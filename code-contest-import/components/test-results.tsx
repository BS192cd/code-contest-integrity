"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CheckCircle, XCircle, Clock, MemoryStick, ChevronDown } from "lucide-react"
import { useState } from "react"

interface TestCase {
  id: number
  input: string
  expectedOutput: string
  actualOutput: string
  status: "passed" | "failed" | "running"
  executionTime: string
  memory: string
}

interface TestResultsProps {
  testCases: TestCase[]
}

export function TestResults({ testCases }: TestResultsProps) {
  const [expandedCases, setExpandedCases] = useState<Set<number>>(new Set())

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedCases)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCases(newExpanded)
  }

  const passedCount = testCases.filter((tc) => tc.status === "passed").length
  const totalCount = testCases.length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-green-400"
      case "failed":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Test Results</CardTitle>
          <Badge variant={passedCount === totalCount ? "default" : "destructive"}>
            {passedCount}/{totalCount} Passed
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-3">
            {testCases.map((testCase) => (
              <Collapsible
                key={testCase.id}
                open={expandedCases.has(testCase.id)}
                onOpenChange={() => toggleExpanded(testCase.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(testCase.status)}
                      <span className="font-medium">Test Case {testCase.id}</span>
                      <span className={`text-sm font-medium ${getStatusColor(testCase.status)}`}>
                        {testCase.status.charAt(0).toUpperCase() + testCase.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {testCase.executionTime}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MemoryStick className="h-3 w-3" />
                        {testCase.memory}
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mt-2 p-4 rounded-lg bg-muted/50 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Input:</h4>
                      <pre className="text-xs bg-background p-2 rounded border font-mono overflow-x-auto">
                        {testCase.input}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Expected Output:</h4>
                      <pre className="text-xs bg-background p-2 rounded border font-mono overflow-x-auto">
                        {testCase.expectedOutput}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Your Output:</h4>
                      <pre
                        className={`text-xs p-2 rounded border font-mono overflow-x-auto ${
                          testCase.status === "passed"
                            ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
                            : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
                        }`}
                      >
                        {testCase.actualOutput}
                      </pre>
                    </div>

                    {testCase.status === "failed" && (
                      <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-2 rounded border border-red-200 dark:border-red-800">
                        <strong>Error:</strong> Output does not match expected result
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
