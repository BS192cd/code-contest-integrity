/**
 * LeetCode to Codeforces Format Converter
 * 
 * Converts LeetCode-style problems (function-based) to Codeforces-style (stdin/stdout)
 * This runs automatically when scraping problems from LeetCode
 */

class LeetCodeToCodeforcesConverter {
  
  /**
   * Main conversion function
   * Takes a LeetCode problem and converts it to Codeforces format
   */
  static convert(leetcodeProblem) {
    console.log(`🔄 Converting: ${leetcodeProblem.title}`);
    
    return {
      title: leetcodeProblem.title,
      description: this.convertDescription(leetcodeProblem),
      difficulty: leetcodeProblem.difficulty?.toLowerCase() || 'medium',
      tags: leetcodeProblem.tags || [],
      
      // KEY: Always use "program" execution type
      executionType: 'program',
      
      // Convert test cases to simple stdin/stdout format
      testCases: this.convertTestCases(leetcodeProblem.testCases || []),
      
      // Time and memory limits
      timeLimit: leetcodeProblem.timeLimit || 2,
      memoryLimit: leetcodeProblem.memoryLimit || 256,
      
      // Remove all LeetCode-specific metadata
      // No metadata, no signatures, no templates needed!
    };
  }
  
  /**
   * Convert test cases from LeetCode format to Codeforces format
   */
  static convertTestCases(testCases) {
    return testCases.map((tc, index) => {
      const input = this.convertInput(tc.input);
      const output = this.convertOutput(tc.output || tc.expectedOutput);
      
      console.log(`  Test ${index + 1}: "${tc.input}" → "${input}"`);
      
      return {
        input: input,
        expectedOutput: output,
        isPublic: tc.isPublic !== false // Default to public
      };
    });
  }
  
  /**
   * Convert LeetCode input format to simple stdin format
   * 
   * Examples:
   * "[2,7,11,15]\n9" → "4\n2 7 11 15\n9"
   * "x = 2.0, n = 10" → "2.0 10"
   * "[1,2,3]" → "3\n1 2 3"
   */
  static convertInput(input) {
    if (!input) return '';
    
    // Remove extra whitespace
    input = input.trim();
    
    // Case 1: LeetCode parameter format "x = 2.0, n = 10"
    if (input.includes('=')) {
      return this.convertParameterFormat(input);
    }
    
    // Case 2: Multiple lines with arrays
    if (input.includes('\n')) {
      return this.convertMultiLineInput(input);
    }
    
    // Case 3: Single array "[1,2,3]"
    if (input.startsWith('[') && input.endsWith(']')) {
      return this.convertArrayInput(input);
    }
    
    // Case 4: Array + value "[1,2,3]5"
    if (input.includes('[')) {
      return this.convertArrayWithValue(input);
    }
    
    // Case 5: Already simple format - return as is
    return input;
  }
  
  /**
   * Convert "x = 2.0, n = 10" → "2.0 10"
   */
  static convertParameterFormat(input) {
    // Extract values after '=' signs
    const values = input
      .split(',')
      .map(part => {
        const match = part.match(/=\s*(.+)/);
        return match ? match[1].trim() : part.trim();
      })
      .filter(v => v);
    
    return values.join(' ');
  }
  
  /**
   * Convert "[1,2,3]" → "3\n1 2 3"
   */
  static convertArrayInput(input) {
    try {
      const arr = JSON.parse(input);
      if (Array.isArray(arr)) {
        // For array of arrays (2D)
        if (Array.isArray(arr[0])) {
          const rows = arr.length;
          const cols = arr[0].length;
          const flat = arr.map(row => row.join(' ')).join('\n');
          return `${rows} ${cols}\n${flat}`;
        }
        // For 1D array
        return `${arr.length}\n${arr.join(' ')}`;
      }
    } catch (e) {
      // If parsing fails, return as is
    }
    return input;
  }
  
  /**
   * Convert "[1,2,3]5" → "3\n1 2 3\n5"
   */
  static convertArrayWithValue(input) {
    try {
      // Find where array ends
      const arrayEnd = input.indexOf(']') + 1;
      const arrayPart = input.substring(0, arrayEnd);
      const valuePart = input.substring(arrayEnd).trim();
      
      const arr = JSON.parse(arrayPart);
      if (Array.isArray(arr)) {
        const arrayStr = `${arr.length}\n${arr.join(' ')}`;
        return valuePart ? `${arrayStr}\n${valuePart}` : arrayStr;
      }
    } catch (e) {
      // If parsing fails, return as is
    }
    return input;
  }
  
  /**
   * Convert multi-line input with arrays
   */
  static convertMultiLineInput(input) {
    const lines = input.split('\n');
    const converted = lines.map(line => {
      line = line.trim();
      if (line.startsWith('[') && line.endsWith(']')) {
        return this.convertArrayInput(line);
      }
      return line;
    });
    return converted.join('\n');
  }
  
  /**
   * Convert output format (usually simpler)
   */
  static convertOutput(output) {
    if (!output) return '';
    
    output = output.trim();
    
    // If output is an array like "[0,1]", convert to "0 1"
    if (output.startsWith('[') && output.endsWith(']')) {
      try {
        const arr = JSON.parse(output);
        if (Array.isArray(arr)) {
          return arr.join(' ');
        }
      } catch (e) {
        // If parsing fails, return as is
      }
    }
    
    return output;
  }
  
  /**
   * Convert description to include stdin/stdout instructions
   */
  static convertDescription(problem) {
    let desc = problem.description || '';
    
    // Add Codeforces-style I/O instructions
    desc += `\n\n---\n\n`;
    desc += `## 📥 Input Format\n\n`;
    desc += this.generateInputFormatDescription(problem);
    desc += `\n\n## 📤 Output Format\n\n`;
    desc += this.generateOutputFormatDescription(problem);
    desc += `\n\n## 💡 Note\n\n`;
    desc += `This problem uses **Codeforces-style I/O**:\n`;
    desc += `- Read input from **stdin** (standard input)\n`;
    desc += `- Write output to **stdout** (standard output)\n`;
    desc += `- Write a **complete program**, not just a function\n`;
    desc += `\n\n## 🎯 Solution Template\n\n`;
    desc += this.generateSolutionTemplate(problem);
    
    return desc;
  }
  
  /**
   * Generate input format description based on problem
   */
  static generateInputFormatDescription(problem) {
    // Try to infer from test cases
    if (problem.testCases && problem.testCases.length > 0) {
      const firstInput = problem.testCases[0].input;
      
      if (firstInput.includes('[') && firstInput.includes(']')) {
        return `Read from standard input. Arrays are provided as:\n- Line 1: Array size\n- Line 2: Space-separated array elements\n- Additional lines: Other parameters`;
      }
      
      if (firstInput.includes('=')) {
        const paramCount = (firstInput.match(/=/g) || []).length;
        return `Read ${paramCount} space-separated value(s) from standard input.`;
      }
    }
    
    return `Read input from standard input (stdin).`;
  }
  
  /**
   * Generate output format description
   */
  static generateOutputFormatDescription(problem) {
    if (problem.testCases && problem.testCases.length > 0) {
      const firstOutput = problem.testCases[0].output || problem.testCases[0].expectedOutput;
      
      if (firstOutput && firstOutput.includes('[')) {
        return `Output space-separated values to standard output.`;
      }
    }
    
    return `Write output to standard output (stdout).`;
  }
  
  /**
   * Generate solution template
   */
  static generateSolutionTemplate(problem) {
    return `
### Python
\`\`\`python
import sys

def main():
    # Read input from stdin
    data = sys.stdin.read().strip().split()
    
    # Parse input (adjust based on problem)
    # Example: a, b = int(data[0]), int(data[1])
    
    # Solve the problem
    result = solve(data)
    
    # Print output to stdout
    print(result)

if __name__ == "__main__":
    main()
\`\`\`

### Java
\`\`\`java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read input
        // Example: int a = sc.nextInt();
        
        // Solve the problem
        // int result = solve(a);
        
        // Print output
        // System.out.println(result);
        
        sc.close();
    }
}
\`\`\`

### C++
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    // Read input
    // Example: int a, b;
    // cin >> a >> b;
    
    // Solve the problem
    // int result = solve(a, b);
    
    // Print output
    // cout << result << endl;
    
    return 0;
}
\`\`\`
    `.trim();
  }
  
  /**
   * Batch convert multiple problems
   */
  static convertBatch(leetcodeProblems) {
    console.log(`\n🔄 Converting ${leetcodeProblems.length} LeetCode problems to Codeforces format...\n`);
    
    const converted = leetcodeProblems.map((problem, index) => {
      console.log(`[${index + 1}/${leetcodeProblems.length}] ${problem.title}`);
      return this.convert(problem);
    });
    
    console.log(`\n✅ Converted ${converted.length} problems successfully!\n`);
    
    return converted;
  }
}

module.exports = LeetCodeToCodeforcesConverter;
