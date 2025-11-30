"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { User, Mail, Calendar, Award, BookOpen, Trophy, Save, Copy } from "lucide-react"
import { useRouter } from "next/navigation"

export default function StudentProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    bio: ""
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('auth_token')
      
      if (token) {
        // Fetch full profile from API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            // The API returns { data: { user: {...} } }
            const profileData = data.data.user || data.data
            setUser(profileData)
            setFormData({
              fullName: profileData.fullName || "",
              email: profileData.email || "",
              username: profileData.username || "",
              bio: profileData.bio || ""
            })
            
            // Update localStorage with full user data including _id
            localStorage.setItem("user", JSON.stringify(profileData))
            return
          }
        }
      }
      
      // Fallback to localStorage data
      const userData = localStorage.getItem("user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setFormData({
          fullName: parsedUser.fullName || "",
          email: parsedUser.email || "",
          username: parsedUser.username || "",
          bio: parsedUser.bio || ""
        })
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      // Fallback to localStorage
      const userData = localStorage.getItem("user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setFormData({
          fullName: parsedUser.fullName || "",
          email: parsedUser.email || "",
          username: parsedUser.username || "",
          bio: parsedUser.bio || ""
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real app, call API to update profile
      const updatedUser = { ...user, ...formData }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    alert(`${label} copied to clipboard!`)
  }

  const stats = {
    problemsSolved: 89,
    contestsParticipated: 12,
    averageScore: 78,
    currentRank: 247
  }

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className="min-h-screen bg-background">
          <DashboardHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex">
            <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-6 md:ml-0">
              <div className="max-w-4xl mx-auto">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading profile...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    )
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
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground mt-2">
                  Manage your account information and view your statistics
                </p>
              </div>

              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>Update your profile details</CardDescription>
                        </div>
                        {!isEditing ? (
                          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button onClick={handleSave} disabled={isSaving}>
                              <Save className="mr-2 h-4 w-4" />
                              {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-12 w-12 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{user?.fullName || "Student"}</h3>
                          <p className="text-muted-foreground">@{user?.username}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge>Student</Badge>
                            {user?._id && (
                              <Badge variant="secondary" className="font-mono text-xs">
                                ID: {user._id}
                              </Badge>
                            )}
                          </div>
                          {user?._id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-7 text-xs"
                              onClick={() => copyToClipboard(user._id, "Student ID")}
                            >
                              <Copy className="mr-1 h-3 w-3" />
                              Copy ID
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Your Student ID
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Share this ID with your teacher to join their class
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 p-2 bg-background rounded border font-mono text-sm">
                            {user?._id || "ID not available"}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(user?._id || "", "Student ID")}
                            disabled={!user?._id}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio">Bio</Label>
                          <textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            disabled={!isEditing}
                            className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="stats" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.problemsSolved}</div>
                        <p className="text-xs text-muted-foreground">
                          Keep solving to improve!
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contests Participated</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.contestsParticipated}</div>
                        <p className="text-xs text-muted-foreground">
                          Join more contests
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.averageScore}%</div>
                        <p className="text-xs text-muted-foreground">
                          Across all contests
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">#{stats.currentRank}</div>
                        <p className="text-xs text-muted-foreground">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently joined"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive email updates about contests and submissions
                          </p>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Change Password</p>
                          <p className="text-sm text-muted-foreground">
                            Update your account password
                          </p>
                        </div>
                        <Button variant="outline">Change</Button>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security
                          </p>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
