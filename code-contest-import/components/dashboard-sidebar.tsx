"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Clock, Play, BookOpen, Users, Timer, Eye, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const activeContests = [
  {
    id: 1,
    title: "Weekly Challenge #42",
    participants: 156,
    timeLeft: "2h 34m",
    difficulty: "Medium",
  },
  {
    id: 2,
    title: "Algorithm Sprint",
    participants: 89,
    timeLeft: "45m",
    difficulty: "Hard",
  },
]

const upcomingContests = [
  {
    id: 3,
    title: "Monthly Championship",
    startTime: "Tomorrow 2:00 PM",
    difficulty: "Expert",
  },
  {
    id: 4,
    title: "Beginner Bootcamp",
    startTime: "Friday 10:00 AM",
    difficulty: "Easy",
  },
]

const practiceProblems = [
  { id: 1, title: "Two Sum", difficulty: "Easy", solved: true },
  { id: 2, title: "Binary Tree Traversal", difficulty: "Medium", solved: false },
  { id: 3, title: "Dynamic Programming", difficulty: "Hard", solved: false },
  { id: 4, title: "Linked List Cycle", difficulty: "Easy", solved: false },
  { id: 5, title: "Maximum Subarray", difficulty: "Medium", solved: true },
]

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>("active")
  const [upcomingSection, setUpcomingSection] = useState<string>("upcoming")
  const [practiceSection, setPracticeSection] = useState<string>("practice")
  const router = useRouter()
  const { toast } = useToast()

  const handleJoinContest = (contestId: number, contestTitle: string) => {
    router.push(`/contest/${contestId}`)
    toast({
      title: "Joining contest",
      description: `Redirecting to ${contestTitle}...`,
    })
  }

  const handleSetReminder = (contestTitle: string) => {
    toast({
      title: "Reminder set!",
      description: `You'll be notified when ${contestTitle} starts.`,
    })
  }

  const handleViewProblem = (problemId: number, problemTitle: string) => {
    router.push(`/problems/${problemId}/view`)
    toast({
      title: "Opening problem",
      description: `Loading ${problemTitle}...`,
    })
  }

  const handleSolveProblem = (problemId: number, problemTitle: string) => {
    router.push(`/problems/${problemId}/solve`)
    toast({
      title: "Starting solution",
      description: `Opening code editor for ${problemTitle}...`,
    })
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-80 transform border-r border-border bg-card transition-all duration-300 ease-in-out md:relative md:top-0 md:h-[calc(100vh-4rem)]",
          isOpen ? "translate-x-0" : "-translate-x-full md:-translate-x-full",
        )}
      >
        <ScrollArea className="h-full px-4 py-6">
          <div className="space-y-6">
            {/* Active Contests */}
            <Collapsible
              open={activeSection === "active"}
              onOpenChange={() => setActiveSection(activeSection === "active" ? "" : "active")}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" />
                    <span className="font-medium">Active Contests</span>
                    <Badge variant="secondary" className="ml-auto">
                      {activeContests.length}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {activeContests.map((contest) => (
                  <div
                    key={contest.id}
                    className="rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{contest.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {contest.participants}
                          </div>
                          <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {contest.timeLeft}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          contest.difficulty === "Easy"
                            ? "secondary"
                            : contest.difficulty === "Medium"
                              ? "default"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {contest.difficulty}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleJoinContest(contest.id, contest.title)}
                    >
                      Join Contest
                    </Button>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Upcoming Contests */}
            <Collapsible
              open={upcomingSection === "upcoming"}
              onOpenChange={() => setUpcomingSection(upcomingSection === "upcoming" ? "" : "upcoming")}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="font-medium">Upcoming Contests</span>
                    <Badge variant="outline" className="ml-auto">
                      {upcomingContests.length}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {upcomingContests.map((contest) => (
                  <div
                    key={contest.id}
                    className="rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{contest.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{contest.startTime}</p>
                      </div>
                      <Badge
                        variant={
                          contest.difficulty === "Easy"
                            ? "secondary"
                            : contest.difficulty === "Medium"
                              ? "default"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {contest.difficulty}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-3 bg-transparent"
                      onClick={() => handleSetReminder(contest.title)}
                    >
                      Set Reminder
                    </Button>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Practice Problems */}
            <Collapsible
              open={practiceSection === "practice"}
              onOpenChange={() => setPracticeSection(practiceSection === "practice" ? "" : "practice")}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-chart-2" />
                    <span className="font-medium">Practice Problems</span>
                    <Badge variant="outline" className="ml-auto">
                      {practiceProblems.length}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {practiceProblems.map((problem, index) => (
                  <motion.div
                    key={problem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{problem.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              problem.difficulty === "Easy"
                                ? "secondary"
                                : problem.difficulty === "Medium"
                                  ? "default"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {problem.difficulty}
                          </Badge>
                          {problem.solved && (
                            <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                              Solved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleViewProblem(problem.id, problem.title)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSolveProblem(problem.id, problem.title)}
                      >
                        <Code2 className="h-3 w-3 mr-1" />
                        Solve
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}
