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

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [studentForm, setStudentForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: ""
  })
  const [teacherForm, setTeacherForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: ""
  })
  
  const router = useRouter()
  const { register } = useAuth()

  const handleSignUp = async (role: "student" | "teacher") => {
    setIsLoading(true)
    try {
      const formData = role === "student" ? studentForm : teacherForm
      
      // Validate required fields
      if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
        throw new Error("All fields are required")
      }

      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: role
      })

      // Redirect based on role
      if (role === "student") {
        router.push("/dashboard")
      } else {
        router.push("/teacher/dashboard")
      }
    } catch (error) {
      console.error("Sign up failed:", error)
      if (error instanceof Error) {
        alert(error.message) // Show error to user
      } else {
        alert("Sign up failed. Please try again.") // Fallback message
      }
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">Join thousands of competitive programmers</p>
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
                <CardTitle>Student Registration</CardTitle>
                <CardDescription>Start your competitive programming journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-username">Username *</Label>
                  <Input 
                    id="student-username" 
                    placeholder="momin123"
                    value={studentForm.username}
                    onChange={(e) => setStudentForm(prev => ({...prev, username: e.target.value}))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-fullname">Full Name *</Label>
                  <Input 
                    id="student-fullname" 
                    placeholder="Momin Saqib Ahmed"
                    value={studentForm.fullName}
                    onChange={(e) => setStudentForm(prev => ({...prev, fullName: e.target.value}))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email *</Label>
                  <Input 
                    id="student-email" 
                    type="email" 
                    placeholder="mominsaqibahmed@gmail.com"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm(prev => ({...prev, email: e.target.value}))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password *</Label>
                  <Input 
                    id="student-password" 
                    type="password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm(prev => ({...prev, password: e.target.value}))}
                    required
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleSignUp("student")} 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Student Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teacher">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Registration</CardTitle>
                <CardDescription>Create and manage coding contests for your students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-username">Username *</Label>
                  <Input 
                    id="teacher-username" 
                    placeholder="prof_momin"
                    value={teacherForm.username}
                    onChange={(e) => setTeacherForm(prev => ({...prev, username: e.target.value}))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-fullname">Full Name *</Label>
                  <Input 
                    id="teacher-fullname" 
                    placeholder="Dr. Momin Saqib Ahmed"
                    value={teacherForm.fullName}
                    onChange={(e) => setTeacherForm(prev => ({...prev, fullName: e.target.value}))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email *</Label>
                  <Input 
                    id="teacher-email" 
                    type="email" 
                    placeholder="mominsaqibahmed@gmail.com"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm(prev => ({...prev, email: e.target.value}))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password *</Label>
                  <Input 
                    id="teacher-password" 
                    type="password"
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm(prev => ({...prev, password: e.target.value}))}
                    required
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleSignUp("teacher")} 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Teacher Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}