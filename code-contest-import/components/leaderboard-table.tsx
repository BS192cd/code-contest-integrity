"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Student {
  rank: number
  userId: string
  username: string
  fullName: string
  avatar: string
  score: number
  problemsSolved: number
  contestsParticipated: number
  averageScore: number
  lastSubmission: string
  streak: number
  badges: string[]
}

interface LeaderboardTableProps {
  data: Student[]
  itemsPerPage: number
  onStudentSelect: (userId: string) => void
}

export function LeaderboardTable({ data, itemsPerPage, onStudentSelect }: LeaderboardTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Student>("rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Trophy className="h-4 w-4 text-gray-400" />
      case 3:
        return <Trophy className="h-4 w-4 text-amber-600" />
      default:
        return <span className="text-sm font-medium">{rank}</span>
    }
  }

  const getTrendIcon = (rank: number) => {
    // Mock trend data - in real app this would come from historical data
    const trend = Math.random()
    if (trend > 0.6) return <TrendingUp className="h-3 w-3 text-green-400" />
    if (trend < 0.4) return <TrendingDown className="h-3 w-3 text-red-400" />
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => handleSort("score")}>
                  Score
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => handleSort("problemsSolved")}>
                  Problems
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-accent/50" onClick={() => handleSort("averageScore")}>
                  Avg Score
                </TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((student) => (
                <TableRow
                  key={student.userId}
                  className="hover:bg-accent/50 cursor-pointer"
                  onClick={() => onStudentSelect(student.userId)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(student.rank)}
                      {getTrendIcon(student.rank)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.fullName} />
                        <AvatarFallback>
                          {student.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.username}</div>
                        <div className="text-sm text-muted-foreground">{student.fullName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-primary">{student.score.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{student.problemsSolved}</span>
                      <span className="text-xs text-muted-foreground">({student.contestsParticipated} contests)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {student.averageScore.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm">{student.streak} days</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{student.lastSubmission}</span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length}{" "}
            students
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
