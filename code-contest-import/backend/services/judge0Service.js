const axios = require('axios');

class Judge0Service {
  constructor() {
    this.baseURL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.apiKey = process.env.JUDGE0_API_KEY;
    this.languageMap = {
      'python': 71,    // Python 3.8.1
      'javascript': 63, // JavaScript (Node.js 12.14.0)
      'java': 62,      // Java (OpenJDK 13.0.1)
      'cpp': 54,       // C++ (GCC 9.2.0)
      'c': 50,         // C (GCC 9.2.0)
      'go': 60,        // Go (1.13.5)
      'rust': 73       // Rust (1.40.0)
    };
  }

  // Submit code for execution
  async submitCode(code, language, input = '', expectedOutput = '') {
    try {
      const languageId = this.languageMap[language];
      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // If in development/testing mode without real Judge0 API
      if (!this.apiKey || this.apiKey === 'mock-judge0-key') {
        return this.mockSubmission(code, language, input, expectedOutput);
      }

      const submissionData = {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(input).toString('base64'),
        expected_output: expectedOutput ? Buffer.from(expectedOutput).toString('base64') : undefined
      };

      const response = await axios.post(`${this.baseURL}/submissions`, submissionData, {
        params: {
          base64_encoded: 'true',
          wait: 'false'
        },
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Judge0 submission error:', error);
      throw new Error('Code execution failed');
    }
  }

  // Get submission result
  async getSubmissionResult(token) {
    try {
      // If in development/testing mode
      if (!this.apiKey || this.apiKey === 'mock-judge0-key') {
        return this.mockResult(token);
      }

      const response = await axios.get(`${this.baseURL}/submissions/${token}`, {
        params: {
          base64_encoded: 'true',
          fields: '*'
        },
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com'
        }
      });

      const result = response.data;

      // Decode base64 encoded fields
      if (result.stdout) result.stdout = Buffer.from(result.stdout, 'base64').toString();
      if (result.stderr) result.stderr = Buffer.from(result.stderr, 'base64').toString();
      if (result.compile_output) result.compile_output = Buffer.from(result.compile_output, 'base64').toString();

      return result;
    } catch (error) {
      console.error('Judge0 get result error:', error);
      throw new Error('Failed to get execution result');
    }
  }

  // Mock submission for development/testing
  mockSubmission(code, language, input, expectedOutput) {
    const token = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { token };
  }

  // Mock result for development/testing
  mockResult(token) {
    // Simulate different outcomes based on random chance
    const random = Math.random();
    const executionTime = Math.floor(Math.random() * 100) + 10; // 10-110ms
    const memory = Math.floor(Math.random() * 50000) + 30000; // 30-80MB

    if (random > 0.8) {
      // Runtime error
      return {
        status: { id: 5, description: 'Time Limit Exceeded' },
        time: '2.000',
        memory: memory,
        stdout: null,
        stderr: null,
        compile_output: null,
        token
      };
    } else if (random > 0.7) {
      // Wrong answer
      return {
        status: { id: 4, description: 'Wrong Answer' },
        time: (executionTime / 1000).toFixed(3),
        memory: memory,
        stdout: 'incorrect output',
        stderr: null,
        compile_output: null,
        token
      };
    } else if (random > 0.6) {
      // Runtime error
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
      // Accepted
      return {
        status: { id: 3, description: 'Accepted' },
        time: (executionTime / 1000).toFixed(3),
        memory: memory,
        stdout: 'expected output',
        stderr: null,
        compile_output: null,
        token
      };
    }
  }

  // Execute code against multiple test cases
  async executeWithTestCases(code, language, testCases, timeLimit = 2, memoryLimit = 128) {
    try {
      const results = [];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        try {
          const submission = await this.submitCode(
            code, 
            language, 
            testCase.input, 
            testCase.expectedOutput
          );

          // Poll for result with timeout
          const result = await this.pollForResult(submission.token, 30000); // 30 second timeout
          
          const testResult = {
            testCaseIndex: i,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: result.stdout || '',
            status: this.mapStatusToInternal(result.status),
            executionTime: result.time ? parseFloat(result.time) * 1000 : null,
            memoryUsage: result.memory ? Math.round(result.memory / 1024) : null,
            errorMessage: result.stderr || result.compile_output || null,
            points: testCase.points || 10
          };

          // Check if output matches expected (for correct answer verification)
          if (testResult.status === 'passed' && testResult.actualOutput.trim() !== testCase.expectedOutput.trim()) {
            testResult.status = 'failed';
            testResult.errorMessage = 'Output does not match expected result';
          }

          results.push(testResult);

          // Continue with all test cases to get complete feedback
          
        } catch (testError) {
          console.error(`Test case ${i} execution error:`, testError);
          results.push({
            testCaseIndex: i,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            status: 'runtime_error',
            executionTime: null,
            memoryUsage: null,
            errorMessage: testError.message || 'Execution failed',
            points: 0
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Test case execution error:', error);
      throw error;
    }
  }

  // Poll for submission result with timeout
  async pollForResult(token, timeout = 30000) {
    const startTime = Date.now();
    const pollInterval = 1000; // Poll every second
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await this.getSubmissionResult(token);
        
        // Check if processing is complete
        if (result.status && result.status.id !== 1 && result.status.id !== 2) {
          return result;
        }
        
        // Wait before next poll
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

    return statusMap[status.id] || 'failed';
  }

  // Get supported languages
  getSupportedLanguages() {
    return Object.keys(this.languageMap);
  }
}

module.exports = new Judge0Service();