const axios = require('axios');

class BatchJudge0Service {
  constructor() {
    this.apiUrl = process.env.JUDGE0_API_URL || 'http://localhost:2358';
    this.apiHost = process.env.JUDGE0_HOST || 'localhost';
    this.apiKey = process.env.JUDGE0_API_KEY;
    this.batchSize = 20; // Process 20 test cases at a time (increased for better performance)
    
    this.languageMap = {
      javascript: 63,
      python: 71,
      java: 62,
      cpp: 54,
      c: 50
    };
    
    console.log(`🚀 Batch Judge0 Service initialized`);
    console.log(`   Batch size: ${this.batchSize} parallel submissions`);
  }

  // Submit multiple test cases in parallel batches
  async executeWithTestCases(code, language, testCases, timeLimit = 2, memoryLimit = 256, problemTitle = '', problem = null) {
    console.log(`🧪 Batch execution: ${testCases.length} test cases in batches of ${this.batchSize}`);
    
    const languageId = this.languageMap[language];
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const allResults = [];
    const totalBatches = Math.ceil(testCases.length / this.batchSize);
    
    // Process test cases in batches
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * this.batchSize;
      const end = Math.min(start + this.batchSize, testCases.length);
      const batch = testCases.slice(start, end);
      
      console.log(`📦 Processing batch ${batchIndex + 1}/${totalBatches} (tests ${start + 1}-${end})`);
      
      const batchStartTime = Date.now();
      
      // Submit all test cases in this batch simultaneously
      const submissionPromises = batch.map(async (testCase, index) => {
        const testIndex = start + index;
        const input = testCase.input || '';
        const expectedOutput = testCase.expectedOutput || testCase.output || '';
        
        try {
          const result = await this.submitSingleTest(code, languageId, input, expectedOutput);
          
          const actualOutput = (result.stdout || '').trim();
          const isCorrect = this.validateOutput(actualOutput, expectedOutput);
          
          let status = 'passed';
          if (result.status?.id === 6) {
            status = 'compile_error';
          } else if (result.status?.id >= 7 && result.status?.id <= 12) {
            status = 'runtime_error';
          } else if (result.status?.id === 5) {
            status = 'tle';
          } else if (result.status?.id === 14) {
            status = 'mle';
          } else if (!isCorrect) {
            status = 'failed';
          }
          
          return {
            testCaseIndex: testIndex,
            input: input.trim(),
            expectedOutput: expectedOutput.trim(),
            actualOutput: actualOutput,
            status: status,
            executionTime: result.time ? parseFloat(result.time) * 1000 : null,
            memoryUsage: result.memory ? Math.round(result.memory / 1024) : null,
            errorMessage: result.stderr || result.compile_output || (!isCorrect ? 'Output does not match' : null),
            points: isCorrect ? (testCase.points || 10) : 0
          };
        } catch (error) {
          console.error(`❌ Test ${testIndex + 1} failed:`, error.message);
          return {
            testCaseIndex: testIndex,
            input: input.trim(),
            expectedOutput: expectedOutput.trim(),
            actualOutput: '',
            status: 'runtime_error',
            executionTime: null,
            memoryUsage: null,
            errorMessage: error.message,
            points: 0
          };
        }
      });
      
      // Wait for all submissions in this batch to complete
      const batchResults = await Promise.all(submissionPromises);
      allResults.push(...batchResults);
      
      // Check for first failure and stop execution
      const firstFailure = batchResults.find(r => r.status !== 'passed');
      if (firstFailure) {
        const failedIndex = firstFailure.testCaseIndex + 1;
        console.log(`\n❌ EXECUTION STOPPED: Test case ${failedIndex} failed`);
        console.log(`   Status: ${firstFailure.status}`);
        console.log(`   Input: ${firstFailure.input.substring(0, 100)}${firstFailure.input.length > 100 ? '...' : ''}`);
        console.log(`   Expected: ${firstFailure.expectedOutput.substring(0, 100)}${firstFailure.expectedOutput.length > 100 ? '...' : ''}`);
        console.log(`   Got: ${firstFailure.actualOutput.substring(0, 100)}${firstFailure.actualOutput.length > 100 ? '...' : ''}`);
        if (firstFailure.errorMessage) {
          console.log(`   Error: ${firstFailure.errorMessage.substring(0, 200)}`);
        }
        
        // Return early with partial results
        const passedTests = allResults.filter(r => r.status === 'passed').length;
        console.log(`\n⚠️  Stopped after ${allResults.length} tests: ${passedTests} passed, ${allResults.length - passedTests} failed`);
        return allResults;
      }
      
      const batchTime = Date.now() - batchStartTime;
      const avgTime = batchTime / batch.length;
      console.log(`   ✅ Batch completed in ${batchTime}ms (avg ${avgTime.toFixed(0)}ms per test)`);
    }
    
    const passedTests = allResults.filter(r => r.status === 'passed').length;
    console.log(`\n📊 All batches complete: ${passedTests}/${allResults.length} passed`);
    
    return allResults;
  }

  // Submit a single test case with synchronous wait
  async submitSingleTest(code, languageId, input, expectedOutput) {
    const submissionData = {
      source_code: Buffer.from(code).toString('base64'),
      language_id: languageId,
      stdin: Buffer.from(input).toString('base64'),
      expected_output: expectedOutput ? Buffer.from(expectedOutput).toString('base64') : undefined
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    // Add API key headers if using remote Judge0
    if (this.apiKey && this.apiUrl.includes('rapidapi')) {
      headers['x-rapidapi-key'] = this.apiKey;
      headers['x-rapidapi-host'] = this.apiHost;
    }

    const response = await axios.post(`${this.apiUrl}/submissions`, submissionData, {
      params: {
        base64_encoded: 'true',
        wait: 'true'  // Synchronous mode - no polling needed
      },
      headers,
      timeout: 30000
    });

    // Decode base64 responses
    const result = response.data;
    if (result.stdout) result.stdout = Buffer.from(result.stdout, 'base64').toString();
    if (result.stderr) result.stderr = Buffer.from(result.stderr, 'base64').toString();
    if (result.compile_output) result.compile_output = Buffer.from(result.compile_output, 'base64').toString();

    return result;
  }

  // Validate output (same logic as enhancedJudge0Service)
  validateOutput(actual, expected) {
    if (!actual && !expected) return true;
    if (!actual || !expected) return false;

    const normalizedActual = actual.toString().trim().replace(/\s+/g, ' ').replace(/\r/g, '');
    const normalizedExpected = expected.toString().trim().replace(/\s+/g, ' ').replace(/\r/g, '');

    return normalizedActual === normalizedExpected;
  }

  getSupportedLanguages() {
    return Object.keys(this.languageMap);
  }
}

module.exports = new BatchJudge0Service();
