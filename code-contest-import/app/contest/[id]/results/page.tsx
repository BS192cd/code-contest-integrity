"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Award, Clock, CheckCircle, User, Code } from "lucide-react"
import Link from "next/link"

export default function ContestResultsPage({ params }: { params: { id: string } }) {
  const contestResults = {
    title: "Weekly Programming Challenge #1",
    status: "completed",
    participants: 45,
    duration: "2 hours",
    problems: [
      { id: 1, title: "Two Sum", difficulty: "Easy", solved: 38, attempts: 45 },
      { id: 2, title: "Binary Tree Traversal", difficulty: "Medium", solved: 22, attempts: 41 },
      { id: 3, title: "Dynamic Programming", difficulty: "Hard", solved: 8, attempts: 28 },
    ],
    leaderboard: [
      { rank: 1, name: "Alice Johnson", score: 300, solved: 3, time: "1h 23m", accuracy: "95%" },
      { rank: 2, name: "Bob Smith", score: 280, solved: 3, time: "1h 45m", accuracy: "88%" },
      { rank: 3, name: "Carol Davis", score: 250, solved: 2, time: "1h 12m", accuracy: "92%" },
      { rank: 4, name: "David Wilson", score: 220, solved: 2, time: "1h 35m", accuracy: "85%" },
      { rank: 5, name: "Eve Brown", score: 200, solved: 2, time: "1h 48m", accuracy: "78%" },
    ],
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{contestResults.title}</h1>
              <p className="text-muted-foreground">Contest Results & Analytics</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold">{contestResults.participants}</p>
                </div>
                <User className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">{contestResults.duration}</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Problems</p>
                  <p className="text-2xl font-bold">{contestResults.problems.length}</p>
                </div>
                <Code className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">245</p>
                </div>
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="leaderboard">Final Leaderboard</TabsTrigger>
            <TabsTrigger value="problems">Problem Statistics</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Final Rankings
                </CardTitle>
                <CardDescription>Top performers in this contest</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Problems Solved</TableHead>
                      <TableHead>Total Time</TableHead>
                      <TableHead>Accuracy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contestResults.leaderboard.map((participant) => (
                      <TableRow key={participant.rank}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {participant.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                            {participant.rank === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                            {participant.rank === 3 && <Award className="h-4 w-4 text-amber-600" />}#{participant.rank}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{participant.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{participant.score} pts</Badge>
                        </TableCell>
                        <TableCell>{participant.solved}/3</TableCell>
                        <TableCell>{participant.time}</TableCell>
                        <TableCell>{participant.accuracy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="problems">
            <Card>
              <CardHeader>
                <CardTitle>Problem Statistics</CardTitle>
                <CardDescription>Success rates and difficulty analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contestResults.problems.map((problem) => (
                    <div key={problem.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{problem.title}</h4>
                        <Badge
                          variant={
                            problem.difficulty === "Easy"
                              ? "secondary"
                              : problem.difficulty === "Medium"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {problem.difficulty}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Solved</p>
                          <p className="font-medium">
                            {problem.solved}/{problem.attempts}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-medium">{Math.round((problem.solved / problem.attempts) * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Attempts</p>
                          <p className="font-medium">{problem.attempts}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Difficulty</p>
                          <p className="font-medium">{problem.difficulty}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Timeline</CardTitle>
                  <CardDescription>When participants submitted their solutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart visualization would go here
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Language Distribution</CardTitle>
                  <CardDescription>Programming languages used</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Python</span>
                      <span className="text-muted-foreground">65%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Java</span>
                      <span className="text-muted-foreground">20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>C++</span>
                      <span className="text-muted-foreground">12%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>JavaScript</span>
                      <span className="text-muted-foreground">3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex gap-4">
          <Link href={`/contest/${params.id}`}>
            <Button variant="outline">Back to Contest</Button>
          </Link>
          <Link href={`/contest/${params.id}/leaderboard`}>
            <Button>View Live Leaderboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
