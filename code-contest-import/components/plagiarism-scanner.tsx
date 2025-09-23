"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Play, Settings, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScanResult {
  scanId: string
  contestId: string
  problemId?: string
  threshold: number
  totalSubmissions: number
  comparisons: number
  flaggedPairs: number
  results: any[]
  scanCompletedAt: string
}

interface PlagiarismScannerProps {
  onScanComplete: (results: ScanResult) => void
}

export function PlagiarismScanner({ onScanComplete }: PlagiarismScannerProps) {
  const [selectedContest, setSelectedContest] = useState("")
  const [selectedProblem, setSelectedProblem] = useState("")
  const [threshold, setThreshold] = useState([70])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null)
  const { toast } = useToast()

  const mockContests = [
    { id: "1", title: "Weekly Challenge #42" },
    { id: "2", title: "Algorithm Sprint" },
    { id: "3", title: "Monthly Championship" },
  ]

  const mockProblems = [
    { id: "1", title: "Two Sum" },
    { id: "2", title: "Binary Tree Traversal" },
    { id: "3", title: "Graph Shortest Path" },
  ]

  const handleStartScan = async () => {
    if (!selectedContest) {
      toast({
        title: "Contest required",
        description: "Please select a contest to scan.",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)
    setScanProgress(0)

    try {
      // Simulate scan progress
      const progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 200)

      // Make API call
      const response = await fetch("/api/plagiarism/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestId: selectedContest,
          problemId: selectedProblem || undefined,
          threshold: threshold[0],
        }),
      })

      const data = await response.json()

      if (data.success) {
        setScanProgress(100)
        setLastScanResult(data.data)
        onScanComplete(data.data)

        toast({
          title: "Scan completed successfully",
          description: `Found ${data.data.flaggedPairs} potential plagiarism cases.`,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Scan failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
      setTimeout(() => setScanProgress(0), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Scanner Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Plagiarism Scanner
          </CardTitle>
          <CardDescription>Configure and run automated plagiarism detection on contest submissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contest">Contest</Label>
              <Select value={selectedContest} onValueChange={setSelectedContest}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contest to scan" />
                </SelectTrigger>
                <SelectContent>
                  {mockContests.map((contest) => (
                    <SelectItem key={contest.id} value={contest.id}>
                      {contest.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="problem">Problem (Optional)</Label>
              <Select value={selectedProblem} onValueChange={setSelectedProblem}>
                <SelectTrigger>
                  <SelectValue placeholder="All problems" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All problems</SelectItem>
                  {mockProblems.map((problem) => (
                    <SelectItem key={problem.id} value={problem.id}>
                      {problem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Similarity Threshold</Label>
              <Badge variant="outline">{threshold[0]}%</Badge>
            </div>
            <Slider value={threshold} onValueChange={setThreshold} max={100} min={30} step={5} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30% (Low sensitivity)</span>
              <span>100% (High sensitivity)</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Advanced settings and filters</span>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Scanning submissions...</span>
                <span>{Math.round(scanProgress)}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          )}

          <Button onClick={handleStartScan} disabled={isScanning || !selectedContest} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            {isScanning ? "Scanning..." : "Start Plagiarism Scan"}
          </Button>
        </CardContent>
      </Card>

      {/* Last Scan Results Summary */}
      {lastScanResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Last Scan Results
            </CardTitle>
            <CardDescription>Completed {new Date(lastScanResult.scanCompletedAt).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{lastScanResult.totalSubmissions}</div>
                <div className="text-xs text-muted-foreground">Submissions</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{lastScanResult.comparisons}</div>
                <div className="text-xs text-muted-foreground">Comparisons</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{lastScanResult.flaggedPairs}</div>
                <div className="text-xs text-muted-foreground">Flagged Pairs</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{lastScanResult.threshold}%</div>
                <div className="text-xs text-muted-foreground">Threshold</div>
              </div>
            </div>

            {lastScanResult.flaggedPairs > 0 && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Attention Required</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {lastScanResult.flaggedPairs} submission pairs require manual review for potential plagiarism.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { contest: "Weekly Challenge #42", time: "2 hours ago", flagged: 3 },
              { contest: "Algorithm Sprint", time: "1 day ago", flagged: 1 },
              { contest: "Monthly Championship", time: "3 days ago", flagged: 5 },
            ].map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <div className="font-medium">{scan.contest}</div>
                  <div className="text-sm text-muted-foreground">{scan.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{scan.flagged}</div>
                  <div className="text-xs text-muted-foreground">flagged</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
