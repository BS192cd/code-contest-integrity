# Code Contest Platform

A comprehensive online coding platform for teachers and students with multi-language support, AI-powered test case generation, and real-time code execution.

## Quick Start

### Start Both Servers
```cmd
START.bat
```

This will:
1. Kill any existing Node processes
2. Start backend on port 3001
3. Start frontend on port 5000
4. Open two terminal windows (keep both open)

### Access the Platform
After 10 seconds, open: **http://localhost:5000**

## Manual Start

### Backend
```cmd
cd backend
npm start
```

### Frontend (in new terminal)
```cmd
npm run dev
```

## Features

### Problems
- 15 coding problems (6 original + 9 LeetCode)
- Multiple language support (Python, Java, JavaScript, C++, C)
- Real-time code execution
- Test case validation

### Supported Problems
1. Sum of Two Numbers
2. Even or Odd
3. Maximum of Three Numbers
4. Count Digits
5. Array Sum
6. Two Sum (LeetCode)
7. Palindrome Number (LeetCode)
8. Roman to Integer (LeetCode)
9. Longest Common Prefix (LeetCode)
10. Valid Parentheses (LeetCode)
11. Merge Two Sorted Lists (LeetCode)
12. Remove Duplicates from Sorted Array (LeetCode)
13. Remove Element (LeetCode)
14. Find the Index of the First Occurrence in a String (LeetCode)
15. Search Insert Position (LeetCode)

## How to Submit Solutions

### For LeetCode-Style Problems
Just write the Solution class:

```java
class Solution {
    public int searchInsert(int[] nums, int target) {
        // Your code here
        return result;
    }
}
```

The platform automatically handles input/output.

### For Original Problems
Write complete programs with input/output handling.

## Ports

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5000
- **API**: http://localhost:3001/api

## Troubleshooting

### Connection Errors
Make sure both servers are running. Check terminal windows.

### Port Already in Use
```cmd
taskkill /F /IM node.exe
START.bat
```

### Clear Browser Cache
Press `Ctrl+Shift+Delete` and clear all data.

## User Roles

### Student
- View and solve problems
- Submit solutions
- View submission history

### Teacher
- All student features
- Create/edit problems
- View all submissions
- Manage classes and contests

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Code Execution**: Judge0 API / Mock Judge

## Environment Variables

Create `backend/.env`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3001
```

## Support

For issues, check:
1. Both servers are running
2. MongoDB is connected
3. Browser cache is cleared
4. Correct ports (3001, 5000)
