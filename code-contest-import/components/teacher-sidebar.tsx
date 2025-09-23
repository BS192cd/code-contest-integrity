"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Plus, Eye, Users, AlertTriangle, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface TeacherSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const recentContests = [
  { id: 1, title: "Data Structures Quiz", status: "active", participants: 45 },
  { id: 2, title: "Algorithm Challenge", status: "upcoming", participants: 0 },
  { id: 3, title: "Final Exam Practice", status: "ended", participants: 58 },
]

const classGroups = [
  { id: 1, name: "CS 101 - Fall 2024", students: 60, active: 45 },
  { id: 2, name: "Advanced Algorithms", students: 35, active: 32 },
  { id: 3, name: "Data Structures", students: 42, active: 38 },
]

export function TeacherSidebar({ isOpen, onClose }: TeacherSidebarProps) {
  const [contestsSection, setContestsSection] = useState<string>("contests")
  const [classesSection, setClassesSection] = useState<string>("classes")
  const router = useRouter()
  const { toast } = useToast()

  const handleCreateContest = () => {
    router.push("/teacher/contests/create")
    toast({
      title: "Creating new contest",
      description: "Redirecting to contest creation page...",
    })
  }

  const handleViewContest = (contestId: number, contestTitle: string) => {
    router.push(`/teacher/contests/${contestId}`)
    toast({
      title: "Opening contest",
      description: `Viewing ${contestTitle}...`,
    })
  }

  const handleViewClass = (classId: number, className: string) => {
    router.push(`/teacher/classes/${classId}`)
    toast({
      title: "Opening class",
      description: `Viewing ${className}...`,
    })
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-80 transform border-r border-border bg-card transition-transform duration-200 ease-in-out md:relative md:top-0 md:h-[calc(100vh-4rem)] md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ScrollArea className="h-full px-4 py-6">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Quick Actions</h3>
              <Button className="w-full justify-start" onClick={handleCreateContest}>
                <Plus className="mr-2 h-4 w-4" />
                Create Contest
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>

            {/* Recent Contests */}
            <Collapsible
              open={contestsSection === "contests"}
              onOpenChange={() => setContestsSection(contestsSection === "contests" ? "" : "contests")}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="font-medium">Recent Contests</span>
                    <Badge variant="secondary" className="ml-auto">
                      {recentContests.length}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {recentContests.map((contest) => (
                  <div
                    key={contest.id}
                    className="rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleViewContest(contest.id, contest.title)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{contest.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {contest.participants} participants
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          contest.status === "active"
                            ? "default"
                            : contest.status === "upcoming"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {contest.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Class Groups */}
            <Collapsible
              open={classesSection === "classes"}
              onOpenChange={() => setClassesSection(classesSection === "classes" ? "" : "classes")}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    <span className="font-medium">My Classes</span>
                    <Badge variant="outline" className="ml-auto">
                      {classGroups.length}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {classGroups.map((classGroup) => (
                  <div
                    key={classGroup.id}
                    className="rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleViewClass(classGroup.id, classGroup.name)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{classGroup.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {classGroup.active}/{classGroup.students} students active
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Alerts */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Alerts
              </h3>
              <div className="rounded-lg border border-destructive/20 p-3 bg-destructive/5">
                <p className="text-sm font-medium text-destructive">2 Plagiarism Alerts</p>
                <p className="text-xs text-muted-foreground mt-1">Requires your attention</p>
                <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                  Review Now
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}
