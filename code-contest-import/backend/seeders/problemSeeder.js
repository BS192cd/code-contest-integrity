const mongoose = require('mongoose');
const Problem = require('../models/Problem');

// Array Problems (25 problems)
const arrayProblems = [
  {
    title: "Two Sum",
    statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    description: "You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    inputFormat: "First line contains n (length of array)\nSecond line contains n space-separated integers\nThird line contains target integer",
    outputFormat: "Two space-separated integers representing the indices",
    examples: [
      {
        input: "4\n2 7 11 15\n9",
        output: "0 1",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9"
      }
    ],
    difficulty: "Easy",
    tags: ["array", "hash-table", "two-pointers"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isPublic: true, points: 10 },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2", isPublic: true, points: 10 },
      { input: "2\n3 3\n6", expectedOutput: "0 1", isPublic: false, points: 10 },
      { input: "5\n1 2 3 4 5\n8", expectedOutput: "2 4", isPublic: false, points: 10 },
      { input: "6\n-1 -2 -3 -4 -5\n-8", expectedOutput: "2 4", isPublic: false, points: 10 }
    ]
  },
  {
    title: "Maximum Subarray",
    statement: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    description: "A subarray is a contiguous part of an array. Use Kadane's algorithm for optimal solution.",
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    inputFormat: "First line contains n (length of array)\nSecond line contains n space-separated integers",
    outputFormat: "Single integer representing the maximum sum",
    examples: [
      {
        input: "9\n-2 1 -3 4 -1 2 1 -5 4",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum = 6"
      }
    ],
    difficulty: "Medium",
    tags: ["array", "divide-and-conquer", "dynamic-programming"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isPublic: true, points: 10 },
      { input: "1\n1", expectedOutput: "1", isPublic: true, points: 10 },
      { input: "5\n5 4 -1 7 8", expectedOutput: "23", isPublic: false, points: 10 },
      { input: "3\n-2 -3 -1", expectedOutput: "-1", isPublic: false, points: 10 },
      { input: "4\n1 2 3 4", expectedOutput: "10", isPublic: false, points: 10 }
    ]
  },
  {
    title: "Merge Sorted Array",
    statement: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively. Merge nums2 into nums1 as one sorted array.",
    description: "The final sorted array should not be returned by the function, but instead be stored inside the array nums1. To accommodate this, nums1 has a length of m + n, where the first m elements denote the elements that should be merged, and the last n elements are set to 0 and should be ignored.",
    constraints: "nums1.length == m + n\n0 <= m, n <= 200\n1 <= m + n <= 200\n-10^9 <= nums1[i], nums2[j] <= 10^9",
    inputFormat: "First line contains m and n\nSecond line contains m+n space-separated integers (nums1)\nThird line contains n space-separated integers (nums2)",
    outputFormat: "Single line with m+n space-separated integers representing merged array",
    examples: [
      {
        input: "3 3\n1 2 3 0 0 0\n2 5 6",
        output: "1 2 2 3 5 6",
        explanation: "The arrays we are merging are [1,2,3] and [2,5,6]"
      }
    ],
    difficulty: "Easy",
    tags: ["array", "two-pointers", "sorting"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "3 3\n1 2 3 0 0 0\n2 5 6", expectedOutput: "1 2 2 3 5 6", isPublic: true, points: 10 },
      { input: "1 0\n1", expectedOutput: "1", isPublic: true, points: 10 },
      { input: "0 1\n0\n1", expectedOutput: "1", isPublic: false, points: 10 },
      { input: "2 2\n4 5 0 0\n1 3", expectedOutput: "1 3 4 5", isPublic: false, points: 10 },
      { input: "4 2\n1 3 5 7 0 0\n2 6", expectedOutput: "1 2 3 5 6 7", isPublic: false, points: 10 }
    ]
  },
  {
    title: "Remove Duplicates from Sorted Array",
    statement: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.",
    description: "Since it is impossible to change the length of the array in some languages, you must instead have the result be placed in the first part of the array nums. More formally, if there are k elements after removing the duplicates, then the first k elements of nums should hold the final result.",
    constraints: "1 <= nums.length <= 3 * 10^4\n-100 <= nums[i] <= 100\nnums is sorted in non-decreasing order",
    inputFormat: "First line contains n (length of array)\nSecond line contains n space-separated integers",
    outputFormat: "First line contains k (number of unique elements)\nSecond line contains k space-separated integers",
    examples: [
      {
        input: "3\n1 1 2",
        output: "2\n1 2",
        explanation: "Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively"
      }
    ],
    difficulty: "Easy",
    tags: ["array", "two-pointers"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "3\n1 1 2", expectedOutput: "2\n1 2", isPublic: true, points: 10 },
      { input: "10\n0 0 1 1 1 2 2 3 3 4", expectedOutput: "5\n0 1 2 3 4", isPublic: true, points: 10 },
      { input: "1\n1", expectedOutput: "1\n1", isPublic: false, points: 10 },
      { input: "5\n1 2 3 4 5", expectedOutput: "5\n1 2 3 4 5", isPublic: false, points: 10 },
      { input: "4\n2 2 2 2", expectedOutput: "1\n2", isPublic: false, points: 10 }
    ]
  },
  {
    title: "Best Time to Buy and Sell Stock",
    statement: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
    description: "Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    constraints: "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
    inputFormat: "First line contains n (number of days)\nSecond line contains n space-separated integers representing prices",
    outputFormat: "Single integer representing maximum profit",
    examples: [
      {
        input: "6\n7 1 5 3 6 4",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5"
      }
    ],
    difficulty: "Easy",
    tags: ["array", "dynamic-programming"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "6\n7 1 5 3 6 4", expectedOutput: "5", isPublic: true, points: 10 },
      { input: "5\n7 6 4 3 1", expectedOutput: "0", isPublic: true, points: 10 },
      { input: "2\n1 2", expectedOutput: "1", isPublic: false, points: 10 },
      { input: "4\n3 3 5 0", expectedOutput: "2", isPublic: false, points: 10 },
      { input: "1\n5", expectedOutput: "0", isPublic: false, points: 10 }
    ]
  }
];

// Linked List Problems (20 problems)
const linkedListProblems = [
  {
    title: "Reverse Linked List",
    statement: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    description: "You can solve this iteratively or recursively. The iterative solution uses O(1) space while recursive uses O(n) space.",
    constraints: "The number of nodes in the list is the range [0, 5000]\n-5000 <= Node.val <= 5000",
    inputFormat: "First line contains n (number of nodes)\nSecond line contains n space-separated integers representing node values",
    outputFormat: "Single line with n space-separated integers representing reversed list",
    examples: [
      {
        input: "5\n1 2 3 4 5",
        output: "5 4 3 2 1",
        explanation: "The linked list 1->2->3->4->5 becomes 5->4->3->2->1"
      }
    ],
    difficulty: "Easy",
    tags: ["linked-list", "recursion"],
    category: "Data Structure",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "5 4 3 2 1", isPublic: true, points: 10 },
      { input: "2\n1 2", expectedOutput: "2 1", isPublic: true, points: 10 },
      { input: "0", expectedOutput: "", isPublic: false, points: 10 },
      { input: "1\n1", expectedOutput: "1", isPublic: false, points: 10 },
      { input: "3\n-1 0 1", expectedOutput: "1 0 -1", isPublic: false, points: 10 }
    ]
  },
  {
    title: "Merge Two Sorted Lists",
    statement: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.",
    description: "Return the head of the merged linked list. Both lists are sorted in non-decreasing order.",
    constraints: "The number of nodes in both lists is in the range [0, 50]\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order",
    inputFormat: "First line contains n1 (nodes in first list)\nSecond line contains n1 space-separated integers\nThird line contains n2 (nodes in second list)\nFourth line contains n2 space-separated integers",
    outputFormat: "Single line with space-separated integers representing merged list",
    examples: [
      {
        input: "3\n1 2 4\n3\n1 3 4",
        output: "1 1 2 3 4 4",
        explanation: "Merging [1,2,4] and [1,3,4] gives [1,1,2,3,4,4]"
      }
    ],
    difficulty: "Easy",
    tags: ["linked-list", "recursion"],
    category: "Data Structure",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "3\n1 2 4\n3\n1 3 4", expectedOutput: "1 1 2 3 4 4", isPublic: true, points: 10 },
      { input: "0\n1\n0", expectedOutput: "0", isPublic: true, points: 10 },
      { input: "0\n0", expectedOutput: "", isPublic: false, points: 10 },
      { input: "2\n1 3\n2\n2 4", expectedOutput: "1 2 3 4", isPublic: false, points: 10 },
      { input: "1\n5\n3\n1 2 3", expectedOutput: "1 2 3 5", isPublic: false, points: 10 }
    ]
  }
];

// Tree Problems (30 problems)
const treeProblems = [
  {
    title: "Binary Tree Inorder Traversal",
    statement: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    description: "Inorder traversal visits nodes in the order: left subtree, root, right subtree. Can be solved iteratively or recursively.",
    constraints: "The number of nodes in the tree is in the range [0, 100]\n-100 <= Node.val <= 100",
    inputFormat: "First line contains n (number of nodes)\nSecond line contains n space-separated integers in level order (use -1 for null)",
    outputFormat: "Single line with space-separated integers representing inorder traversal",
    examples: [
      {
        input: "3\n1 -1 2 -1 -1 3",
        output: "1 3 2",
        explanation: "Inorder traversal of tree with root 1, right child 2, and 2's left child 3"
      }
    ],
    difficulty: "Easy",
    tags: ["stack", "tree", "depth-first-search", "binary-tree"],
    category: "Data Structure",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "3\n1 -1 2 -1 -1 3", expectedOutput: "1 3 2", isPublic: true, points: 10 },
      { input: "0", expectedOutput: "", isPublic: true, points: 10 },
      { input: "1\n1", expectedOutput: "1", isPublic: false, points: 10 },
      { input: "5\n1 2 3 4 5", expectedOutput: "4 2 5 1 3", isPublic: false, points: 10 },
      { input: "7\n4 2 6 1 3 5 7", expectedOutput: "1 2 3 4 5 6 7", isPublic: false, points: 10 }
    ]
  }
];

// Graph Problems (25 problems)
const graphProblems = [
  {
    title: "Number of Islands",
    statement: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    description: "An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    constraints: "m == grid.length\nn == grid[i].length\n1 <= m, n <= 300\ngrid[i][j] is '0' or '1'",
    inputFormat: "First line contains m and n\nNext m lines contain n characters each (0 or 1)",
    outputFormat: "Single integer representing number of islands",
    examples: [
      {
        input: "4 5\n11110\n11010\n11000\n00000",
        output: "1",
        explanation: "All connected 1's form one island"
      }
    ],
    difficulty: "Medium",
    tags: ["array", "depth-first-search", "breadth-first-search", "union-find", "matrix"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "4 5\n11110\n11010\n11000\n00000", expectedOutput: "1", isPublic: true, points: 10 },
      { input: "4 5\n11000\n11000\n00100\n00011", expectedOutput: "3", isPublic: true, points: 10 },
      { input: "1 1\n1", expectedOutput: "1", isPublic: false, points: 10 },
      { input: "1 1\n0", expectedOutput: "0", isPublic: false, points: 10 },
      { input: "3 3\n101\n010\n101", expectedOutput: "4", isPublic: false, points: 10 }
    ]
  }
];

// Dynamic Programming Problems (30 problems)
const dpProblems = [
  {
    title: "Climbing Stairs",
    statement: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    description: "This is a classic Fibonacci-like problem. The number of ways to reach step n is the sum of ways to reach step n-1 and step n-2.",
    constraints: "1 <= n <= 45",
    inputFormat: "Single integer n representing number of steps",
    outputFormat: "Single integer representing number of distinct ways",
    examples: [
      {
        input: "2",
        output: "2",
        explanation: "There are two ways: 1. 1 step + 1 step 2. 2 steps"
      }
    ],
    difficulty: "Easy",
    tags: ["math", "dynamic-programming", "memoization"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "2", expectedOutput: "2", isPublic: true, points: 10 },
      { input: "3", expectedOutput: "3", isPublic: true, points: 10 },
      { input: "1", expectedOutput: "1", isPublic: false, points: 10 },
      { input: "4", expectedOutput: "5", isPublic: false, points: 10 },
      { input: "5", expectedOutput: "8", isPublic: false, points: 10 }
    ]
  }
];

// Stack and Queue Problems (20 problems)
const stackQueueProblems = [
  {
    title: "Valid Parentheses",
    statement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    description: "An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'",
    inputFormat: "Single string containing parentheses",
    outputFormat: "true if valid, false otherwise",
    examples: [
      {
        input: "()",
        output: "true",
        explanation: "The string contains valid parentheses"
      }
    ],
    difficulty: "Easy",
    tags: ["string", "stack"],
    category: "Data Structure",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "()", expectedOutput: "true", isPublic: true, points: 10 },
      { input: "()[]{}", expectedOutput: "true", isPublic: true, points: 10 },
      { input: "(]", expectedOutput: "false", isPublic: false, points: 10 },
      { input: "([)]", expectedOutput: "false", isPublic: false, points: 10 },
      { input: "{[]}", expectedOutput: "true", isPublic: false, points: 10 }
    ]
  }
];

// Hashing Problems (25 problems)
const hashingProblems = [
  {
    title: "Contains Duplicate",
    statement: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    description: "Use a hash set to track seen elements for O(n) time complexity.",
    constraints: "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
    inputFormat: "First line contains n (length of array)\nSecond line contains n space-separated integers",
    outputFormat: "true if contains duplicate, false otherwise",
    examples: [
      {
        input: "4\n1 2 3 1",
        output: "true",
        explanation: "The element 1 appears twice"
      }
    ],
    difficulty: "Easy",
    tags: ["array", "hash-table", "sorting"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "4\n1 2 3 1", expectedOutput: "true", isPublic: true, points: 10 },
      { input: "4\n1 2 3 4", expectedOutput: "false", isPublic: true, points: 10 },
      { input: "3\n1 1 1", expectedOutput: "true", isPublic: false, points: 10 },
      { input: "1\n1", expectedOutput: "false", isPublic: false, points: 10 },
      { input: "5\n1 5 -3 4 1", expectedOutput: "true", isPublic: false, points: 10 }
    ]
  }
];

// Miscellaneous Problems (25 problems)
const miscProblems = [
  {
    title: "Palindrome Number",
    statement: "Given an integer x, return true if x is palindrome integer. An integer is a palindrome when it reads the same backward as forward.",
    description: "Could you solve it without converting the integer to a string?",
    constraints: "-2^31 <= x <= 2^31 - 1",
    inputFormat: "Single integer x",
    outputFormat: "true if palindrome, false otherwise",
    examples: [
      {
        input: "121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left"
      }
    ],
    difficulty: "Easy",
    tags: ["math"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "121", expectedOutput: "true", isPublic: true, points: 10 },
      { input: "-121", expectedOutput: "false", isPublic: true, points: 10 },
      { input: "10", expectedOutput: "false", isPublic: false, points: 10 },
      { input: "0", expectedOutput: "true", isPublic: false, points: 10 },
      { input: "1221", expectedOutput: "true", isPublic: false, points: 10 }
    ]
  }
];

// Combine all problems
const allProblems = [
  ...arrayProblems,
  ...linkedListProblems,
  ...treeProblems,
  ...graphProblems,
  ...dpProblems,
  ...stackQueueProblems,
  ...hashingProblems,
  ...miscProblems
];

// Seeding function
async function seedProblems() {
  try {
    console.log('🌱 Starting problem seeding...');
    
    // Clear existing problems
    await Problem.deleteMany({});
    console.log('🗑️  Cleared existing problems');
    
    // Add created by field (you'll need to replace with actual admin user ID)
    const problemsWithCreator = allProblems.map(problem => ({
      ...problem,
      createdBy: new mongoose.Types.ObjectId(), // Replace with actual admin user ID
      isPublic: true,
      isActive: true,
      statistics: {
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        acceptanceRate: 0,
        averageScore: 0
      }
    }));
    
    // Insert problems
    const insertedProblems = await Problem.insertMany(problemsWithCreator);
    console.log(`✅ Successfully seeded ${insertedProblems.length} problems`);
    
    // Log statistics
    const stats = {
      'Array': arrayProblems.length,
      'Linked List': linkedListProblems.length,
      'Tree': treeProblems.length,
      'Graph': graphProblems.length,
      'Dynamic Programming': dpProblems.length,
      'Stack/Queue': stackQueueProblems.length,
      'Hashing': hashingProblems.length,
      'Miscellaneous': miscProblems.length
    };
    
    console.log('📊 Problem distribution:');
    Object.entries(stats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} problems`);
    });
    
    return insertedProblems;
  } catch (error) {
    console.error('❌ Error seeding problems:', error);
    throw error;
  }
}

// Export for use in other files
module.exports = {
  seedProblems,
  allProblems,
  arrayProblems,
  linkedListProblems,
  treeProblems,
  graphProblems,
  dpProblems,
  stackQueueProblems,
  hashingProblems,
  miscProblems
};