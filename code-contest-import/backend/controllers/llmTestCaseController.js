/**
 * Controller for LLM-powered test case operations
 */

const LLMTestCaseService = require('../services/llmTestCaseService');
const Problem = require('../models/Problem');

// Initialize LLM service
const llmService = new LLMTestCaseService(
  process.env.LLM_API_KEY,
  process.env.LLM_PROVIDER || 'openai'
);

/**
 * Generate test cases using LLM
 * POST /api/llm/generate-test-cases
 */
exports.generateTestCases = async (req, res) => {
  try {
    const { problemId, problemData } = req.body;

    let problem;
    if (problemId) {
      problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
    } else if (problemData) {
      problem = problemData;
    } else {
      return res.status(400).json({ error: 'Either problemId or problemData required' });
    }

    console.log(`Generating test cases for: ${problem.title}`);
    const result = await llmService.generateTestCases(problem);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      testCases: result.testCases,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error generating test cases:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Validate test cases using LLM
 * POST /api/llm/validate-test-cases
 */
exports.validateTestCases = async (req, res) => {
  try {
    const { problemId, testCases, problemData } = req.body;

    let problem;
    if (problemId) {
      problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
    } else if (problemData) {
      problem = problemData;
    } else {
      return res.status(400).json({ error: 'Either problemId or problemData required' });
    }

    if (!testCases || !Array.isArray(testCases)) {
      return res.status(400).json({ error: 'Test cases array required' });
    }

    console.log(`Validating ${testCases.length} test cases for: ${problem.title}`);
    const result = await llmService.validateTestCases(problem, testCases);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      isValid: result.isValid,
      issues: result.issues,
      suggestions: result.suggestions,
      correctedTestCases: result.correctedTestCases
    });
  } catch (error) {
    console.error('Error validating test cases:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate reference solution using LLM
 * POST /api/llm/generate-solution
 */
exports.generateSolution = async (req, res) => {
  try {
    const { problemId, language, problemData } = req.body;

    let problem;
    if (problemId) {
      problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
    } else if (problemData) {
      problem = problemData;
    } else {
      return res.status(400).json({ error: 'Either problemId or problemData required' });
    }

    const lang = language || 'python';
    console.log(`Generating ${lang} solution for: ${problem.title}`);
    
    const result = await llmService.generateReferenceSolution(problem, lang);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      solution: result.solution,
      language: result.language
    });
  } catch (error) {
    console.error('Error generating solution:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Auto-fix test cases using reference solution
 * POST /api/llm/auto-fix-test-cases
 */
exports.autoFixTestCases = async (req, res) => {
  try {
    const { problemId, testCases, problemData } = req.body;

    let problem;
    if (problemId) {
      problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
    } else if (problemData) {
      problem = problemData;
    } else {
      return res.status(400).json({ error: 'Either problemId or problemData required' });
    }

    if (!testCases || !Array.isArray(testCases)) {
      return res.status(400).json({ error: 'Test cases array required' });
    }

    console.log(`Auto-fixing ${testCases.length} test cases for: ${problem.title}`);
    const result = await llmService.autoFixTestCases(problem, testCases);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      fixedTestCases: result.fixedTestCases,
      referenceSolution: result.referenceSolution
    });
  } catch (error) {
    console.error('Error auto-fixing test cases:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Complete workflow: Generate, validate, and save test cases
 * POST /api/llm/complete-workflow
 */
exports.completeWorkflow = async (req, res) => {
  try {
    const { problemId } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    console.log(`Running complete LLM workflow for: ${problem.title}`);

    // Step 1: Generate test cases
    console.log('Step 1: Generating test cases...');
    const generateResult = await llmService.generateTestCases(problem);
    if (!generateResult.success) {
      return res.status(500).json({ 
        error: 'Test case generation failed',
        details: generateResult.error 
      });
    }

    // Step 2: Validate generated test cases
    console.log('Step 2: Validating test cases...');
    const validateResult = await llmService.validateTestCases(
      problem, 
      generateResult.testCases
    );

    // Step 3: Auto-fix if needed
    let finalTestCases = generateResult.testCases;
    if (!validateResult.isValid && validateResult.correctedTestCases.length > 0) {
      console.log('Step 3: Auto-fixing test cases...');
      const fixResult = await llmService.autoFixTestCases(problem, generateResult.testCases);
      if (fixResult.success) {
        finalTestCases = fixResult.fixedTestCases;
      }
    }

    // Step 4: Save to database
    console.log('Step 4: Saving test cases to database...');
    problem.testCases = finalTestCases.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: tc.category !== 'edge', // Show edge cases, hide others
      points: tc.category === 'adversarial' ? 2 : 1
    }));

    await problem.save();

    res.json({
      success: true,
      message: 'Test cases generated, validated, and saved successfully',
      testCasesCount: finalTestCases.length,
      validation: {
        isValid: validateResult.isValid,
        issues: validateResult.issues,
        suggestions: validateResult.suggestions
      }
    });
  } catch (error) {
    console.error('Error in complete workflow:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
