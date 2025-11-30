// Universal Code Wrapper for Two Sum Problem
// Wraps student code with I/O handling for all languages

class CodeWrapper {
  /**
   * Wrap code based on language and problem
   */
  static wrap(code, language, problemTitle = '') {
    const title = problemTitle.toLowerCase();
    
    // Special case: Two Sum (custom wrapper)
    if (title.includes('two sum')) {
      return this.wrapTwoSum(code, language);
    }
    
    // Search Insert Position
    if (title.includes('search insert')) {
      return this.wrapSearchInsert(code, language);
    }
    
    // Palindrome Number
    if (title.includes('palindrome number')) {
      return this.wrapPalindromeNumber(code, language);
    }
    
    // Roman to Integer
    if (title.includes('roman')) {
      return this.wrapRomanToInteger(code, language);
    }
    
    // Longest Common Prefix
    if (title.includes('longest common prefix')) {
      return this.wrapLongestCommonPrefix(code, language);
    }
    
    // Valid Parentheses
    if (title.includes('valid parentheses')) {
      return this.wrapValidParentheses(code, language);
    }
    
    // Generic case: Return code as-is (stdin/stdout approach)
    // Students write complete programs
    return code;
  }

  /**
   * Wrap Two Sum solution for any language
   */
  static wrapTwoSum(code, language) {
    switch (language.toLowerCase()) {
      case 'java':
        return this.wrapTwoSumJava(code);
      case 'python':
        return this.wrapTwoSumPython(code);
      case 'javascript':
        return this.wrapTwoSumJavaScript(code);
      case 'cpp':
      case 'c++':
        return this.wrapTwoSumCpp(code);
      case 'c':
        return this.wrapTwoSumC(code);
      default:
        return code;
    }
  }

  /**
   * Java wrapper for Two Sum
   */
  static wrapTwoSumJava(solutionCode) {
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
            
            // Read array: [2,7,11,15]
            String line1 = reader.readLine();
            if (line1 == null || line1.trim().isEmpty()) {
                System.out.println("[0,0]");
                return;
            }
            
            String arrayStr = line1.trim();
            if (arrayStr.startsWith("[")) arrayStr = arrayStr.substring(1);
            if (arrayStr.endsWith("]")) arrayStr = arrayStr.substring(0, arrayStr.length() - 1);
            
            String[] numsStr = arrayStr.split(",");
            int[] nums = new int[numsStr.length];
            for (int i = 0; i < numsStr.length; i++) {
                nums[i] = Integer.parseInt(numsStr[i].trim());
            }
            
            // Read target
            String line2 = reader.readLine();
            if (line2 == null || line2.trim().isEmpty()) {
                System.out.println("[0,0]");
                return;
            }
            int target = Integer.parseInt(line2.trim());
            
            // Call solution
            Solution solution = new Solution();
            int[] result = solution.twoSum(nums, target);
            
            // Print result: [0,1]
            if (result != null && result.length >= 2) {
                System.out.println("[" + result[0] + "," + result[1] + "]");
            } else {
                System.out.println("[0,0]");
            }
            
            reader.close();
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.out.println("[0,0]");
        }
    }
}
`;
  }

  /**
   * Python wrapper for Two Sum
   */
  static wrapTwoSumPython(solutionCode) {
    // Check if code already has the function definition
    const hasFunction = solutionCode.includes('def twoSum');
    const cleanCode = hasFunction ? solutionCode : `def twoSum(nums, target):\n    ${solutionCode}`;

    return `
import sys
import json

${cleanCode}

if __name__ == "__main__":
    try:
        # Read array: [2,7,11,15]
        line1 = input().strip()
        nums = json.loads(line1)
        
        # Read target
        line2 = input().strip()
        target = int(line2)
        
        # Call solution
        result = twoSum(nums, target)
        
        # Print result: [0,1]
        if result and len(result) >= 2:
            print(json.dumps(result))
        else:
            print("[0,0]")
    except Exception as e:
        print("[0,0]", file=sys.stderr)
        print(f"Error: {e}", file=sys.stderr)
`;
  }

  /**
   * JavaScript wrapper for Two Sum
   */
  static wrapTwoSumJavaScript(solutionCode) {
    // Check if code already has the function
    const hasFunction = solutionCode.includes('function twoSum') || solutionCode.includes('const twoSum') || solutionCode.includes('var twoSum');
    const cleanCode = hasFunction ? solutionCode : `function twoSum(nums, target) {\n${solutionCode}\n}`;

    return `
${cleanCode}

// Read input using fs (more reliable than readline for Judge0)
const fs = require('fs');
try {
    const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
    const lines = input.split('\\n');
    
    // Parse array: [2,7,11,15]
    const nums = JSON.parse(lines[0]);
    
    // Parse target
    const target = parseInt(lines[1]);
    
    // Call solution
    const result = twoSum(nums, target);
    
    // Print result: [0,1]
    if (result && result.length >= 2) {
        console.log(JSON.stringify(result));
    } else {
        console.log("[0,0]");
    }
} catch (e) {
    console.error("Error:", e.message);
    console.log("[0,0]");
}
`;
  }

  /**
   * C++ wrapper for Two Sum
   */
  static wrapTwoSumCpp(solutionCode) {
    // Check if code has the class/function
    const hasClass = solutionCode.includes('class Solution');
    const cleanCode = hasClass ? solutionCode : `
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        ${solutionCode}
    }
};`;

    return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

${cleanCode}

int main() {
    try {
        string line;
        
        // Read array: [2,7,11,15]
        getline(cin, line);
        
        // Remove brackets
        if (line[0] == '[') line = line.substr(1);
        if (line[line.length()-1] == ']') line = line.substr(0, line.length()-1);
        
        // Parse array
        vector<int> nums;
        stringstream ss(line);
        string token;
        while (getline(ss, token, ',')) {
            nums.push_back(stoi(token));
        }
        
        // Read target
        int target;
        cin >> target;
        
        // Call solution
        Solution solution;
        vector<int> result = solution.twoSum(nums, target);
        
        // Print result: [0,1]
        if (result.size() >= 2) {
            cout << "[" << result[0] << "," << result[1] << "]" << endl;
        } else {
            cout << "[0,0]" << endl;
        }
        
    } catch (exception& e) {
        cerr << "Error: " << e.what() << endl;
        cout << "[0,0]" << endl;
    }
    
    return 0;
}
`;
  }

  /**
   * C wrapper for Two Sum
   */
  static wrapTwoSumC(solutionCode) {
    return `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${solutionCode}

int main() {
    char line[1000];
    int nums[1000];
    int numsSize = 0;
    
    // Read array: [2,7,11,15]
    if (fgets(line, sizeof(line), stdin) == NULL) {
        printf("[0,0]\\n");
        return 0;
    }
    
    // Remove brackets and parse
    char* ptr = line;
    if (*ptr == '[') ptr++;
    
    char* token = strtok(ptr, ",]");
    while (token != NULL && numsSize < 1000) {
        nums[numsSize++] = atoi(token);
        token = strtok(NULL, ",]");
    }
    
    // Read target
    int target;
    if (scanf("%d", &target) != 1) {
        printf("[0,0]\\n");
        return 0;
    }
    
    // Call solution
    int returnSize;
    int* result = twoSum(nums, numsSize, target, &returnSize);
    
    // Print result: [0,1]
    if (result != NULL && returnSize >= 2) {
        printf("[%d,%d]\\n", result[0], result[1]);
        free(result);
    } else {
        printf("[0,0]\\n");
    }
    
    return 0;
}
`;
  }
  /**
   * Reverse String wrapper - Input: ["h","e","l","l","o"], Output: ["o","l","l","e","h"]
   */
  static wrapReverseString(code, language) {
    switch (language.toLowerCase()) {
      case 'java':
        return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            String input = sc.nextLine().trim();
            input = input.substring(1, input.length() - 1);
            String[] parts = input.split(",");
            char[] s = new char[parts.length];
            for (int i = 0; i < parts.length; i++) {
                s[i] = parts[i].replace("\\"", "").trim().charAt(0);
            }
            
            Solution solution = new Solution();
            solution.reverseString(s);
            
            System.out.print("[");
            for (int i = 0; i < s.length; i++) {
                System.out.print("\\"" + s[i] + "\\"");
                if (i < s.length - 1) System.out.print(",");
            }
            System.out.println("]");
        } catch (Exception e) {
            System.out.println("[]");
        }
    }
}`;
      case 'python':
        return `
import json

${cleanCode}

if __name__ == "__main__":
    s = json.loads(input().strip())
    reverseString(s)
    print(json.dumps(s))`;
      case 'javascript':
        return `
${cleanCode}

const input = require('fs').readFileSync(0, 'utf8').trim();
const s = JSON.parse(input);
reverseString(s);
console.log(JSON.stringify(s));`;
      case 'cpp':
        return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

${cleanCode}

int main() {
    string line;
    getline(cin, line);
    line = line.substr(1, line.length() - 2);
    
    vector<string> s;
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {
        token.erase(remove(token.begin(), token.end(), '"'), token.end());
        token.erase(remove(token.begin(), token.end(), ' '), token.end());
        s.push_back(token);
    }
    
    Solution solution;
    solution.reverseString(s);
    
    cout << "[";
    for (int i = 0; i < s.size(); i++) {
        cout << "\\"" << s[i] << "\\"";
        if (i < s.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    return 0;
}`;
      default:
        return code;
    }
  }

  /**
   * Valid Parentheses wrapper - Input: "()", Output: true/false
   */
  static wrapValidParentheses(code, language) {
    const cleanCode = code.includes('class Solution') ? code : `class Solution {\n${code}\n}`;
    
    switch (language.toLowerCase()) {
      case 'java':
        return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine().replace("\\"", "");
        Solution solution = new Solution();
        boolean result = solution.isValid(input);
        System.out.println(result);
    }
}`;
      case 'python':
        return `
${cleanCode}

if __name__ == "__main__":
    s = input().strip().replace('"', '')
    result = isValid(s)
    print(str(result).lower())`;
      case 'javascript':
        return `
${cleanCode}

const input = require('fs').readFileSync(0, 'utf8').trim().replace(/"/g, '');
const result = isValid(input);
console.log(result);`;
      case 'cpp':
        return `
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

${cleanCode}

int main() {
    string input;
    getline(cin, input);
    input.erase(remove(input.begin(), input.end(), '"'), input.end());
    
    Solution solution;
    bool result = solution.isValid(input);
    cout << (result ? "true" : "false") << endl;
    return 0;
}`;
      default:
        return code;
    }
  }

  /**
   * Maximum Subarray wrapper - Input: [-2,1,-3,4], Output: 6
   */
  static wrapMaximumSubarray(code, language) {
    const cleanCode = code.includes('class Solution') ? code : `class Solution {\n${code}\n}`;
    
    switch (language.toLowerCase()) {
      case 'java':
        return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        line = line.substring(1, line.length() - 1);
        String[] parts = line.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        Solution solution = new Solution();
        int result = solution.maxSubArray(nums);
        System.out.println(result);
    }
}`;
      case 'python':
        return `
import json

${cleanCode}

if __name__ == "__main__":
    nums = json.loads(input().strip())
    result = maxSubArray(nums)
    print(result)`;
      case 'javascript':
        return `
${cleanCode}

const input = require('fs').readFileSync(0, 'utf8').trim();
const nums = JSON.parse(input);
const result = maxSubArray(nums);
console.log(result);`;
      case 'cpp':
        return `
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

${cleanCode}

int main() {
    string line;
    getline(cin, line);
    line = line.substr(1, line.length() - 2);
    
    vector<int> nums;
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {
        nums.push_back(stoi(token));
    }
    
    Solution solution;
    int result = solution.maxSubArray(nums);
    cout << result << endl;
    return 0;
}`;
      default:
        return code;
    }
  }

  /**
   * Merge Two Sorted Lists wrapper - Input: [1,2,4]\\n[1,3,4], Output: [1,1,2,3,4,4]
   */
  static wrapMergeSortedLists(code, language) {
    const cleanCode = code.includes('class Solution') ? code : `class Solution {\n${code}\n}`;
    
    switch (language.toLowerCase()) {
      case 'java':
        return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line1 = sc.nextLine().trim();
        String line2 = sc.nextLine().trim();
        
        int[] list1 = parseArray(line1);
        int[] list2 = parseArray(line2);
        
        Solution solution = new Solution();
        int[] result = solution.merge(list1, list2);
        
        System.out.print("[");
        for (int i = 0; i < result.length; i++) {
            System.out.print(result[i]);
            if (i < result.length - 1) System.out.print(",");
        }
        System.out.println("]");
    }
    
    static int[] parseArray(String s) {
        if (s.equals("[]")) return new int[0];
        s = s.substring(1, s.length() - 1);
        String[] parts = s.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i].trim());
        }
        return arr;
    }
}`;
      case 'python':
        return `
import json

${cleanCode}

if __name__ == "__main__":
    list1 = json.loads(input().strip())
    list2 = json.loads(input().strip())
    result = merge(list1, list2)
    print(json.dumps(result))`;
      case 'javascript':
        return `
${cleanCode}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const list1 = JSON.parse(lines[0]);
const list2 = JSON.parse(lines[1]);
const result = merge(list1, list2);
console.log(JSON.stringify(result));`;
      case 'cpp':
        return `
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

${cleanCode}

vector<int> parseArray(string s) {
    vector<int> arr;
    if (s == "[]") return arr;
    s = s.substr(1, s.length() - 2);
    stringstream ss(s);
    string token;
    while (getline(ss, token, ',')) {
        arr.push_back(stoi(token));
    }
    return arr;
}

int main() {
    string line1, line2;
    getline(cin, line1);
    getline(cin, line2);
    
    vector<int> list1 = parseArray(line1);
    vector<int> list2 = parseArray(line2);
    
    Solution solution;
    vector<int> result = solution.merge(list1, list2);
    
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    return 0;
}`;
      default:
        return code;
    }
  }

  /**
   * Best Time to Buy and Sell Stock wrapper - Input: [7,1,5,3,6,4], Output: 5
   */
  static wrapBestTimeToBuyStock(code, language) {
    return this.wrapMaximumSubarray(code, language).replace(/maxSubArray/g, 'maxProfit');
  }

  /**
   * Contains Duplicate wrapper - Input: [1,2,3,1], Output: true
   */
  static wrapContainsDuplicate(code, language) {
    const cleanCode = code.includes('class Solution') ? code : `class Solution {\n${code}\n}`;
    
    switch (language.toLowerCase()) {
      case 'java':
        return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        line = line.substring(1, line.length() - 1);
        String[] parts = line.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        Solution solution = new Solution();
        boolean result = solution.containsDuplicate(nums);
        System.out.println(result);
    }
}`;
      case 'python':
        return `
import json

${cleanCode}

if __name__ == "__main__":
    nums = json.loads(input().strip())
    result = containsDuplicate(nums)
    print(str(result).lower())`;
      case 'javascript':
        return `
${cleanCode}

const input = require('fs').readFileSync(0, 'utf8').trim();
const nums = JSON.parse(input);
const result = containsDuplicate(nums);
console.log(result);`;
      case 'cpp':
        return `
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

${cleanCode}

int main() {
    string line;
    getline(cin, line);
    line = line.substr(1, line.length() - 2);
    
    vector<int> nums;
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {
        nums.push_back(stoi(token));
    }
    
    Solution solution;
    bool result = solution.containsDuplicate(nums);
    cout << (result ? "true" : "false") << endl;
    return 0;
}`;
      default:
        return code;
    }
  }

  /**
   * Missing Number wrapper - Input: [3,0,1], Output: 2
   */
  static wrapMissingNumber(code, language) {
    return this.wrapMaximumSubarray(code, language).replace(/maxSubArray/g, 'missingNumber');
  }

  /**
   * Single Number wrapper - Input: [2,2,1], Output: 1
   */
  static wrapSingleNumber(code, language) {
    return this.wrapMaximumSubarray(code, language).replace(/maxSubArray/g, 'singleNumber');
  }

  /**
   * Climbing Stairs wrapper - Input: 2, Output: 2
   */
  static wrapClimbingStairs(code, language) {
    const cleanCode = code.includes('class Solution') ? code : `class Solution {\n${code}\n}`;
    
    switch (language.toLowerCase()) {
      case 'java':
        return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Solution solution = new Solution();
        int result = solution.climbStairs(n);
        System.out.println(result);
    }
}`;
      case 'python':
        return `
${cleanCode}

if __name__ == "__main__":
    n = int(input().strip())
    result = climbStairs(n)
    print(result)`;
      case 'javascript':
        return `
${cleanCode}

const n = parseInt(require('fs').readFileSync(0, 'utf8').trim());
const result = climbStairs(n);
console.log(result);`;
      case 'cpp':
        return `
#include <iostream>
using namespace std;

${cleanCode}

int main() {
    int n;
    cin >> n;
    Solution solution;
    int result = solution.climbStairs(n);
    cout << result << endl;
    return 0;
}`;
      default:
        return code;
    }
  }

  /**
   * Palindrome Number wrapper - Input: 121, Output: true
   */
  static wrapPalindromeNumber(code, language) {
    const cleanCode = code.includes('class Solution') ? code : `class Solution {\n${code}\n}`;
    
    switch (language.toLowerCase()) {
      case 'java':
        return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        Solution solution = new Solution();
        boolean result = solution.isPalindrome(x);
        System.out.println(result);
    }
}`;
      case 'python':
        return `
${cleanCode}

if __name__ == "__main__":
    x = int(input().strip())
    result = isPalindrome(x)
    print(str(result).lower())`;
      case 'javascript':
        return `
${cleanCode}

const x = parseInt(require('fs').readFileSync(0, 'utf8').trim());
const result = isPalindrome(x);
console.log(result);`;
      case 'cpp':
        return `
#include <iostream>
using namespace std;

${cleanCode}

int main() {
    int x;
    cin >> x;
    Solution solution;
    bool result = solution.isPalindrome(x);
    cout << (result ? "true" : "false") << endl;
    return 0;
}`;
      default:
        return code;
    }
  }

  /**
   * Search Insert Position wrapper - Input: [1,3,5,6]\n5, Output: 2
   */
  static wrapSearchInsert(code, language) {
    const cleanCode = code.includes('class Solution') ? code : `class Solution {\n${code}\n}`;
    
    switch (language.toLowerCase()) {
      case 'java':
        return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            String line = sc.nextLine().trim();
            
            // Parse array: [1,3,5,6]
            line = line.substring(1, line.length() - 1);
            String[] parts = line.split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                nums[i] = Integer.parseInt(parts[i].trim());
            }
            
            // Read target
            int target = sc.nextInt();
            
            // Call solution
            Solution solution = new Solution();
            int result = solution.searchInsert(nums, target);
            System.out.println(result);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.out.println(0);
        }
    }
}`;
      case 'python':
        return `
import json

${cleanCode}

if __name__ == "__main__":
    nums = json.loads(input().strip())
    target = int(input().strip())
    result = searchInsert(nums, target)
    print(result)`;
      case 'javascript':
        return `
${cleanCode}

const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const nums = JSON.parse(lines[0]);
const target = parseInt(lines[1]);
const result = searchInsert(nums, target);
console.log(result);`;
      case 'cpp':
        return `
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

${cleanCode}

int main() {
    string line;
    getline(cin, line);
    line = line.substr(1, line.length() - 2);
    
    vector<int> nums;
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {
        nums.push_back(stoi(token));
    }
    
    int target;
    cin >> target;
    
    Solution solution;
    int result = solution.searchInsert(nums, target);
    cout << result << endl;
    return 0;
}`;
      default:
        return code;
    }
  }

  /**
   * Roman to Integer wrapper - Input: III, Output: 3
   */
  static wrapRomanToInteger(code, language) {
    const cleanCode = code.includes('class Solution') ? code : `class Solution {\n${code}\n}`;
    
    switch (language.toLowerCase()) {
      case 'java':
        return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().trim();
        Solution solution = new Solution();
        int result = solution.romanToInt(s);
        System.out.println(result);
    }
}`;
      case 'python':
        return `
${cleanCode}

if __name__ == "__main__":
    s = input().strip()
    result = romanToInt(s)
    print(result)`;
      case 'javascript':
        return `
${cleanCode}

const s = require('fs').readFileSync(0, 'utf8').trim();
const result = romanToInt(s);
console.log(result);`;
      case 'cpp':
        return `
#include <iostream>
#include <string>
using namespace std;

${cleanCode}

int main() {
    string s;
    cin >> s;
    Solution solution;
    int result = solution.romanToInt(s);
    cout << result << endl;
    return 0;
}`;
      default:
        return code;
    }
  }

  /**
   * Longest Common Prefix wrapper - Input: ["flower","flow","flight"], Output: "fl"
   */
  static wrapLongestCommonPrefix(code, language) {
    const cleanCode = code.includes('class Solution') ? code : `class Solution {\n${code}\n}`;
    
    switch (language.toLowerCase()) {
      case 'java':
        return `
import java.util.*;

${cleanCode}

public class Main {
    public static void main(String[] args) {
        try {
            Scanner sc = new Scanner(System.in);
            String line = sc.nextLine().trim();
            
            // Parse array: ["flower","flow","flight"]
            line = line.substring(1, line.length() - 1);
            String[] strs = line.split(",");
            for (int i = 0; i < strs.length; i++) {
                strs[i] = strs[i].trim().replace("\\"", "");
            }
            
            Solution solution = new Solution();
            String result = solution.longestCommonPrefix(strs);
            System.out.println("\\"" + result + "\\"");
        } catch (Exception e) {
            System.out.println("\\"\\"");
        }
    }
}`;
      case 'python':
        return `
import json

${cleanCode}

if __name__ == "__main__":
    strs = json.loads(input().strip())
    result = longestCommonPrefix(strs)
    print(json.dumps(result))`;
      case 'javascript':
        return `
${cleanCode}

const strs = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());
const result = longestCommonPrefix(strs);
console.log(JSON.stringify(result));`;
      case 'cpp':
        return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

${cleanCode}

int main() {
    string line;
    getline(cin, line);
    line = line.substr(1, line.length() - 2);
    
    vector<string> strs;
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {
        token.erase(remove(token.begin(), token.end(), '"'), token.end());
        token.erase(remove(token.begin(), token.end(), ' '), token.end());
        strs.push_back(token);
    }
    
    Solution solution;
    string result = solution.longestCommonPrefix(strs);
    cout << "\\"" << result << "\\"" << endl;
    return 0;
}`;
      default:
        return code;
    }
  }
}

module.exports = CodeWrapper;
