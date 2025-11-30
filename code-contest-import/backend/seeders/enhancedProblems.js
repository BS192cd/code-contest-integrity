// Enhanced Problem Definitions with LeetCode-quality descriptions and test cases

const enhancedProblems = [
  {
    title: "Two Sum",
    statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    description: `You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

**Example 2:**
Input: nums = [3,2,4], target = 6
Output: [1,2]

**Example 3:**
Input: nums = [3,3], target = 6
Output: [0,1]`,
    constraints: `- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
    inputFormat: "First line contains n (array length)\nSecond line contains n space-separated integers (the array)\nThird line contains the target integer",
    outputFormat: "Two space-separated integers representing the indices",
    examples: [
      {
        input: "4\n2 7 11 15\n9",
        output: "0 1",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9, so return indices [0, 1]"
      },
      {
        input: "3\n3 2 4\n6", 
        output: "1 2",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6, so return indices [1, 2]"
      }
    ],
    difficulty: "Easy",
    tags: ["array", "hash-table"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isPublic: true, points: 20 },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2", isPublic: true, points: 20 },
      { input: "2\n3 3\n6", expectedOutput: "0 1", isPublic: false, points: 20 },
      { input: "5\n1 2 3 4 5\n8", expectedOutput: "2 4", isPublic: false, points: 20 },
      { input: "4\n-1 -2 -3 -4\n-6", expectedOutput: "1 3", isPublic: false, points: 20 }
    ],
    solutionTemplate: {
      python: `def two_sum(nums, target):
    # Your solution here
    pass

# Read input
n = int(input())
nums = list(map(int, input().split()))
target = int(input())

# Solve and print result
result = two_sum(nums, target)
print(result[0], result[1])`,
      javascript: `function twoSum(nums, target) {
    // Your solution here
}

// Read input (Node.js)
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
    if (lines.length === 3) {
        const n = parseInt(lines[0]);
        const nums = lines[1].split(' ').map(Number);
        const target = parseInt(lines[2]);
        
        const result = twoSum(nums, target);
        console.log(result[0] + ' ' + result[1]);
        rl.close();
    }
});`,
      java: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        
        Solution sol = new Solution();
        int[] result = sol.twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your solution here
    return {};
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int target;
    cin >> target;
    
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`
    },
    hints: [
      { level: 1, content: "Think about what data structure can help you find complements quickly." },
      { level: 2, content: "Use a hash map to store numbers you've seen and their indices." },
      { level: 3, content: "For each number, check if (target - number) exists in your hash map." }
    ],
    complexityAnalysis: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)"
    },
    algorithmTags: ["hash-table", "two-pointers"],
    dataStructureTags: ["array", "hash-map"],
    companies: ["Amazon", "Google", "Microsoft", "Facebook"],
    followUpQuestions: [
      "What if the array is sorted?",
      "What if we need to find all pairs that sum to target?",
      "What if we can't use extra space?"
    ]
  },

  {
    title: "Reverse Integer",
    statement: "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.",
    description: `**Example 1:**
Input: x = 123
Output: 321

**Example 2:**
Input: x = -123
Output: -321

**Example 3:**
Input: x = 120
Output: 21

**Note:**
Assume the environment does not allow you to store 64-bit integers (signed or unsigned).`,
    constraints: `-2^31 <= x <= 2^31 - 1`,
    inputFormat: "Single integer x",
    outputFormat: "Single integer (reversed x, or 0 if overflow)",
    examples: [
      {
        input: "123",
        output: "321",
        explanation: "Simply reverse the digits: 123 → 321"
      },
      {
        input: "-123",
        output: "-321", 
        explanation: "Reverse digits while preserving sign: -123 → -321"
      },
      {
        input: "120",
        output: "21",
        explanation: "Trailing zeros are dropped: 120 → 021 → 21"
      }
    ],
    difficulty: "Medium",
    tags: ["math"],
    category: "Algorithm", 
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "123", expectedOutput: "321", isPublic: true, points: 25 },
      { input: "-123", expectedOutput: "-321", isPublic: true, points: 25 },
      { input: "120", expectedOutput: "21", isPublic: false, points: 25 },
      { input: "0", expectedOutput: "0", isPublic: false, points: 25 },
      { input: "1534236469", expectedOutput: "0", isPublic: false, points: 25 } // Overflow case
    ],
    solutionTemplate: {
      python: `def reverse_integer(x):
    # Your solution here
    pass

x = int(input())
print(reverse_integer(x))`,
      javascript: `function reverse(x) {
    // Your solution here
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    const x = parseInt(line);
    console.log(reverse(x));
    rl.close();
});`,
      java: `import java.util.*;

public class Solution {
    public int reverse(int x) {
        // Your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.reverse(x));
    }
}`,
      cpp: `#include <iostream>
#include <climits>
using namespace std;

int reverse(int x) {
    // Your solution here
    return 0;
}

int main() {
    int x;
    cin >> x;
    cout << reverse(x) << endl;
    return 0;
}`
    },
    hints: [
      { level: 1, content: "Think about how to extract digits from a number." },
      { level: 2, content: "Use modulo (%) to get the last digit and division (/) to remove it." },
      { level: 3, content: "Check for overflow before multiplying by 10." }
    ],
    complexityAnalysis: {
      timeComplexity: "O(log x)",
      spaceComplexity: "O(1)"
    }
  },

  {
    title: "Palindrome Number",
    statement: "Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward.",
    description: `**Example 1:**
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.

**Example 2:**
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.

**Example 3:**
Input: x = 10
Output: false
Explanation: Reads 01 from right to left. Therefore it is not a palindrome.

**Follow up:** Could you solve it without converting the integer to a string?`,
    constraints: `-2^31 <= x <= 2^31 - 1`,
    inputFormat: "Single integer x",
    outputFormat: "true or false",
    examples: [
      {
        input: "121",
        output: "true",
        explanation: "121 reads the same forwards and backwards"
      },
      {
        input: "-121",
        output: "false",
        explanation: "Negative numbers are not palindromes"
      },
      {
        input: "10",
        output: "false",
        explanation: "10 reversed is 01, which is not the same"
      }
    ],
    difficulty: "Easy",
    tags: ["math"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "121", expectedOutput: "true", isPublic: true, points: 20 },
      { input: "-121", expectedOutput: "false", isPublic: true, points: 20 },
      { input: "10", expectedOutput: "false", isPublic: false, points: 20 },
      { input: "0", expectedOutput: "true", isPublic: false, points: 20 },
      { input: "12321", expectedOutput: "true", isPublic: false, points: 20 }
    ],
    solutionTemplate: {
      python: `def is_palindrome(x):
    # Your solution here
    pass

x = int(input())
result = is_palindrome(x)
print("true" if result else "false")`,
      javascript: `function isPalindrome(x) {
    // Your solution here
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    const x = parseInt(line);
    console.log(isPalindrome(x) ? "true" : "false");
    rl.close();
});`
    },
    hints: [
      { level: 1, content: "Negative numbers are never palindromes." },
      { level: 2, content: "You can reverse half the number and compare with the other half." },
      { level: 3, content: "Be careful with numbers ending in 0 (except 0 itself)." }
    ],
    complexityAnalysis: {
      timeComplexity: "O(log x)",
      spaceComplexity: "O(1)"
    }
  },

  {
    title: "Valid Parentheses",
    statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    description: `An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
Input: s = "()"
Output: true

**Example 2:**
Input: s = "()[]{}"
Output: true

**Example 3:**
Input: s = "(]"
Output: false`,
    constraints: `- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'.`,
    inputFormat: "Single string s",
    outputFormat: "true or false",
    examples: [
      {
        input: "()",
        output: "true",
        explanation: "Simple pair of parentheses"
      },
      {
        input: "()[]{}", 
        output: "true",
        explanation: "Multiple valid pairs in sequence"
      },
      {
        input: "(]",
        output: "false",
        explanation: "Mismatched bracket types"
      }
    ],
    difficulty: "Easy",
    tags: ["string", "stack"],
    category: "Data Structure",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "()", expectedOutput: "true", isPublic: true, points: 20 },
      { input: "()[]{}", expectedOutput: "true", isPublic: true, points: 20 },
      { input: "(]", expectedOutput: "false", isPublic: false, points: 20 },
      { input: "([)]", expectedOutput: "false", isPublic: false, points: 20 },
      { input: "{[]}", expectedOutput: "true", isPublic: false, points: 20 }
    ],
    solutionTemplate: {
      python: `def is_valid(s):
    # Your solution here
    pass

s = input().strip()
result = is_valid(s)
print("true" if result else "false")`,
      javascript: `function isValid(s) {
    // Your solution here
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    const s = line.trim();
    console.log(isValid(s) ? "true" : "false");
    rl.close();
});`
    },
    hints: [
      { level: 1, content: "Think about what data structure naturally handles 'last in, first out' operations." },
      { level: 2, content: "Use a stack to keep track of opening brackets." },
      { level: 3, content: "When you see a closing bracket, check if it matches the most recent opening bracket." }
    ],
    complexityAnalysis: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)"
    },
    algorithmTags: ["stack"],
    dataStructureTags: ["stack", "string"]
  },

  {
    title: "Maximum Subarray",
    statement: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    description: `A subarray is a contiguous part of an array.

**Example 1:**
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.

**Example 2:**
Input: nums = [1]
Output: 1

**Example 3:**
Input: nums = [5,4,-1,7,8]
Output: 23

**Follow up:** If you have figured out the O(n) solution, try coding another solution using the divide and conquer approach, which is more subtle.`,
    constraints: `- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
    inputFormat: "First line contains n (array length)\nSecond line contains n space-separated integers",
    outputFormat: "Single integer (maximum subarray sum)",
    examples: [
      {
        input: "9\n-2 1 -3 4 -1 2 1 -5 4",
        output: "6",
        explanation: "Subarray [4,-1,2,1] has sum 6"
      },
      {
        input: "1\n1",
        output: "1",
        explanation: "Single element array"
      }
    ],
    difficulty: "Medium",
    tags: ["array", "divide-and-conquer", "dynamic-programming"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isPublic: true, points: 25 },
      { input: "1\n1", expectedOutput: "1", isPublic: true, points: 25 },
      { input: "5\n5 4 -1 7 8", expectedOutput: "23", isPublic: false, points: 25 },
      { input: "3\n-2 -1 -3", expectedOutput: "-1", isPublic: false, points: 25 }
    ],
    solutionTemplate: {
      python: `def max_subarray(nums):
    # Your solution here (Kadane's algorithm)
    pass

n = int(input())
nums = list(map(int, input().split()))
print(max_subarray(nums))`,
      javascript: `function maxSubArray(nums) {
    // Your solution here
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
    if (lines.length === 2) {
        const n = parseInt(lines[0]);
        const nums = lines[1].split(' ').map(Number);
        console.log(maxSubArray(nums));
        rl.close();
    }
});`
    },
    hints: [
      { level: 1, content: "Think about when you should start a new subarray vs. extend the current one." },
      { level: 2, content: "Kadane's algorithm: keep track of the maximum sum ending at each position." },
      { level: 3, content: "At each step, decide: add current element to existing subarray or start fresh?" }
    ],
    complexityAnalysis: {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)"
    },
    algorithmTags: ["kadanes-algorithm", "dynamic-programming"],
    dataStructureTags: ["array"]
  }
];

module.exports = { enhancedProblems };
