"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, User, Calendar, Code, FileText, ArrowLeftRight } from "lucide-react"

interface CodeComparison {
  submissionA: {
    id: string
    username: string
    fullName: string
    submissionTime: string
    language: string
    code: string
  }
  submissionB: {
    id: string
    username: string
    fullName: string
    submissionTime: string
    language: string
    code: string
  }
  similarity: number
  matchedLines: number[]
  analysis: {
    structuralSimilarity: number
    variableNameSimilarity: number
    logicSimilarity: number
    commentSimilarity: number
  }
  problemTitle: string
  contestTitle: string
}

interface CodeComparisonViewProps {
  comparison: CodeComparison
  onClose: () => void
}

export function CodeComparisonView({ comparison, onClose }: CodeComparisonViewProps) {
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side")

  const highlightMatchedLines = (code: string, matchedLines: number[]) => {
    const lines = code.split("\n")
    return lines.map((line, index) => ({
      content: line,
      isMatched: matchedLines.includes(index + 1),
      lineNumber: index + 1,
    }))
  }

  const codeA = highlightMatchedLines(comparison.submissionA.code, comparison.matchedLines)
  const codeB = highlightMatchedLines(comparison.submissionB.code, comparison.matchedLines)

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return "text-red-400"
    if (similarity >= 60) return "text-yellow-400"
    return "text-green-400"
  }

  const getSimilarityBadge = (similarity: number) => {
    if (similarity >= 80) return <Badge variant="destructive">High Risk</Badge>
    if (similarity >= 60) return <Badge variant="default">Medium Risk</Badge>
    return <Badge variant="secondary">Low Risk</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                Code Similarity Analysis
              </CardTitle>
              <CardDescription>
                {comparison.problemTitle} • {comparison.contestTitle}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${getSimilarityColor(comparison.similarity)}`}>
                {comparison.similarity}%
              </div>
              {getSimilarityBadge(comparison.similarity)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Student A */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{comparison.submissionA.fullName}</span>
                <Badge variant="outline">@{comparison.submissionA.username}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {comparison.submissionA.submissionTime}
                </div>
                <div className="flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  {comparison.submissionA.language}
                </div>
              </div>
            </div>

            {/* Student B */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{comparison.submissionB.fullName}</span>
                <Badge variant="outline">@{comparison.submissionB.username}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {comparison.submissionB.submissionTime}
                </div>
                <div className="flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  {comparison.submissionB.language}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Details */}
      <Card>
        <CardHeader>
          <CardTitle>Similarity Analysis</CardTitle>
          <CardDescription>Detailed breakdown of code similarity metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Structural</span>
                <span className="font-medium">{comparison.analysis.structuralSimilarity}%</span>
              </div>
              <Progress value={comparison.analysis.structuralSimilarity} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Variable Names</span>
                <span className="font-medium">{comparison.analysis.variableNameSimilarity}%</span>
              </div>
              <Progress value={comparison.analysis.variableNameSimilarity} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Logic Flow</span>
                <span className="font-medium">{comparison.analysis.logicSimilarity}%</span>
              </div>
              <Progress value={comparison.analysis.logicSimilarity} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Comments</span>
                <span className="font-medium">{comparison.analysis.commentSimilarity}%</span>
              </div>
              <Progress value={comparison.analysis.commentSimilarity} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Code Comparison</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "side-by-side" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("side-by-side")}
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                Side by Side
              </Button>
              <Button
                variant={viewMode === "unified" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("unified")}
              >
                <FileText className="h-4 w-4 mr-1" />
                Unified
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "side-by-side" ? (
            <div className="grid grid-cols-2 gap-4">
              {/* Student A Code */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {comparison.submissionA.username}'s Code
                </div>
                <ScrollArea className="h-96 border rounded-lg">
                  <div className="p-4 font-mono text-sm">
                    {codeA.map((line, index) => (
                      <div
                        key={index}
                        className={`flex ${line.isMatched ? "bg-red-500/10 border-l-2 border-red-500" : ""}`}
                      >
                        <div className="w-8 text-right text-muted-foreground mr-4 select-none">{line.lineNumber}</div>
                        <div className="flex-1">{line.content || " "}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Student B Code */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {comparison.submissionB.username}'s Code
                </div>
                <ScrollArea className="h-96 border rounded-lg">
                  <div className="p-4 font-mono text-sm">
                    {codeB.map((line, index) => (
                      <div
                        key={index}
                        className={`flex ${line.isMatched ? "bg-red-500/10 border-l-2 border-red-500" : ""}`}
                      >
                        <div className="w-8 text-right text-muted-foreground mr-4 select-none">{line.lineNumber}</div>
                        <div className="flex-1">{line.content || " "}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Unified Diff View</div>
              <ScrollArea className="h-96 border rounded-lg">
                <div className="p-4 font-mono text-sm">
                  <div className="text-center py-8 text-muted-foreground">
                    Unified diff view would show line-by-line differences here
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onClose}>
          Back to Results
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline">Generate Report</Button>
          <Button variant="destructive">Report as Plagiarism</Button>
        </div>
      </div>
    </div>
  )
}
