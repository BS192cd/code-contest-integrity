import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, language, problemId } = body

    if (!code || !language || !problemId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Simulate code execution delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock test results
    const testResults = [
      {
        id: 1,
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
        actualOutput: "[0,1]",
        status: "passed",
        executionTime: "2ms",
        memory: "42.1 MB",
      },
      {
        id: 2,
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
        actualOutput: "[1,2]",
        status: "passed",
        executionTime: "1ms",
        memory: "41.8 MB",
      },
      {
        id: 3,
        input: "[3,3]\n6",
        expectedOutput: "[0,1]",
        actualOutput: Math.random() > 0.5 ? "[0,1]" : "[1,0]",
        status: Math.random() > 0.5 ? "passed" : "failed",
        executionTime: "3ms",
        memory: "42.3 MB",
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        testResults,
        overallStatus: testResults.every((t) => t.status === "passed") ? "accepted" : "wrong_answer",
        executionTime: "3ms",
        memory: "42.3 MB",
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Code execution failed" }, { status: 500 })
  }
}
