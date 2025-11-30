/**
 * LLM-Powered Test Case Generation and Validation Service
 * Uses OpenAI/Anthropic/Gemini to intelligently generate and validate test cases
 */

class LLMTestCaseService {
  constructor(apiKey, provider = 'openai') {
    this.apiKey = apiKey || process.env.LLM_API_KEY;
    this.provider = provider; // 'openai', 'anthropic', 'gemini'
    this.baseURL = this.getBaseURL();
  }

  getBaseURL() {
    switch (this.provider) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'anthropic':
        return 'https://api.anthropic.com/v1';
      case 'gemini':
        return 'https://generativelanguage.googleapis.com/v1';
      default:
        return 'https://api.openai.com/v1';
    }
  }

  /**
   * Generate test cases using LLM
   */
  async generateTestCases(problem) {
    const prompt = this.buildGenerationPrompt(problem);

    try {
      const response = await this.callLLM(prompt);
      const testCases = this.parseTestCasesFromResponse(response);

      return {
        success: true,
        testCases,
        metadata: {
          generatedBy: 'llm',
          provider: this.provider,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('LLM test case generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate existing test cases using LLM
   */
  async validateTestCases(problem, testCases) {
    const prompt = this.buildValidationPrompt(problem, testCases);

    try {
      const response = await this.callLLM(prompt);
      const validation = this.parseValidationResponse(response);

      return {
        success: true,
        isValid: validation.isValid,
        issues: validation.issues,
        suggestions: validation.suggestions,
        correctedTestCases: validation.correctedTestCases
      };
    } catch (error) {
      console.error('LLM test case validation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate reference solution using LLM
   */
  async generateReferenceSolution(problem, language = 'python') {
    const prompt = this.buildSolutionPrompt(problem, language);

    try {
      const response = await this.callLLM(prompt);
      const solution = this.parseSolutionFromResponse(response, language);

      return {
        success: true,
        solution,
        language
      };
    } catch (error) {
      console.error('LLM solution generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Auto-fix test cases by running reference solution
   */
  async autoFixTestCases(problem, testCases) {
    // Step 1: Generate reference solution
    const solutionResult = await this.generateReferenceSolution(problem);

    if (!solutionResult.success) {
      return { success: false, error: 'Failed to generate reference solution' };
    }

    // Step 2: Run reference solution against each test case
    const pistonService = require('./pistonService');
    const fixedTestCases = [];

    for (const testCase of testCases) {
      try {
        const result = await pistonService.executeCode(
          solutionResult.solution,
          solutionResult.language,
          testCase.input
        );

        if (result.run && result.run.output) {
          fixedTestCases.push({
            ...testCase,
            expectedOutput: result.run.output.trim(),
            fixedBy: 'llm-reference-solution'
          });
        } else {
          fixedTestCases.push(testCase); // Keep original if execution failed
        }
      } catch (error) {
        console.error(`Failed to fix test case: ${error.message}`);
        fixedTestCases.push(testCase);
      }
    }

    return {
      success: true,
      fixedTestCases,
      referenceSolution: solutionResult.solution
    };
  }

  /**
   * Build prompt for test case generation
   */
  buildGenerationPrompt(problem) {
    return `You are an expert competitive programming judge. Generate EXACTLY 5 test cases for the following problem.

**Problem Title:** ${problem.title}

**Problem Description:**
${problem.description}

**Input Format:**
${problem.inputFormat || 'Not specified'}

**Output Format:**
${problem.outputFormat || 'Not specified'}

**Constraints:**
${problem.constraints || 'Not specified'}

**Sample Input:**
${problem.sampleInput || 'Not provided'}

**Sample Output:**
${problem.sampleOutput || 'Not provided'}

Generate EXACTLY 5 test cases covering:
1. **Edge Case**: Minimum constraint (e.g., n=1, empty array)
2. **Normal Case**: Typical input
3. **Normal Case**: Another typical input
4. **Large Case**: Near maximum constraint
5. **Corner Case**: Special pattern

Return EXACTLY 5 test cases in this JSON format:
\`\`\`json
{
  "testCases": [
    {
      "name": "Test case name",
      "input": "actual input string",
      "expectedOutput": "expected output string",
      "category": "edge|normal|stress|corner|adversarial",
      "justification": "Why this test case is important"
    }
  ]
}
\`\`\`

CRITICAL RULES: 
- Generate EXACTLY 5 test cases, no more, no less
- Match the EXACT input/output format from the sample
- Ensure all test cases are valid according to constraints
- Keep test cases SIMPLE and CORRECT
- DO NOT generate overly complex or large test cases
- Return ONLY valid JSON, no explanations`;
  }

  /**
   * Build prompt for test case validation
   */
  buildValidationPrompt(problem, testCases) {
    return `You are an expert competitive programming judge. Validate the following test cases for correctness.

**Problem Title:** ${problem.title}

**Problem Description:**
${problem.description}

**Input Format:** ${problem.inputFormat || 'Not specified'}
**Output Format:** ${problem.outputFormat || 'Not specified'}
**Constraints:** ${problem.constraints || 'Not specified'}

**Test Cases to Validate:**
${JSON.stringify(testCases, null, 2)}

Analyze each test case and check:
1. Does the input follow the correct format?
2. Does the input satisfy all constraints?
3. Is the expected output correct for the given input?
4. Are there any edge cases missing?

Return validation results in JSON format:
\`\`\`json
{
  "isValid": true/false,
  "issues": [
    {
      "testCaseIndex": 0,
      "issue": "Description of the problem",
      "severity": "error|warning"
    }
  ],
  "suggestions": [
    "Suggestion for improvement"
  ],
  "correctedTestCases": [
    {
      "index": 0,
      "correctedInput": "...",
      "correctedOutput": "...",
      "reason": "Why it was corrected"
    }
  ]
}
\`\`\``;
  }

  /**
   * Build prompt for reference solution generation
   */
  buildSolutionPrompt(problem, language) {
    const languageTemplates = {
      python: 'Python 3 with standard input/output',
      cpp: 'C++ with iostream',
      java: 'Java with Scanner',
      javascript: 'Node.js with readline'
    };

    return `Generate a correct reference solution for this problem in ${languageTemplates[language]}.

**Problem Title:** ${problem.title}

**Problem Description:**
${problem.description}

**Input Format:** ${problem.inputFormat || 'Not specified'}
**Output Format:** ${problem.outputFormat || 'Not specified'}
**Constraints:** ${problem.constraints || 'Not specified'}

**Sample Input:**
${problem.sampleInput || 'Not provided'}

**Sample Output:**
${problem.sampleOutput || 'Not provided'}

Requirements:
1. Read input from stdin
2. Write output to stdout
3. Handle all edge cases
4. Follow the exact output format
5. Be efficient within constraints
6. Include NO explanatory comments, ONLY code

Return ONLY the code, no markdown, no explanations:`;
  }

  /**
   * Call LLM API (supports OpenAI, Ollama, Hugging Face)
   */
  async callLLM(prompt) {
    const fetch = require('node-fetch');

    // Ollama (Local - FREE)
    if (this.provider === 'ollama') {
      const ollamaURL = process.env.OLLAMA_URL || 'http://localhost:11434';
      const model = process.env.LLM_MODEL || 'codellama:7b';

      try {
        const response = await fetch(`${ollamaURL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model,
            prompt: this.formatPromptForOllama(prompt),
            stream: false,
            options: {
              temperature: 0.3,  // Lower temperature for more consistent output
              num_predict: 2000,  // Reduced from 4000 for faster generation
              top_k: 40,
              top_p: 0.9
            }
          }),
          timeout: 30000  // 30 second timeout
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ollama API call failed');
        }

        return data.response;
      } catch (error) {
        throw new Error(`Ollama error: ${error.message}. Make sure Ollama is running (ollama serve)`);
      }
    }

    // Hugging Face (Free tier)
    if (this.provider === 'huggingface') {
      const model = process.env.LLM_MODEL || 'codellama/CodeLlama-7b-hf';

      try {
        const response = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inputs: this.formatPromptForOllama(prompt),
              parameters: {
                max_new_tokens: 4000,
                temperature: 0.7,
                return_full_text: false
              }
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Hugging Face API call failed');
        }

        return data[0].generated_text;
      } catch (error) {
        throw new Error(`Hugging Face error: ${error.message}`);
      }
    }

    // OpenAI (Paid)
    if (this.provider === 'openai') {
      const model = process.env.LLM_MODEL || 'gpt-4-turbo-preview';

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert competitive programming judge and test case generator.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API call failed');
      }

      return data.choices[0].message.content;
    }

    throw new Error(`Provider ${this.provider} not supported. Use: ollama, huggingface, or openai`);
  }

  /**
   * Format prompt for Ollama/local models (more structured)
   */
  formatPromptForOllama(prompt) {
    return `<s>[INST] ${prompt}

CRITICAL: 
- Return ONLY valid JSON
- NO markdown code blocks
- NO explanations
- EXACTLY 5 test cases
- Keep it simple and correct

Example format:
{"testCases":[{"name":"Edge case","input":"1","expectedOutput":"2","category":"edge","justification":"Minimum input"}]}

Now generate the test cases: [/INST]`;
  }

  /**
   * Parse test cases from LLM response
   */
  parseTestCasesFromResponse(response) {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
      response.match(/```\n([\s\S]*?)\n```/);

    const jsonStr = jsonMatch ? jsonMatch[1] : response;

    try {
      const parsed = JSON.parse(jsonStr);
      return parsed.testCases || parsed;
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      throw new Error('Invalid JSON response from LLM');
    }
  }

  /**
   * Parse validation response from LLM
   */
  parseValidationResponse(response) {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
      response.match(/```\n([\s\S]*?)\n```/);

    const jsonStr = jsonMatch ? jsonMatch[1] : response;

    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse validation response:', error);
      return {
        isValid: false,
        issues: [{ issue: 'Failed to parse LLM response', severity: 'error' }],
        suggestions: [],
        correctedTestCases: []
      };
    }
  }

  /**
   * Parse solution from LLM response
   */
  parseSolutionFromResponse(response, language) {
    // Try to extract code from markdown blocks
    const codeMatch = response.match(/```(?:python|cpp|java|javascript)?\n([\s\S]*?)\n```/);

    if (codeMatch) {
      return codeMatch[1].trim();
    }

    // If no code block, return the whole response (LLM might have returned raw code)
    return response.trim();
  }
}

module.exports = LLMTestCaseService;
