import { NextResponse } from "next/server"

// Mock leaderboard data
const leaderboardData = [
  {
    rank: 1,
    userId: "user_1",
    username: "alice_codes",
    fullName: "Alice Johnson",
    score: 2850,
    problemsSolved: 45,
    contestsParticipated: 12,
    averageScore: 95.2,
    lastSubmission: "2 hours ago",
    streak: 15,
    badges: ["Top Performer", "Speed Demon"],
  },
  // Add more mock data...
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contestId = searchParams.get("contestId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredData = leaderboardData

    // Filter by contest if specified
    if (contestId && contestId !== "all") {
      // In a real app, this would filter by contest participation
      filteredData = leaderboardData.filter(() => Math.random() > 0.3)
    }

    // Apply pagination
    const paginatedData = filteredData.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: paginatedData,
        total: filteredData.length,
        hasMore: offset + limit < filteredData.length,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
