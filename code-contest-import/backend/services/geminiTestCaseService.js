const axios = require('axios');

class GeminiTestCaseService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    
    if (!this.apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not set - test case generation will fail');
    } else {
      console.log('✅ Gemini Test Case Service initialized');
    }
  }

  async generateTestCases(problemTitle, problemDescription, inputFormat, outputFormat, constraints, numTestCases = 5) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = this.buildPrompt(problemTitle, problemDescription, inputFormat, outputFormat, constraints, numTestCases);
    
    // Retry logic for 503 errors (server overloaded)
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          const waitTime = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.log(`⏳ Retry attempt ${attempt}/${maxRetries} after ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        console.log(`🤖 Generating ${numTestCases} test cases with Gemini... (attempt ${attempt}/${maxRetries})`);
        
        const response = await axios.post(
          `${this.apiUrl}?key=${this.apiKey}`,
          {
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        const generatedText = response.data.candidates[0].content.parts[0].text;
        const testCases = this.parseTestCases(generatedText);
        
        console.log(`✅ Generated ${testCases.length} test cases successfully`);
        console.log(`📝 Test case summary:`);
        testCases.forEach((tc, i) => {
          const inputPreview = tc.input.substring(0, 50).replace(/\n/g, ' ');
          const outputPreview = tc.expectedOutput.substring(0, 30).replace(/\n/g, ' ');
          console.log(`   ${i + 1}. [${tc.difficulty}] Input: ${inputPreview}... → Output: ${outputPreview}...`);
        });
        
        return testCases;
        
      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        const errorCode = error.response?.data?.error?.code;
        
        // Only retry on 503 (overloaded) or 429 (rate limit)
        if (status === 503 || errorCode === 503 || status === 429) {
          console.warn(`⚠️  Gemini API temporarily unavailable (${status || errorCode})`);
          if (attempt < maxRetries) {
            continue; // Retry
          }
        }
        
        // For other errors, don't retry
        console.error('❌ Gemini API error:', error.response?.data || error.message);
        throw new Error(`Failed to generate test cases: ${error.message}`);
      }
    }
    
    // All retries failed
    console.error('❌ All retry attempts failed');
    throw new Error(`Failed to generate test cases after ${maxRetries} attempts: ${lastError.message}`);
  }

  buildPrompt(title, description, inputFormat, outputFormat, constraints, numTestCases) {
    return `You are an expert competitive programming test case generator with deep knowledge of algorithms and data structures. Your task is to generate ${numTestCases} UNIQUE, diverse, and CORRECT test cases.

**Problem Title:** ${title}

**Problem Description:**
${description}

**Input Format:**
${inputFormat}

**Output Format:**
${outputFormat}

**Constraints:**
${constraints}

**CRITICAL REQUIREMENTS FOR CORRECTNESS:**

1. **UNDERSTAND THE PROBLEM FIRST:**
   - Read the problem description carefully
   - Identify what the problem is asking for
   - Understand the algorithm or logic needed
   - Think through the solution before generating outputs

2. **CALCULATE OUTPUTS STEP-BY-STEP:**
   - For each input, manually trace through the algorithm
   - Show your work in the explanation
   - Double-check your calculations
   - Verify the output matches the expected format

3. **TEST CASE DIVERSITY (Generate EXACTLY ${numTestCases} cases):**
   - **Edge Cases (20%):** Minimum values, maximum values, empty inputs, single elements
   - **Normal Cases (50%):** Typical inputs with varying sizes and values
   - **Corner Cases (30%):** Boundary conditions, special patterns, tricky scenarios

4. **UNIQUENESS GUARANTEE:**
   - Each test case must have DIFFERENT input from all others
   - Vary input sizes: small (1-5), medium (10-50), large (100-1000)
   - Vary input values: negative, zero, positive, mixed
   - Avoid repeating the same pattern

5. **OUTPUT VERIFICATION:**
   - Manually verify each output is correct
   - Check for off-by-one errors
   - Ensure output format matches specification exactly
   - Test edge cases carefully (they often have tricky outputs)

**EXAMPLES OF GOOD TEST CASES:**

Example 1 - Edge Case:
- Input: Minimum possible input
- Output: Correctly calculated for minimum case
- Explanation: "Tests minimum boundary condition"

Example 2 - Normal Case:
- Input: Typical medium-sized input
- Output: Correctly calculated for normal case
- Explanation: "Tests standard scenario with moderate complexity"

Example 3 - Corner Case:
- Input: Boundary or special pattern
- Output: Correctly calculated for corner case
- Explanation: "Tests boundary condition where algorithm behavior changes"

**STEP-BY-STEP PROCESS:**

For each test case:
1. Choose input that fits the category (edge/normal/corner)
2. Manually solve the problem for that input
3. Write down the step-by-step solution
4. Verify the output is correct
5. Format input and output according to specifications
6. Write clear explanation of what this test case validates

**OUTPUT FORMAT (STRICT JSON):**

Return ONLY a JSON array with this exact structure:
\`\`\`json
[
  {
    "input": "exact input as specified in format",
    "output": "correct output as specified in format",
    "explanation": "what this test case validates and how you calculated the output",
    "difficulty": "easy|medium|hard"
  }
]
\`\`\`

**FINAL CHECKLIST BEFORE RETURNING:**

✓ Generated exactly ${numTestCases} test cases
✓ All inputs are unique and diverse
✓ All outputs are manually verified and correct
✓ Input/output formats match specifications exactly
✓ Explanations clearly describe what each test validates
✓ Mix of edge cases, normal cases, and corner cases
✓ No duplicates or similar test cases
✓ Used \\n for newlines where needed
✓ Returned ONLY the JSON array, no other text

**REMEMBER:** The most important thing is OUTPUT CORRECTNESS. Take your time to calculate each output carefully. A test case with wrong output is worse than no test case at all.`;
  }

  parseTestCases(generatedText) {
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = generatedText.trim();
      
      // Remove markdown code blocks
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON array
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      const testCases = JSON.parse(jsonMatch[0]);
      
      // Validate and format test cases
      const formattedTestCases = testCases.map((tc, index) => ({
        input: (tc.input || '').toString().trim(),
        expectedOutput: (tc.output || tc.expectedOutput || '').toString().trim(),
        explanation: tc.explanation || `Test case ${index + 1}`,
        difficulty: tc.difficulty || 'medium',
        isHidden: index >= 2, // First 2 visible, rest hidden
        points: this.calculatePoints(tc.difficulty)
      }));
      
      // Remove duplicates based on input
      const uniqueTestCases = this.removeDuplicates(formattedTestCases);
      
      if (uniqueTestCases.length < formattedTestCases.length) {
        console.warn(`⚠️  Removed ${formattedTestCases.length - uniqueTestCases.length} duplicate test cases`);
      }
      
      return uniqueTestCases;
      
    } catch (error) {
      console.error('❌ Failed to parse test cases:', error.message);
      console.error('Generated text:', generatedText);
      throw new Error('Failed to parse generated test cases');
    }
  }

  removeDuplicates(testCases) {
    const seen = new Set();
    const unique = [];
    
    for (const tc of testCases) {
      // Normalize input for comparison (remove extra whitespace)
      const normalizedInput = tc.input.replace(/\s+/g, ' ').trim();
      
      if (!seen.has(normalizedInput)) {
        seen.add(normalizedInput);
        unique.push(tc);
      } else {
        console.log(`🔄 Skipping duplicate test case: ${normalizedInput.substring(0, 50)}...`);
      }
    }
    
    return unique;
  }

  calculatePoints(difficulty) {
    const pointsMap = {
      'easy': 10,
      'medium': 15,
      'hard': 20
    };
    return pointsMap[difficulty] || 10;
  }

  // Validate test cases by running them through Judge0
  async validateTestCases(testCases, solutionCode, language) {
    console.log(`🔍 Validating ${testCases.length} test cases...`);
    
    const batchJudge0Service = require('./batchJudge0Service');
    
    try {
      const results = await batchJudge0Service.executeWithTestCases(
        solutionCode,
        language,
        testCases,
        2,
        256
      );
      
      const allPassed = results.every(r => r.status === 'passed');
      
      if (allPassed) {
        console.log('✅ All test cases validated successfully');
        return { valid: true, results };
      } else {
        const failed = results.filter(r => r.status !== 'passed');
        console.warn(`⚠️  ${failed.length} test cases failed validation`);
        return { valid: false, results, failedCases: failed };
      }
      
    } catch (error) {
      console.error('❌ Validation error:', error.message);
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new GeminiTestCaseService();
