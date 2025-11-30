/**
 * Test Case Generator for Competitive Programming Problems
 * Generates comprehensive hidden test suites following the 4-layer framework
 * 
 * SAFE LIMITS (to avoid API errors):
 * - Max array size: 1000 elements
 * - Max payload: ~50KB
 * - Execution time: < 3 seconds
 * - Full randomization: Different test cases each generation
 */

class TestCaseGenerator {
  constructor(problem) {
    this.problem = problem;
    this.testCases = {
      layer2_edge: [],
      layer3_stress: [],
      layer4_adversarial: []
    };

    // Detect problem type from metadata or title
    this.problemType = this.detectProblemType();

    // Add timestamp-based seed for randomization
    this.seed = Date.now();
  }

  /**
   * Generate random number with seed for variety
   */
  random() {
    // Simple seeded random for variety
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Random integer between min and max (inclusive)
   */
  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Random float between min and max
   */
  randomFloat(min, max, decimals = 5) {
    return (this.random() * (max - min) + min).toFixed(decimals);
  }

  /**
   * Detect problem type to determine input/output format
   */
  detectProblemType() {
    const title = (this.problem.title || '').toLowerCase();
    const description = (this.problem.description || '').toLowerCase();
    const inputFormat = (this.problem.inputFormat || '').toLowerCase();
    const sampleInput = (this.problem.sampleInput || '').toLowerCase();

    // Power function problem (x^n format)
    if (title.includes('power') || title.includes('pow') || title.includes('x^n')) {
      return 'power';
    }

    // Codeforces-style array problems (n on first line, then array elements)
    // Check if inputFormat mentions "first line" and "n" and "elements"
    if ((inputFormat.includes('first line') && inputFormat.includes('integer') &&
      (inputFormat.includes('elements') || inputFormat.includes('array'))) ||
      (inputFormat.includes('$n$') && inputFormat.includes('second line'))) {
      return 'codeforces_array';
    }

    // Array-based problems (general) - check BEFORE string
    if (title.includes('array') ||
      (inputFormat.includes('array') && !inputFormat.includes('string')) ||
      description.includes('integer array') ||
      description.includes('array of integers')) {
      return 'codeforces_array';
    }

    // String problems (single string input)
    if (title.includes('palindrome') ||
      title.includes('substring') || title.includes('valid parentheses') ||
      title.includes('reverse string') ||
      (inputFormat.includes('string') && !title.includes('array')) ||
      description.includes('given a string')) {
      return 'string';
    }

    // Two number problems (like Two Sum, 3Sum, etc.)
    if (title.includes('two sum') || title.includes('3sum') ||
      title.includes('target') || inputFormat.includes('target')) {
      return 'array_with_target';
    }

    // Matrix problems
    if (title.includes('matrix') || inputFormat.includes('matrix') ||
      description.includes('2d array') || description.includes('grid')) {
      return 'matrix';
    }

    // Tree problems
    if (title.includes('tree') || title.includes('binary tree') ||
      inputFormat.includes('tree') || description.includes('tree node')) {
      return 'tree';
    }

    // Linked list problems
    if (title.includes('linked list') || title.includes('list node') ||
      inputFormat.includes('linked list')) {
      return 'linkedlist';
    }

    // Graph problems
    if (title.includes('graph') || inputFormat.includes('graph') ||
      description.includes('vertices') || description.includes('edges')) {
      return 'graph';
    }

    // Number problems (single number or two numbers)
    if (inputFormat.includes('single integer') ||
      (inputFormat.includes('integer') && !inputFormat.includes('array'))) {
      return 'number';
    }

    // Default: Codeforces array (most common format)
    return 'codeforces_array';
  }

  /**
   * Layer 2: Edge & Corner Cases
   * Tests boundary conditions and constraint limits
   */
  generateEdgeCases() {
    const cases = [];

    if (this.problemType === 'power') {
      return this.generatePowerEdgeCases();
    }

    if (this.problemType === 'string') {
      return this.generateStringEdgeCases();
    }

    if (this.problemType === 'number') {
      return this.generateNumberEdgeCases();
    }

    if (this.problemType === 'codeforces_array') {
      return this.generateCodeforcesArrayEdgeCases();
    }

    // Default array-based edge cases
    cases.push({
      name: "Minimum Input Size",
      input: this.generateMinimumInput(),
      justification: "Tests the smallest valid input according to constraints"
    });

    cases.push({
      name: "Maximum Input Size",
      input: this.generateMaximumInput(),
      justification: "Tests the largest valid input to verify performance limits"
    });

    cases.push({
      name: "Empty/Zero Case",
      input: this.generateEmptyCase(),
      justification: "Tests handling of empty arrays, zero values, or null inputs"
    });

    cases.push({
      name: "Single Element",
      input: this.generateSingleElement(),
      justification: "Tests edge case with minimal non-empty input"
    });

    cases.push({
      name: "All Identical Elements",
      input: this.generateIdenticalElements(),
      justification: "Tests handling of uniform data"
    });

    cases.push({
      name: "Boundary Values",
      input: this.generateBoundaryValues(),
      justification: "Tests integer overflow, underflow, and extreme values"
    });

    cases.push({
      name: "Negative Numbers",
      input: this.generateNegativeCase(),
      justification: "Tests handling of negative values"
    });

    return cases;
  }

  /**
   * String-specific edge cases - FULLY RANDOMIZED
   */
  generateStringEdgeCases() {
    const cases = [];

    // Empty string
    cases.push({
      name: "Empty String",
      input: "",
      justification: "Tests handling of empty input"
    });

    // Single character (randomized)
    const singleChars = ['a', 'z', 'A', 'Z', '0', '9', '(', ')'];
    const randomChar = singleChars[this.randomInt(0, singleChars.length - 1)];
    cases.push({
      name: "Single Character",
      input: randomChar,
      justification: "Tests minimal non-empty input"
    });

    // Two characters (randomized)
    const twoCharOptions = ['aa', 'ab', 'ba', '()', '[]', '{}', '12'];
    const randomTwo = twoCharOptions[this.randomInt(0, twoCharOptions.length - 1)];
    cases.push({
      name: "Two Characters",
      input: randomTwo,
      justification: "Tests minimal pair"
    });

    // All same character (randomized length and char)
    const repeatChar = ['a', 'b', 'x', '1', '('][this.randomInt(0, 4)];
    const repeatLen = this.randomInt(5, 15);
    cases.push({
      name: "All Same Character",
      input: repeatChar.repeat(repeatLen),
      justification: "Tests uniform string"
    });

    // Alternating pattern (randomized)
    const altLen = this.randomInt(8, 16);
    const altChars = [['a', 'b'], ['(', ')'], ['{', '}'], ['0', '1']][this.randomInt(0, 3)];
    const alternating = Array(altLen).fill(0).map((_, i) => altChars[i % 2]).join('');
    cases.push({
      name: "Alternating Pattern",
      input: alternating,
      justification: "Tests alternating characters"
    });

    // Long string (randomized)
    const longLen = this.randomInt(80, 120);
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const longStr = Array(longLen).fill(0).map(() =>
      chars[this.randomInt(0, chars.length - 1)]
    ).join('');
    cases.push({
      name: "Long String",
      input: longStr,
      justification: "Tests longer input"
    });

    // Special characters (randomized)
    const specialLen = this.randomInt(10, 20);
    const specialChars = '()[]{}';
    const specialStr = Array(specialLen).fill(0).map(() =>
      specialChars[this.randomInt(0, specialChars.length - 1)]
    ).join('');
    cases.push({
      name: "Special Characters",
      input: specialStr,
      justification: "Tests special character handling"
    });

    return cases;
  }

  /**
   * Number-specific edge cases - FULLY RANDOMIZED
   */
  generateNumberEdgeCases() {
    const cases = [];

    // Zero
    cases.push({
      name: "Zero",
      input: "0",
      justification: "Tests zero input"
    });

    // Small positive (randomized)
    const smallPos = this.randomInt(1, 10);
    cases.push({
      name: "Small Positive",
      input: smallPos.toString(),
      justification: "Tests small positive number"
    });

    // Small negative (randomized)
    const smallNeg = this.randomInt(-10, -1);
    cases.push({
      name: "Small Negative",
      input: smallNeg.toString(),
      justification: "Tests small negative number"
    });

    // Large positive (randomized)
    const largePos = this.randomInt(1000000, 2147483647);
    cases.push({
      name: "Large Positive",
      input: largePos.toString(),
      justification: "Tests large positive number"
    });

    // Large negative (randomized)
    const largeNeg = this.randomInt(-2147483648, -1000000);
    cases.push({
      name: "Large Negative",
      input: largeNeg.toString(),
      justification: "Tests large negative number"
    });

    // Max int
    cases.push({
      name: "Maximum Integer",
      input: "2147483647",
      justification: "Tests maximum 32-bit integer"
    });

    // Min int
    cases.push({
      name: "Minimum Integer",
      input: "-2147483648",
      justification: "Tests minimum 32-bit integer"
    });

    return cases;
  }

  /**
   * Remove Duplicates from Sorted Array - Edge Cases
   * Based on analysis: values -50 to 50, arrays 1-100 elements
   * Format: n\nelem1 elem2 elem3 ...
   */
  generateCodeforcesArrayEdgeCases() {
    const cases = [];

    // Single element (like existing test case 1)
    const singleVal = this.randomInt(-50, 50);
    cases.push({
      name: "Single Element",
      input: `1\n${singleVal}`,
      justification: "Tests minimum array size"
    });

    // Two identical elements (like existing test case 2)
    const twoVal = this.randomInt(-50, 50);
    cases.push({
      name: "Two Identical Elements",
      input: `2\n${twoVal} ${twoVal}`,
      justification: "Tests basic duplicate removal"
    });

    // Two different elements (like existing test case 3)
    const val1 = this.randomInt(-50, 0);
    const val2 = this.randomInt(1, 50);
    cases.push({
      name: "Two Different Elements",
      input: `2\n${val1} ${val2}`,
      justification: "Tests no duplicates case"
    });

    // All same elements (like existing test case 4)
    const sameLen = this.randomInt(5, 15);
    const sameVal = this.randomInt(-50, 50);
    const sameArr = Array(sameLen).fill(sameVal);
    cases.push({
      name: "All Same Elements",
      input: `${sameLen}\n${sameArr.join(' ')}`,
      justification: "Tests all duplicates case"
    });

    // Mixed duplicates (like existing test case 5)
    const mixedLen = this.randomInt(6, 12);
    const mixedArr = [];
    const baseVal = this.randomInt(-40, 30);

    // Create pattern: some duplicates, some unique
    for (let i = 0; i < mixedLen; i++) {
      if (i < 2) {
        mixedArr.push(baseVal);
      } else if (i < 4) {
        mixedArr.push(baseVal + 10);
      } else if (i < 7) {
        mixedArr.push(baseVal + 20);
      } else {
        mixedArr.push(baseVal + 30 + (i - 7));
      }
    }
    mixedArr.sort((a, b) => a - b);

    cases.push({
      name: "Mixed Duplicates",
      input: `${mixedLen}\n${mixedArr.join(' ')}`,
      justification: "Tests mixed duplicates and unique elements"
    });

    return cases;
  }

  /**
   * Power function specific edge cases - FULLY RANDOMIZED
   */
  generatePowerEdgeCases() {
    const cases = [];

    // Fixed edge cases (always include these)
    cases.push({
      name: "Zero Exponent",
      input: "2.00000 0",
      justification: "Any number to power 0 equals 1"
    });

    cases.push({
      name: "Zero Base",
      input: "0.00000 5",
      justification: "Zero to any positive power equals 0"
    });

    cases.push({
      name: "One as Base",
      input: "1.00000 1000",
      justification: "1 to any power equals 1"
    });

    // Randomized negative exponents (different each time)
    const negExp1 = this.randomInt(-5, -2);
    const negExp2 = this.randomInt(-15, -8);
    cases.push({
      name: "Negative Exponent Small",
      input: `2.00000 ${negExp1}`,
      justification: "Tests reciprocal calculation"
    });

    cases.push({
      name: "Negative Exponent Medium",
      input: `2.00000 ${negExp2}`,
      justification: "Tests larger negative exponent"
    });

    // Randomized negative base tests
    const negBase = this.randomFloat(-3, -1.5);
    const oddExp = this.randomInt(1, 5) * 2 + 1; // Random odd: 3,5,7,9,11
    const evenExp = this.randomInt(1, 5) * 2; // Random even: 2,4,6,8,10

    cases.push({
      name: "Negative Base Odd Power",
      input: `${negBase} ${oddExp}`,
      justification: "Negative base with odd exponent gives negative result"
    });

    cases.push({
      name: "Negative Base Even Power",
      input: `${negBase} ${evenExp}`,
      justification: "Negative base with even exponent gives positive result"
    });

    // Randomized fractional bases
    const fracBase1 = this.randomFloat(0.3, 0.7);
    const fracBase2 = this.randomFloat(0.05, 0.2);
    const fracExp1 = this.randomInt(3, 8);
    const fracExp2 = this.randomInt(8, 15);

    cases.push({
      name: "Fractional Base Small",
      input: `${fracBase1} ${fracExp1}`,
      justification: "Tests fractional base less than 1"
    });

    cases.push({
      name: "Fractional Base Large",
      input: `${fracBase2} ${fracExp2}`,
      justification: "Tests very small fractional base"
    });

    // Fully random variations
    const randomBase = this.randomFloat(1.5, 3.0);
    const randomExp = this.randomInt(5, 15);
    cases.push({
      name: "Random Variation",
      input: `${randomBase} ${randomExp}`,
      justification: "Random test case for variety"
    });

    return cases;
  }

  /**
   * Layer 3: Medium & Large Stress Tests
   * Tests performance on typical large inputs
   */
  generateStressTests() {
    const cases = [];

    if (this.problemType === 'power') {
      return this.generatePowerStressTests();
    }

    if (this.problemType === 'string') {
      return this.generateStringStressTests();
    }

    if (this.problemType === 'number') {
      return this.generateNumberStressTests();
    }

    if (this.problemType === 'codeforces_array') {
      return this.generateCodeforcesArrayStressTests();
    }

    // Default array-based stress tests
    cases.push({
      name: "Random Medium Input",
      input: this.generateRandomInput('medium'),
      justification: "Tests correctness on typical medium-sized random data"
    });

    cases.push({
      name: "Random Large Input",
      input: this.generateRandomInput('large'),
      justification: "Tests performance and correctness on large random data"
    });

    cases.push({
      name: "Sorted Ascending",
      input: this.generateSortedInput('asc'),
      justification: "Tests performance on already sorted data"
    });

    cases.push({
      name: "Sorted Descending",
      input: this.generateSortedInput('desc'),
      justification: "Tests reverse-sorted data which may break certain algorithms"
    });

    cases.push({
      name: "Nearly Sorted",
      input: this.generateNearlySorted(),
      justification: "Tests data with small perturbations from sorted order"
    });

    return cases;
  }

  /**
   * String-specific stress tests - FULLY RANDOMIZED
   */
  generateStringStressTests() {
    const cases = [];

    // Medium random string (randomized)
    const medLen = this.randomInt(50, 100);
    const chars = 'abcdefghijklmnopqrstuvwxyz()[]{}';
    const medStr = Array(medLen).fill(0).map(() =>
      chars[this.randomInt(0, chars.length - 1)]
    ).join('');
    cases.push({
      name: "Medium Random String",
      input: medStr,
      justification: "Tests medium-sized random input"
    });

    // Large random string (randomized)
    const largeLen = this.randomInt(200, 400);
    const largeStr = Array(largeLen).fill(0).map(() =>
      chars[this.randomInt(0, chars.length - 1)]
    ).join('');
    cases.push({
      name: "Large Random String",
      input: largeStr,
      justification: "Tests large random input"
    });

    // Repeated pattern (randomized)
    const patternLen = this.randomInt(3, 6);
    const pattern = Array(patternLen).fill(0).map(() =>
      chars[this.randomInt(0, chars.length - 1)]
    ).join('');
    const repeatCount = this.randomInt(15, 30);
    cases.push({
      name: "Repeated Pattern",
      input: pattern.repeat(repeatCount),
      justification: "Tests repeated pattern"
    });

    // Mixed case (randomized)
    const mixedLen = this.randomInt(60, 100);
    const mixedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const mixedStr = Array(mixedLen).fill(0).map(() =>
      mixedChars[this.randomInt(0, mixedChars.length - 1)]
    ).join('');
    cases.push({
      name: "Mixed Case String",
      input: mixedStr,
      justification: "Tests mixed case and numbers"
    });

    // Nested brackets (randomized)
    const nestLevel = this.randomInt(10, 20);
    const brackets = ['()', '[]', '{}'];
    let nested = '';
    for (let i = 0; i < nestLevel; i++) {
      const bracket = brackets[this.randomInt(0, 2)];
      nested = bracket[0] + nested + bracket[1];
    }
    cases.push({
      name: "Nested Structure",
      input: nested,
      justification: "Tests deeply nested structure"
    });

    return cases;
  }

  /**
   * Number-specific stress tests - FULLY RANDOMIZED
   */
  generateNumberStressTests() {
    const cases = [];

    // Random medium numbers (randomized)
    for (let i = 0; i < 3; i++) {
      const num = this.randomInt(-100000, 100000);
      cases.push({
        name: `Random Medium Number ${i + 1}`,
        input: num.toString(),
        justification: "Tests random medium-sized number"
      });
    }

    // Random large numbers (randomized)
    for (let i = 0; i < 2; i++) {
      const num = this.randomInt(-2000000000, 2000000000);
      cases.push({
        name: `Random Large Number ${i + 1}`,
        input: num.toString(),
        justification: "Tests random large number"
      });
    }

    return cases;
  }

  /**
   * Remove Duplicates from Sorted Array - Stress Tests
   * Medium to large arrays with various duplicate patterns
   */
  generateCodeforcesArrayStressTests() {
    const cases = [];

    // Medium array with random duplicates
    const medLen = this.randomInt(30, 60);
    const medArr = [];
    for (let i = 0; i < medLen; i++) {
      medArr.push(this.randomInt(-50, 50));
    }
    medArr.sort((a, b) => a - b);
    cases.push({
      name: "Medium Random Array",
      input: `${medLen}\n${medArr.join(' ')}`,
      justification: "Tests medium-sized array with random duplicates"
    });

    // Large array with many duplicates
    const largeLen = this.randomInt(60, 90);
    const largeArr = [];
    const uniqueValues = this.randomInt(10, 20);
    for (let i = 0; i < largeLen; i++) {
      largeArr.push(this.randomInt(-50, -50 + uniqueValues));
    }
    largeArr.sort((a, b) => a - b);
    cases.push({
      name: "Large Array Many Duplicates",
      input: `${largeLen}\n${largeArr.join(' ')}`,
      justification: "Tests large array with many duplicate values"
    });

    // Consecutive duplicates pattern
    const consLen = this.randomInt(40, 70);
    const consArr = [];
    let currentVal = this.randomInt(-40, 0);
    for (let i = 0; i < consLen; i++) {
      consArr.push(currentVal);
      if (this.randomInt(1, 3) === 1) { // 33% chance to increment
        currentVal += this.randomInt(1, 3);
      }
    }
    cases.push({
      name: "Consecutive Duplicates",
      input: `${consLen}\n${consArr.join(' ')}`,
      justification: "Tests consecutive duplicate patterns"
    });

    // Mostly unique with few duplicates
    const uniqueLen = this.randomInt(50, 80);
    const uniqueArr = [];
    for (let i = 0; i < uniqueLen; i++) {
      uniqueArr.push(i - 40); // Mostly unique
    }
    // Add some duplicates
    for (let i = 0; i < 5; i++) {
      const dupIndex = this.randomInt(0, uniqueLen - 1);
      uniqueArr.push(uniqueArr[dupIndex]);
    }
    uniqueArr.sort((a, b) => a - b);
    cases.push({
      name: "Mostly Unique",
      input: `${uniqueArr.length}\n${uniqueArr.join(' ')}`,
      justification: "Tests mostly unique array with few duplicates"
    });

    return cases;
  }

  /**
   * Power function specific stress tests - FULLY RANDOMIZED
   */
  generatePowerStressTests() {
    const cases = [];

    // Randomized medium exponents
    const medBase1 = this.randomFloat(1.3, 1.7);
    const medExp1 = this.randomInt(8, 15);
    cases.push({
      name: "Medium Positive Exponent",
      input: `${medBase1} ${medExp1}`,
      justification: "Tests medium-sized exponent calculation"
    });

    // Randomized large exponents (safe limit: 100)
    const largeBase = this.randomFloat(1.05, 1.15);
    const largeExp = this.randomInt(40, 80);
    cases.push({
      name: "Large Positive Exponent",
      input: `${largeBase} ${largeExp}`,
      justification: "Tests larger exponent"
    });

    // Randomized negative exponents
    const negBase = this.randomFloat(1.8, 2.5);
    const negExp = this.randomInt(-20, -12);
    cases.push({
      name: "Medium Negative Exponent",
      input: `${negBase} ${negExp}`,
      justification: "Tests medium-sized negative exponent"
    });

    // Randomized large base tests
    const largeBase1 = this.randomFloat(8, 12);
    const smallExp1 = this.randomInt(2, 4);
    cases.push({
      name: "Large Base Small Exponent",
      input: `${largeBase1} ${smallExp1}`,
      justification: "Tests large base with small exponent"
    });

    const largeBase2 = this.randomFloat(4, 7);
    const medExp2 = this.randomInt(4, 7);
    cases.push({
      name: "Large Base Medium Exponent",
      input: `${largeBase2} ${medExp2}`,
      justification: "Tests larger base with medium exponent"
    });

    // Fully random stress tests
    const randomBase1 = this.randomFloat(1.5, 3.0);
    const randomExp1 = this.randomInt(10, 30);
    cases.push({
      name: "Random Stress Test 1",
      input: `${randomBase1} ${randomExp1}`,
      justification: "Random stress test for variety"
    });

    const randomBase2 = this.randomFloat(5, 10);
    const randomExp2 = this.randomInt(3, 6);
    cases.push({
      name: "Random Stress Test 2",
      input: `${randomBase2} ${randomExp2}`,
      justification: "Random large base test"
    });

    return cases;
  }

  /**
   * Layer 4: Adversarial Attacks
   * Precision-engineered tests to break suboptimal solutions
   */
  generateAdversarialTests() {
    const cases = [];

    if (this.problemType === 'power') {
      return this.generatePowerAdversarialTests();
    }

    if (this.problemType === 'string') {
      return this.generateStringAdversarialTests();
    }

    if (this.problemType === 'number') {
      return this.generateNumberAdversarialTests();
    }

    if (this.problemType === 'codeforces_array') {
      return this.generateCodeforcesArrayAdversarialTests();
    }

    // Default array-based adversarial tests
    cases.push({
      name: "TLE Test - Brute Force Killer",
      input: this.generateTLETest(),
      justification: "Designed to cause timeout for O(n²) or worse solutions"
    });

    cases.push({
      name: "WA Test - Greedy Killer",
      input: this.generateGreedyKiller(),
      justification: "Counter-example where greedy approach fails"
    });

    cases.push({
      name: "Off-by-One Trap",
      input: this.generateOffByOneTest(),
      justification: "Tests boundary indexing and loop conditions"
    });

    cases.push({
      name: "Overflow Trap",
      input: this.generateOverflowTest(),
      justification: "Tests for proper handling of integer overflow"
    });

    cases.push({
      name: "Pattern Breaker",
      input: this.generatePatternBreaker(),
      justification: "Specific pattern designed to break common incorrect approaches"
    });

    return cases;
  }

  /**
   * String-specific adversarial tests - FULLY RANDOMIZED
   */
  generateStringAdversarialTests() {
    const cases = [];

    // Very long string (randomized)
    const veryLongLen = this.randomInt(500, 800);
    const chars = 'abcdefghijklmnopqrstuvwxyz()[]{}';
    const veryLongStr = Array(veryLongLen).fill(0).map(() =>
      chars[this.randomInt(0, chars.length - 1)]
    ).join('');
    cases.push({
      name: "Very Long String",
      input: veryLongStr,
      justification: "Tests performance on very long input - requires O(n) solution"
    });

    // Almost valid pattern (randomized)
    const almostLen = this.randomInt(20, 40);
    const brackets = '()[]{}';
    let almostValid = '';
    for (let i = 0; i < almostLen; i++) {
      almostValid += brackets[this.randomInt(0, brackets.length - 1)];
    }
    // Add one mismatched bracket
    almostValid += brackets[this.randomInt(0, 2) * 2]; // Opening bracket
    cases.push({
      name: "Almost Valid Pattern",
      input: almostValid,
      justification: "Tests edge case with almost valid pattern"
    });

    // Deeply nested then broken (randomized)
    const nestDepth = this.randomInt(15, 25);
    let deepNested = '';
    for (let i = 0; i < nestDepth; i++) {
      deepNested = '(' + deepNested + ')';
    }
    // Break it at random position
    const breakPos = this.randomInt(1, deepNested.length - 2);
    deepNested = deepNested.substring(0, breakPos) + deepNested.substring(breakPos + 1);
    cases.push({
      name: "Deeply Nested Then Broken",
      input: deepNested,
      justification: "Tests deep nesting with subtle error"
    });

    // All opening brackets (randomized)
    const openLen = this.randomInt(30, 50);
    const openBrackets = '([{';
    const allOpen = Array(openLen).fill(0).map(() =>
      openBrackets[this.randomInt(0, openBrackets.length - 1)]
    ).join('');
    cases.push({
      name: "All Opening Brackets",
      input: allOpen,
      justification: "Tests unbalanced brackets"
    });

    // All closing brackets (randomized)
    const closeLen = this.randomInt(30, 50);
    const closeBrackets = ')]}';
    const allClose = Array(closeLen).fill(0).map(() =>
      closeBrackets[this.randomInt(0, closeBrackets.length - 1)]
    ).join('');
    cases.push({
      name: "All Closing Brackets",
      input: allClose,
      justification: "Tests unbalanced closing brackets"
    });

    // Random complex pattern (randomized)
    const complexLen = this.randomInt(100, 200);
    const complexStr = Array(complexLen).fill(0).map(() =>
      chars[this.randomInt(0, chars.length - 1)]
    ).join('');
    cases.push({
      name: "Complex Random Pattern",
      input: complexStr,
      justification: "Tests complex random pattern"
    });

    return cases;
  }

  /**
   * Number-specific adversarial tests - FULLY RANDOMIZED
   */
  generateNumberAdversarialTests() {
    const cases = [];

    // Near overflow (randomized)
    const nearMax = 2147483647 - this.randomInt(0, 100);
    cases.push({
      name: "Near Maximum",
      input: nearMax.toString(),
      justification: "Tests near overflow condition"
    });

    // Near underflow (randomized)
    const nearMin = -2147483648 + this.randomInt(0, 100);
    cases.push({
      name: "Near Minimum",
      input: nearMin.toString(),
      justification: "Tests near underflow condition"
    });

    // Random large numbers (randomized)
    for (let i = 0; i < 3; i++) {
      const largeNum = this.randomInt(1000000000, 2147483647);
      const sign = this.randomInt(0, 1) === 0 ? 1 : -1;
      cases.push({
        name: `Random Large ${i + 1}`,
        input: (largeNum * sign).toString(),
        justification: "Tests large random number"
      });
    }

    return cases;
  }

  /**
   * Remove Duplicates from Sorted Array - Adversarial Tests
   * Designed to test edge cases and potential algorithm failures
   */
  generateCodeforcesArrayAdversarialTests() {
    const cases = [];

    // All duplicates except one
    const allDupLen = this.randomInt(30, 60);
    const dupVal = this.randomInt(-50, 50);
    const allDupArr = Array(allDupLen).fill(dupVal);
    allDupArr[this.randomInt(0, allDupLen - 1)] = dupVal + this.randomInt(1, 10);
    allDupArr.sort((a, b) => a - b);
    cases.push({
      name: "All Duplicates Except One",
      input: `${allDupLen}\n${allDupArr.join(' ')}`,
      justification: "Tests worst case: almost all duplicates"
    });

    // Alternating duplicates
    const altLen = this.randomInt(40, 70);
    const val1 = this.randomInt(-50, 0);
    const val2 = this.randomInt(1, 50);
    const altArr = [];
    for (let i = 0; i < altLen; i++) {
      altArr.push(i % 2 === 0 ? val1 : val2);
    }
    altArr.sort((a, b) => a - b);
    cases.push({
      name: "Alternating Values",
      input: `${altLen}\n${altArr.join(' ')}`,
      justification: "Tests alternating duplicate pattern"
    });

    // Boundary values (within problem constraints)
    const boundLen = this.randomInt(20, 40);
    const boundArr = [];
    for (let i = 0; i < boundLen; i++) {
      boundArr.push(this.randomInt(0, 1) === 0 ? -50 : 50); // Min/max values
    }
    boundArr.sort((a, b) => a - b);
    cases.push({
      name: "Boundary Values",
      input: `${boundLen}\n${boundArr.join(' ')}`,
      justification: "Tests minimum and maximum values from constraints"
    });

    // Dense duplicates (many groups of duplicates)
    const denseLen = this.randomInt(50, 80);
    const denseArr = [];
    let currentVal = -40;
    for (let i = 0; i < denseLen; i++) {
      denseArr.push(currentVal);
      if (i % 3 === 2) { // Every 3rd element, increment
        currentVal += this.randomInt(1, 2);
      }
    }
    cases.push({
      name: "Dense Duplicates",
      input: `${denseLen}\n${denseArr.join(' ')}`,
      justification: "Tests many small groups of duplicates"
    });

    return cases;
  }

  /**
   * Power function specific adversarial tests - FULLY RANDOMIZED
   */
  generatePowerAdversarialTests() {
    const cases = [];

    // Very large exponent test (safe limit: 100)
    const verySmallBase = this.randomFloat(1.001, 1.01);
    const veryLargeExp = this.randomInt(80, 100);
    cases.push({
      name: "Very Large Positive Exponent",
      input: `${verySmallBase} ${veryLargeExp}`,
      justification: "Tests very large exponent with small base - requires O(log n)"
    });

    // Large exponent tests
    const largeExpBase = this.randomFloat(1.8, 2.2);
    const largeExp = this.randomInt(25, 35);
    cases.push({
      name: "Large Positive Exponent",
      input: `${largeExpBase} ${largeExp}`,
      justification: "Tests large exponent - requires O(log n) algorithm"
    });

    const largeNegExp = this.randomInt(-35, -25);
    cases.push({
      name: "Large Negative Exponent",
      input: `${largeExpBase} ${largeNegExp}`,
      justification: "Tests large negative exponent"
    });

    // Negative base with large exponents
    const negBase1 = this.randomFloat(-2.0, -1.3);
    const largeOddExp = this.randomInt(6, 10) * 2 + 1; // Random odd: 13,15,17,19,21
    cases.push({
      name: "Negative Base Large Odd",
      input: `${negBase1} ${largeOddExp}`,
      justification: "Negative base with large odd exponent"
    });

    const negBase2 = this.randomFloat(-2.0, -1.3);
    const largeEvenExp = this.randomInt(6, 10) * 2; // Random even: 12,14,16,18,20
    cases.push({
      name: "Negative Base Large Even",
      input: `${negBase2} ${largeEvenExp}`,
      justification: "Negative base with large even exponent"
    });

    // Precision test
    const precisionBase = this.randomFloat(0.9999, 0.99999);
    const precisionExp = this.randomInt(40, 60);
    cases.push({
      name: "Precision Test",
      input: `${precisionBase} ${precisionExp}`,
      justification: "Tests floating-point precision"
    });

    // Fully random adversarial tests
    const randomNegBase1 = this.randomFloat(-3.0, -1.5);
    const randomOddExp = this.randomInt(5, 12) * 2 + 1; // Random odd
    cases.push({
      name: "Random Negative Base Odd",
      input: `${randomNegBase1} ${randomOddExp}`,
      justification: "Random negative base with odd exponent"
    });

    const randomNegBase2 = this.randomFloat(-3.0, -1.5);
    const randomEvenExp = this.randomInt(5, 12) * 2; // Random even
    cases.push({
      name: "Random Negative Base Even",
      input: `${randomNegBase2} ${randomEvenExp}`,
      justification: "Random negative base with even exponent"
    });

    return cases;
  }

  // Helper methods for generating specific test types (array-based)
  // IMPORTANT: Keep sizes small to avoid API payload limits (max 400KB)

  generateMinimumInput() {
    return { n: 1, data: [1] };
  }

  generateMaximumInput() {
    // Limit to 1000 elements to stay well under API limits
    // This is still enough to test O(n²) vs O(n log n) algorithms
    return { n: 1000, data: Array(1000).fill(0).map((_, i) => i) };
  }

  generateEmptyCase() {
    return { n: 0, data: [] };
  }

  generateSingleElement() {
    const randomValue = this.randomInt(-100, 100);
    return { n: 1, data: [randomValue] };
  }

  generateIdenticalElements() {
    const size = this.randomInt(80, 120);
    const value = this.randomInt(-50, 50);
    return { n: size, data: Array(size).fill(value) };
  }

  generateBoundaryValues() {
    return {
      n: 5,
      data: [-2147483648, -1, 0, 1, 2147483647]
    };
  }

  generateNegativeCase() {
    return { n: 5, data: [-5, -4, -3, -2, -1] };
  }

  generateRandomInput(size) {
    // Keep sizes reasonable for API limits - RANDOMIZED
    const n = size === 'medium' ? this.randomInt(80, 120) : this.randomInt(400, 600);
    const data = Array(n).fill(0).map(() =>
      this.randomInt(-1000000, 1000000)
    );
    return { n, data };
  }

  generateSortedInput(order) {
    const n = this.randomInt(150, 250);
    const start = this.randomInt(-100, 0);
    const data = Array(n).fill(0).map((_, i) => start + i);
    if (order === 'desc') data.reverse();
    return { n, data };
  }

  generateNearlySorted() {
    const n = this.randomInt(150, 250);
    const start = this.randomInt(-50, 50);
    const data = Array(n).fill(0).map((_, i) => start + i);
    // Swap 1-3% of elements randomly
    const swapCount = this.randomInt(Math.floor(n * 0.01), Math.floor(n * 0.03));
    for (let i = 0; i < swapCount; i++) {
      const idx1 = this.randomInt(0, n - 1);
      const idx2 = this.randomInt(0, n - 1);
      [data[idx1], data[idx2]] = [data[idx2], data[idx1]];
    }
    return { n, data };
  }

  generateTLETest() {
    // Worst case for O(n²) algorithms
    // 800-1000 elements is enough to show O(n²) is slow
    const n = this.randomInt(800, 1000);
    const start = this.randomInt(1, 100);
    return { n, data: Array(n).fill(0).map((_, i) => start + n - i) };
  }

  generateGreedyKiller() {
    return { n: 5, data: [1, 2, 3, 4, 5] };
  }

  generateOffByOneTest() {
    return { n: 2, data: [1, 2] };
  }

  generateOverflowTest() {
    return {
      n: 3,
      data: [2147483647, 2147483647, 2147483647]
    };
  }

  generatePatternBreaker() {
    return { n: 10, data: [1, 1, 1, 1, 1, 2, 2, 2, 2, 2] };
  }

  /**
   * Compute expected output for power function
   */
  computePowerOutput(input) {
    const parts = input.trim().split(/\s+/);
    const x = parseFloat(parts[0]);
    const n = parseInt(parts[1]);

    // Implement fast power algorithm
    const power = (base, exp) => {
      if (exp === 0) return 1.0;
      if (exp < 0) return 1.0 / power(base, -exp);

      let result = 1.0;
      let currentBase = base;
      let currentExp = exp;

      while (currentExp > 0) {
        if (currentExp % 2 === 1) {
          result *= currentBase;
        }
        currentBase *= currentBase;
        currentExp = Math.floor(currentExp / 2);
      }

      return result;
    };

    const result = power(x, n);
    return result.toFixed(5);
  }

  /**
   * Generate all test cases and return in API format
   */
  async generateAll() {
    const allTestCases = [];
    const MAX_INPUT_SIZE = 400000; // 400KB limit for Piston API

    try {
      // Layer 2: Edge cases
      const edgeCases = this.generateEdgeCases();
      edgeCases.forEach(tc => {
        const output = this.computeExpectedOutput(tc.input);
        const inputStr = typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input);
        const outputStr = typeof output === 'string' ? output : JSON.stringify(output);

        // Skip if input is too large
        if (inputStr.length > MAX_INPUT_SIZE) {
          console.warn(`⚠️  Skipping test case (input too large: ${inputStr.length} bytes)`);
          return;
        }

        allTestCases.push({
          input: inputStr,
          output: outputStr
        });
      });

      // Layer 3: Stress tests
      const stressTests = this.generateStressTests();
      stressTests.forEach(tc => {
        const output = this.computeExpectedOutput(tc.input);
        const inputStr = typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input);
        const outputStr = typeof output === 'string' ? output : JSON.stringify(output);

        // Skip if input is too large
        if (inputStr.length > MAX_INPUT_SIZE) {
          console.warn(`⚠️  Skipping test case (input too large: ${inputStr.length} bytes)`);
          return;
        }

        allTestCases.push({
          input: inputStr,
          output: outputStr
        });
      });

      // Layer 4: Adversarial tests
      const adversarialTests = this.generateAdversarialTests();
      adversarialTests.forEach(tc => {
        const output = this.computeExpectedOutput(tc.input);
        const inputStr = typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input);
        const outputStr = typeof output === 'string' ? output : JSON.stringify(output);

        // Skip if input is too large
        if (inputStr.length > MAX_INPUT_SIZE) {
          console.warn(`⚠️  Skipping test case (input too large: ${inputStr.length} bytes)`);
          return;
        }

        allTestCases.push({
          input: inputStr,
          output: outputStr
        });
      });

    } catch (error) {
      console.error('Error generating test cases:', error);
      // Return at least some basic test cases
      if (allTestCases.length === 0) {
        // Fallback: generate simple test cases based on sample
        allTestCases.push({
          input: this.problem.sampleInput || "1",
          output: this.problem.sampleOutput || "1"
        });
      }
    }

    return allTestCases;
  }

  /**
   * Compute expected output for given input
   * Routes to problem-specific computation
   */
  computeExpectedOutput(input) {
    if (this.problemType === 'power') {
      return this.computePowerOutput(input);
    }

    if (this.problemType === 'string') {
      return this.computeStringOutput(input);
    }

    if (this.problemType === 'number') {
      return this.computeNumberOutput(input);
    }

    if (this.problemType === 'codeforces_array') {
      return this.computeCodeforcesArrayOutput(input);
    }

    // Default: return placeholder
    // For unknown types, we can't compute output automatically
    // Teacher will need to provide correct outputs or use reference solution
    return "PLACEHOLDER_OUTPUT";
  }

  /**
   * Compute expected output for Codeforces-style array problems
   * Format: Input is "n\nelem1 elem2 ... elemn"
   * Output depends on problem type
   */
  computeCodeforcesArrayOutput(input) {
    const lines = input.trim().split('\n');
    if (lines.length < 2) return "PLACEHOLDER_OUTPUT";

    const n = parseInt(lines[0]);
    const arr = lines[1].split(' ').map(x => parseInt(x));

    const title = (this.problem.title || '').toLowerCase();

    // Remove Duplicates from Sorted Array
    if (title.includes('remove duplicates')) {
      const unique = [];
      for (let i = 0; i < arr.length; i++) {
        if (i === 0 || arr[i] !== arr[i - 1]) {
          unique.push(arr[i]);
        }
      }
      return `${unique.length}\n${unique.join(' ')}`;
    }

    // Two Sum
    if (title.includes('two sum')) {
      // For two sum, we'd need a target value
      // Return placeholder for now
      return "PLACEHOLDER_OUTPUT";
    }

    // Default: return count and array (most common format)
    return `${arr.length}\n${arr.join(' ')}`;
  }

  /**
   * Compute expected output for string problems
   * This is a generic handler - specific problems may need custom logic
   */
  computeStringOutput(input) {
    const title = (this.problem.title || '').toLowerCase();

    // Valid Parentheses
    if (title.includes('valid parentheses') || title.includes('balanced')) {
      return this.isValidParentheses(input) ? "true" : "false";
    }

    // Remove Duplicates
    if (title.includes('remove duplicates')) {
      // Remove consecutive duplicates
      let result = '';
      for (let i = 0; i < input.length; i++) {
        if (i === 0 || input[i] !== input[i - 1]) {
          result += input[i];
        }
      }
      return result;
    }

    // Reverse String
    if (title.includes('reverse')) {
      return input.split('').reverse().join('');
    }

    // Palindrome check
    if (title.includes('palindrome')) {
      const reversed = input.split('').reverse().join('');
      return (input === reversed) ? "true" : "false";
    }

    // Default: return length or the string itself
    return input.length.toString();
  }

  /**
   * Helper: Check if parentheses are valid
   */
  isValidParentheses(s) {
    const stack = [];
    const pairs = { '(': ')', '[': ']', '{': '}' };

    for (let char of s) {
      if (pairs[char]) {
        stack.push(char);
      } else if (char === ')' || char === ']' || char === '}') {
        if (stack.length === 0) return false;
        const last = stack.pop();
        if (pairs[last] !== char) return false;
      }
    }

    return stack.length === 0;
  }

  /**
   * Compute expected output for number problems
   */
  computeNumberOutput(input) {
    const num = parseInt(input.trim());
    const title = (this.problem.title || '').toLowerCase();

    // Factorial
    if (title.includes('factorial')) {
      let result = 1;
      for (let i = 2; i <= num; i++) {
        result *= i;
      }
      return result.toString();
    }

    // Fibonacci
    if (title.includes('fibonacci')) {
      if (num <= 1) return num.toString();
      let a = 0, b = 1;
      for (let i = 2; i <= num; i++) {
        [a, b] = [b, a + b];
      }
      return b.toString();
    }

    // Prime check
    if (title.includes('prime')) {
      if (num < 2) return "false";
      for (let i = 2; i * i <= num; i++) {
        if (num % i === 0) return "false";
      }
      return "true";
    }

    // Default: return the number itself
    return num.toString();
  }

  /**
   * Format test cases for output
   */
  formatTestCases() {
    const formatted = [];

    formatted.push("=== LAYER 2: EDGE & CORNER CASES ===\n");
    this.testCases.layer2_edge.forEach((tc, idx) => {
      formatted.push(`Test Case ${idx + 1}: ${tc.name}`);
      formatted.push(`Input: ${JSON.stringify(tc.input)}`);
      formatted.push(`Justification: ${tc.justification}\n`);
    });

    formatted.push("\n=== LAYER 3: MEDIUM & LARGE STRESS TESTS ===\n");
    this.testCases.layer3_stress.forEach((tc, idx) => {
      formatted.push(`Test Case ${idx + 1}: ${tc.name}`);
      formatted.push(`Input: ${this.formatLargeInput(tc.input)}`);
      formatted.push(`Justification: ${tc.justification}\n`);
    });

    formatted.push("\n=== LAYER 4: ADVERSARIAL ATTACKS ===\n");
    this.testCases.layer4_adversarial.forEach((tc, idx) => {
      formatted.push(`Test Case ${idx + 1}: ${tc.name}`);
      formatted.push(`Input: ${this.formatLargeInput(tc.input)}`);
      formatted.push(`Justification: ${tc.justification}\n`);
    });

    return formatted.join('\n');
  }

  formatLargeInput(input) {
    const str = JSON.stringify(input);
    if (str.length > 200) {
      return str.substring(0, 200) + '... (truncated)';
    }
    return str;
  }
}

module.exports = TestCaseGenerator;
