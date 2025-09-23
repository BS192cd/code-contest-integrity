"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, Filter, UserPlus, TrendingUp, Award, Clock } from "lucide-react"
import Link from "next/link"

export default function TeacherStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const students = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@school.edu",
      class: "CS101",
      contests: 12,
      avgScore: 285,
      lastActive: "2 hours ago",
      status: "active",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@school.edu",
      class: "CS101",
      contests: 8,
      avgScore: 245,
      lastActive: "1 day ago",
      status: "active",
    },
    {
      id: 3,
      name: "Carol Davis",
      email: "carol@school.edu",
      class: "CS102",
      contests: 15,
      avgScore: 320,
      lastActive: "30 minutes ago",
      status: "active",
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david@school.edu",
      class: "CS101",
      contests: 5,
      avgScore: 180,
      lastActive: "3 days ago",
      status: "inactive",
    },
    {
      id: 5,
      name: "Eve Brown",
      email: "eve@school.edu",
      class: "CS102",
      contests: 10,
      avgScore: 265,
      lastActive: "1 hour ago",
      status: "active",
    },
  ]

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Student Management</h1>
              <p className="text-muted-foreground">Monitor and manage your students' progress</p>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold">{students.filter((s) => s.status === "active").length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">
                    {Math.round(students.reduce((acc, s) => acc + s.avgScore, 0) / students.length)}
                  </p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contests</p>
                  <p className="text-2xl font-bold">{students.reduce((acc, s) => acc + s.contests, 0)}</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Students</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
                <CardDescription>Complete list of enrolled students</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Contests Participated</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.class}</Badge>
                        </TableCell>
                        <TableCell>{student.contests}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.avgScore} pts</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{student.lastActive}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === "active" ? "default" : "secondary"}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/teacher/students/${student.id}`}>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Students</CardTitle>
                <CardDescription>Students who have been active recently</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Contests Participated</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents
                      .filter((s) => s.status === "active")
                      .map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.class}</Badge>
                          </TableCell>
                          <TableCell>{student.contests}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{student.avgScore} pts</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{student.lastActive}</TableCell>
                          <TableCell>
                            <Link href={`/teacher/students/${student.id}`}>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive">
            <Card>
              <CardHeader>
                <CardTitle>Inactive Students</CardTitle>
                <CardDescription>Students who haven't been active recently</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Contests Participated</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents
                      .filter((s) => s.status === "inactive")
                      .map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.class}</Badge>
                          </TableCell>
                          <TableCell>{student.contests}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{student.avgScore} pts</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{student.lastActive}</TableCell>
                          <TableCell>
                            <Link href={`/teacher/students/${student.id}`}>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
