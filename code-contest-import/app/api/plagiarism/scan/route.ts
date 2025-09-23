import { NextResponse } from "next/server"

// Mock plagiarism detection algorithm
function calculateSimilarity(codeA: string, codeB: string) {
  // Simple similarity calculation based on common lines
  const linesA = codeA.split("\n").filter((line) => line.trim())
  const linesB = codeB.split("\n").filter((line) => line.trim())

  let commonLines = 0
  const matchedLines: number[] = []

  linesA.forEach((lineA, indexA) => {
    linesB.forEach((lineB, indexB) => {
      // Simple string similarity check
      if (lineA.trim() === lineB.trim() && lineA.trim().length > 5) {
        commonLines++
        matchedLines.push(indexA + 1)
      }
    })
  })

  const similarity = Math.min(100, (commonLines / Math.max(linesA.length, linesB.length)) * 100)

  return {
    similarity: Math.round(similarity),
    matchedLines,
    analysis: {
      structuralSimilarity: Math.round(similarity * 0.9 + Math.random() * 10),
      variableNameSimilarity: Math.round(similarity * 0.7 + Math.random() * 20),
      logicSimilarity: Math.round(similarity * 0.8 + Math.random() * 15),
      commentSimilarity: Math.round(similarity * 0.5 + Math.random() * 30),
    },
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contestId, problemId, threshold = 60 } = body

    // Simulate plagiarism scanning delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock submission data for comparison
    const mockSubmissions = [
      {
        id: "sub_001",
        userId: "user_1",
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
      {
        id: "sub_002",
        userId: "user_2",
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
      {
        id: "sub_003",
        userId: "user_3",
        username: "charlie_algo",
        fullName: "Charlie Brown",
        submissionTime: "2024-03-01T15:00:00Z",
        language: "python",
        code: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
      },
    ]

    // Compare all pairs of submissions
    const results = []

    for (let i = 0; i < mockSubmissions.length; i++) {
      for (let j = i + 1; j < mockSubmissions.length; j++) {
        const submissionA = mockSubmissions[i]
        const submissionB = mockSubmissions[j]

        const comparison = calculateSimilarity(submissionA.code, submissionB.code)

        if (comparison.similarity >= threshold) {
          results.push({
            id: `comparison_${submissionA.id}_${submissionB.id}`,
            submissionA,
            submissionB,
            similarity: comparison.similarity,
            matchedLines: comparison.matchedLines,
            analysis: comparison.analysis,
            status: comparison.similarity >= 80 ? "high_risk" : "medium_risk",
            detectedAt: new Date().toISOString(),
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        scanId: `scan_${Date.now()}`,
        contestId,
        problemId,
        threshold,
        totalSubmissions: mockSubmissions.length,
        comparisons: (mockSubmissions.length * (mockSubmissions.length - 1)) / 2,
        flaggedPairs: results.length,
        results,
        scanCompletedAt: new Date().toISOString(),
      },
      message: `Plagiarism scan completed. Found ${results.length} potential matches.`,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Plagiarism scan failed" }, { status: 500 })
  }
}
