import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contestId, userId } = body

    if (!contestId || !userId) {
      return NextResponse.json({ success: false, error: "Contest ID and User ID are required" }, { status: 400 })
    }

    // Simulate API delay and processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate random success/failure for demo
    const success = Math.random() > 0.1 // 90% success rate

    if (!success) {
      return NextResponse.json({ success: false, error: "Contest is full or registration closed" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined the contest",
      data: {
        contestId,
        userId,
        joinedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to join contest" }, { status: 500 })
  }
}
