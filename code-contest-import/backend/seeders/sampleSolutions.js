// Sample solutions for enhanced problems to verify correctness

const sampleSolutions = {
  "Two Sum": {
    python: `def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []

# Read input
n = int(input())
nums = list(map(int, input().split()))
target = int(input())

# Solve and print result
result = two_sum(nums, target)
print(result[0], result[1])`,
    
    javascript: `function twoSum(nums, target) {
    const numMap = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        numMap.set(nums[i], i);
    }
    return [];
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
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
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
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> numMap;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (numMap.find(complement) != numMap.end()) {
            return {numMap[complement], i};
        }
        numMap[nums[i]] = i;
    }
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

  "Reverse Integer": {
    python: `def reverse_integer(x):
    INT_MAX = 2**31 - 1
    INT_MIN = -2**31
    
    sign = -1 if x < 0 else 1
    x = abs(x)
    
    result = 0
    while x:
        result = result * 10 + x % 10
        x //= 10
    
    result *= sign
    
    # Check for overflow
    if result > INT_MAX or result < INT_MIN:
        return 0
    
    return result

x = int(input())
print(reverse_integer(x))`,

    javascript: `function reverse(x) {
    const INT_MAX = Math.pow(2, 31) - 1;
    const INT_MIN = -Math.pow(2, 31);
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    
    let result = 0;
    while (x > 0) {
        result = result * 10 + x % 10;
        x = Math.floor(x / 10);
    }
    
    result *= sign;
    
    if (result > INT_MAX || result < INT_MIN) {
        return 0;
    }
    
    return result;
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
});`
  },

  "Palindrome Number": {
    python: `def is_palindrome(x):
    if x < 0:
        return False
    
    original = x
    reversed_num = 0
    
    while x > 0:
        reversed_num = reversed_num * 10 + x % 10
        x //= 10
    
    return original == reversed_num

x = int(input())
result = is_palindrome(x)
print("true" if result else "false")`,

    javascript: `function isPalindrome(x) {
    if (x < 0) return false;
    
    const original = x;
    let reversed = 0;
    
    while (x > 0) {
        reversed = reversed * 10 + x % 10;
        x = Math.floor(x / 10);
    }
    
    return original === reversed;
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

  "Valid Parentheses": {
    python: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    
    return len(stack) == 0

s = input().strip()
result = is_valid(s)
print("true" if result else "false")`,

    javascript: `function isValid(s) {
    const stack = [];
    const mapping = {')': '(', '}': '{', ']': '['};
    
    for (let char of s) {
        if (char in mapping) {
            if (stack.length === 0 || stack.pop() !== mapping[char]) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0;
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

  "Maximum Subarray": {
    python: `def max_subarray(nums):
    max_sum = nums[0]
    current_sum = nums[0]
    
    for i in range(1, len(nums)):
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    
    return max_sum

n = int(input())
nums = list(map(int, input().split()))
print(max_subarray(nums))`,

    javascript: `function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
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
  }
};

module.exports = { sampleSolutions };
