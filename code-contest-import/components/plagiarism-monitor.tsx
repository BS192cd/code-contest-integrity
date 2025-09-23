"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Eye, Shield, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const mockPlagiarismData = [
  {
    id: "sub_001",
    studentA: "alice_codes",
    studentB: "bob_dev",
    problemTitle: "Two Sum",
    similarity: 87,
    status: "flagged",
    submissionTime: "2 hours ago",
    reviewStatus: "pending",
  },
  {
    id: "sub_002",
    studentA: "charlie_algo",
    studentB: "diana_prog",
    problemTitle: "Binary Tree Traversal",
    similarity: 72,
    status: "flagged",
    submissionTime: "4 hours ago",
    reviewStatus: "pending",
  },
  {
    id: "sub_003",
    studentA: "eve_coder",
    studentB: "frank_dev",
    problemTitle: "Graph Shortest Path",
    similarity: 65,
    status: "reviewed",
    submissionTime: "1 day ago",
    reviewStatus: "cleared",
  },
  {
    id: "sub_004",
    studentA: "grace_algo",
    studentB: "henry_code",
    problemTitle: "Dynamic Programming",
    similarity: 91,
    status: "confirmed",
    submissionTime: "2 days ago",
    reviewStatus: "plagiarism",
  },
]

export function PlagiarismMonitor() {
  const [plagiarismData, setPlagiarismData] = useState(mockPlagiarismData)
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "flagged":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Flagged</Badge>
      case "reviewed":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Reviewed</Badge>
      case "confirmed":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Confirmed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleRunScan = async () => {
    setIsScanning(true)
    try {
      // Simulate plagiarism scan
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast({
        title: "Plagiarism scan completed",
        description: "Found 2 new potential matches requiring review.",
      })
    } catch (error) {
      toast({
        title: "Scan failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleReviewSubmission = (submissionId: string, action: "clear" | "confirm") => {
    setPlagiarismData((data) =>
      data.map((item) =>
        item.id === submissionId
          ? {
              ...item,
              reviewStatus: action === "clear" ? "cleared" : "plagiarism",
              status: action === "clear" ? "reviewed" : "confirmed",
            }
          : item,
      ),
    )

    toast({
      title: `Submission ${action === "clear" ? "cleared" : "confirmed as plagiarism"}`,
      description: `The review has been recorded and appropriate actions will be taken.`,
    })
  }

  const pendingReviews = plagiarismData.filter((item) => item.reviewStatus === "pending").length
  const confirmedCases = plagiarismData.filter((item) => item.reviewStatus === "plagiarism").length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-muted-foreground">Pending Reviews</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-yellow-400">{pendingReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-400" />
              <span className="text-sm text-muted-foreground">Confirmed Cases</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-red-400">{confirmedCases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Last Scan</span>
            </div>
            <div className="text-sm font-medium mt-1">2 hours ago</div>
            <Button size="sm" className="mt-2 w-full" onClick={handleRunScan} disabled={isScanning}>
              {isScanning ? "Scanning..." : "Run New Scan"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Plagiarism Detection Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Plagiarism Detection Results
          </CardTitle>
          <CardDescription>Review submissions with high similarity scores and take appropriate action</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Students</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Similarity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plagiarismData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{item.studentA}</div>
                        <div className="text-sm text-muted-foreground">vs {item.studentB}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.problemTitle}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getSimilarityColor(item.similarity)}`}>{item.similarity}%</span>
                          {getSimilarityBadge(item.similarity)}
                        </div>
                        <Progress value={item.similarity} className="h-1" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{item.submissionTime}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Compare
                        </Button>
                        {item.reviewStatus === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewSubmission(item.id, "clear")}
                            >
                              Clear
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReviewSubmission(item.id, "confirm")}
                            >
                              Confirm
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
