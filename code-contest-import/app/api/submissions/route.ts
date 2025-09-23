import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, language, problemId, contestId, userId } = body

    if (!code || !language || !problemId || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Simulate submission processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Mock submission result
    const submission = {
      id: submissionId,
      userId,
      problemId,
      contestId,
      language,
      code,
      status: Math.random() > 0.3 ? "accepted" : "wrong_answer",
      score: Math.floor(Math.random() * 100),
      submissionTime: new Date().toISOString(),
      executionTime: `${Math.floor(Math.random() * 100) + 1}ms`,
      memory: `${(Math.random() * 20 + 40).toFixed(1)} MB`,
    }

    return NextResponse.json({
      success: true,
      data: submission,
      message: "Submission processed successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 })
  }
}
