/**
 * CLI Tool for generating test cases for a specific problem
 * Usage: node backend/scripts/generateTestCases.js <problemId>
 */

const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const TestCaseGenerator = require('../services/testCaseGenerator');
require('dotenv').config({ path: './backend/.env' });

/**
 * Problem-specific test case generators
 */
class TwoSumGenerator extends TestCaseGenerator {
  generateMinimumInput() {
    return "2\n2 7\n9";
  }

  generateMaximumInput() {
    const n = 100000;
    const arr = Array(n).fill(0).map((_, i) => i);
    const target = arr[n-1] + arr[n-2];
    return `${n}\n${arr.join(' ')}\n${target}`;
  }

  generateEmptyCase() {
    return "2\n1 2\n3";
  }

  generateGreedyKiller() {
    // Case where multiple pairs exist
    return "4\n1 2 3 4\n5";
  }

  generateOverflowTest() {
    return "2\n1000000000 1000000000\n2000000000";
  }

  computeExpectedOutput(input) {
    // Parse input and compute expected output
    const lines = input.trim().split('\n');
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    const target = parseInt(lines[2]);

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (nums[i] + nums[j] === target) {
          return `${i} ${j}`;
        }
      }
    }
    return "-1 -1";
  }
}

class ArraySearchGenerator extends TestCaseGenerator {
  generateMinimumInput() {
    return "1\n5\n5";
  }

  generateMaximumInput() {
    const n = 100000;
    const arr = Array(n).fill(0).map((_, i) => i * 2);
    return `${n}\n${arr.join(' ')}\n${arr[n-1]}`;
  }

  generateOffByOneTest() {
    return "5\n1 3 5 6\n5";
  }

  generatePatternBreaker() {
    // Binary search killer
    return "10\n1 2 3 4 5 6 7 8 9 10\n11";
  }

  computeExpectedOutput(input) {
    const lines = input.trim().split('\n');
    const n = parseInt(lines[0]);
    const nums = lines[1].split(' ').map(Number);
    const target = parseInt(lines[2]);

    const idx = nums.indexOf(target);
    if (idx !== -1) return idx.toString();
    
    // Find insertion position
    for (let i = 0; i < n; i++) {
      if (nums[i] > target) return i.toString();
    }
    return n.toString();
  }
}

/**
 * Generate test cases for a problem
 */
async function generateTestCases(problemId) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.error('Problem not found');
      return;
    }

    console.log(`\nGenerating test cases for: ${problem.title}\n`);
    console.log('='.repeat(80));

    // Select appropriate generator based on problem type
    let generator;
    if (problem.title.toLowerCase().includes('two sum')) {
      generator = new TwoSumGenerator(problem);
    } else if (problem.title.toLowerCase().includes('search')) {
      generator = new ArraySearchGenerator(problem);
    } else {
      generator = new TestCaseGenerator(problem);
    }

    // Generate all test cases
    const testCases = generator.generateAll();

    // Format and display
    console.log("\n📋 LAYER 2: EDGE & CORNER CASES");
    console.log("=".repeat(80));
    testCases.layer2_edge.forEach((tc, idx) => {
      console.log(`\n✓ Test Case ${idx + 1}: ${tc.name}`);
      console.log(`  Input:\n${tc.input}`);
      if (generator.computeExpectedOutput) {
        console.log(`  Expected Output: ${generator.computeExpectedOutput(tc.input)}`);
      }
      console.log(`  Justification: ${tc.justification}`);
    });

    console.log("\n\n📊 LAYER 3: MEDIUM & LARGE STRESS TESTS");
    console.log("=".repeat(80));
    testCases.layer3_stress.forEach((tc, idx) => {
      console.log(`\n✓ Test Case ${idx + 1}: ${tc.name}`);
      const inputStr = tc.input.toString();
      console.log(`  Input: ${inputStr.length > 200 ? inputStr.substring(0, 200) + '...' : inputStr}`);
      console.log(`  Justification: ${tc.justification}`);
    });

    console.log("\n\n⚔️  LAYER 4: ADVERSARIAL ATTACKS");
    console.log("=".repeat(80));
    testCases.layer4_adversarial.forEach((tc, idx) => {
      console.log(`\n✓ Test Case ${idx + 1}: ${tc.name}`);
      const inputStr = tc.input.toString();
      console.log(`  Input: ${inputStr.length > 200 ? inputStr.substring(0, 200) + '...' : inputStr}`);
      console.log(`  Justification: ${tc.justification}`);
    });

    console.log("\n" + "=".repeat(80));
    console.log(`\n✅ Generated ${testCases.layer2_edge.length + testCases.layer3_stress.length + testCases.layer4_adversarial.length} test cases total\n`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  const problemId = process.argv[2];
  if (!problemId) {
    console.log('Usage: node generateTestCases.js <problemId>');
    process.exit(1);
  }
  generateTestCases(problemId);
}

module.exports = { TwoSumGenerator, ArraySearchGenerator };
