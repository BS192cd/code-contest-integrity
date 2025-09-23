import { type NextRequest, NextResponse } from "next/server"

// Mock data for demonstration
const mockPlagiarismData = {
  summary: {
    totalSubmissions: 45,
    flaggedPairs: 8,
    averageSimilarity: 23.5,
    scanDate: new Date().toISOString(),
  },
  pairs: [
    {
      id: "1",
      studentA: "Alice Johnson",
      studentB: "Bob Smith",
      similarity: 85.2,
      submissionAId: "sub_001",
      submissionBId: "sub_002",
      codeSnippetA: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Calculate first 10 numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
      codeSnippetB: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Print first 10 fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
      matchingLines: [1, 2, 3, 4, 6, 7],
    },
    {
      id: "2",
      studentA: "Carol Davis",
      studentB: "David Wilson",
      similarity: 72.8,
      submissionAId: "sub_003",
      submissionBId: "sub_004",
      codeSnippetA: `function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}`,
      codeSnippetB: `function quickSort(array) {
    if (array.length <= 1) return array;
    const pivot = array[Math.floor(array.length / 2)];
    const left = array.filter(x => x < pivot);
    const right = array.filter(x => x > pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}`,
      matchingLines: [1, 2, 3, 4, 5],
    },
    {
      id: "3",
      studentA: "Eve Brown",
      studentB: "Frank Miller",
      similarity: 45.6,
      submissionAId: "sub_005",
      submissionBId: "sub_006",
      codeSnippetA: `class BinaryTree:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
    
    def insert(self, value):
        if value < self.value:
            if self.left is None:
                self.left = BinaryTree(value)
            else:
                self.left.insert(value)`,
      codeSnippetB: `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
    
    def add(self, val):
        if val < self.val:
            if self.left is None:
                self.left = TreeNode(val)
            else:
                self.left.add(val)`,
      matchingLines: [3, 4, 7, 8, 10],
    },
    {
      id: "4",
      studentA: "Grace Lee",
      studentB: "Henry Taylor",
      similarity: 25.3,
      submissionAId: "sub_007",
      submissionBId: "sub_008",
      codeSnippetA: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0`,
      codeSnippetB: `def mergeSort(array):
    if len(array) <= 1:
        return array
    
    middle = len(array) // 2
    leftHalf = mergeSort(array[:middle])
    rightHalf = mergeSort(array[middle:])
    
    return mergeArrays(leftHalf, rightHalf)

def mergeArrays(left, right):
    merged = []
    i = j = 0`,
      matchingLines: [2, 3, 5, 9, 13],
    },
  ],
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contestId = searchParams.get("contestId")

  if (!contestId) {
    return NextResponse.json({ error: "Contest ID is required" }, { status: 400 })
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(mockPlagiarismData)
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contestId = searchParams.get("contestId")

  if (!contestId) {
    return NextResponse.json({ error: "Contest ID is required" }, { status: 400 })
  }

  // Simulate scanning process
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return updated data with new scan timestamp
  const updatedData = {
    ...mockPlagiarismData,
    summary: {
      ...mockPlagiarismData.summary,
      scanDate: new Date().toISOString(),
    },
  }

  return NextResponse.json(updatedData)
}
