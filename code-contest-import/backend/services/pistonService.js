const axios = require('axios');

class PistonService {
  constructor() {
    this.apiUrl = 'https://emkc.org/api/v2/piston';
    
    // Piston language mappings
    this.languageMap = {
      javascript: { language: 'javascript', version: '18.15.0' },
      python: { language: 'python', version: '3.10.0' },
      java: { language: 'java', version: '15.0.2' },
      cpp: { language: 'c++', version: '10.2.0' },
      c: { language: 'c', version: '10.2.0' }
    };
    
    console.log(`🚀 Piston Service initialized (Free & Unlimited)`);
    console.log(`   API URL: ${this.apiUrl}`);
  }

  async executeCode(code, language, stdin = '') {
    try {
      const langConfig = this.languageMap[language];
      
      if (!langConfig) {
        throw new Error(`Unsupported language: ${language}`);
      }

      // Check input size limit (Piston API has ~500KB limit)
      const MAX_INPUT_SIZE = 400000; // 400KB to be safe
      if (stdin.length > MAX_INPUT_SIZE) {
        throw new Error(`Input size (${stdin.length} bytes) exceeds maximum allowed (${MAX_INPUT_SIZE} bytes). Please use smaller test cases.`);
      }

      console.log(`🔄 Piston Execute: ${language}`);
      console.log(`   Code length: ${code.length}, Input length: ${stdin.length}`);

      // Adjust timeout based on input size
      // For large inputs (>1000 bytes), use longer timeout
      const runTimeout = stdin.length > 1000 ? 10000 : 3000;
      
      console.log(`   Timeout: ${runTimeout}ms (input size: ${stdin.length} bytes)`);

      const response = await axios.post(`${this.apiUrl}/execute`, {
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: this.getFileName(language),
            content: code
          }
        ],
        stdin: stdin,
        compile_timeout: 10000, // 10 seconds for compilation
        run_timeout: runTimeout, // Dynamic timeout based on input size
        compile_memory_limit: -1, // Unlimited (Piston doesn't enforce this well)
        run_memory_limit: -1      // Unlimited (Piston doesn't enforce this well)
      });

      const result = response.data;
      
      console.log(`   Status: ${result.run ? 'Success' : 'Failed'}`);
      
      return {
        stdout: result.run?.stdout || '',
        stderr: result.run?.stderr || result.compile?.stderr || '',
        exitCode: result.run?.code || 0,
        executionTime: result.run?.time || 0,
        memory: result.run?.memory || 0
      };

    } catch (error) {
      console.error('❌ Piston execution error:', error.message);
      throw error;
    }
  }

  getFileName(language) {
    const fileNames = {
      javascript: 'script.js',
      python: 'script.py',
      java: 'Main.java',  // Piston requires Main.java with public class Main
      cpp: 'main.cpp',
      c: 'main.c'
    };
    
    return fileNames[language] || 'script.txt';
  }

  async executeWithTestCases(code, language, testCases, timeLimit = 2000, memoryLimit = 256, problemTitle = '', problem = null) {
    try {
      const results = [];
      
      console.log(`🧪 Piston execution against ${testCases.length} test cases`);
      console.log(`   Problem: ${problemTitle}`);
      console.log(`   Language: ${language}`);
      console.log(`   ✅ CODEFORCES-STYLE: Using user code directly (no wrappers)`);
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        try {
          const expectedOutput = testCase.expectedOutput || testCase.output || '';
          const inputValue = testCase.input || '';
          
          console.log(`\n📝 Test Case ${i + 1}:`);
          console.log(`   Input: "${inputValue}"`);
          console.log(`   Expected: "${expectedOutput}"`);
          
          // Execute user's code directly with stdin
          const result = await this.executeCode(code, language, inputValue);
          
          const actualOutput = (result.stdout || '').trim();
          
          console.log(`   Actual: "${actualOutput}"`);
          
          // Simple string comparison (can be enhanced for floating point tolerance)
          const isCorrect = this.compareOutputs(actualOutput, expectedOutput);
          
          const testResult = {
            testCaseIndex: i,
            input: inputValue.trim(),
            expectedOutput: expectedOutput.trim(),
            actualOutput: actualOutput,
            status: isCorrect ? 'passed' : 'failed',
            executionTime: result.executionTime,
            memoryUsage: result.memory,
            errorMessage: result.stderr || (!isCorrect ? 'Output does not match expected result' : null),
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
      console.error('❌ Piston test case execution error:', error);
      throw error;
    }
  }

  compareOutputs(actual, expected) {
    // Normalize whitespace
    const normalizeOutput = (str) => {
      return str.trim().replace(/\s+/g, ' ');
    };

    const normalizedActual = normalizeOutput(actual);
    const normalizedExpected = normalizeOutput(expected);

    // Exact match
    if (normalizedActual === normalizedExpected) {
      return true;
    }

    // Try parsing as numbers for floating point comparison
    const actualNum = parseFloat(normalizedActual);
    const expectedNum = parseFloat(normalizedExpected);
    
    if (!isNaN(actualNum) && !isNaN(expectedNum)) {
      // Use relative tolerance for large numbers, absolute for small
      const tolerance = Math.max(Math.abs(expectedNum) * 1e-5, 1e-5);
      return Math.abs(actualNum - expectedNum) <= tolerance;
    }

    return false;
  }
}

module.exports = new PistonService();
