"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, User, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [studentForm, setStudentForm] = useState({ email: "", password: "" })
  const [teacherForm, setTeacherForm] = useState({ email: "", password: "" })
  const router = useRouter()
  const { login } = useAuth()

  const handleSignIn = async (role: "student" | "teacher") => {
    setIsLoading(true)
    try {
      const form = role === "student" ? studentForm : teacherForm
      await login(form.email, form.password, role)

      // Redirect based on role
      if (role === "student") {
        router.push("/dashboard")
      } else {
        router.push("/teacher/dashboard")
      }
    } catch (error) {
      console.error("Sign in failed:", error)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Code className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CodeContest</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Student
            </TabsTrigger>
            <TabsTrigger value="teacher" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Teacher
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Sign In</CardTitle>
                <CardDescription>Access your contests and track your progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="student@university.edu"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    type="password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <Button className="w-full" onClick={() => handleSignIn("student")} disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In as Student"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teacher">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Sign In</CardTitle>
                <CardDescription>Manage contests and monitor student progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="teacher@university.edu"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password</Label>
                  <Input
                    id="teacher-password"
                    type="password"
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <Button className="w-full" onClick={() => handleSignIn("teacher")} disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In as Teacher"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
