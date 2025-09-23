use client

import { use, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2, Eye, Play, Pause, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const mockContests = [
  {
    id: 1,
    title: "Weekly Challenge #42",
    status: "active",
    participants: 156,
    startTime: "2024-03-01 14:00",
    endTime: "2024-03-01 17:00",
    difficulty: "Medium",
    problems: 3,
    submissions: 234,
  },
  {
    id: 2,
    title: "Algorithm Sprint",
    status: "active",
    participants: 89,
    startTime: "2024-03-01 16:00",
    endTime: "2024-03-01 17:30",
    difficulty: "Hard",
    problems: 2,
    submissions: 145,
  },
  {
    id: 3,
    title: "Monthly Championship",
    status: "upcoming",
    participants: 0,
    startTime: "2024-03-02 14:00",
    endTime: "2024-03-02 18:00",
    difficulty: "Expert",
    problems: 5,
    submissions: 0,
  },
  {
    id: 4,
    title: "Beginner Bootcamp",
    status: "upcoming",
    participants: 0,
    startTime: "2024-03-05 10:00",
    endTime: "2024-03-05 12:00",
    difficulty: "Easy",
    problems: 4,
    submissions: 0,
  },
  {
    id: 5,
    title: "Data Structures Deep Dive",
    status: "ended",
    participants: 234,
    startTime: "2024-02-28 14:00",
    endTime: "2024-02-28 17:00",
    difficulty: "Hard",
    problems: 4,
    submissions: 456,
  },
]

export function ContestManagementTable() {
  const [contests, setContests] = useState(mockContests)
  const { toast } = useToast()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
      case "upcoming":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Upcoming</Badge>
      case "ended":
        return <Badge variant="secondary">Ended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
      case "Expert":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const handleDeleteContest = async (contestId: number) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setContests(contests.filter((c) => c.id !== contestId))
      toast({
        title: "Contest deleted",
        description: "The contest has been successfully removed.",
      })
    } catch (error) {
      toast({
        title: "Failed to delete contest",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleToggleContest = async (contestId: number, action: "pause" | "resume") => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setContests(
        contests.map((c) => (c.id === contestId ? { ...c, status: action === "pause" ? "paused" : "active" } : c)),
      )

      toast({
        title: `Contest ${action}d`,
        description: `The contest has been ${action}d successfully.`,
      })
    } catch (error) {
      toast({
        title: `Failed to ${action} contest`,
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contest Management</CardTitle>
        <CardDescription>Manage all contests, monitor participation, and control contest flow</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Problems</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contests.map((contest) => (
                <TableRow key={contest.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contest.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getDifficultyColor(contest.difficulty)} className="text-xs">
                          {contest.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(contest.status)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{contest.participants}</div>
                    {contest.status === "active" && <div className="text-xs text-green-400">Live</div>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Start: {contest.startTime}</div>
                      <div className="text-muted-foreground">End: {contest.endTime}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{contest.problems}</div>
                    <div className="text-xs text-muted-foreground">problems</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{contest.submissions}</div>
                    <div className="text-xs text-muted-foreground">submissions</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Contest
                        </DropdownMenuItem>
                        {contest.status === "active" && (
                          <DropdownMenuItem onClick={() => handleToggleContest(contest.id, "pause")}>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Contest
                          </DropdownMenuItem>
                        )}
                        {contest.status === "paused" && (
                          <DropdownMenuItem onClick={() => handleToggleContest(contest.id, "resume")}>
                            <Play className="mr-2 h-4 w-4" />
                            Resume Contest
                          </DropdownMenuItem>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Contest
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Contest</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{contest.title}"? This action cannot be undone and will
                                remove all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteContest(contest.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Contest
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
