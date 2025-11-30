"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Bell, AlertTriangle, CheckCircle, Info, X, Clock } from "lucide-react"

export default function AlertsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setIsLoading(true)
      // Mock alerts data
      const mockAlerts = [
        {
          id: "1",
          type: "plagiarism",
          title: "High Similarity Detected",
          message: "89% similarity found between John Doe and Jane Smith in Weekly Challenge #42",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: "high"
        },
        {
          id: "2",
          type: "submission",
          title: "New Submission",
          message: "Alice Johnson submitted a solution for Problem: Binary Search Tree",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: "normal"
        },
        {
          id: "3",
          type: "contest",
          title: "Contest Starting Soon",
          message: "Algorithm Sprint contest starts in 1 hour",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: "normal"
        },
        {
          id: "4",
          type: "system",
          title: "System Update",
          message: "Platform maintenance scheduled for tonight at 2 AM",
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: "low"
        },
        {
          id: "5",
          type: "plagiarism",
          title: "Moderate Similarity Detected",
          message: "76% similarity found between Mike Johnson and Sarah Wilson in Algorithm Sprint",
          timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: "medium"
        }
      ]
      setAlerts(mockAlerts)
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "plagiarism":
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case "submission":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "contest":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "system":
        return <Info className="h-5 w-5 text-muted-foreground" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return "Just now"
  }

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ))
  }

  const handleDismiss = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId))
  }

  const handleMarkAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })))
  }

  const unreadCount = alerts.filter(a => !a.read).length

  const filterAlerts = (filter: string) => {
    if (filter === "all") return alerts
    if (filter === "unread") return alerts.filter(a => !a.read)
    return alerts.filter(a => a.type === filter)
  }

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-6 md:ml-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Bell className="h-8 w-8" />
                    Alerts & Notifications
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {unreadCount > 0 
                      ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                      : "You're all caught up!"
                    }
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button variant="outline" onClick={handleMarkAllAsRead}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark All as Read
                  </Button>
                )}
              </div>

              <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="all">
                    All ({alerts.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread ({unreadCount})
                  </TabsTrigger>
                  <TabsTrigger value="plagiarism">
                    Plagiarism
                  </TabsTrigger>
                  <TabsTrigger value="submission">
                    Submissions
                  </TabsTrigger>
                  <TabsTrigger value="contest">
                    Contests
                  </TabsTrigger>
                </TabsList>

                {["all", "unread", "plagiarism", "submission", "contest"].map(filter => (
                  <TabsContent key={filter} value={filter} className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading alerts...</p>
                      </div>
                    ) : filterAlerts(filter).length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-12">
                          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No alerts</h3>
                          <p className="text-muted-foreground">
                            {filter === "unread" 
                              ? "You've read all your notifications" 
                              : "No alerts in this category"
                            }
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      filterAlerts(filter).map((alert) => (
                        <Card 
                          key={alert.id} 
                          className={`transition-all ${!alert.read ? 'border-l-4 border-l-primary bg-accent/50' : ''}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="mt-1">
                                {getAlertIcon(alert.type)}
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold">{alert.title}</h3>
                                      {!alert.read && (
                                        <Badge variant="default" className="text-xs">New</Badge>
                                      )}
                                      <Badge variant={getPriorityColor(alert.priority)} className="text-xs">
                                        {alert.priority}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {getTimeAgo(alert.timestamp)}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    {!alert.read && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleMarkAsRead(alert.id)}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDismiss(alert.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
