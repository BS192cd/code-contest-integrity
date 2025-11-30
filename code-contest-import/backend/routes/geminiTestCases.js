const express = require('express');
const router = express.Router();
const geminiTestCaseService = require('../services/geminiTestCaseService');
const Problem = require('../models/Problem');

// Generate test cases using Gemini
router.post('/generate', async (req, res) => {
  try {
    const {
      problemTitle,
      problemDescription,
      inputFormat,
      outputFormat,
      constraints,
      numTestCases = 5,
      problemId
    } = req.body;

    // Validate required fields
    if (!problemTitle || !problemDescription || !inputFormat || !outputFormat) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: problemTitle, problemDescription, inputFormat, outputFormat'
      });
    }

    // Generate test cases
    const testCases = await geminiTestCaseService.generateTestCases(
      problemTitle,
      problemDescription,
      inputFormat,
      outputFormat,
      constraints || 'Standard constraints',
      parseInt(numTestCases)
    );

    // If problemId provided, optionally save to database
    if (problemId) {
      const problem = await Problem.findById(problemId);
      if (problem) {
        // Add generated test cases to existing ones
        problem.testCases = [...(problem.testCases || []), ...testCases];
        await problem.save();
        
        return res.json({
          success: true,
          message: `Generated and saved ${testCases.length} test cases`,
          testCases,
          totalTestCases: problem.testCases.length
        });
      }
    }

    res.json({
      success: true,
      message: `Generated ${testCases.length} test cases`,
      testCases
    });

  } catch (error) {
    console.error('Test case generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate test cases'
    });
  }
});

// Validate generated test cases with a solution
router.post('/validate', async (req, res) => {
  try {
    const { testCases, solutionCode, language } = req.body;

    if (!testCases || !solutionCode || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: testCases, solutionCode, language'
      });
    }

    const validation = await geminiTestCaseService.validateTestCases(
      testCases,
      solutionCode,
      language
    );

    res.json({
      success: true,
      validation
    });

  } catch (error) {
    console.error('Test case validation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate test cases'
    });
  }
});

module.exports = router;
