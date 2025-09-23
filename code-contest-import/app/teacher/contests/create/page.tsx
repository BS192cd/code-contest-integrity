"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Clock, Users, Trophy, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CreateContestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [problems, setProblems] = useState([{ title: "", description: "", difficulty: "easy", points: 100 }])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Contest Created",
      description: "Your contest has been successfully created and scheduled.",
    })
    router.push("/teacher/contests")
  }

  const addProblem = () => {
    setProblems([...problems, { title: "", description: "", difficulty: "easy", points: 100 }])
  }

  const removeProblem = (index: number) => {
    setProblems(problems.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Contest</h1>
          <p className="text-muted-foreground">Set up a new coding contest for your students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Contest Details
              </CardTitle>
              <CardDescription>Basic information about your contest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Contest Title</Label>
                  <Input id="title" placeholder="Weekly Programming Challenge #1" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" placeholder="120" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Contest description and rules..." rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date & Time</Label>
                  <Input id="start-date" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-participants">Max Participants</Label>
                  <Input id="max-participants" type="number" placeholder="50" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contest Settings
              </CardTitle>
              <CardDescription>Configure contest behavior and rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Contest</Label>
                  <p className="text-sm text-muted-foreground">Allow anyone to participate</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Plagiarism Detection</Label>
                  <p className="text-sm text-muted-foreground">Automatically scan submissions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Leaderboard</Label>
                  <p className="text-sm text-muted-foreground">Display real-time rankings</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Problems
              </CardTitle>
              <CardDescription>Add problems to your contest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {problems.map((problem, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Problem {index + 1}</h4>
                    {problems.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeProblem(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Problem Title</Label>
                      <Input placeholder="Two Sum" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input type="number" placeholder="100" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Problem Description</Label>
                    <Textarea placeholder="Problem statement..." rows={3} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select defaultValue="easy">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addProblem} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Problem
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              Create Contest
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
