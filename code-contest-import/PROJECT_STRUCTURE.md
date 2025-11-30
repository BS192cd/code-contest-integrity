# Code Contest Platform - Project Structure

## 📊 Project Statistics

- **Total Frontend Pages**: 46 TSX files
- **Total Components**: 60 TSX files
- **Total Backend Files**: 70 JS files
- **Total Scripts**: 12 files (Python + JS)

---

## 📁 Directory Structure

### 🎨 Frontend (`app/` - 46 files)

#### Authentication (2 files)
- `app/auth/signin/page.tsx` - Sign in page
- `app/auth/signup/page.tsx` - Sign up page with role selection

#### Student Dashboard (3 files)
- `app/dashboard/page.tsx` - Student dashboard
- `app/profile/page.tsx` - Student profile page
- `app/problems/page.tsx` - Browse problems list

#### Problem Solving (1 file)
- `app/problems/[id]/solve/page.tsx` - Code editor with multi-language support

#### Teacher Dashboard (40 files)

**Main Dashboard**
- `app/teacher/dashboard/page.tsx` - Teacher overview dashboard
- `app/teacher/profile/page.tsx` - Teacher profile management
- `app/teacher/alerts/page.tsx` - System alerts and notifications

**Problem Management (4 files)**
- `app/teacher/problems/page.tsx` - List all problems
- `app/teacher/problems/create/page.tsx` - Create new problem (with AI generation)
- `app/teacher/problems/[id]/edit/page.tsx` - Edit existing problem
- `app/teacher/problems/[id]/page.tsx` - View problem details

**Class Management (4 files)**
- `app/teacher/classes/page.tsx` - List all classes
- `app/teacher/classes/create/page.tsx` - Create new class
- `app/teacher/classes/[id]/page.tsx` - View class details
- `app/teacher/classes/[id]/edit/page.tsx` - Edit class

**Student Management (2 files)**
- `app/teacher/students/page.tsx` - List all students
- `app/teacher/students/[id]/page.tsx` - View student details

**Contest Management (4 files)**
- `app/teacher/contests/page.tsx` - List all contests
- `app/teacher/contests/create/page.tsx` - Create new contest
- `app/teacher/contests/[id]/page.tsx` - View contest details
- `app/teacher/contests/[id]/edit/page.tsx` - Edit contest

---

### 🧩 Components (`components/` - 60 files)

#### Core Components (10 files)
- `ProtectedRoute.tsx` - Route authentication wrapper
- `dashboard-header.tsx` - Student dashboard header
- `teacher-header.tsx` - Teacher dashboard header
- `teacher-sidebar.tsx` - Teacher navigation sidebar
- `LatexEditor.tsx` - Math equation editor (LaTeX support)
- `CodeEditor.tsx` - Monaco-based code editor
- `LanguageSelector.tsx` - Programming language dropdown
- `TestCaseDisplay.tsx` - Test case results viewer
- `ProblemDescription.tsx` - Problem statement renderer
- `SubmissionHistory.tsx` - Past submissions list

#### UI Components (`components/ui/` - 50 files)
Shadcn/UI components for consistent design:
- `button.tsx`, `card.tsx`, `input.tsx`, `textarea.tsx`
- `select.tsx`, `dropdown-menu.tsx`, `dialog.tsx`
- `table.tsx`, `tabs.tsx`, `badge.tsx`
- `alert.tsx`, `checkbox.tsx`, `radio-group.tsx`
- `toast.tsx`, `tooltip.tsx`, `popover.tsx`
- And 35+ more UI primitives

---

### ⚙️ Backend (`backend/` - 70 files)

#### Server Entry (1 file)
- `server.js` - Express server initialization

#### Configuration (2 files)
- `config/database.js` - MongoDB connection setup
- `.env` - Environment variables

#### Models (8 files)
- `models/User.js` - User authentication & roles
- `models/Problem.js` - Problem schema with test cases
- `models/Submission.js` - Code submission records
- `models/Class.js` - Class/course management
- `models/Contest.js` - Contest configuration
- `models/Student.js` - Student profile data
- `models/Teacher.js` - Teacher profile data
- `models/ActivityLog.js` - User activity tracking

#### Controllers (8 files)
- `controllers/authController.js` - Authentication logic
- `controllers/problemController.js` - Problem CRUD operations
- `controllers/submissionController.js` - Code submission handling
- `controllers/classController.js` - Class management
- `controllers/contestController.js` - Contest operations
- `controllers/studentController.js` - Student management
- `controllers/teacherController.js` - Teacher operations
- `controllers/llmTestCaseController.js` - AI test case generation

#### Routes (12 files)
- `routes/auth.js` - Authentication endpoints
- `routes/problems.js` - Problem endpoints
- `routes/submissions.js` - Submission endpoints
- `routes/classes.js` - Class endpoints
- `routes/contests.js` - Contest endpoints
- `routes/students.js` - Student endpoints
- `routes/teachers.js` - Teacher endpoints
- `routes/llmTestCases.js` - AI test case endpoints
- `routes/geminiTestCases.js` - Gemini AI integration
- `routes/judge0Status.js` - Judge0 health check
- `routes/profile.js` - User profile endpoints
- `routes/analytics.js` - Analytics endpoints

#### Services (15 files)

**Code Execution Services**
- `services/judge0Service.js` - Judge0 API integration (primary)
- `services/judge0FallbackService.js` - Fallback execution service
- `services/batchJudge0Service.js` - Batch submission processing
- `services/pistonService.js` - Piston API integration (backup)
- `services/codeWrapper.js` - Universal code wrapper generator
- `services/javaCodeWrapper.js` - Java-specific wrapper
- `services/genericMockJudge.js` - Mock judge for testing
- `services/smartMockJudge.js` - Smart mock with validation
- `services/enhancedJudge0Service.js` - Enhanced Judge0 features

**AI & Test Generation**
- `services/testCaseGenerator.js` - Test case generation logic
- `services/llmTestCaseService.js` - LLM-based test generation
- `services/geminiTestCaseService.js` - Google Gemini integration

**Utilities**
- `services/leetcodeToCodeforcesConverter.js` - Format converter
- `services/emailService.js` - Email notifications
- `services/analyticsService.js` - Usage analytics

#### Middleware (4 files)
- `middleware/auth.js` - JWT authentication
- `middleware/validation.js` - Request validation
- `middleware/errorHandler.js` - Global error handling
- `middleware/activityLogger.js` - Activity logging

#### Scripts (`backend/scripts/` - 12 files)

**Database Seeding**
- `runSeeder.js` - Main seeder runner
- `seed_problems.py` - Seed problems from database
- `seed_problems_api.py` - Seed via API calls
- `seed_leetcode.py` - Import LeetCode problems

**Problem Scrapers**
- `scrape_leetcode.py` - LeetCode problem scraper
- `scrape_leetcode_complete.py` - Complete LeetCode scraper
- `scrape_codeforces.py` - Codeforces problem scraper
- `scrape_codeforces_full.py` - Full Codeforces scraper

**Utilities**
- `generateTestCases.js` - Generate test cases for problems
- `analyzeExistingTestCases.js` - Analyze test case quality
- `directCheckMetadata.js` - Check problem metadata
- `.env.scraper.example` - Scraper environment template

---

### 📚 Libraries & Utilities

#### `lib/` (5 files)
- `api-client.ts` - Centralized API client
- `utils.ts` - Helper functions
- `auth.ts` - Authentication utilities
- `constants.ts` - App constants
- `validators.ts` - Form validators

#### `contexts/` (3 files)
- `AuthContext.tsx` - Authentication state
- `ThemeContext.tsx` - Theme management
- `ToastContext.tsx` - Toast notifications

#### `hooks/` (8 files)
- `useAuth.ts` - Authentication hook
- `useProblems.ts` - Problem data hook
- `useSubmissions.ts` - Submission hook
- `useClasses.ts` - Class management hook
- `useContests.ts` - Contest hook
- `useStudents.ts` - Student data hook
- `useDebounce.ts` - Debounce utility
- `useLocalStorage.ts` - Local storage hook

---

### 🎨 Styling

#### `styles/` (3 files)
- `globals.css` - Global styles
- `editor.css` - Code editor styles
- `markdown.css` - Markdown rendering styles

---

### 📋 Configuration Files (Root - 15 files)

**Package Management**
- `package.json` - Dependencies and scripts
- `package-lock.json` - Locked dependencies

**TypeScript**
- `tsconfig.json` - TypeScript configuration
- `next-env.d.ts` - Next.js type definitions

**Next.js**
- `next.config.mjs` - Next.js configuration

**Styling**
- `tailwind.config.ts` - Tailwind CSS config
- `postcss.config.mjs` - PostCSS config
- `components.json` - Shadcn/UI config

**Docker**
- `docker-compose.yml` - Judge0 container setup

**Environment**
- `.env.local` - Frontend environment variables
- `backend/.env` - Backend environment variables

**Git**
- `.gitignore` - Git ignore rules

**Documentation**
- `README.md` - Project documentation
- `START.bat` - Quick start script

---

## 🔑 Key Features by File Count

### Frontend Pages (46 files)
- ✅ Authentication (2)
- ✅ Student Dashboard (4)
- ✅ Teacher Dashboard (40)
  - Problem Management (4)
  - Class Management (4)
  - Student Management (2)
  - Contest Management (4)
  - Analytics & Reports (3)

### Components (60 files)
- ✅ Core Components (10)
- ✅ UI Library (50)

### Backend (70 files)
- ✅ Models (8)
- ✅ Controllers (8)
- ✅ Routes (12)
- ✅ Services (15)
- ✅ Middleware (4)
- ✅ Scripts (12)
- ✅ Configuration (2)

### Scripts (12 files)
- ✅ Database Seeders (4)
- ✅ Problem Scrapers (4)
- ✅ Utilities (4)

---

## 🚀 Technology Stack

**Frontend**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Monaco Editor
- KaTeX (LaTeX)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Judge0 API
- Google Gemini AI

**DevOps**
- Docker (Judge0)
- Git

---

## 📊 File Distribution

```
Total Project Files: ~200 files

Frontend:     106 files (53%)
├─ Pages:      46 files
└─ Components: 60 files

Backend:       70 files (35%)
├─ Core:       58 files
└─ Scripts:    12 files

Config:        15 files (7%)
Docs:           1 file  (1%)
Utils:          8 files (4%)
```

---

## 🎯 Core Functionality

### Problem Management
- Create/Edit/Delete problems
- LaTeX math support
- Multi-language templates
- Test case management
- AI-powered test generation
- Bulk file upload

### Code Execution
- 5 languages (Python, Java, C++, JavaScript, C)
- Real-time execution
- Multiple test cases
- Time/memory limits
- Detailed error messages

### User Management
- Role-based access (Student/Teacher)
- Class enrollment
- Progress tracking
- Activity logging

### Contest System
- Timed contests
- Leaderboards
- Automatic grading
- Plagiarism detection

---

**Last Updated**: November 25, 2025
**Version**: 1.0.0
