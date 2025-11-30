"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/code-editor"
import { Play, Send, ChevronLeft, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface Problem {
  _id: string
  title: string
  difficulty: string
  tags?: string[]
  description?: string
  inputFormat?: string
  outputFormat?: string
  constraints?: string | string[]
  sampleInput?: string
  sampleOutput?: string
  examples?: { input: string; output: string; explanation?: string }[]
  testCases?: { input: string; expectedOutput?: string; output?: string; isHidden?: boolean }[]
  solutionTemplate?: Record<string, string>
}

export default function LeetCodeStyleSolvePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [problem, setProblem] = useState<Problem | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('testcase')
  const [selectedCase, setSelectedCase] = useState(0)
  const [leftPanelTab, setLeftPanelTab] = useState('description')
  const [submissions, setSubmissions] = useState<any[]>([])
  const [localSubmissions, setLocalSubmissions] = useState<any[]>([])

  useEffect(() => {
    if (leftPanelTab === 'submissions') {
      fetchSubmissions()
      loadLocalSubmissions()
    }
  }, [leftPanelTab])

  const loadLocalSubmissions = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`submissions_${params.id}`)
      if (stored) {
        try {
          setLocalSubmissions(JSON.parse(stored))
        } catch (e) {
          console.error('Failed to parse local submissions:', e)
        }
      }
    }
  }

  const saveLocalSubmission = (submissionData: any) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`submissions_${params.id}`)
      let submissions = []
      if (stored) {
        try {
          submissions = JSON.parse(stored)
        } catch (e) {
          submissions = []
        }
      }

      // Add new submission at the beginning
      submissions.unshift(submissionData)

      // Keep only last 10 submissions
      submissions = submissions.slice(0, 10)

      localStorage.setItem(`submissions_${params.id}`, JSON.stringify(submissions))
      setLocalSubmissions(submissions)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await apiClient.getSubmissions({
        problemId: params.id as string,
        limit: 10
      })
      setSubmissions(response.data || [])
    } catch (error: any) {
      // Silently handle authentication errors - this is expected when not logged in
      // Just use local submissions instead
      setSubmissions([])
    }
  }

  // Resizable panel state
  const [leftWidth, setLeftWidth] = useState(50)
  const isDragging = useRef(false)

  useEffect(() => {
    fetchProblem()
  }, [params.id])

  // Update code when language changes - Start with empty editor (Codeforces style)
  useEffect(() => {
    if (problem) {
      // Always start with empty editor - no boilerplate
      setCode('')
    }
  }, [language, problem])

  const fetchProblem = async () => {
    try {
      const response = await apiClient.getProblem(params.id as string)
      setProblem(response.data)
      // Don't set code here - let the useEffect handle it
      setLoading(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load problem",
        variant: "destructive"
      })
    }
  }

  const handleRun = async () => {
    setRunning(true)
    setActiveTab('result')
    try {
      const response = await apiClient.runCode({
        problemId: params.id as string,
        code,
        language
      })

      console.log('API Response:', response)

      // Handle nested data structure
      const results = response.data?.results || response.data?.data?.results || (response as any).results || []
      console.log('Parsed results:', results)

      setTestResults(results)

      if (results.length > 0) {
        const passed = results.filter((r: any) =>
          r.status === 'passed' || r.passed === true
        ).length

        toast({
          title: passed === results.length ? "✅ All Tests Passed!" : "❌ Some Tests Failed",
          description: `${passed}/${results.length} test cases passed`
        })
      }
    } catch (error: any) {
      console.error('Run error:', error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to run code",
        variant: "destructive"
      })
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setActiveTab('result') // Switch to result tab immediately
    setTestResults([]) // Clear old results
    
    try {
      // Submit the solution (will test against all test cases including hidden)
      const response = await apiClient.submitSolution({
        problemId: params.id as string,
        code,
        language
      })

      // Poll for submission result
      const submissionId = response.data?.id || response.data?.data?.id
      if (submissionId) {
        // Poll until submission is complete (max 30 seconds)
        let submission = null
        let attempts = 0
        const maxAttempts = 20 // 20 attempts * 2 seconds = 40 seconds max
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Check every 1 second instead of 2
          
          const submissionResponse = await apiClient.getSubmission(submissionId)
          submission = submissionResponse.data || submissionResponse.data?.data
          
          console.log(`📊 Checking status (${attempts + 1}/${maxAttempts}): ${submission.status}`)
          
          // Check if submission is complete (not pending or running)
          if (submission.status !== 'pending' && submission.status !== 'running') {
            console.log('✅ Submission complete!')
            break
          }
          
          attempts++
        }
        
        if (!submission) {
          throw new Error('Failed to get submission status')
        }
        
        // Check if polling timed out while still running
        if (attempts >= maxAttempts && (submission.status === 'pending' || submission.status === 'running')) {
          console.warn('⚠️ Polling timeout - submission still running, continuing in background...')
          
          // Show partial results if available
          const partialStats = submission.testCaseStats
          const partialResults = submission.testResults || []
          
          let partialMessage = "Your submission is taking longer than expected. We'll notify you when it completes."
          
          if (partialStats && partialStats.total > 0) {
            const completed = partialResults.filter((r: any) => r.status !== 'pending').length
            const passed = partialResults.filter((r: any) => r.status === 'passed').length
            const failed = partialResults.filter((r: any) => r.status === 'failed').length
            const errors = partialResults.filter((r: any) => r.status === 'runtime_error').length
            
            if (completed > 0) {
              partialMessage = `Progress: ${completed}/${partialStats.total} tests completed (${passed} passed`
              if (failed > 0) partialMessage += `, ${failed} failed`
              if (errors > 0) partialMessage += `, ${errors} errors`
              partialMessage += '). Continuing in background...'
              
              // Find first failure for context
              const firstFailure = partialResults.find((r: any) => r.status !== 'passed' && r.status !== 'pending')
              if (firstFailure) {
                const testNum = firstFailure.testCaseIndex + 1
                if (firstFailure.status === 'runtime_error') {
                  partialMessage += ` Test ${testNum}: Runtime Error.`
                } else if (firstFailure.status === 'failed') {
                  partialMessage += ` Test ${testNum}: Wrong Answer.`
                }
              }
            }
          }
          
          toast({
            title: "⏳ Submission Still Processing",
            description: partialMessage,
            duration: 10000
          })
          
          // Update test results with partial data
          if (partialResults.length > 0) {
            setTestResults(partialResults)
          }
          
          // Save as pending in local storage with partial stats
          saveLocalSubmission({
            _id: submissionId,
            status: 'Running',
            language,
            createdAt: new Date().toISOString(),
            passed: partialStats?.passed || 0,
            total: partialStats?.total || 0,
            code,
            testCaseStats: partialStats
          })
          
          // Continue polling in background (up to 2 more minutes)
          const backgroundPoll = async () => {
            const maxBackgroundAttempts = 60 // 60 * 2s = 2 minutes more
            let bgAttempts = 0
            
            while (bgAttempts < maxBackgroundAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000))
              
              try {
                const bgResponse = await apiClient.getSubmission(submissionId)
                const bgSubmission = bgResponse.data || bgResponse.data?.data
                
                console.log(`🔄 Background poll ${bgAttempts + 1}: Status = ${bgSubmission.status}`)
                
                // Check if complete
                if (bgSubmission.status !== 'pending' && bgSubmission.status !== 'running') {
                  console.log('✅ Background polling complete!')
                  
                  // Show final result notification
                  const finalStats = bgSubmission.testCaseStats
                  const finalStatus = bgSubmission.status
                  const finalMessage = bgSubmission.statusMessage
                  
                  if (finalStatus === 'accepted') {
                    // Use statusMessage from backend (has correct info) or build from stats
                    let successMessage = finalMessage
                    if (!successMessage && finalStats) {
                      const visiblePassed = finalStats.visible?.passed || 0
                      const visibleTotal = finalStats.visible?.total || 0
                      const hiddenPassed = finalStats.hidden?.passed || 0
                      const hiddenTotal = finalStats.hidden?.total || 0
                      const totalPassed = finalStats.passed || (visiblePassed + hiddenPassed)
                      const totalTests = finalStats.total || (visibleTotal + hiddenTotal)
                      
                      if (totalTests > 0) {
                        successMessage = `All test cases passed! (${visibleTotal} visible + ${hiddenTotal} hidden)`
                      } else {
                        successMessage = 'All test cases passed!'
                      }
                    }
                    
                    toast({
                      title: "🎉 Solution Accepted!",
                      description: successMessage || 'All test cases passed!',
                      duration: 10000
                    })
                  } else {
                    // Find first failed test
                    const failedTest = bgSubmission.testResults?.find((t: any) => t.status !== 'passed')
                    let errorDetail = ''
                    
                    if (failedTest) {
                      const testNum = failedTest.testCaseIndex + 1
                      if (failedTest.status === 'runtime_error') {
                        errorDetail = `Test ${testNum}: Runtime Error`
                      } else if (failedTest.status === 'timeout') {
                        errorDetail = `Test ${testNum}: Time Limit Exceeded`
                      } else {
                        errorDetail = `Test ${testNum}: Wrong Answer`
                      }
                    }
                    
                    toast({
                      title: "❌ Solution Failed",
                      description: errorDetail || finalMessage || `Tests: ${finalStats?.passed || 0}/${finalStats?.total || 0} passed`,
                      variant: "destructive",
                      duration: 10000
                    })
                  }
                  
                  // Update local storage with final result
                  saveLocalSubmission({
                    _id: submissionId,
                    status: finalStatus === 'accepted' ? 'Accepted' : 'Wrong Answer',
                    language,
                    createdAt: new Date().toISOString(),
                    passed: finalStats?.passed || 0,
                    total: finalStats?.total || 0,
                    code,
                    testCaseStats: finalStats
                  })
                  
                  // Refresh submissions list
                  fetchSubmissions()
                  
                  break
                }
              } catch (error) {
                console.error('Background polling error:', error)
              }
              
              bgAttempts++
            }
            
            if (bgAttempts >= maxBackgroundAttempts) {
              console.warn('⚠️ Background polling also timed out')
              toast({
                title: "⏰ Submission Timeout",
                description: "Please check the Submissions tab for final results.",
                duration: 8000
              })
            }
          }
          
          // Start background polling (non-blocking)
          backgroundPoll()
          
          // Refresh submissions to show current status
          if (leftPanelTab === 'submissions') {
            fetchSubmissions()
          }
          
          return // Don't show success/failure message yet
        }
        
        const stats = submission.testCaseStats
        const status = submission.status
        const statusMessage = submission.statusMessage
        
        console.log('📊 Final Status:', status)
        console.log('📊 Stats:', stats)
        
        // Update test results with submission results
        setTestResults(submission.testResults || [])
        
        // Save to local storage
        saveLocalSubmission({
          _id: submissionId,
          status: status === 'accepted' ? 'Accepted' : 'Wrong Answer',
          language,
          createdAt: new Date().toISOString(),
          passed: stats?.passed || 0,
          total: stats?.total || 0,
          code,
          testCaseStats: stats
        })

        // Show detailed results
        if (status === 'accepted') {
          // Use statusMessage from backend if available (it has the correct info)
          const message = statusMessage || 'All test cases passed!'
          
          toast({
            title: "✅ Solution Accepted!",
            description: message,
            duration: 5000
          })
        } else {
          // Find first failed test case for detailed error message
          const failedTest = submission.testResults?.find((t: any) => t.status !== 'passed')
          let errorDetail = ''
          
          if (failedTest) {
            const testNum = failedTest.testCaseIndex + 1
            if (failedTest.status === 'runtime_error') {
              errorDetail = `Test ${testNum}: Runtime Error - ${failedTest.errorMessage || 'Code crashed'}`
            } else if (failedTest.status === 'timeout') {
              errorDetail = `Test ${testNum}: Time Limit Exceeded`
            } else if (failedTest.status === 'failed') {
              errorDetail = `Test ${testNum}: Wrong Answer - Output mismatch`
            } else {
              errorDetail = `Test ${testNum}: ${failedTest.status}`
            }
          }
          
          const visibleInfo = stats?.visible ? `${stats.visible.passed}/${stats.visible.total} visible` : ''
          const hiddenInfo = stats?.hidden ? `${stats.hidden.passed}/${stats.hidden.total} hidden` : ''
          const testInfo = `Tests: ${visibleInfo}${visibleInfo && hiddenInfo ? ', ' : ''}${hiddenInfo}`
          
          toast({
            title: "❌ Solution Failed",
            description: errorDetail || statusMessage || testInfo,
            variant: "destructive",
            duration: 8000
          })
        }
        
        // Refresh submissions list
        if (leftPanelTab === 'submissions') {
          fetchSubmissions()
        }
      }
    } catch (error: any) {
      console.error('Submit error:', error)
      toast({
        title: "Error",
        description: error.response?.data?.message || error.response?.data?.error || "Failed to submit solution",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleMouseDown = () => {
    isDragging.current = true
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      const newWidth = (e.clientX / window.innerWidth) * 100
      setLeftWidth(Math.max(0, Math.min(100, newWidth)))
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove as any)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!problem) return null

  const difficultyColor = {
    easy: 'text-green-600',
    medium: 'text-yellow-600',
    hard: 'text-red-600'
  }[problem.difficulty.toLowerCase()] || 'text-gray-600'

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-12 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(user?.role === 'teacher' ? '/teacher/problems' : '/problems')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Problem List
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-8 px-3 rounded-md border bg-background text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRun}
            disabled={running}
          >
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-1" />
            Submit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description & Submissions */}
        <div
          className="border-r overflow-hidden flex flex-col"
          style={{ width: `${leftWidth}%` }}
        >
          <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full justify-start rounded-none border-b h-10 px-4 bg-background">
              <TabsTrigger value="description" className="text-sm data-[state=active]:bg-muted">
                Description
              </TabsTrigger>
              <TabsTrigger value="editorial" className="text-sm data-[state=active]:bg-muted">
                Editorial
              </TabsTrigger>
              <TabsTrigger value="solutions" className="text-sm data-[state=active]:bg-muted">
                Solutions
              </TabsTrigger>
              <TabsTrigger value="submissions" className="text-sm data-[state=active]:bg-muted">
                Submissions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="flex-1 m-0 overflow-auto">
              <div className="p-6 max-w-4xl">
                {/* Title and Difficulty */}
                <h1 className="text-2xl font-bold mb-3">{problem.title}</h1>

                <div className="flex items-center gap-2 mb-8 pb-6 border-b">
                  <span className={cn("text-sm font-semibold px-2 py-1 rounded", difficultyColor)}>
                    {problem.difficulty}
                  </span>
                  {problem.tags && problem.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Description */}
                {problem.description && typeof problem.description === 'string' && (
                  <div className="mb-8">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {problem.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Input Format */}
                {problem.inputFormat && (
                  <div className="mb-6">
                    <p className="font-semibold text-base mb-2">Input Format:</p>
                    <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 p-4 rounded-lg">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {problem.inputFormat}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Output Format */}
                {problem.outputFormat && (
                  <div className="mb-6">
                    <p className="font-semibold text-base mb-2">Output Format:</p>
                    <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 p-4 rounded-lg">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {problem.outputFormat}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Sample Test Case */}
                {(problem.sampleInput || problem.sampleOutput) && (
                  <div className="mb-8">
                    <p className="font-semibold text-base mb-3">Sample Test Case:</p>
                    <div className="bg-muted/50 border border-border p-4 rounded-lg space-y-3">
                      {problem.sampleInput && (
                        <div>
                          <span className="font-semibold text-sm text-muted-foreground">Input:</span>
                          <pre className="text-sm mt-2 font-mono bg-background p-2 rounded border whitespace-pre-wrap">{problem.sampleInput}</pre>
                        </div>
                      )}
                      {problem.sampleOutput && (
                        <div>
                          <span className="font-semibold text-sm text-muted-foreground">Output:</span>
                          <pre className="text-sm mt-2 font-mono bg-background p-2 rounded border whitespace-pre-wrap">{problem.sampleOutput}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Legacy Examples (for old scraped problems) */}
                {problem.examples && problem.examples.length > 0 && !problem.sampleInput && (
                  <div className="space-y-6 mb-8">
                    {problem.examples.map((example, i) => (
                      <div key={i} className="space-y-3">
                        <p className="font-semibold text-base">Example {i + 1}:</p>
                        <div className="bg-muted/50 border border-border p-4 rounded-lg space-y-3">
                          <div>
                            <span className="font-semibold text-sm text-muted-foreground">Input:</span>
                            <pre className="text-sm mt-2 font-mono bg-background p-2 rounded border">{example.input}</pre>
                          </div>
                          <div>
                            <span className="font-semibold text-sm text-muted-foreground">Output:</span>
                            <pre className="text-sm mt-2 font-mono bg-background p-2 rounded border">{example.output}</pre>
                          </div>
                          {example.explanation && (
                            <div>
                              <span className="font-semibold text-sm text-muted-foreground">Explanation:</span>
                              <p className="text-sm mt-2 leading-6">{example.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && (
                  <div className="space-y-3">
                    <p className="font-semibold text-base">Constraints:</p>
                    {typeof problem.constraints === 'string' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {problem.constraints}
                        </ReactMarkdown>
                      </div>
                    ) : Array.isArray(problem.constraints) && problem.constraints.length > 0 ? (
                      <ul className="space-y-2 pl-1">
                        {problem.constraints.map((constraint, i) => (
                          <li key={i} className="text-sm leading-6 flex items-start">
                            <span className="text-muted-foreground mr-2">•</span>
                            <span className="text-foreground font-mono text-xs bg-muted/30 px-2 py-1 rounded">
                              {constraint}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="editorial" className="flex-1 m-0 overflow-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Editorial</h2>
                <div className="text-muted-foreground text-center py-12">
                  <p>Editorial coming soon...</p>
                  <p className="text-sm mt-2">Check back later for detailed explanations and approaches.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="solutions" className="flex-1 m-0 overflow-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Solutions</h2>
                <div className="text-muted-foreground text-center py-12">
                  <p>Community solutions coming soon...</p>
                  <p className="text-sm mt-2">Share your solution after solving the problem!</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="flex-1 m-0 overflow-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Your Submissions</h2>
                {submissions.length === 0 && localSubmissions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No submissions yet</p>
                    <p className="text-xs mt-2">
                      {typeof window !== 'undefined' && !localStorage.getItem('auth_token')
                        ? 'Submissions are saved locally. Login to sync across devices.'
                        : 'Submit your solution to see it here'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Show server submissions first if logged in */}
                    {submissions.map((submission, i) => {
                      const isAccepted = submission.status === 'accepted' || submission.status === 'Accepted'
                      const isRunning = submission.status === 'running' || submission.status === 'pending'
                      const isFailed = !isAccepted && !isRunning
                      
                      return (
                        <div
                          key={`server_${i}`}
                          className={cn(
                            "p-4 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors",
                            isAccepted && "border-green-200 bg-green-50/50",
                            isRunning && "border-orange-200 bg-orange-50/50",
                            isFailed && "border-red-200 bg-red-50/50"
                          )}
                          onClick={() => router.push(`/submissions/${submission._id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={cn(
                              "font-medium text-sm capitalize",
                              isAccepted && "text-green-600",
                              isRunning && "text-orange-600",
                              isFailed && "text-red-600"
                            )}>
                              {submission.status}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(submission.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Language: {submission.language}</span>
                            {submission.runtime && <span>Runtime: {submission.runtime}ms</span>}
                            {submission.memory && <span>Memory: {submission.memory}MB</span>}
                          </div>
                        </div>
                      )
                    })}

                    {/* Show local submissions if not logged in or as fallback */}
                    {submissions.length === 0 && localSubmissions.map((submission, i) => (
                      <div
                        key={`local_${i}`}
                        className={cn(
                          "p-4 rounded-md border",
                          submission.status === 'Accepted'
                            ? "border-green-200 bg-green-50/50"
                            : "border-red-200 bg-red-50/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium text-sm",
                              submission.status === 'Accepted' ? "text-green-600" : "text-red-600"
                            )}>
                              {submission.status}
                            </span>
                            <Badge variant="outline" className="text-xs">Local</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(submission.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Language: {submission.language}</span>
                          {submission.passed !== undefined && submission.total !== undefined && (
                            <span>Tests: {submission.passed}/{submission.total}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />

        {/* Right Panel - Code Editor */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: `${100 - leftWidth}%` }}
        >
          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={code}
              onChange={(value) => setCode(value || '')}
              language={language}
            />
          </div>

          {/* Bottom Panel - Test Cases */}
          <div className="h-64 border-t flex flex-col overflow-hidden bg-background">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="w-full justify-start rounded-none border-b h-10 px-4 bg-background">
                <TabsTrigger value="testcase" className="text-sm data-[state=active]:bg-muted">
                  Testcase
                </TabsTrigger>
                <TabsTrigger value="result" className="text-sm data-[state=active]:bg-muted">
                  Test Result
                </TabsTrigger>
              </TabsList>

              <TabsContent value="testcase" className="flex-1 m-0 p-4 overflow-auto">
                {problem.testCases && problem.testCases.length > 0 ? (
                  <div className="space-y-3">
                    {/* Case Tabs - Show only non-hidden test cases */}
                    <div className="flex gap-2 flex-wrap">
                      {problem.testCases
                        .map((tc, i) => ({ tc, originalIndex: i }))
                        .filter(({ tc }) => !tc.isHidden)
                        .map(({ originalIndex }, displayIndex) => (
                          <button
                            key={originalIndex}
                            onClick={() => setSelectedCase(originalIndex)}
                            className={cn(
                              "px-3 py-1 text-sm rounded-md transition-colors",
                              selectedCase === originalIndex
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            )}
                          >
                            Case {displayIndex + 1}
                          </button>
                        ))}
                    </div>

                    {/* Selected Case Content */}
                    {problem.testCases[selectedCase] && !problem.testCases[selectedCase].isHidden && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Input:</p>
                          <div className="bg-muted p-3 rounded-md">
                            <pre className="text-sm whitespace-pre-wrap">{problem.testCases[selectedCase].input}</pre>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Expected Output:</p>
                          <div className="bg-muted p-3 rounded-md">
                            <pre className="text-sm whitespace-pre-wrap">{problem.testCases[selectedCase].expectedOutput || problem.testCases[selectedCase].output}</pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (problem.sampleInput || problem.sampleOutput) ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground"
                      >
                        Sample Test Case
                      </button>
                    </div>

                    <div className="space-y-3">
                      {problem.sampleInput && (
                        <div>
                          <p className="text-sm font-medium mb-1">Input:</p>
                          <div className="bg-muted p-3 rounded-md">
                            <pre className="text-sm whitespace-pre-wrap">{problem.sampleInput}</pre>
                          </div>
                        </div>
                      )}
                      {problem.sampleOutput && (
                        <div>
                          <p className="text-sm font-medium mb-1">Expected Output:</p>
                          <div className="bg-muted p-3 rounded-md">
                            <pre className="text-sm whitespace-pre-wrap">{problem.sampleOutput}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : problem.examples && problem.examples.length > 0 ? (
                  <div className="space-y-3">
                    {/* Case Tabs */}
                    <div className="flex gap-2">
                      {problem.examples.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedCase(i)}
                          className={cn(
                            "px-3 py-1 text-sm rounded-md transition-colors",
                            selectedCase === i
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                    </div>

                    {/* Selected Case Content */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Input:</p>
                        <div className="bg-muted p-3 rounded-md">
                          <pre className="text-sm">{problem.examples[selectedCase].input}</pre>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Expected Output:</p>
                        <div className="bg-muted p-3 rounded-md">
                          <pre className="text-sm">{problem.examples[selectedCase].output}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">No test cases available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="result" className="flex-1 m-0 p-4 overflow-auto">
                {testResults.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">You must run your code first</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Show only visible test case results */}
                    {testResults
                      .filter((result, i) => {
                        // Show only non-hidden test cases
                        const visibleCount = problem?.testCases?.filter(tc => !tc.isHidden).length || testResults.length
                        return i < visibleCount
                      })
                      .map((result, i) => (
                        <div
                          key={i}
                          className={cn(
                            "p-3 rounded-md border",
                            (result.passed || result.status === 'passed')
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {(result.passed || result.status === 'passed') ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium text-sm">
                              Test Case {i + 1} - {(result.passed || result.status === 'passed') ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Input:</span>
                              <pre className="mt-1 text-xs bg-white p-2 rounded border">
                                {result.input || result.testInput || 'N/A'}
                              </pre>
                            </div>
                            <div>
                              <span className="font-medium">Expected:</span>
                              <pre className="mt-1 text-xs bg-white p-2 rounded border">
                                {result.expected || result.expectedOutput || 'N/A'}
                              </pre>
                            </div>
                            <div>
                              <span className="font-medium">Output:</span>
                              <pre className="mt-1 text-xs bg-white p-2 rounded border">
                                {result.output || result.actualOutput || 'N/A'}
                              </pre>
                            </div>
                            {result.error && (
                              <div>
                                <span className="font-medium text-red-600">Error:</span>
                                <pre className="mt-1 text-xs bg-white p-2 rounded border text-red-600">
                                  {result.error}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    
                    {/* Show hidden test case summary if available */}
                    {testResults.length > (problem?.testCases?.filter(tc => !tc.isHidden).length || 0) && (
                      <div className="p-4 rounded-md border border-blue-200 bg-blue-50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm text-blue-900">
                            Hidden Test Cases
                          </span>
                        </div>
                        <p className="text-sm text-blue-800">
                          {(() => {
                            const visibleCount = problem?.testCases?.filter(tc => !tc.isHidden).length || 0
                            const hiddenResults = testResults.slice(visibleCount)
                            const hiddenPassed = hiddenResults.filter(r => r.passed || r.status === 'passed').length
                            const hiddenTotal = hiddenResults.length
                            return `${hiddenPassed}/${hiddenTotal} hidden test cases passed`
                          })()}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Hidden test cases are not shown but are used to evaluate your solution.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
