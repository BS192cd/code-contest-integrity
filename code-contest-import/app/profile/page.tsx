"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Edit, Save } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const achievements = [
  {
    id: 1,
    title: "First Contest",
    description: "Participated in your first contest",
    earned: true,
    date: "2024-01-15",
  },
  { id: 2, title: "Problem Solver", description: "Solved 50+ problems", earned: true, date: "2024-02-20" },
  { id: 3, title: "Speed Demon", description: "Solved a problem in under 5 minutes", earned: false },
  { id: 4, title: "Consistency King", description: "7-day solving streak", earned: true, date: "2024-03-10" },
]

const contestHistory = [
  { id: 1, name: "Weekly Challenge #42", rank: 15, score: 850, date: "2024-03-15" },
  { id: 2, name: "Algorithm Sprint", rank: 8, score: 920, date: "2024-03-08" },
  { id: 3, name: "Data Structures Quiz", rank: 23, score: 780, date: "2024-03-01" },
]

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { user } = useAuth()
  const [profileData, setProfileData] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@example.com",
    bio: "Passionate competitive programmer with a love for algorithms and data structures.",
    university: "Tech University",
    year: "3rd Year",
    major: "Computer Science",
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to backend
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-6 md:ml-0">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-balance">My Profile</h1>
                <p className="text-muted-foreground mt-2 text-pretty">
                  Manage your profile information and view your coding journey.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                  <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src="/diverse-user-avatars.png" alt="Profile" />
                      <AvatarFallback className="text-2xl">
                        {profileData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle>{profileData.name}</CardTitle>
                    <CardDescription>{profileData.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Global Rank</span>
                        <Badge variant="secondary">#247</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Problems Solved</span>
                        <span className="font-medium">89</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Contests Joined</span>
                        <span className="font-medium">12</span>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    >
                      {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Main Content */}
                <div className="md:col-span-2">
                  <Tabs defaultValue="info" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="info">Information</TabsTrigger>
                      <TabsTrigger value="achievements">Achievements</TabsTrigger>
                      <TabsTrigger value="history">Contest History</TabsTrigger>
                      <TabsTrigger value="stats">Statistics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info">
                      <Card>
                        <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>Update your profile details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                disabled={!isEditing}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={profileData.bio}
                              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                              disabled={!isEditing}
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label htmlFor="university">University</Label>
                              <Input
                                id="university"
                                value={profileData.university}
                                onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                                disabled={!isEditing}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="year">Year</Label>
                              <Input
                                id="year"
                                value={profileData.year}
                                onChange={(e) => setProfileData({ ...profileData, year: e.target.value })}
                                disabled={!isEditing}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="major">Major</Label>
                              <Input
                                id="major"
                                value={profileData.major}
                                onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="achievements">
                      <Card>
                        <CardHeader>
                          <CardTitle>Achievements</CardTitle>
                          <CardDescription>Your coding milestones and accomplishments</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4">
                            {achievements.map((achievement) => (
                              <div
                                key={achievement.id}
                                className={`flex items-center gap-4 p-4 rounded-lg border ${
                                  achievement.earned ? "bg-accent/50" : "opacity-50"
                                }`}
                              >
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    achievement.earned ? "bg-primary text-primary-foreground" : "bg-muted"
                                  }`}
                                >
                                  <Trophy className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{achievement.title}</h4>
                                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                  {achievement.earned && achievement.date && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Earned on {new Date(achievement.date).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                {achievement.earned && <Badge variant="secondary">Earned</Badge>}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="history">
                      <Card>
                        <CardHeader>
                          <CardTitle>Contest History</CardTitle>
                          <CardDescription>Your recent contest performances</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {contestHistory.map((contest) => (
                              <div key={contest.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <h4 className="font-medium">{contest.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(contest.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">Rank #{contest.rank}</Badge>
                                    <span className="font-medium">{contest.score} pts</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="stats">
                      <div className="grid gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Problem Solving Statistics</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Easy Problems</span>
                                <span>45/60 (75%)</span>
                              </div>
                              <Progress value={75} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Medium Problems</span>
                                <span>32/80 (40%)</span>
                              </div>
                              <Progress value={40} className="h-2" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Hard Problems</span>
                                <span>12/50 (24%)</span>
                              </div>
                              <Progress value={24} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>Activity Overview</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">7</div>
                                <p className="text-sm text-muted-foreground">Current Streak</p>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">156</div>
                                <p className="text-sm text-muted-foreground">Total Submissions</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
