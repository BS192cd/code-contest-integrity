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
                        
                        
                                  </div>
        </ScrollArea>
      </aside>
    </>
  )
}
