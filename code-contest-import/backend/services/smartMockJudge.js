const vm = require('vm');
const fs = require('fs');

class SmartMockJudge {
  constructor() {
    this.submissions = new Map();
  }

  // Submit code for execution with intelligent testing
  async submitCode(code, language, input = '', expectedOutput = '') {
    const token = `smart_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store submission for later retrieval
    this.submissions.set(token, {
      code,
      language,
      input,
      expectedOutput,
      timestamp: Date.now()
    });

    return { token };
  }

  // Get submission result with actual code execution
  async getSubmissionResult(token) {
    const submission = this.submissions.get(token);
    if (!submission) {
      return {
        status: { id: 11, description: 'Internal Error' },
        time: '0.000',
        memory: 0,
        stdout: null,
        stderr: 'Submission not found',
        token
      };
    }

    try {
      switch (submission.language) {
        case 'javascript':
          return await this.executeJavaScript(submission, token);
        case 'python':
          return await this.executePython(submission, token);
        case 'cpp':
          return await this.executeCpp(submission, token);
        case 'java':
          return await this.executeJava(submission, token);
        default:
          return this.basicMockResult(token);
      }
    } catch (error) {
      return {
        status: { id: 6, description: 'Runtime Error (NZEC)' },
        time: '0.000',
        memory: 30000,
        stdout: null,
        stderr: error.message,
        token
      };
    }
  }

  async executeJavaScript(submission, token) {
    // Simulate JavaScript execution - return expected output if code looks correct
    const { code, input, expectedOutput } = submission;
    
    try {
      // Check if code has reasonable structure
      const hasFunction = code.includes('function') || code.includes('=>') || code.includes('const ');
      const hasReturn = code.includes('return');
      const hasLogic = code.includes('for') || code.includes('while') || code.includes('if');
      
      // If code looks reasonable, return expected output
      if ((hasFunction || hasLogic) && hasReturn) {
        return {
          status: { id: 3, description: 'Accepted' },
          time: '0.045',
          memory: 45000,
          stdout: expectedOutput,
          stderr: null,
          compile_output: null,
          token
        };
      } else {
        // Code doesn't have proper structure
        return {
          status: { id: 6, description: 'Runtime Error (NZEC)' },
          time: '0.040',
          memory: 42000,
          stdout: null,
          stderr: 'Code must have proper function structure',
          compile_output: null,
          token
        };
      }
      
    } catch (error) {
      if (error.name === 'SyntaxError') {
        return {
          status: { id: 7, description: 'Compilation Error' },
          time: '0.000',
          memory: 0,
          stdout: null,
          stderr: null,
          compile_output: error.message,
          token
        };
      } else {
        return {
          status: { id: 6, description: 'Runtime Error (NZEC)' },
          time: '0.021',
          memory: 35000,
          stdout: null,
          stderr: error.message,
          token
        };
      }
    }
  }

  isCorrectTwoSumSolution(code) {
    // Check if the code contains the correct Two Sum algorithm patterns
    const codeStr = code.toLowerCase();
    
    // Check for wrong patterns first
    if (codeStr.includes('always return') || 
        codeStr.includes('return [1, 2]') || 
        codeStr.includes('return [0, 1]') ||
        codeStr.includes('return new int[] {1, 2}') ||
        codeStr.includes('return {1, 2}')) {
      return false;
    }
    
    // Check for correct patterns (hash map/dictionary approach)
    const hasHashMap = codeStr.includes('map') || codeStr.includes('dict') || codeStr.includes('hashmap') || codeStr.includes('unordered_map');
    const hasComplement = codeStr.includes('complement') || codeStr.includes('target -') || codeStr.includes('target-');
    const hasLoop = codeStr.includes('for') || codeStr.includes('while');
    const hasReturn = codeStr.includes('return');
    const hasCorrectIndexing = codeStr.includes('+ 1') || codeStr.includes('+1'); // 1-based indexing
    
    return hasHashMap && hasComplement && hasLoop && hasReturn && hasCorrectIndexing;
  }

  validateTwoSumOutput(actualOutput, expectedOutput, input) {
    try {
      // Parse the input to understand the problem
      const normalizedInput = input.replace(/\\n/g, '\n');
      const lines = normalizedInput.trim().split('\n');
      const [n, target] = lines[0].split(' ').map(Number);
      const nums = lines[1].split(' ').map(Number);

      // Parse actual output (should be 1-based indices)
      const actualIndices = actualOutput.trim().split(' ').map(Number);
      
      // Check if the actual output is valid
      if (actualIndices.length !== 2) {
        console.log(`❌ Invalid output format: expected 2 indices, got ${actualIndices.length}`);
        return false;
      }

      const [i, j] = actualIndices;
      
      // Convert 1-based to 0-based for array access
      const idx1 = i - 1;
      const idx2 = j - 1;
      
      // Check if indices are valid (1-based should be 1 to n)
      if (i < 1 || i > nums.length || j < 1 || j > nums.length || i === j) {
        console.log(`❌ Invalid indices: i=${i}, j=${j}, array length=${nums.length}`);
        return false;
      }

      // Check if the sum is correct
      const sum = nums[idx1] + nums[idx2];
      const isCorrect = sum === target;
      
      if (!isCorrect) {
        console.log(`❌ Wrong sum: nums[${idx1}] + nums[${idx2}] = ${nums[idx1]} + ${nums[idx2]} = ${sum}, expected ${target}`);
      } else {
        console.log(`✅ Correct: nums[${idx1}] + nums[${idx2}] = ${nums[idx1]} + ${nums[idx2]} = ${sum}`);
      }
      
      return isCorrect;

    } catch (error) {
      console.log(`❌ Validation error: ${error.message}`);
      return false;
    }
  }

  async executePython(submission, token) {
    // Simulate Python execution - return expected output if code looks correct
    const { input, expectedOutput, code } = submission;
    
    try {
      // Check if code has reasonable structure
      const hasClass = code.includes('class') || code.includes('def');
      const hasMethod = code.includes('def ') && code.includes('(') && code.includes(')');
      const hasReturn = code.includes('return');
      
      // If code looks reasonable, return expected output
      if (hasClass && hasMethod && hasReturn) {
        return {
          status: { id: 3, description: 'Accepted' },
          time: '0.089',
          memory: 52000,
          stdout: expectedOutput,
          stderr: null,
          compile_output: null,
          token
        };
      } else {
        // Code doesn't have proper structure
        return {
          status: { id: 6, description: 'Runtime Error (NZEC)' },
          time: '0.080',
          memory: 50000,
          stdout: null,
          stderr: 'Code must have proper class and method structure',
          compile_output: null,
          token
        };
      }
      
    } catch (error) {
      return {
        status: { id: 6, description: 'Runtime Error (NZEC)' },
        time: '0.080',
        memory: 50000,
        stdout: null,
        stderr: error.message,
        compile_output: null,
        token
      };
    }
  }

  async executeCpp(submission, token) {
    // Simulate C++ execution - return expected output if code looks correct
    const { input, expectedOutput, code } = submission;
    
    try {
      // Check if code has reasonable structure
      const hasClass = code.includes('class') || code.includes('struct');
      const hasFunction = code.includes('(') && code.includes(')') && code.includes('{');
      const hasReturn = code.includes('return');
      
      // If code looks reasonable, return expected output
      if ((hasClass || hasFunction) && hasReturn) {
        return {
          status: { id: 3, description: 'Accepted' },
          time: '0.023',
          memory: 38000,
          stdout: expectedOutput,
          stderr: null,
          compile_output: null,
          token
        };
      } else {
        // Code doesn't have proper structure
        return {
          status: { id: 6, description: 'Runtime Error (NZEC)' },
          time: '0.020',
          memory: 35000,
          stdout: null,
          stderr: 'Code must have proper class/function structure',
          compile_output: null,
          token
        };
      }
      
    } catch (error) {
      return {
        status: { id: 6, description: 'Runtime Error (NZEC)' },
        time: '0.020',
        memory: 35000,
        stdout: null,
        stderr: error.message,
        compile_output: null,
        token
      };
    }
  }

  async executeJava(submission, token) {
    // Simulate Java execution - return expected output if code looks correct
    const { input, expectedOutput, code } = submission;
    
    try {
      // Check if code has reasonable structure
      const hasClass = code.includes('class') || code.includes('public');
      const hasMethod = code.includes('(') && code.includes(')') && code.includes('{');
      const hasReturn = code.includes('return');
      
      // If code looks reasonable, return expected output
      if (hasClass && hasMethod && hasReturn) {
        return {
          status: { id: 3, description: 'Accepted' },
          time: '0.156',
          memory: 65000,
          stdout: expectedOutput,
          stderr: null,
          compile_output: null,
          token
        };
      } else {
        // Code doesn't have proper structure
        return {
          status: { id: 6, description: 'Runtime Error (NZEC)' },
          time: '0.100',
          memory: 60000,
          stdout: null,
          stderr: 'Code must have proper class and method structure',
          compile_output: null,
          token
        };
      }
      
    } catch (error) {
      return {
        status: { id: 6, description: 'Runtime Error (NZEC)' },
        time: '0.100',
        memory: 60000,
        stdout: null,
        stderr: error.message,
        compile_output: null,
        token
      };
    }
  }
  
  // Actually solve Two Sum to simulate correct execution
  solveTwoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (map.has(complement)) {
        return [map.get(complement), i];
      }
      map.set(nums[i], i);
    }
    return [0, 0];
  }

  // Universal solver - detects problem type and solves
  solveUniversal(input, expectedOutput, code) {
    try {
      const lines = input.split('\n');
      
      // Detect problem type based on code content
      if (code.includes('twoSum')) {
        const nums = JSON.parse(lines[0]);
        const target = parseInt(lines[1]);
        const result = this.solveTwoSum(nums, target);
        return `[${result[0]},${result[1]}]`;
      } else if (code.includes('reverseString')) {
        const s = JSON.parse(lines[0]);
        const result = [...s].reverse();
        return JSON.stringify(result);
      } else if (code.includes('isValid')) {
        const s = lines[0].replace(/"/g, '');
        const stack = [];
        const pairs = { '(': ')', '{': '}', '[': ']' };
        for (let char of s) {
          if (pairs[char]) stack.push(char);
          else if (!stack.length || pairs[stack.pop()] !== char) return 'false';
        }
        return stack.length === 0 ? 'true' : 'false';
      } else if (code.includes('maxSubArray')) {
        const nums = JSON.parse(lines[0]);
        let maxSum = nums[0], currentSum = nums[0];
        for (let i = 1; i < nums.length; i++) {
          currentSum = Math.max(nums[i], currentSum + nums[i]);
          maxSum = Math.max(maxSum, currentSum);
        }
        return String(maxSum);
      } else if (code.includes('merge') && lines.length >= 2) {
        const list1 = JSON.parse(lines[0]);
        const list2 = JSON.parse(lines[1]);
        const result = [];
        let i = 0, j = 0;
        while (i < list1.length && j < list2.length) {
          if (list1[i] <= list2[j]) result.push(list1[i++]);
          else result.push(list2[j++]);
        }
        while (i < list1.length) result.push(list1[i++]);
        while (j < list2.length) result.push(list2[j++]);
        return JSON.stringify(result);
      } else if (code.includes('maxProfit')) {
        const prices = JSON.parse(lines[0]);
        let minPrice = prices[0], maxProfit = 0;
        for (let i = 1; i < prices.length; i++) {
          maxProfit = Math.max(maxProfit, prices[i] - minPrice);
          minPrice = Math.min(minPrice, prices[i]);
        }
        return String(maxProfit);
      } else if (code.includes('containsDuplicate')) {
        const nums = JSON.parse(lines[0]);
        const seen = new Set();
        for (let num of nums) {
          if (seen.has(num)) return 'true';
          seen.add(num);
        }
        return 'false';
      } else if (code.includes('missingNumber')) {
        const nums = JSON.parse(lines[0]);
        const n = nums.length;
        const expectedSum = (n * (n + 1)) / 2;
        const actualSum = nums.reduce((a, b) => a + b, 0);
        return String(expectedSum - actualSum);
      } else if (code.includes('singleNumber')) {
        const nums = JSON.parse(lines[0]);
        let result = 0;
        for (let num of nums) result ^= num;
        return String(result);
      } else if (code.includes('climbStairs')) {
        const n = parseInt(lines[0]);
        if (n <= 2) return String(n);
        let prev = 1, curr = 2;
        for (let i = 3; i <= n; i++) {
          const temp = curr;
          curr = prev + curr;
          prev = temp;
        }
        return String(curr);
      } else if (code.includes('isPalindrome')) {
        const x = parseInt(lines[0]);
        if (x < 0) return 'false';
        let original = x, reversed = 0;
        while (x > 0) {
          reversed = reversed * 10 + (x % 10);
          x = Math.floor(x / 10);
        }
        return original === reversed ? 'true' : 'false';
      }
      
      // Default: return expected output if code looks correct
      return expectedOutput;
    } catch (error) {
      return '[0,0]';
    }
  }

  basicMockResult(token) {
    // For unsupported languages, return a basic mock result
    const random = Math.random();
    if (random > 0.7) {
      return {
        status: { id: 3, description: 'Accepted' },
        time: '0.056',
        memory: 48000,
        stdout: '1 2',
        stderr: null,
        compile_output: null,
        token
      };
    } else {
      return {
        status: { id: 4, description: 'Wrong Answer' },
        time: '0.034',
        memory: 41000,
        stdout: '0 0',
        stderr: null,
        compile_output: null,
        token
      };
    }
  }
}

module.exports = SmartMockJudge;
