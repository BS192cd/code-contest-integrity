import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { submissionIdA, submissionIdB } = body

    if (!submissionIdA || !submissionIdB) {
      return NextResponse.json({ success: false, error: "Both submission IDs are required" }, { status: 400 })
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock detailed comparison data
    const comparison = {
      submissionA: {
        id: submissionIdA,
        username: "alice_codes",
        fullName: "Alice Johnson",
        submissionTime: "2024-03-01T14:30:00Z",
        language: "python",
        code: `def twoSum(nums, target):
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []`,
      },
      submissionB: {
        id: submissionIdB,
        username: "bob_dev",
        fullName: "Bob Smith",
        submissionTime: "2024-03-01T14:45:00Z",
        language: "python",
        code: `def twoSum(nums, target):
    hash_table = {}
    for index, number in enumerate(nums):
        diff = target - number
        if diff in hash_table:
            return [hash_table[diff], index]
        hash_table[number] = index
    return []`,
      },
      similarity: 87,
      matchedLines: [1, 2, 3, 4, 5, 6, 7, 8],
      analysis: {
        structuralSimilarity: 92,
        variableNameSimilarity: 65,
        logicSimilarity: 95,
        commentSimilarity: 0,
      },
      problemTitle: "Two Sum",
      contestTitle: "Weekly Challenge #42",
    }

    return NextResponse.json({
      success: true,
      data: comparison,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to compare submissions" }, { status: 500 })
  }
}
