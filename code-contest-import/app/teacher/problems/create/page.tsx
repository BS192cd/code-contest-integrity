"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { TeacherHeader } from "@/components/teacher-header"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import LatexEditor from "@/components/LatexEditor"
import { Save, Plus, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

export default function CreateProblemPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    category: "",
    timeLimit: "1000",
    memoryLimit: "256",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
  })

  const [examples, setExamples] = useState([
    { input: "", output: "", explanation: "" }
  ])

  const [testCases, setTestCases] = useState([
    { input: "", output: "", isHidden: false }
  ])

  const [uploadedFiles, setUploadedFiles] = useState<{input: string | null, output: string | null}>({
    input: null,
    output: null
  })
  const [uploadedTestCases, setUploadedTestCases] = useState<Array<{input: string, output: string}>>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTestCases, setGeneratedTestCases] = useState<Array<{input: string, output: string}>>([])

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: "", output: "", isHidden: false }])
  }

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index))
  }

  const handleTestCaseChange = (index: number, field: string, value: string | boolean) => {
    const updated = [...testCases]
    updated[index] = { ...updated[index], [field]: value }
    setTestCases(updated)
  }

  const handleAddExample = () => {
    setExamples([...examples, { input: "", output: "", explanation: "" }])
  }

  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index))
  }

  const handleExampleChange = (index: number, field: string, value: string) => {
    const updated = [...examples]
    updated[index] = { ...updated[index], [field]: value }
    setExamples(updated)
  }

  const handleInputFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setUploadedFiles(prev => ({ ...prev, input: text }))
    
    if (uploadedFiles.output) {
      processUploadedFiles(text, uploadedFiles.output)
    }
  }

  const handleOutputFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setUploadedFiles(prev => ({ ...prev, output: text }))
    
    if (uploadedFiles.input) {
      processUploadedFiles(uploadedFiles.input, text)
    }
  }

  const processUploadedFiles = (inputText: string, outputText: string) => {
    // Try different splitting strategies
    
    // Strategy 1: Split by "---" delimiter (common separator)
    let inputSections = inputText.trim().split(/\n?---+\n?/)
    let outputSections = outputText.trim().split(/\n?---+\n?/)
    
    if (inputSections.length > 1 && inputSections.length === outputSections.length) {
      const newTestCases = inputSections.map((input, i) => ({
        input: input.trim(),
        output: outputSections[i].trim()
      }))
      setUploadedTestCases(newTestCases)
      alert(`✓ Files uploaded successfully! ${newTestCases.length} test cases detected (using --- delimiter).`)
      return
    }
    
    // Strategy 2: Split by double newline
    inputSections = inputText.trim().split(/\n\n+/)
    outputSections = outputText.trim().split(/\n\n+/)
    
    if (inputSections.length > 1 && inputSections.length === outputSections.length) {
      const newTestCases = inputSections.map((input, i) => ({
        input: input.trim(),
        output: outputSections[i].trim()
      }))
      setUploadedTestCases(newTestCases)
      alert(`✓ Files uploaded successfully! ${newTestCases.length} test cases detected (using blank line separator).`)
      return
    }
    
    // Strategy 3: Single-line mode (one line = one test case)
    const inputs = inputText.trim().split('\n')
    const outputs = outputText.trim().split('\n')
    
    if (inputs.length === outputs.length && inputs.length > 0) {
      const newTestCases = inputs.map((input, i) => ({
        input: input.trim(),
        output: outputs[i].trim()
      }))
      setUploadedTestCases(newTestCases)
      alert(`✓ Files uploaded successfully! ${newTestCases.length} test cases detected (one per line).`)
      return
    }
    
    // Nothing worked - show detailed error
    alert(`⚠️ Could not parse test cases. Please use one of these formats:

**Format 1 - Delimiter (recommended):**
Separate test cases with "---" on its own line

Input file:
test case 1 input
---
test case 2 input
---

Output file:
test case 1 output
---
test case 2 output
---

**Format 2 - Blank line:**
Separate test cases with a blank line

**Format 3 - Single line:**
One test case per line (input and output files must have same number of lines)

**Current detection:**
- With --- delimiter: ${inputText.split(/\n?---+\n?/).length} inputs, ${outputText.split(/\n?---+\n?/).length} outputs
- With blank lines: ${inputText.split(/\n\n+/).length} inputs, ${outputText.split(/\n\n+/).length} outputs  
- Single lines: ${inputs.length} inputs, ${outputs.length} outputs`)
  }

  const handleGenerateTestCases = async () => {
    try {
      setIsGenerating(true)
      
      // For create page, we don't have a problemId yet, so we pass problem details directly
      const response = await apiClient.generateTestCases('', {
        title: formData.title,
        description: formData.description,
        constraints: formData.constraints,
        inputFormat: formData.inputFormat,
        outputFormat: formData.outputFormat,
        sampleInput: formData.sampleInput,
        sampleOutput: formData.sampleOutput,
        visibleTestCases: testCases.filter(tc => !tc.isHidden)
      })

      if (response.success && response.data) {
        const newTestCases = response.data.testCases || []
        
        // Add generated test cases to the existing test cases
        const formattedTestCases = newTestCases.map((tc: any) => ({
          input: tc.input || '',
          output: tc.expectedOutput || tc.output || '',
          isHidden: tc.isHidden !== undefined ? tc.isHidden : true // Default to hidden
        }))
        
        // Append to existing test cases
        setTestCases([...testCases, ...formattedTestCases])
        setGeneratedTestCases(newTestCases)
        
        alert(`✨ Successfully generated ${newTestCases.length} AI-powered test cases with Gemini!\n\nScroll down to see them added to your test cases.`)
      } else {
        throw new Error(response.error || 'Failed to generate test cases')
      }
    } catch (error: any) {
      console.error('Failed to generate test cases:', error)
      
      // Show detailed error message from backend
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate test cases'
      const errorDetails = error.response?.data?.details
      
      let alertMessage = errorMessage
      if (errorDetails?.suggestion) {
        alertMessage += `\n\n💡 Suggestion: ${errorDetails.suggestion}`
      }
      
      alert(alertMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert("Please enter a problem title")
      return
    }
    
    if (!formData.description.trim()) {
      alert("Please enter a problem description")
      return
    }
    
    // Validate at least one test case has input and output
    const validTestCases = testCases.filter(tc => tc.input.trim() && tc.output.trim())
    if (validTestCases.length === 0) {
      alert("Please add at least one test case with both input and output")
      return
    }
    
    setIsSubmitting(true)

    try {
      // Prepare problem data matching backend schema
      const problemData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        statement: formData.description.trim(), // Backend might expect 'statement' field
        difficulty: formData.difficulty,
        category: formData.category.trim() || "General",
        timeLimit: parseInt(formData.timeLimit) || 1000,
        memoryLimit: parseInt(formData.memoryLimit) || 256,
        inputFormat: formData.inputFormat.trim(),
        outputFormat: formData.outputFormat.trim(),
        constraints: formData.constraints.trim(),
        sampleInput: formData.sampleInput.trim(),
        sampleOutput: formData.sampleOutput.trim(),
        examples: examples.filter(ex => ex.input || ex.output).map(ex => ({
          input: ex.input || "",
          output: ex.output || "",
          explanation: ex.explanation || ""
        })),
        testCases: [
          ...validTestCases.map((tc, index) => ({
            input: tc.input.trim(),
            expectedOutput: tc.output.trim(),
            output: tc.output.trim(), // Some backends use 'output' instead of 'expectedOutput'
            isHidden: tc.isHidden || false,
            points: 10,
            order: index
          })),
          ...uploadedTestCases
            .filter(tc => tc.input && tc.output) // Only include test cases with both input and output
            .map((tc, index) => ({
              input: tc.input,
              expectedOutput: tc.output,
              output: tc.output,
              isHidden: true, // Uploaded test cases are always hidden
              points: 10,
              order: validTestCases.length + index
            })),
          ...generatedTestCases
            .filter(tc => tc.input && tc.output) // Only include test cases with both input and output
            .map((tc, index) => ({
              input: tc.input,
              expectedOutput: tc.output,
              output: tc.output,
              isHidden: true, // Generated test cases are always hidden
              points: 10,
              order: validTestCases.length + uploadedTestCases.length + index
            }))
        ]
      }

      console.log("Sending problem data:", problemData) // Debug log

      const response = await apiClient.createProblem(problemData)
      
      if (response.success) {
        alert("Problem created successfully!")
        router.push("/teacher/problems")
      } else {
        throw new Error(response.error || "Failed to create problem")
      }
    } catch (error: any) {
      console.error("Failed to create problem:", error)
      const errorMessage = error.message || error.toString() || "Failed to create problem. Please try again."
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-background">
        <TeacherHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 p-6 md:ml-0">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Problems
                </Button>
                <h1 className="text-3xl font-bold">Create New Problem</h1>
                <p className="text-muted-foreground mt-2">
                  Add a new coding problem to your library
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Problem title and description</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Problem Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g., Two Sum"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <LatexEditor
                        value={formData.description}
                        onChange={(value) => setFormData({...formData, description: value})}
                        label="Description *"
                        placeholder="Describe the problem in detail... Use $x^n$ for math notation"
                        minHeight="300px"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty *</Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) => setFormData({...formData, difficulty: value})}
                        >
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

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          placeholder="e.g., Arrays, Strings"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timeLimit">Time Limit (ms)</Label>
                        <Input
                          id="timeLimit"
                          type="number"
                          value={formData.timeLimit}
                          onChange={(e) => setFormData({...formData, timeLimit: e.target.value})}
                          placeholder="1000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="memoryLimit">Memory Limit (MB)</Label>
                        <Input
                          id="memoryLimit"
                          type="number"
                          value={formData.memoryLimit}
                          onChange={(e) => setFormData({...formData, memoryLimit: e.target.value})}
                          placeholder="256"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Input/Output Format */}
                <Card>
                  <CardHeader>
                    <CardTitle>Input/Output Format</CardTitle>
                    <CardDescription>Specify the format for inputs and outputs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <LatexEditor
                        value={formData.inputFormat}
                        onChange={(value) => setFormData({...formData, inputFormat: value})}
                        label="Input Format"
                        placeholder="Describe the input format... Use $n$ for variables"
                        minHeight="150px"
                      />
                    </div>

                    <div className="space-y-2">
                      <LatexEditor
                        value={formData.outputFormat}
                        onChange={(value) => setFormData({...formData, outputFormat: value})}
                        label="Output Format"
                        placeholder="Describe the output format... Use $x^n$ for math"
                        minHeight="150px"
                      />
                    </div>

                    <div className="space-y-2">
                      <LatexEditor
                        value={formData.constraints}
                        onChange={(value) => setFormData({...formData, constraints: value})}
                        label="Constraints"
                        placeholder="e.g., $1 \le n \le 10^5$"
                        minHeight="150px"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Sample Test Case */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Test Case</CardTitle>
                    <CardDescription>Visible example for students</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sampleInput">Sample Input</Label>
                      <Textarea
                        id="sampleInput"
                        value={formData.sampleInput}
                        onChange={(e) => setFormData({...formData, sampleInput: e.target.value})}
                        placeholder="Example input..."
                        className="min-h-[100px] font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sampleOutput">Sample Output</Label>
                      <Textarea
                        id="sampleOutput"
                        value={formData.sampleOutput}
                        onChange={(e) => setFormData({...formData, sampleOutput: e.target.value})}
                        placeholder="Expected output..."
                        className="min-h-[100px] font-mono"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Examples */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Examples</CardTitle>
                        <CardDescription>Add detailed examples with explanations (shown in problem description)</CardDescription>
                      </div>
                      <Button type="button" onClick={handleAddExample} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Example
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {examples.map((example, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Example {index + 1}</h4>
                          {examples.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveExample(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Input</Label>
                          <Textarea
                            value={example.input}
                            onChange={(e) => handleExampleChange(index, "input", e.target.value)}
                            placeholder="Example input (e.g., x = 2.00000, n = 10)"
                            className="font-mono"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Output</Label>
                          <Textarea
                            value={example.output}
                            onChange={(e) => handleExampleChange(index, "output", e.target.value)}
                            placeholder="Expected output (e.g., 1024.00000)"
                            className="font-mono"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Explanation (Optional)</Label>
                          <Textarea
                            value={example.explanation}
                            onChange={(e) => handleExampleChange(index, "explanation", e.target.value)}
                            placeholder="Explain the example..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Test Cases */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Test Cases</CardTitle>
                        <CardDescription>Add test cases for evaluation</CardDescription>
                      </div>
                      <Button type="button" onClick={handleAddTestCase} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Test Case
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {testCases.map((testCase, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Test Case {index + 1}</h4>
                          {testCases.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTestCase(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Input</Label>
                          <Textarea
                            value={testCase.input}
                            onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                            placeholder="Test case input..."
                            className="font-mono"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Expected Output</Label>
                          <Textarea
                            value={testCase.output}
                            onChange={(e) => handleTestCaseChange(index, "output", e.target.value)}
                            placeholder="Expected output..."
                            className="font-mono"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`hidden-${index}`}
                            checked={testCase.isHidden}
                            onChange={(e) => handleTestCaseChange(index, "isHidden", e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor={`hidden-${index}`} className="cursor-pointer">
                            Hidden test case (not visible to students)
                          </Label>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Auto-Generate Hidden Test Cases */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Auto-Generate Hidden Test Cases</CardTitle>
                        <CardDescription>
                          AI-powered test case generation based on problem description, constraints, and visible test cases
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        onClick={handleGenerateTestCases}
                        disabled={isGenerating}
                        variant="secondary"
                      >
                        {isGenerating ? "Generating..." : "Generate Test Cases"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="font-medium text-blue-900 mb-2">What will be generated:</h4>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Edge cases (min/max constraints, empty inputs, boundary values)</li>
                        <li>Stress tests (large random inputs, sorted data, performance tests)</li>
                        <li>Adversarial cases (TLE traps, greedy killers, overflow tests)</li>
                      </ul>
                    </div>

                    {generatedTestCases.length > 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">
                          ✓ Generated {generatedTestCases.length} comprehensive hidden test cases! They will be added when you save.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Bulk Upload Hidden Test Cases */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Upload Hidden Test Cases</CardTitle>
                    <CardDescription>
                      Upload input.txt and output.txt files to add multiple hidden test cases at once
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="inputFile">Input File (.txt)</Label>
                        <Input
                          id="inputFile"
                          type="file"
                          accept=".txt"
                          onChange={handleInputFileUpload}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                          Each line will be treated as a separate test case input
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="outputFile">Output File (.txt)</Label>
                        <Input
                          id="outputFile"
                          type="file"
                          accept=".txt"
                          onChange={handleOutputFileUpload}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                          Each line should correspond to the expected output for each input
                        </p>
                      </div>
                    </div>

                    {uploadedFiles.input && uploadedFiles.output && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">
                          ✓ Files uploaded successfully! {uploadedTestCases.length} hidden test cases will be added when you save.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Creating..." : "Create Problem"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
