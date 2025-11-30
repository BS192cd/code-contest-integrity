const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Problem = require('../models/Problem');

async function analyzeTestCases() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);

    const problemId = '68f6392963b05f16395454de';
    const problem = await Problem.findById(problemId);
    
    if (!problem) {
      console.log('Problem not found!');
      return;
    }

    console.log('=== ANALYZING EXISTING TEST CASES ===\n');
    console.log('Problem:', problem.title);
    console.log('Total test cases:', problem.testCases?.length || 0);
    
    if (!problem.testCases || problem.testCases.length === 0) {
      console.log('No test cases to analyze!');
      return;
    }

    // Analyze first 5 test cases to understand format
    console.log('\n=== FIRST 5 TEST CASES ===\n');
    
    const analysis = {
      inputFormat: null,
      outputFormat: null,
      minArraySize: Infinity,
      maxArraySize: 0,
      minValue: Infinity,
      maxValue: -Infinity,
      hasDuplicates: false
    };
    
    problem.testCases.slice(0, 5).forEach((tc, idx) => {
      console.log(`Test Case ${idx + 1}:`);
      console.log('Input:', tc.input);
      console.log('Expected Output:', tc.expectedOutput);
      console.log();
      
      // Parse input
      const inputLines = tc.input.split('\n');
      if (inputLines.length >= 2) {
        const n = parseInt(inputLines[0]);
        const nums = inputLines[1].split(' ').map(x => parseInt(x));
        
        analysis.minArraySize = Math.min(analysis.minArraySize, n);
        analysis.maxArraySize = Math.max(analysis.maxArraySize, n);
        analysis.minValue = Math.min(analysis.minValue, ...nums);
        analysis.maxValue = Math.max(analysis.maxValue, ...nums);
        
        // Check for duplicates
        const unique = new Set(nums);
        if (unique.size < nums.length) {
          analysis.hasDuplicates = true;
        }
      }
    });
    
    console.log('\n=== ANALYSIS RESULTS ===');
    console.log('Input Format: n on first line, space-separated integers on second line');
    console.log('Array Size Range:', analysis.minArraySize, 'to', analysis.maxArraySize);
    console.log('Value Range:', analysis.minValue, 'to', analysis.maxValue);
    console.log('Has Duplicates:', analysis.hasDuplicates);
    
    console.log('\n=== RECOMMENDED TEST CASE GENERATION ===');
    console.log('Format: n\\nelem1 elem2 elem3 ...');
    console.log('Array sizes: 1 to 100 (safe for Piston API)');
    console.log('Value range:', analysis.minValue, 'to', analysis.maxValue);
    console.log('Include: duplicates, sorted arrays, edge values');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

analyzeTestCases();
