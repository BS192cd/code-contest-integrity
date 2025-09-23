"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    notifications: {
      contestReminders: true,
      newProblems: false,
      leaderboardUpdates: true,
      emailDigest: true,
    },
    preferences: {
      theme: "system",
      language: "javascript",
      fontSize: "medium",
      autoSave: true,
    },
    privacy: {
      profileVisible: true,
      showRanking: true,
      showActivity: false,
    },
  })

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
  }

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }))
  }

  const handlePrivacyChange = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }))
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
                <h1 className="text-3xl font-bold text-balance">Settings</h1>
                <p className="text-muted-foreground mt-2 text-pretty">
                  Customize your experience and manage your preferences.
                </p>
              </div>

              <Tabs defaultValue="notifications" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Choose what notifications you want to receive</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Contest Reminders</Label>
                          <p className="text-sm text-muted-foreground">Get notified before contests start</p>
                        </div>
                        <Switch
                          checked={settings.notifications.contestReminders}
                          onCheckedChange={(value) => handleNotificationChange("contestReminders", value)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>New Problems</Label>
                          <p className="text-sm text-muted-foreground">Notify when new practice problems are added</p>
                        </div>
                        <Switch
                          checked={settings.notifications.newProblems}
                          onCheckedChange={(value) => handleNotificationChange("newProblems", value)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Leaderboard Updates</Label>
                          <p className="text-sm text-muted-foreground">Get notified about ranking changes</p>
                        </div>
                        <Switch
                          checked={settings.notifications.leaderboardUpdates}
                          onCheckedChange={(value) => handleNotificationChange("leaderboardUpdates", value)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Digest</Label>
                          <p className="text-sm text-muted-foreground">Weekly summary of your activity</p>
                        </div>
                        <Switch
                          checked={settings.notifications.emailDigest}
                          onCheckedChange={(value) => handleNotificationChange("emailDigest", value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>Coding Preferences</CardTitle>
                      <CardDescription>Customize your coding environment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Theme</Label>
                          <Select
                            value={settings.preferences.theme}
                            onValueChange={(value) => handlePreferenceChange("theme", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Default Language</Label>
                          <Select
                            value={settings.preferences.language}
                            onValueChange={(value) => handlePreferenceChange("language", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="javascript">JavaScript</SelectItem>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="java">Java</SelectItem>
                              <SelectItem value="cpp">C++</SelectItem>
                              <SelectItem value="c">C</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Font Size</Label>
                        <Select
                          value={settings.preferences.fontSize}
                          onValueChange={(value) => handlePreferenceChange("fontSize", value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-save Code</Label>
                          <p className="text-sm text-muted-foreground">Automatically save your code while typing</p>
                        </div>
                        <Switch
                          checked={settings.preferences.autoSave}
                          onCheckedChange={(value) => handlePreferenceChange("autoSave", value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="privacy">
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy Settings</CardTitle>
                      <CardDescription>Control what information is visible to others</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Public Profile</Label>
                          <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                        </div>
                        <Switch
                          checked={settings.privacy.profileVisible}
                          onCheckedChange={(value) => handlePrivacyChange("profileVisible", value)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Show Ranking</Label>
                          <p className="text-sm text-muted-foreground">Display your rank on leaderboards</p>
                        </div>
                        <Switch
                          checked={settings.privacy.showRanking}
                          onCheckedChange={(value) => handlePrivacyChange("showRanking", value)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Show Activity</Label>
                          <p className="text-sm text-muted-foreground">Let others see your recent activity</p>
                        </div>
                        <Switch
                          checked={settings.privacy.showActivity}
                          onCheckedChange={(value) => handlePrivacyChange("showActivity", value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="account">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account password</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                        <Button>Update Password</Button>
                      </CardContent>
                    </Card>

                    <Card className="border-destructive">
                      <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions that affect your account</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="destructive">Delete Account</Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end mt-8">
                <Button onClick={handleSave}>Save All Changes</Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
