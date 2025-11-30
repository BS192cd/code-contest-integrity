// Java Code Wrapper for Two Sum Problem
// This wraps student code with main method and I/O handling

class JavaCodeWrapper {
  /**
   * Wraps Java solution code with main method and I/O handling
   * @param {string} solutionCode - Student's Solution class code
   * @param {string} problemType - Type of problem (e.g., 'twoSum', 'generic')
   * @returns {string} Complete Java code ready to compile and run
   */
  static wrapTwoSum(solutionCode) {
    // Extract just the solution method if full class is provided
    const cleanCode = solutionCode.includes('class Solution') 
      ? solutionCode 
      : `class Solution {\n${solutionCode}\n}`;

    return `
import java.util.*;
import java.io.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
            
            // Read array (first line) - format: [2,7,11,15]
            String line1 = reader.readLine();
            if (line1 == null || line1.trim().isEmpty()) {
                System.out.println("[0,0]");
                return;
            }
            
            // Remove brackets and split by comma
            String arrayStr = line1.trim();
            if (arrayStr.startsWith("[")) {
                arrayStr = arrayStr.substring(1);
            }
            if (arrayStr.endsWith("]")) {
                arrayStr = arrayStr.substring(0, arrayStr.length() - 1);
            }
            
            String[] numsStr = arrayStr.split(",");
            int[] nums = new int[numsStr.length];
            for (int i = 0; i < numsStr.length; i++) {
                nums[i] = Integer.parseInt(numsStr[i].trim());
            }
            
            // Read target (second line)
            String line2 = reader.readLine();
            if (line2 == null || line2.trim().isEmpty()) {
                System.out.println("[0,0]");
                return;
            }
            int target = Integer.parseInt(line2.trim());
            
            // Call solution
            Solution solution = new Solution();
            int[] result = solution.twoSum(nums, target);
            
            // Print result in array format: [0,1]
            if (result != null && result.length >= 2) {
                System.out.println("[" + result[0] + "," + result[1] + "]");
            } else {
                System.out.println("[0,0]");
            }
            
            reader.close();
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.out.println("[0,0]");
        }
    }
}
`;
  }

  /**
   * Generic wrapper for problems that return a single value
   */
  static wrapGeneric(solutionCode, methodName, inputParsing, outputFormatting) {
    return `
import java.util.*;
import java.io.*;

${solutionCode}

public class Main {
    public static void main(String[] args) {
        try {
            Scanner scanner = new Scanner(System.in);
            ${inputParsing}
            Solution solution = new Solution();
            ${outputFormatting}
            scanner.close();
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
`;
  }

  /**
   * Detect problem type and wrap accordingly
   */
  static wrap(solutionCode, problemTitle = '') {
    const title = problemTitle.toLowerCase();
    
    if (title.includes('two sum')) {
      return this.wrapTwoSum(solutionCode);
    }
    
    // Default: return code as-is for now
    // Can add more problem-specific wrappers here
    return solutionCode;
  }
}

module.exports = JavaCodeWrapper;
