# Quick Reference Guide

## 🚀 Getting Started

### Start the Application
```bash
# Start both frontend and backend
npm run dev          # Frontend (port 5000)
cd backend && npm run dev  # Backend (port 3000)

# Or use the quick start script
START.bat
```

### Access the Application
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3000
- **MongoDB**: Atlas Cloud (configured in .env)

---

## 📂 Key Directories

### Frontend Structure
```
app/
├── auth/              # Login & Signup
├── dashboard/         # Student dashboard
├── problems/          # Problem browsing & solving
└── teacher/           # Teacher portal (40 pages)
    ├── dashboard/     # Overview
    ├── problems/      # Problem management
    ├── classes/       # Class management
    ├── students/      # Student management
    └── contests/      # Contest management
```

### Backend Structure
```
backend/
├── models/            # Database schemas (8 models)
├── controllers/       # Business logic (8 controllers)
├── routes/            # API endpoints (12 route files)
├── services/          # External services (15 services)
├── middleware/        # Auth, validation, logging (4 files)
└── scripts/           # Utilities & seeders (12 scripts)
```

---

## 🔑 Important Files

### Configuration
- `package.json` - Dependencies and scripts
- `.env.local` - Frontend environment variables
- `backend/.env` - Backend environment variables
- `docker-compose.yml` - Judge0 setup

### Entry Points
- `app/page.tsx` - Landing page
- `backend/server.js` - Backend server
- `lib/api-client.ts` - API client

### Core Components
- `components/LatexEditor.tsx` - Math equation editor
- `components/CodeEditor.tsx` - Code editor
- `components/ProtectedRoute.tsx` - Route protection

---

## 🎯 Key Features & Files

### 1. Problem Management
**Files**: `app/teacher/problems/create/page.tsx`
- Create problems with LaTeX support
- AI-powered test case generation (Gemini)
- Bulk file upload for test cases
- Multi-language templates

### 2. Code Execution
**Files**: `backend/services/judge0Service.js`
- Supports 5 languages
- Real-time execution
- Multiple test cases
- Time/memory limits

### 3. AI Test Generation
**Files**: 
- `backend/services/geminiTestCaseService.js`
- `backend/routes/geminiTestCases.js`
- Generates edge cases, stress tests, adversarial cases

### 4. User Authentication
**Files**: 
- `backend/middleware/auth.js`
- `contexts/AuthContext.tsx`
- JWT-based authentication
- Role-based access control

---

## 📊 Database Models

1. **User** - Authentication & roles
2. **Problem** - Problem details & test cases
3. **Submission** - Code submissions & results
4. **Class** - Class/course management
5. **Contest** - Contest configuration
6. **Student** - Student profiles
7. **Teacher** - Teacher profiles
8. **ActivityLog** - User activity tracking

---

## 🛠️ Useful Scripts

### Database Seeding
```bash
# Seed problems from LeetCode
cd backend/scripts
python seed_leetcode.py

# Seed problems from Codeforces
python seed_problems.py

# Run custom seeder
node runSeeder.js
```

### Problem Scraping
```bash
# Scrape LeetCode problems
python scrape_leetcode_complete.py

# Scrape Codeforces problems
python scrape_codeforces_full.py
```

### Test Case Generation
```bash
# Generate test cases for a problem
node generateTestCases.js

# Analyze existing test cases
node analyzeExistingTestCases.js
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user

### Problems
- `GET /api/problems` - List all problems
- `GET /api/problems/:id` - Get problem details
- `POST /api/problems` - Create problem (teacher)
- `PUT /api/problems/:id` - Update problem (teacher)
- `DELETE /api/problems/:id` - Delete problem (teacher)

### Submissions
- `POST /api/submissions` - Submit code
- `GET /api/submissions/:id` - Get submission result
- `GET /api/submissions/user/:userId` - User submissions

### AI Test Cases
- `POST /api/gemini/generate-test-cases` - Generate test cases

### Classes
- `GET /api/classes` - List classes
- `POST /api/classes` - Create class (teacher)
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class (teacher)

### Contests
- `GET /api/contests` - List contests
- `POST /api/contests` - Create contest (teacher)
- `GET /api/contests/:id` - Get contest details

---

## 🎨 UI Components

### Core Components (10)
- `ProtectedRoute` - Authentication wrapper
- `LatexEditor` - Math equation editor
- `CodeEditor` - Monaco-based editor
- `LanguageSelector` - Language dropdown
- `TestCaseDisplay` - Test results viewer
- `ProblemDescription` - Problem renderer
- `SubmissionHistory` - Past submissions
- `dashboard-header` - Student header
- `teacher-header` - Teacher header
- `teacher-sidebar` - Teacher navigation

### UI Library (50)
Shadcn/UI components for consistent design:
- Buttons, Cards, Inputs, Textareas
- Selects, Dropdowns, Dialogs, Modals
- Tables, Tabs, Badges, Alerts
- Checkboxes, Radio buttons, Switches
- Toasts, Tooltips, Popovers
- And 35+ more primitives

---

## 🔧 Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_JUDGE0_URL=http://localhost:2358
```

### Backend (`backend/.env`)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
JUDGE0_API_URL=http://localhost:2358
PORT=3000
```

---

## 📦 Dependencies

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Monaco Editor
- KaTeX

### Backend
- Express
- Mongoose
- JWT
- Axios
- Bcrypt
- Cors

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Issues
- Check `MONGODB_URI` in `backend/.env`
- Verify network access in MongoDB Atlas
- Check IP whitelist

### Judge0 Not Working
```bash
# Start Judge0 with Docker
docker-compose up -d

# Check Judge0 status
curl http://localhost:2358/about
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## 📚 Documentation Files

1. **README.md** - Main project documentation
2. **PROJECT_STRUCTURE.md** - Detailed file structure
3. **QUICK_REFERENCE.md** - This file
4. **.kiro/specs/** - Project specifications

---

## 🎯 Common Tasks

### Add a New Problem
1. Go to Teacher Dashboard
2. Click "Problems" → "Add Problem"
3. Fill in details with LaTeX support
4. Add examples and test cases
5. Use AI generation or bulk upload
6. Save and publish

### Create a Contest
1. Go to Teacher Dashboard
2. Click "Contests" → "Create Contest"
3. Set duration and rules
4. Select problems
5. Assign to classes
6. Publish contest

### View Student Progress
1. Go to Teacher Dashboard
2. Click "Students"
3. Select a student
4. View submissions and analytics

---

**Last Updated**: November 25, 2025
**Version**: 1.0.0
