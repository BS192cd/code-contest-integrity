"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Scan, Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface PlagiarismPair {
  id: string
  studentA: string
  studentB: string
  similarity: number
  submissionAId: string
  submissionBId: string
  codeSnippetA: string
  codeSnippetB: string
  matchingLines: number[]
}

interface PlagiarismSummary {
  totalSubmissions: number
  flaggedPairs: number
  averageSimilarity: number
  scanDate: string
}

export function TeacherPlagiarismDashboard({ contestId }: { contestId: string }) {
  const [selectedPair, setSelectedPair] = useState<PlagiarismPair | null>(null)
  const queryClient = useQueryClient()

  // Fetch plagiarism data
  const { data: plagiarismData, isLoading } = useQuery({
    queryKey: ["plagiarism", contestId],
    queryFn: async () => {
      const response = await fetch(`/api/plagiarism/check?contestId=${contestId}`)
      if (!response.ok) throw new Error("Failed to fetch plagiarism data")
      return response.json()
    },
  })

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/plagiarism/check?contestId=${contestId}`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to scan submissions")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plagiarism", contestId] })
      toast.success("Plagiarism scan completed successfully")
    },
    onError: () => {
      toast.error("Failed to scan submissions")
    },
  })

  const getSimilarityColor = (similarity: number) => {
    if (similarity < 30) return "bg-green-100 text-green-800 border-green-200"
    if (similarity <= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getSimilarityIcon = (similarity: number) => {
    if (similarity < 30) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (similarity <= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const summary: PlagiarismSummary = plagiarismData?.summary || {
    totalSubmissions: 0,
    flaggedPairs: 0,
    averageSimilarity: 0,
    scanDate: new Date().toISOString(),
  }

  const pairs: PlagiarismPair[] = plagiarismData?.pairs || []

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Scanned on {new Date(summary.scanDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Pairs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.flaggedPairs}</div>
            <p className="text-xs text-muted-foreground">Requiring review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Similarity</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageSimilarity.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all pairs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => scanMutation.mutate()} disabled={scanMutation.isPending} className="w-full">
              {scanMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-4 w-4" />
                  Scan Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Pairs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Pairs</CardTitle>
          <CardDescription>Submissions with potential plagiarism detected</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : pairs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No suspicious pairs detected</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student A</TableHead>
                  <TableHead>Student B</TableHead>
                  <TableHead>Similarity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pairs.map((pair) => (
                  <TableRow key={pair.id} className={getSimilarityColor(pair.similarity)}>
                    <TableCell className="font-medium">{pair.studentA}</TableCell>
                    <TableCell className="font-medium">{pair.studentB}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSimilarityIcon(pair.similarity)}
                        <Badge variant="outline" className={getSimilarityColor(pair.similarity)}>
                          {pair.similarity.toFixed(1)}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={pair.similarity > 70 ? "destructive" : pair.similarity > 30 ? "secondary" : "default"}
                      >
                        {pair.similarity > 70 ? "High Risk" : pair.similarity > 30 ? "Medium Risk" : "Low Risk"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedPair(pair)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Report
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Plagiarism Report</DialogTitle>
                            <DialogDescription>
                              Code comparison between {pair.studentA} and {pair.studentB}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge className={getSimilarityColor(pair.similarity)}>
                                {pair.similarity.toFixed(1)}% Similarity
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {pair.matchingLines.length} matching lines detected
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">{pair.studentA}'s Code</h4>
                                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                                  <code>{pair.codeSnippetA}</code>
                                </pre>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">{pair.studentB}'s Code</h4>
                                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                                  <code>{pair.codeSnippetB}</code>
                                </pre>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
