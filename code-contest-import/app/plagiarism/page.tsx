"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { PlagiarismScanner } from "@/components/plagiarism-scanner"
import { CodeComparisonView } from "@/components/code-comparison-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Shield, AlertTriangle, TrendingUp } from "lucide-react"

export default function PlagiarismPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scanResults, setScanResults] = useState<any>(null)
  const [selectedComparison, setSelectedComparison] = useState<any>(null)

  const handleScanComplete = (results: any) => {
    setScanResults(results)
  }

  const handleViewComparison = async (submissionIdA: string, submissionIdB: string) => {
    try {
      const response = await fetch("/api/plagiarism/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionIdA, submissionIdB }),
      })

      const data = await response.json()
      if (data.success) {
        setSelectedComparison(data.data)
      }
    } catch (error) {
      console.error("Failed to load comparison:", error)
    }
  }

  if (selectedComparison) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex">
          <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <CodeComparisonView comparison={selectedComparison} onClose={() => setSelectedComparison(null)} />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-balance">Plagiarism Detection</h1>
                <p className="text-muted-foreground mt-2 text-pretty">
                  Automated code similarity analysis and plagiarism detection system.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                  <Shield className="h-3 w-3 mr-1" />
                  System Active
                </Badge>
              </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="scanner" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scanner">Scanner</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="scanner" className="space-y-4">
                <PlagiarismScanner onScanComplete={handleScanComplete} />
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                {scanResults ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Scan Results</CardTitle>
                      <CardDescription>Found {scanResults.flaggedPairs} potential plagiarism cases</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Students</TableHead>
                              <TableHead>Similarity</TableHead>
                              <TableHead>Risk Level</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {scanResults.results.map((result: any) => (
                              <TableRow key={result.id}>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="font-medium">{result.submissionA.username}</div>
                                    <div className="text-sm text-muted-foreground">
                                      vs {result.submissionB.username}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-bold text-primary">{result.similarity}%</div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={result.status === "high_risk" ? "destructive" : "default"}>
                                    {result.status === "high_risk" ? "High Risk" : "Medium Risk"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewComparison(result.submissionA.id, result.submissionB.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Compare
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No scan results available</p>
                        <p className="text-sm">Run a plagiarism scan to see results here.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Plagiarism Analytics
                    </CardTitle>
                    <CardDescription>Historical trends and detection statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Analytics dashboard would go here</p>
                      <p className="text-sm mt-2">
                        Charts showing detection trends, false positive rates, and system performance
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
