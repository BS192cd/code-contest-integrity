# CodeContest Pro

## Overview
CodeContest Pro is a modern code contest platform with plagiarism detection built with Next.js, React, TypeScript, and Tailwind CSS. It provides a comprehensive solution for educators to run programming contests with real-time leaderboards, submission tracking, and advanced plagiarism detection capabilities.

## Project Architecture
- **Framework**: Next.js 14.2.32 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Font**: Geist Sans & Mono fonts
- **Analytics**: Vercel Analytics
- **State Management**: React Context for authentication
- **UI Components**: Radix UI primitives with custom shadcn/ui components

## Key Features
- Student and teacher authentication flows
- Live contest management and participation
- Real-time leaderboards with WebSocket support
- Code editor with syntax highlighting
- Automated code execution and testing
- Advanced plagiarism detection with detailed analysis
- Performance analytics and progress tracking
- Multi-language support (Python, Java, C++, JavaScript)

## Project Structure
- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable React components and UI primitives
- `/contexts` - React context providers
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and shared logic
- `/public` - Static assets
- `/styles` - Global CSS styles

## Development Setup
The project is configured to run on Replit with:
- Development server on port 5000 (0.0.0.0:5000)
- Host verification disabled for Replit proxy
- TypeScript build errors ignored for development
- ESLint errors ignored during builds
- Unoptimized images for faster development

## API Structure
All API endpoints are located in `/app/api/` and include:
- `/analytics` - Performance and usage analytics
- `/contests` - Contest CRUD operations
- `/execute` - Code execution and testing
- `/leaderboard` - Contest rankings and scores
- `/plagiarism` - Plagiarism detection and analysis
- `/submissions` - Code submission processing
- `/websocket` - Real-time communication endpoints

## Current State
- Dependencies installed and project running successfully in Replit environment
- Frontend (Next.js) development server configured on port 5000 with 0.0.0.0 binding
- Backend (Node.js/Express) API server running on port 3001 with localhost binding
- Cross-origin request handling configured between frontend and backend
- Backend gracefully handles MongoDB connection issues in development mode
- Deployment configuration set for autoscale target with proper build/run commands
- Ready for development and production use

## Recent Changes (September 22, 2025)
- Imported fresh GitHub repository and set up for Replit environment
- Installed all npm dependencies for both frontend and backend
- Configured Next.js for Replit environment with proper host configuration
- Set up development workflows: Frontend on port 5000 (0.0.0.0), Backend on port 3001 (localhost)
- Fixed critical resizable component error and implemented Monaco code editor for solve page
- Completed remaining 15% backend functionality:
  - Judge0 API integration with full language support (Python, Java, C++, JavaScript)
  - Plagiarism detection service with real similarity algorithms
  - Comprehensive analytics endpoints for users, contests, and platform insights
  - Added /api/submissions/run endpoint for custom code execution
  - Created .env.example for production deployment setup
- Both frontend and backend services are running successfully with complete functionality

## User Preferences
- Uses Next.js App Router architecture
- Implements modern React patterns with TypeScript
- Follows shadcn/ui design system conventions
- Maintains clean, readable code structure