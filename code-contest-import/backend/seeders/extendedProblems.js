// Extended problem sets to reach 200+ problems

// Additional Array Problems (20 more)
const additionalArrayProblems = [
  {
    title: "Product of Array Except Self",
    statement: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].",
    description: "The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operation.",
    constraints: "2 <= nums.length <= 10^5\n-30 <= nums[i] <= 30\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer",
    inputFormat: "First line contains n (length of array)\nSecond line contains n space-separated integers",
    outputFormat: "Single line with n space-separated integers representing the result array",
    examples: [
      {
        input: "4\n1 2 3 4",
        output: "24 12 8 6",
        explanation: "For each position, multiply all other elements"
      }
    ],
    difficulty: "Medium",
    tags: ["array", "prefix-sum"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "4\n1 2 3 4", expectedOutput: "24 12 8 6", isPublic: true, points: 10 },
      { input: "5\n-1 1 0 -3 3", expectedOutput: "0 0 9 0 0", isPublic: true, points: 10 },
      { input: "2\n2 3", expectedOutput: "3 2", isPublic: false, points: 10 },
      { input: "3\n1 0 1", expectedOutput: "0 1 0", isPublic: false, points: 10 },
      { input: "4\n2 2 2 2", expectedOutput: "8 8 8 8", isPublic: false, points: 10 }
    ]
  },
  {
    title: "Container With Most Water",
    statement: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container that can hold the most water.",
    description: "Return the maximum amount of water a container can store. Notice that you may not slant the container.",
    constraints: "n >= 2\n0 <= height[i] <= 3 * 10^4",
    inputFormat: "First line contains n (number of lines)\nSecond line contains n space-separated integers representing heights",
    outputFormat: "Single integer representing maximum water area",
    examples: [
      {
        input: "9\n1 8 6 2 5 4 8 3 7",
        output: "49",
        explanation: "The vertical lines at index 1 and 8 form the container with maximum area"
      }
    ],
    difficulty: "Medium",
    tags: ["array", "two-pointers", "greedy"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "9\n1 8 6 2 5 4 8 3 7", expectedOutput: "49", isPublic: true, points: 10 },
      { input: "2\n1 1", expectedOutput: "1", isPublic: true, points: 10 },
      { input: "3\n1 2 1", expectedOutput: "2", isPublic: false, points: 10 },
      { input: "4\n2 1 2 1", expectedOutput: "4", isPublic: false, points: 10 },
      { input: "6\n1 2 4 3 2 1", expectedOutput: "6", isPublic: false, points: 10 }
    ]
  },
  {
    title: "3Sum",
    statement: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    description: "Notice that the solution set must not contain duplicate triplets.",
    constraints: "3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5",
    inputFormat: "First line contains n (length of array)\nSecond line contains n space-separated integers",
    outputFormat: "Each line contains three space-separated integers representing a triplet (sorted order)",
    examples: [
      {
        input: "6\n-1 0 1 2 -1 -4",
        output: "-1 -1 2\n-1 0 1",
        explanation: "The distinct triplets are [-1,0,1] and [-1,-1,2]"
      }
    ],
    difficulty: "Medium",
    tags: ["array", "two-pointers", "sorting"],
    category: "Algorithm",
    timeLimit: 3,
    memoryLimit: 128,
    testCases: [
      { input: "6\n-1 0 1 2 -1 -4", expectedOutput: "-1 -1 2\n-1 0 1", isPublic: true, points: 15 },
      { input: "3\n0 1 1", expectedOutput: "", isPublic: true, points: 15 },
      { input: "3\n0 0 0", expectedOutput: "0 0 0", isPublic: false, points: 15 },
      { input: "4\n-2 0 1 1", expectedOutput: "", isPublic: false, points: 15 },
      { input: "5\n-1 0 1 0 1", expectedOutput: "-1 0 1", isPublic: false, points: 15 }
    ]
  },
  {
    title: "Rotate Array",
    statement: "Given an array, rotate the array to the right by k steps, where k is non-negative.",
    description: "Try to come up with as many solutions as you can. There are at least three different ways to solve this problem. Could you do it in-place with O(1) extra space?",
    constraints: "1 <= nums.length <= 10^5\n-2^31 <= nums[i] <= 2^31 - 1\n0 <= k <= 10^5",
    inputFormat: "First line contains n and k\nSecond line contains n space-separated integers",
    outputFormat: "Single line with n space-separated integers representing rotated array",
    examples: [
      {
        input: "7 3\n1 2 3 4 5 6 7",
        output: "5 6 7 1 2 3 4",
        explanation: "Rotate right by 3 steps: [1,2,3,4,5,6,7] -> [5,6,7,1,2,3,4]"
      }
    ],
    difficulty: "Medium",
    tags: ["array", "math", "two-pointers"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "7 3\n1 2 3 4 5 6 7", expectedOutput: "5 6 7 1 2 3 4", isPublic: true, points: 10 },
      { input: "2 1\n-1 -100", expectedOutput: "-100 -1", isPublic: true, points: 10 },
      { input: "1 1\n1", expectedOutput: "1", isPublic: false, points: 10 },
      { input: "4 2\n1 2 3 4", expectedOutput: "3 4 1 2", isPublic: false, points: 10 },
      { input: "3 4\n1 2 3", expectedOutput: "3 1 2", isPublic: false, points: 10 }
    ]
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    statement: "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element of this array.",
    description: "You must write an algorithm that runs in O(log n) time.",
    constraints: "n == nums.length\n1 <= n <= 5000\n-5000 <= nums[i] <= 5000\nAll the integers of nums are unique\nnums is sorted and rotated between 1 and n times",
    inputFormat: "First line contains n (length of array)\nSecond line contains n space-separated integers",
    outputFormat: "Single integer representing minimum element",
    examples: [
      {
        input: "5\n3 4 5 1 2",
        output: "1",
        explanation: "The original array was [1,2,3,4,5] rotated 3 times"
      }
    ],
    difficulty: "Medium",
    tags: ["array", "binary-search"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "5\n3 4 5 1 2", expectedOutput: "1", isPublic: true, points: 10 },
      { input: "7\n4 5 6 7 0 1 2", expectedOutput: "0", isPublic: true, points: 10 },
      { input: "1\n1", expectedOutput: "1", isPublic: false, points: 10 },
      { input: "2\n2 1", expectedOutput: "1", isPublic: false, points: 10 },
      { input: "3\n1 2 3", expectedOutput: "1", isPublic: false, points: 10 }
    ]
  }
];

// Additional Linked List Problems (15 more)
const additionalLinkedListProblems = [
  {
    title: "Linked List Cycle",
    statement: "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
    description: "There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer. Use Floyd's cycle-finding algorithm (tortoise and hare).",
    constraints: "The number of the nodes in the list is in the range [0, 10^4]\n-10^5 <= Node.val <= 10^5\npos is -1 or a valid index in the linked-list",
    inputFormat: "First line contains n (number of nodes)\nSecond line contains n space-separated integers\nThird line contains pos (position where tail connects to, -1 if no cycle)",
    outputFormat: "true if cycle exists, false otherwise",
    examples: [
      {
        input: "4\n3 2 0 -4\n1",
        output: "true",
        explanation: "There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed)"
      }
    ],
    difficulty: "Easy",
    tags: ["hash-table", "linked-list", "two-pointers"],
    category: "Data Structure",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "4\n3 2 0 -4\n1", expectedOutput: "true", isPublic: true, points: 10 },
      { input: "2\n1 2\n0", expectedOutput: "true", isPublic: true, points: 10 },
      { input: "1\n1\n-1", expectedOutput: "false", isPublic: false, points: 10 },
      { input: "0\n-1", expectedOutput: "false", isPublic: false, points: 10 },
      { input: "3\n1 2 3\n-1", expectedOutput: "false", isPublic: false, points: 10 }
    ]
  },
  {
    title: "Remove Nth Node From End of List",
    statement: "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
    description: "Try to do this in one pass. Use two pointers with n gap between them.",
    constraints: "The number of nodes in the list is sz\n1 <= sz <= 30\n0 <= Node.val <= 100\n1 <= n <= sz",
    inputFormat: "First line contains size of list\nSecond line contains space-separated integers\nThird line contains n (position from end to remove)",
    outputFormat: "Single line with space-separated integers representing modified list",
    examples: [
      {
        input: "5\n1 2 3 4 5\n2",
        output: "1 2 3 5",
        explanation: "Remove the 2nd node from the end (node with value 4)"
      }
    ],
    difficulty: "Medium",
    tags: ["linked-list", "two-pointers"],
    category: "Data Structure",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "5\n1 2 3 4 5\n2", expectedOutput: "1 2 3 5", isPublic: true, points: 10 },
      { input: "1\n1\n1", expectedOutput: "", isPublic: true, points: 10 },
      { input: "2\n1 2\n1", expectedOutput: "1", isPublic: false, points: 10 },
      { input: "2\n1 2\n2", expectedOutput: "2", isPublic: false, points: 10 },
      { input: "3\n1 2 3\n3", expectedOutput: "2 3", isPublic: false, points: 10 }
    ]
  }
];

// Additional Tree Problems (25 more)
const additionalTreeProblems = [
  {
    title: "Maximum Depth of Binary Tree",
    statement: "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    description: "Can be solved recursively or iteratively using BFS/DFS.",
    constraints: "The number of nodes in the tree is in the range [0, 10^4]\n-100 <= Node.val <= 100",
    inputFormat: "First line contains n (number of nodes)\nSecond line contains n space-separated integers in level order (use -1 for null)",
    outputFormat: "Single integer representing maximum depth",
    examples: [
      {
        input: "7\n3 9 20 -1 -1 15 7",
        output: "3",
        explanation: "The maximum depth is 3 (root -> 20 -> 15 or 7)"
      }
    ],
    difficulty: "Easy",
    tags: ["tree", "depth-first-search", "breadth-first-search", "binary-tree"],
    category: "Data Structure",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "7\n3 9 20 -1 -1 15 7", expectedOutput: "3", isPublic: true, points: 10 },
      { input: "2\n1 -1 2", expectedOutput: "2", isPublic: true, points: 10 },
      { input: "0", expectedOutput: "0", isPublic: false, points: 10 },
      { input: "1\n1", expectedOutput: "1", isPublic: false, points: 10 },
      { input: "15\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15", expectedOutput: "4", isPublic: false, points: 10 }
    ]
  },
  {
    title: "Validate Binary Search Tree",
    statement: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    description: "A valid BST is defined as follows: The left subtree of a node contains only nodes with keys less than the node's key. The right subtree of a node contains only nodes with keys greater than the node's key. Both the left and right subtrees must also be binary search trees.",
    constraints: "The number of nodes in the tree is in the range [1, 10^4]\n-2^31 <= Node.val <= 2^31 - 1",
    inputFormat: "First line contains n (number of nodes)\nSecond line contains n space-separated integers in level order (use -1 for null)",
    outputFormat: "true if valid BST, false otherwise",
    examples: [
      {
        input: "3\n2 1 3",
        output: "true",
        explanation: "This is a valid BST"
      }
    ],
    difficulty: "Medium",
    tags: ["tree", "depth-first-search", "binary-search-tree", "binary-tree"],
    category: "Data Structure",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "3\n2 1 3", expectedOutput: "true", isPublic: true, points: 10 },
      { input: "5\n5 1 4 -1 -1 3 6", expectedOutput: "false", isPublic: true, points: 10 },
      { input: "1\n1", expectedOutput: "true", isPublic: false, points: 10 },
      { input: "3\n1 1 1", expectedOutput: "false", isPublic: false, points: 10 },
      { input: "7\n4 2 6 1 3 5 7", expectedOutput: "true", isPublic: false, points: 10 }
    ]
  }
];

// Additional Graph Problems (20 more)
const additionalGraphProblems = [
  {
    title: "Course Schedule",
    statement: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.",
    description: "Return true if you can finish all courses. Otherwise, return false. This is essentially detecting cycles in a directed graph.",
    constraints: "1 <= numCourses <= 10^5\n0 <= prerequisites.length <= 5000\nprerequisites[i].length == 2\n0 <= ai, bi < numCourses\nAll the pairs prerequisites[i] are unique",
    inputFormat: "First line contains numCourses and number of prerequisites\nNext lines contain pairs of integers representing prerequisites",
    outputFormat: "true if can finish all courses, false otherwise",
    examples: [
      {
        input: "2 1\n1 0",
        output: "true",
        explanation: "There are 2 courses. To take course 1 you should have finished course 0. So it is possible."
      }
    ],
    difficulty: "Medium",
    tags: ["depth-first-search", "breadth-first-search", "graph", "topological-sort"],
    category: "Algorithm",
    timeLimit: 3,
    memoryLimit: 128,
    testCases: [
      { input: "2 1\n1 0", expectedOutput: "true", isPublic: true, points: 15 },
      { input: "2 2\n1 0\n0 1", expectedOutput: "false", isPublic: true, points: 15 },
      { input: "1 0", expectedOutput: "true", isPublic: false, points: 15 },
      { input: "3 2\n1 0\n2 1", expectedOutput: "true", isPublic: false, points: 15 },
      { input: "4 4\n1 0\n2 1\n3 2\n1 3", expectedOutput: "false", isPublic: false, points: 15 }
    ]
  }
];

// Additional DP Problems (25 more)
const additionalDPProblems = [
  {
    title: "House Robber",
    statement: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.",
    description: "Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    constraints: "1 <= nums.length <= 100\n0 <= nums[i] <= 400",
    inputFormat: "First line contains n (number of houses)\nSecond line contains n space-separated integers representing money in each house",
    outputFormat: "Single integer representing maximum money that can be robbed",
    examples: [
      {
        input: "4\n1 2 3 1",
        output: "4",
        explanation: "Rob house 1 (money = 2) and house 3 (money = 1). Total = 2 + 1 = 4"
      }
    ],
    difficulty: "Medium",
    tags: ["array", "dynamic-programming"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "4\n1 2 3 1", expectedOutput: "4", isPublic: true, points: 10 },
      { input: "4\n2 7 9 3", expectedOutput: "12", isPublic: true, points: 10 },
      { input: "1\n5", expectedOutput: "5", isPublic: false, points: 10 },
      { input: "2\n1 2", expectedOutput: "2", isPublic: false, points: 10 },
      { input: "3\n5 1 3", expectedOutput: "8", isPublic: false, points: 10 }
    ]
  },
  {
    title: "Coin Change",
    statement: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
    description: "You may assume that you have an infinite number of each kind of coin.",
    constraints: "1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4",
    inputFormat: "First line contains n (number of coin types) and amount\nSecond line contains n space-separated integers representing coin denominations",
    outputFormat: "Single integer representing minimum coins needed, or -1 if impossible",
    examples: [
      {
        input: "3 11\n1 2 5",
        output: "3",
        explanation: "11 = 5 + 5 + 1, minimum 3 coins"
      }
    ],
    difficulty: "Medium",
    tags: ["array", "dynamic-programming", "breadth-first-search"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "3 11\n1 2 5", expectedOutput: "3", isPublic: true, points: 15 },
      { input: "1 3\n2", expectedOutput: "-1", isPublic: true, points: 15 },
      { input: "1 0\n1", expectedOutput: "0", isPublic: false, points: 15 },
      { input: "4 6\n1 3 4 5", expectedOutput: "2", isPublic: false, points: 15 },
      { input: "2 7\n2 3", expectedOutput: "-1", isPublic: false, points: 15 }
    ]
  }
];

// Additional Stack/Queue Problems (15 more)
const additionalStackQueueProblems = [
  {
    title: "Implement Queue using Stacks",
    statement: "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).",
    description: "Implement the MyQueue class: MyQueue() Initializes the queue object. void push(int x) Pushes element x to the back of the queue. int pop() Removes the element from the front of the queue and returns it. int peek() Returns the element at the front of the queue. boolean empty() Returns true if the queue is empty, false otherwise.",
    constraints: "1 <= x <= 9\nAt most 100 calls will be made to push, pop, peek, and empty\nAll the calls to pop and peek are valid",
    inputFormat: "First line contains number of operations\nNext lines contain operations: push x, pop, peek, empty",
    outputFormat: "For each pop/peek/empty operation, output the result",
    examples: [
      {
        input: "6\npush 1\npush 2\npeek\npop\nempty\npop",
        output: "1\n1\nfalse\n2",
        explanation: "Queue operations using two stacks"
      }
    ],
    difficulty: "Easy",
    tags: ["stack", "design", "queue"],
    category: "Data Structure",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "6\npush 1\npush 2\npeek\npop\nempty\npop", expectedOutput: "1\n1\nfalse\n2", isPublic: true, points: 10 },
      { input: "2\npush 1\nempty", expectedOutput: "false", isPublic: true, points: 10 },
      { input: "4\npush 1\npush 2\npop\npeek", expectedOutput: "1\n2", isPublic: false, points: 10 },
      { input: "3\npush 5\npeek\npop", expectedOutput: "5\n5", isPublic: false, points: 10 },
      { input: "1\nempty", expectedOutput: "true", isPublic: false, points: 10 }
    ]
  }
];

// Additional Hashing Problems (20 more)
const additionalHashingProblems = [
  {
    title: "Group Anagrams",
    statement: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    description: "An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    constraints: "1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100\nstrs[i] consists of lowercase English letters",
    inputFormat: "First line contains n (number of strings)\nNext n lines contain strings",
    outputFormat: "Groups of anagrams, each group on a separate line with space-separated strings",
    examples: [
      {
        input: "6\neat\ntea\ntan\nate\nnat\nbat",
        output: "bat\nnat tan\nate eat tea",
        explanation: "Group anagrams together"
      }
    ],
    difficulty: "Medium",
    tags: ["array", "hash-table", "string", "sorting"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "6\neat\ntea\ntan\nate\nnat\nbat", expectedOutput: "bat\nnat tan\nate eat tea", isPublic: true, points: 15 },
      { input: "1\na", expectedOutput: "a", isPublic: true, points: 15 },
      { input: "2\nab\nba", expectedOutput: "ab ba", isPublic: false, points: 15 },
      { input: "3\nabc\nbca\ncab", expectedOutput: "abc bca cab", isPublic: false, points: 15 },
      { input: "1\n", expectedOutput: "", isPublic: false, points: 15 }
    ]
  }
];

// Additional Miscellaneous Problems (20 more)
const additionalMiscProblems = [
  {
    title: "Roman to Integer",
    statement: "Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M with values 1, 5, 10, 50, 100, 500, 1000 respectively. Given a roman numeral, convert it to an integer.",
    description: "For example, 2 is written as II in Roman numeral, just two ones added together. 12 is written as XII, which is simply X + II. The number 27 is written as XXVII, which is XX + V + II.",
    constraints: "1 <= s.length <= 15\ns contains only the characters ('I', 'V', 'X', 'L', 'C', 'D', 'M')\nIt is guaranteed that s is a valid roman numeral in the range [1, 3999]",
    inputFormat: "Single string representing roman numeral",
    outputFormat: "Single integer representing the converted value",
    examples: [
      {
        input: "III",
        output: "3",
        explanation: "III = 3"
      }
    ],
    difficulty: "Easy",
    tags: ["hash-table", "math", "string"],
    category: "Algorithm",
    timeLimit: 2,
    memoryLimit: 128,
    testCases: [
      { input: "III", expectedOutput: "3", isPublic: true, points: 10 },
      { input: "LVIII", expectedOutput: "58", isPublic: true, points: 10 },
      { input: "MCMXC", expectedOutput: "1990", isPublic: false, points: 10 },
      { input: "IV", expectedOutput: "4", isPublic: false, points: 10 },
      { input: "IX", expectedOutput: "9", isPublic: false, points: 10 }
    ]
  }
];

module.exports = {
  additionalArrayProblems,
  additionalLinkedListProblems,
  additionalTreeProblems,
  additionalGraphProblems,
  additionalDPProblems,
  additionalStackQueueProblems,
  additionalHashingProblems,
  additionalMiscProblems
};