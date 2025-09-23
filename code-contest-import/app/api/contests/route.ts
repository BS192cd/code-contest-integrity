import { NextResponse } from "next/server"

// Mock contest data
const contests = [
  {
    id: 1,
    title: "Weekly Challenge #42",
    description: "Test your algorithmic skills with dynamic programming and graph theory problems.",
    duration: "3 hours",
    participants: 156,
    maxParticipants: 500,
    status: "active",
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    difficulty: "Medium",
    prize: "$500",
  },
  // Add more mock contests...
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      data: contests,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch contests" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const { title, description, difficulty, duration, maxParticipants, startDate } = body

    if (!title || !description || !difficulty || !duration || !maxParticipants || !startDate) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Simulate contest creation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newContest = {
      id: contests.length + 1,
      title,
      description,
      difficulty,
      duration: `${duration} hour${duration !== "1" ? "s" : ""}`,
      participants: 0,
      maxParticipants: Number.parseInt(maxParticipants),
      status: "upcoming",
      startTime: new Date(startDate).toISOString(),
      endTime: new Date(new Date(startDate).getTime() + Number.parseFloat(duration) * 60 * 60 * 1000).toISOString(),
      prize: body.prize || null,
    }

    contests.push(newContest)

    return NextResponse.json({
      success: true,
      data: newContest,
      message: "Contest created successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create contest" }, { status: 500 })
  }
}
