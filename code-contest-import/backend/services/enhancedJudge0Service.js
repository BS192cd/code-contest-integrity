const axios = require('axios');
const SmartMockJudge = require('./smartMockJudge');

class EnhancedJudge0Service {
  constructor() {
    this.apiUrl = process.env.JUDGE0_API_URL || 'https://judge029.p.rapidapi.com';
    this.apiHost = process.env.JUDGE0_HOST || 'judge029.p.rapidapi.com';
    this.apiKey = process.env.JUDGE0_API_KEY;
    this.useMockMode = !this.apiKey || process.env.NODE_ENV === 'development';
    this.smartMock = new SmartMockJudge();
    this.baseURL = this.apiUrl;
    
    // Judge0 Language IDs (same for CodeArena-Advanced Compiler)
    this.languageMap = {
      javascript: 63,  // Node.js
      python: 71,      // Python 3
      java: 62,        // Java
      cpp: 54,         // C++ (GCC 9.2.0)
      c: 50            // C (GCC 9.2.0)
    };
    
    console.log(`🔧 Enhanced Judge0 Service initialized (CodeArena-Advanced Compiler)`);
    console.log(`   API URL: ${this.apiUrl}`);
    console.log(`   API Host: ${this.apiHost}`);
    console.log(`   Mock Mode: ${this.useMockMode ? 'ON' : 'OFF'}`);
    console.log(`   API Key: ${this.apiKey ? 'Present' : 'Missing'}`);
  }

  // Main method to validate submission against all test cases
  async validateSubmission(code, language, testCases) {
    console.log(`🧪 Validating submission with ${testCases.length} test cases`);
    
    if (!testCases || testCases.length === 0) {
      throw new Error('This problem has no test cases configured.');
    }

    const results = [];
    let allPassed = true;
    let totalScore = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`   Testing case ${i + 1}/${testCases.length}`);

      try {
        const result = await this.runSingleTestCase(code, language, testCase, i);
        results.push(result);
        
        if (result.status !== 'passed') {
          allPassed = false;
        }
        
        totalScore += result.points || 0;
      } catch (error) {
        console.error(`   ❌ Test case ${i + 1} failed:`, error.message);
        results.push({
          testCaseIndex: i,
          status: 'runtime_error',
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          errorMessage: error.message,
          executionTime: 0,
          memoryUsage: 0,
          points: 0
        });
        allPassed = false;
      }
    }

    const finalStatus = this.determineFinalStatus(results);
    const finalScore = Math.round((totalScore / testCases.reduce((sum, tc) => sum + (tc.points || 10), 0)) * 100);

    console.log(`🏁 Validation complete: ${finalStatus} (${finalScore}%)`);

    return {
      status: finalStatus,
      score: finalScore,
      testResults: results,
      passedTestCases: results.filter(r => r.status === 'passed').length,
      totalTestCases: results.length,
      allPassed
    };
  }

  // Run a single test case
  async runSingleTestCase(code, language, testCase, index) {
    const startTime = Date.now();
    
    try {
      let result;
      
      if (this.useMockMode) {
        result = await this.runMockExecution(code, language, testCase.input);
      } else {
        result = await this.runRealJudge0(code, language, testCase.input);
      }

      const executionTime = Date.now() - startTime;
      const actualOutput = (result.stdout || '').trim();
      const expectedOutput = (testCase.expectedOutput || '').trim();
      
      // Enhanced output validation
      const isCorrect = this.validateOutput(actualOutput, expectedOutput);
      
      const testResult = {
        testCaseIndex: index,
        status: isCorrect ? 'passed' : 'failed',
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.stdout || '',
        errorMessage: result.stderr || null,
        executionTime: result.time ? parseFloat(result.time) * 1000 : executionTime,
        memoryUsage: result.memory || 0,
        points: isCorrect ? (testCase.points || 10) : 0,
        judge0Token: result.token || null
      };

      // Handle specific error cases
      if (result.status && result.status.id) {
        if (result.status.id === 5) { // Time Limit Exceeded
          testResult.status = 'tle';
          testResult.errorMessage = 'Time Limit Exceeded';
        } else if (result.status.id === 6) { // Compilation Error
          testResult.status = 'compile_error';
          testResult.errorMessage = result.compile_output || 'Compilation Error';
        } else if (result.status.id >= 7 && result.status.id <= 12) { // Runtime Errors
          testResult.status = 'runtime_error';
          testResult.errorMessage = result.stderr || 'Runtime Error';
        }
      }

      console.log(`     ${testResult.status === 'passed' ? '✅' : '❌'} Test ${index + 1}: ${testResult.status}`);
      
      return testResult;
      
    } catch (error) {
      console.error(`     ❌ Test ${index + 1} execution failed:`, error.message);
      
      return {
        testCaseIndex: index,
        status: 'runtime_error',
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        errorMessage: error.message,
        executionTime: Date.now() - startTime,
        memoryUsage: 0,
        points: 0
      };
    }
  }

  // Determine final submission status based on test results
  determineFinalStatus(results) {
    if (results.length === 0) return 'system_error';
    
    const hasCompileError = results.some(r => r.status === 'compile_error');
    if (hasCompileError) return 'compile_error';
    
    const hasRuntimeError = results.some(r => r.status === 'runtime_error');
    if (hasRuntimeError) return 'runtime_error';
    
    const hasTLE = results.some(r => r.status === 'tle');
    if (hasTLE) return 'time_limit_exceeded';
    
    const hasMLE = results.some(r => r.status === 'mle');
    if (hasMLE) return 'memory_limit_exceeded';
    
    const allPassed = results.every(r => r.status === 'passed');
    if (allPassed) return 'accepted';
    
    return 'wrong_answer';
  }

  // Enhanced output validation with multiple comparison methods
  validateOutput(actual, expected, problemId = null) {
    if (!actual && !expected) return true;
    if (!actual || !expected) return false;

    // Normalize both outputs
    const normalizedActual = this.normalizeOutput(actual);
    const normalizedExpected = this.normalizeOutput(expected);

    console.log(`🔍 Output Validation:`);
    console.log(`   Expected: "${expected}" → Normalized: "${normalizedExpected}"`);
    console.log(`   Actual: "${actual}" → Normalized: "${normalizedActual}"`);

    // Method 1: Exact match after normalization
    if (normalizedActual === normalizedExpected) {
      console.log(`   ✅ Exact match after normalization`);
      return true;
    }

    // Method 2: Flexible numeric comparison
    if (this.isNumericOutput(normalizedExpected) && this.isNumericOutput(normalizedActual)) {
      const numericMatch = this.compareNumericOutputs(normalizedActual, normalizedExpected);
      if (numericMatch) {
        console.log(`   ✅ Numeric match`);
        return true;
      }
    }

    // Method 3: Array/list comparison (for problems like Two Sum)
    if (this.isArrayOutput(normalizedExpected) && this.isArrayOutput(normalizedActual)) {
      const arrayMatch = this.compareArrayOutputs(normalizedActual, normalizedExpected);
      if (arrayMatch) {
        console.log(`   ✅ Array match`);
        return true;
      }
    }

    // Method 4: Boolean comparison
    if (this.isBooleanOutput(normalizedExpected) && this.isBooleanOutput(normalizedActual)) {
      const boolMatch = this.compareBooleanOutputs(normalizedActual, normalizedExpected);
      if (boolMatch) {
        console.log(`   ✅ Boolean match`);
        return true;
      }
    }

    console.log(`   ❌ No match found`);
    return false;
  }

  // Normalize output by removing extra whitespace and standardizing format
  normalizeOutput(output) {
    if (!output) return '';
    
    return output
      .toString()
      .trim()
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .replace(/\r/g, '');   // Remove carriage returns
  }

  // Check if output represents a number
  isNumericOutput(output) {
    const trimmed = output.trim();
    return /^-?\d+(\.\d+)?$/.test(trimmed);
  }

  // Compare numeric outputs with tolerance
  compareNumericOutputs(actual, expected, tolerance = 1e-9) {
    const actualNum = parseFloat(actual.trim());
    const expectedNum = parseFloat(expected.trim());
    
    if (isNaN(actualNum) || isNaN(expectedNum)) return false;
    
    return Math.abs(actualNum - expectedNum) <= tolerance;
  }

  // Check if output represents an array/list
  isArrayOutput(output) {
    const trimmed = output.trim();
    // Check for bracket notation [1,2], space-separated, or comma-separated values
    return /^\[.*\]$/.test(trimmed) || 
           /^-?\d+(\s+-?\d+)*$/.test(trimmed) || 
           /^-?\d+(,\s*-?\d+)*$/.test(trimmed);
  }

  // Compare array outputs (order may or may not matter depending on problem)
  compareArrayOutputs(actual, expected, orderMatters = true) {
    const actualArray = this.parseArrayOutput(actual);
    const expectedArray = this.parseArrayOutput(expected);
    
    if (actualArray.length !== expectedArray.length) return false;
    
    if (orderMatters) {
      return actualArray.every((val, idx) => val === expectedArray[idx]);
    } else {
      // For problems where order doesn't matter (rare)
      const actualSorted = [...actualArray].sort();
      const expectedSorted = [...expectedArray].sort();
      return actualSorted.every((val, idx) => val === expectedSorted[idx]);
    }
  }

  // Parse array output into array of numbers
  parseArrayOutput(output) {
    let trimmed = output.trim();
    
    // Remove brackets if present: [1,2] -> 1,2
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      trimmed = trimmed.substring(1, trimmed.length - 1);
    }
    
    // Space-separated
    if (trimmed.includes(' ') && !trimmed.includes(',')) {
      return trimmed.split(/\s+/).map(x => parseFloat(x));
    }
    
    // Comma-separated
    if (trimmed.includes(',')) {
      return trimmed.split(',').map(x => parseFloat(x.trim()));
    }
    
    // Single number
    return [parseFloat(trimmed)];
  }

  // Check if output represents a boolean
  isBooleanOutput(output) {
    const trimmed = output.trim().toLowerCase();
    return ['true', 'false', 'yes', 'no', '1', '0'].includes(trimmed);
  }

  // Compare boolean outputs
  compareBooleanOutputs(actual, expected) {
    const actualBool = this.parseBooleanOutput(actual);
    const expectedBool = this.parseBooleanOutput(expected);
    return actualBool === expectedBool;
  }

  // Parse boolean output
  parseBooleanOutput(output) {
    const trimmed = output.trim().toLowerCase();
    return ['true', 'yes', '1'].includes(trimmed);
  }

  // Submit code for execution with enhanced error handling
  async submitCode(code, language, input = '', expectedOutput = '') {
    try {
      const languageId = this.languageMap[language];
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      console.log(`🔄 Enhanced Judge0 Submit: ${language} (ID: ${languageId})`);
      console.log(`   Code length: ${code.length}, Input length: ${input.length}`);

      // Use mock service if no real API key
      if (!this.apiKey || this.apiKey === 'mock-judge0-key' || this.apiKey === 'your-judge0-api-key-here') {
        console.log('📝 Using enhanced mock Judge0 service');
        return this.enhancedMockSubmission(code, language, input, expectedOutput);
      }

      const submissionData = {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(input).toString('base64'),
        expected_output: expectedOutput ? Buffer.from(expectedOutput).toString('base64') : undefined
      };

      console.log(`🌐 Calling Judge0 API: ${this.baseURL}/submissions`);

      const response = await axios.post(`${this.baseURL}/submissions`, submissionData, {
        params: {
          base64_encoded: 'true',
          wait: 'true'  // ⚡ FAST MODE: Get result immediately instead of polling
        },
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost
        },
        timeout: 30000  // Increased timeout for synchronous wait
      });

      // Decode base64 encoded fields
      const result = response.data;
      if (result.stdout) result.stdout = Buffer.from(result.stdout, 'base64').toString();
      if (result.stderr) result.stderr = Buffer.from(result.stderr, 'base64').toString();
      if (result.compile_output) result.compile_output = Buffer.from(result.compile_output, 'base64').toString();

      console.log(`✅ Judge0 execution completed: ${result.status?.description || 'Done'}`);
      return result;  // Result is already complete and decoded!
    } catch (error) {
      console.error('❌ Enhanced Judge0 submission error:', error.response?.data || error.message);
      
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        console.log('🔄 Judge0 API unavailable, falling back to enhanced mock service');
        return this.enhancedMockSubmission(code, language, input, expectedOutput);
      }
      
      throw new Error(`Code execution failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Enhanced mock submission with better simulation
  enhancedMockSubmission(code, language, input, expectedOutput) {
    const token = `enhanced_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Try to simulate realistic output based on code analysis
    const simulatedOutput = this.simulateCodeExecution(code, language, input, expectedOutput);
    
    return { 
      token,
      _mockData: {
        code,
        language,
        input,
        expectedOutput,
        simulatedOutput
      }
    };
  }

  // Simulate code execution for better mock results
  simulateCodeExecution(code, language, input, expectedOutput) {
    console.log(`🎭 Simulating code execution for ${language}`);
    
    // Enhanced pattern matching for common problems
    if (code.includes('two_sum') || code.includes('twoSum') || code.includes('Two Sum')) {
      // Parse Two Sum input format: n\nnums\ntarget
      const lines = input.split('\n');
      if (lines.length >= 3) {
        const nums = lines[1].split(' ').map(Number);
        const target = parseInt(lines[2]);
        
        // Simple Two Sum simulation
        for (let i = 0; i < nums.length; i++) {
          for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
              return `${i} ${j}`;
            }
          }
        }
      }
    }
    
    if (code.includes('reverse') || code.includes('Reverse')) {
      const num = parseInt(input.trim());
      if (!isNaN(num)) {
        const sign = num < 0 ? -1 : 1;
        const reversed = parseInt(Math.abs(num).toString().split('').reverse().join('')) * sign;
        // Check for overflow
        if (reversed > 2147483647 || reversed < -2147483648) {
          return '0';
        }
        return reversed.toString();
      }
    }
    
    if (code.includes('palindrome') || code.includes('isPalindrome')) {
      const num = parseInt(input.trim());
      if (!isNaN(num)) {
        if (num < 0) return 'false';
        const str = num.toString();
        const reversed = str.split('').reverse().join('');
        return str === reversed ? 'true' : 'false';
      }
    }
    
    if (code.includes('isValid') || code.includes('Valid Parentheses')) {
      const s = input.trim();
      const stack = [];
      const mapping = {')': '(', '}': '{', ']': '['};
      
      for (let char of s) {
        if (char in mapping) {
          if (stack.length === 0 || stack.pop() !== mapping[char]) {
            return 'false';
          }
        } else {
          stack.push(char);
        }
      }
      return stack.length === 0 ? 'true' : 'false';
    }
    
    if (code.includes('max_subarray') || code.includes('maxSubArray') || code.includes('Maximum Subarray')) {
      const lines = input.split('\n');
      if (lines.length >= 2) {
        const nums = lines[1].split(' ').map(Number);
        let maxSum = nums[0];
        let currentSum = nums[0];
        
        for (let i = 1; i < nums.length; i++) {
          currentSum = Math.max(nums[i], currentSum + nums[i]);
          maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum.toString();
      }
    }
    
    // Simple print statement simulation
    if (code.includes('print(') && language === 'python') {
      const printMatch = code.match(/print\(["'](.+?)["']\)/);
      if (printMatch) {
        return printMatch[1];
      }
      const printNumMatch = code.match(/print\((-?\d+)\)/);
      if (printNumMatch) {
        return printNumMatch[1];
      }
    }
    
    // Console.log simulation for JavaScript
    if (code.includes('console.log(') && language === 'javascript') {
      const logMatch = code.match(/console\.log\(["'](.+?)["']\)/);
      if (logMatch) {
        return logMatch[1];
      }
      const logNumMatch = code.match(/console\.log\((-?\d+)\)/);
      if (logNumMatch) {
        return logNumMatch[1];
      }
    }
    
    // Default simulation based on expected output
    if (expectedOutput) {
      // 90% chance of correct output for better testing
      if (Math.random() > 0.1) {
        return expectedOutput;
      } else {
        // Generate a plausible wrong answer
        return this.generateWrongAnswer(expectedOutput);
      }
    }
    
    return 'mock_output';
  }

  // Generate plausible wrong answers for testing
  generateWrongAnswer(expectedOutput) {
    if (this.isNumericOutput(expectedOutput)) {
      const num = parseInt(expectedOutput);
      return (num + 1).toString();
    }
    
    if (this.isArrayOutput(expectedOutput)) {
      const arr = this.parseArrayOutput(expectedOutput);
      return arr.reverse().join(' ');
    }
    
    if (this.isBooleanOutput(expectedOutput)) {
      return expectedOutput.includes('true') ? 'false' : 'true';
    }
    
    return 'wrong_output';
  }

  // Get submission result with enhanced validation
  async getSubmissionResult(token) {
    try {
      // Handle mock submissions
      if (token.startsWith('enhanced_mock_')) {
        return this.enhancedMockResult(token);
      }

      if (!this.apiKey || this.apiKey === 'mock-judge0-key' || this.apiKey === 'your-judge0-api-key-here') {
        return this.enhancedMockResult(token);
      }

      const response = await axios.get(`${this.baseURL}/submissions/${token}`, {
        params: {
          base64_encoded: 'true',
          fields: '*'
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost
        }
      });

      const result = response.data;

      // Decode base64 encoded fields
      if (result.stdout) result.stdout = Buffer.from(result.stdout, 'base64').toString();
      if (result.stderr) result.stderr = Buffer.from(result.stderr, 'base64').toString();
      if (result.compile_output) result.compile_output = Buffer.from(result.compile_output, 'base64').toString();

      return result;
    } catch (error) {
      console.error('Enhanced Judge0 get result error:', error);
      return this.enhancedMockResult(token);
    }
  }

  // Enhanced mock result with realistic simulation
  enhancedMockResult(token) {
    const executionTime = Math.floor(Math.random() * 100) + 10; // 10-110ms
    const memory = Math.floor(Math.random() * 50000) + 30000; // 30-80MB
    
    // Get mock data if available
    const mockData = token._mockData || {};
    const simulatedOutput = mockData.simulatedOutput || 'mock_output';
    
    // Simulate different outcomes
    const random = Math.random();
    
    if (random > 0.85) {
      // Time Limit Exceeded
      return {
        status: { id: 5, description: 'Time Limit Exceeded' },
        time: '2.000',
        memory: memory,
        stdout: null,
        stderr: null,
        compile_output: null,
        token
      };
    } else if (random > 0.75) {
      // Runtime Error
      return {
        status: { id: 6, description: 'Runtime Error (NZEC)' },
        time: (executionTime / 1000).toFixed(3),
        memory: memory,
        stdout: null,
        stderr: 'IndexError: list index out of range',
        compile_output: null,
        token
      };
    } else {
      // Successful execution
      return {
        status: { id: 3, description: 'Accepted' },
        time: (executionTime / 1000).toFixed(3),
        memory: memory,
        stdout: simulatedOutput,
        stderr: null,
        compile_output: null,
        token
      };
    }
  }

  // Execute code against multiple test cases with enhanced validation
  async executeWithTestCases(code, language, testCases, timeLimit = 2, memoryLimit = 128, problemTitle = '', problem = null) {
    try {
      const results = [];
      
      console.log(`🧪 Enhanced execution against ${testCases.length} test cases`);
      console.log(`   Problem: ${problemTitle}`);
      console.log(`   Language: ${language}`);
      console.log(`   ✅ CODEFORCES-STYLE: Using user code directly (no wrappers)`);
      
      // Initialize generic judge for mock mode
      let genericJudge = null;
      if (this.useMockMode) {
        const GenericMockJudge = require('./genericMockJudge');
        genericJudge = new GenericMockJudge();
        console.log(`🎯 Using GenericMockJudge for execution`);
      }
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        try {
          // Handle both old and new schema - normalize to expectedOutput
          const expectedOutput = testCase.expectedOutput || testCase.output || '';
          const inputValue = testCase.input || '';
          
          console.log(`\n📝 Test Case ${i + 1}:`);
          console.log(`   Input: "${inputValue}"`);
          console.log(`   Expected: "${expectedOutput}"`);
          
          console.log(`   Submitting with input: "${inputValue}"`);
          
          let submission, result;
          
          if (this.useMockMode) {
            // Use generic mock judge for all problems
            submission = await genericJudge.submitCode(code, language, inputValue, expectedOutput);
            result = await genericJudge.getSubmissionResult(submission.token);
          } else {
            // Use real Judge0 API with synchronous wait (FAST!)
            result = await this.submitCode(code, language, inputValue, expectedOutput);
            // No polling needed - result is already complete!
          }
          
          const actualOutput = (result.stdout || '').toString();
          
          console.log(`   Actual: "${actualOutput}"`);
          console.log(`   Status: ${result.status?.description || 'Unknown'}`);
          console.log(`   Error: ${result.stderr || 'None'}`);
          
          // Use enhanced validation
          const isCorrect = this.validateOutput(actualOutput, expectedOutput, testCase.problemId);
          
          // Determine status based on enhanced validation, not just Judge0 status
          let status;
          if (result.status?.id === 6) {
            status = 'compile_error';
          } else if (result.status?.id >= 7 && result.status?.id <= 12) {
            status = 'runtime_error';
          } else if (result.status?.id === 5) {
            status = 'tle';
          } else if (result.status?.id === 14) {
            status = 'mle';
          } else if (isCorrect) {
            // Use our enhanced validation - if it says correct, it's correct!
            status = 'passed';
          } else {
            status = 'failed';
          }
          
          const testResult = {
            testCaseIndex: i,
            input: inputValue.trim(),
            expectedOutput: expectedOutput.trim(),
            actualOutput: actualOutput.trim(),
            status: status,
            executionTime: result.time ? parseFloat(result.time) * 1000 : null,
            memoryUsage: result.memory ? Math.round(result.memory / 1024) : null,
            errorMessage: result.stderr || result.compile_output || (!isCorrect ? 'Output does not match expected result' : null),
            points: isCorrect ? (testCase.points || 10) : 0
          };

          results.push(testResult);
          
          console.log(`   Result: ${testResult.status} (${testResult.points} points)`);

        } catch (testError) {
          console.error(`❌ Test case ${i} execution error:`, testError);
          const expectedOutput = testCase.expectedOutput || testCase.output || '';
          results.push({
            testCaseIndex: i,
            input: testCase.input,
            expectedOutput: expectedOutput,
            actualOutput: '',
            status: 'runtime_error',
            executionTime: null,
            memoryUsage: null,
            errorMessage: testError.message || 'Execution failed',
            points: 0
          });
        }
      }

      const passedTests = results.filter(r => r.status === 'passed').length;
      console.log(`\n📊 Test Results: ${passedTests}/${results.length} passed`);

      return results;
    } catch (error) {
      console.error('❌ Enhanced test case execution error:', error);
      throw error;
    }
  }

  // Poll for submission result with timeout
  async pollForResult(token, timeout = 30000) {
    const startTime = Date.now();
    const pollInterval = 1000;
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await this.getSubmissionResult(token);
        
        if (result.status && result.status.id !== 1 && result.status.id !== 2) {
          return result;
        }
        
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Polling error:', error);
        throw error;
      }
    }
    
    throw new Error('Execution timeout - result not available within time limit');
  }

  // Map Judge0 status to internal status
  mapStatusToInternal(status) {
    const statusMap = {
      3: 'passed',      // Accepted
      4: 'failed',      // Wrong Answer
      5: 'tle',         // Time Limit Exceeded
      6: 'runtime_error', // Runtime Error
      7: 'runtime_error', // Runtime Error
      8: 'runtime_error', // Runtime Error
      9: 'runtime_error', // Runtime Error
      10: 'runtime_error', // Runtime Error
      11: 'runtime_error', // Runtime Error
      12: 'runtime_error', // Runtime Error
      13: 'runtime_error', // Runtime Error
      14: 'mle'         // Memory Limit Exceeded
    };

    return statusMap[status?.id] || 'failed';
  }

  // Get supported languages
  getSupportedLanguages() {
    return Object.keys(this.languageMap);
  }
}

module.exports = new EnhancedJudge0Service();
