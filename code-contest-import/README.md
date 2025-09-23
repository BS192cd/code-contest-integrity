# CodeContest Pro

A modern, full-featured coding contest platform with plagiarism detection, real-time leaderboards, and comprehensive analytics.

## 🏗️ **Architecture**

- **Frontend**: Next.js 14 with React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, MongoDB, WebSocket support
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with bcrypt password hashing
- **Code Execution**: Judge0 API integration with mock fallback
- **Plagiarism Detection**: JPlag API with intelligent similarity analysis
- **Real-time Features**: Socket.io for live leaderboards and updates

## 🔑 **Required Secrets**

Configure these secrets in your Replit environment for production deployment:

| Secret | Description | Required |
|--------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | ✅ **Required** |
| `JWT_SECRET` | Secret key for JWT token signing/verification | ✅ **Required** |
| `JUDGE0_API_KEY` | Judge0 RapidAPI key for code execution | ⚠️ Optional (uses mock mode if missing) |
| `JPLAG_API_KEY` | JPlag API key for plagiarism detection | ⚠️ Optional (uses mock mode if missing) |

### **Setting Up Secrets in Replit**

1. Open your Replit project
2. Click on "Secrets" in the left sidebar
3. Add each required secret with its value:
   - **MONGO_URI**: Your MongoDB Atlas connection string
   - **JWT_SECRET**: Generate using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - **JUDGE0_API_KEY**: Your RapidAPI Judge0 key (optional)
   - **JPLAG_API_KEY**: Your JPlag API key (optional)

## 🚀 **Running in Production**

### **Automatic Startup**
The platform is configured to run automatically in Replit:

- **Frontend**: Next.js development server on port 5000
- **Backend**: Express API server on port 3001

### **Manual Startup**

1. **Frontend (Port 5000)**:
   ```bash
   npm run dev
   ```

2. **Backend (Port 3001)**:
   ```bash
   cd backend && npm start
   ```

### **Production Mode**

For full production deployment, ensure:
- All required secrets are configured in Replit Secrets
- `NODE_ENV=production` is set
- MongoDB connection is established
- API keys are provided for external services

## 🎯 **Features**

### **Core Functionality**
- ✅ Student and teacher authentication flows
- ✅ Contest creation and management
- ✅ Real-time code editor with syntax highlighting
- ✅ Automated code testing and execution
- ✅ Live leaderboards with WebSocket updates
- ✅ Comprehensive analytics dashboard

### **Advanced Features**
- ✅ Plagiarism detection with similarity analysis
- ✅ Multi-language support (Python, Java, C++, JavaScript)
- ✅ File upload and management
- ✅ Performance metrics and progress tracking
- ✅ Real-time contest monitoring

## 🔧 **Development vs Production**

### **Development Mode**
- Uses mock services when API keys are missing
- Graceful fallback for database connection issues
- Verbose logging for debugging
- Hot reloading for rapid development

### **Production Mode**
- Real Judge0 API for code execution
- Real JPlag API for plagiarism detection
- Production-optimized logging
- Secure environment variable handling

## 🛡️ **Security Features**

- JWT-based authentication with secure token handling
- Rate limiting on API endpoints
- CORS configuration for cross-origin requests
- Helmet.js security headers
- Input validation and sanitization
- Secure file upload handling

## 📊 **API Endpoints**

| Endpoint | Description |
|----------|-------------|
| `/api/auth` | Authentication (login, register, refresh) |
| `/api/contests` | Contest CRUD operations |
| `/api/problems` | Problem management |
| `/api/submissions` | Code submission and execution |
| `/api/leaderboard` | Contest rankings and scores |
| `/api/analytics` | Performance and usage analytics |
| `/api/plagiarism` | Plagiarism detection and analysis |
| `/api/upload` | File upload handling |

## 🔄 **Mock Mode**

When API keys are not provided, the platform automatically switches to mock mode:

- **Judge0 Mock**: Simulates code execution results with realistic responses
- **Plagiarism Mock**: Generates intelligent similarity scores based on code analysis
- **Database Mock**: Graceful fallback when MongoDB is unavailable

This allows immediate testing and development without external service costs.

## 🚀 **Deployment**

The platform is configured for **VM deployment** on Replit, suitable for:
- Continuous operation with WebSocket support
- Real-time features and background processing
- Persistent file storage and uploads
- Production-grade performance

## 📁 **Project Structure**

```
├── app/                 # Next.js App Router pages and API routes
├── components/          # Reusable React components and UI primitives
├── contexts/           # React context providers (auth, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and shared logic
├── public/             # Static assets
├── backend/            # Express.js API server
│   ├── config/         # Database and service configurations
│   ├── controllers/    # API route handlers
│   ├── middleware/     # Authentication and validation
│   ├── models/         # MongoDB/Mongoose models
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic (Judge0, plagiarism, etc.)
│   ├── sockets/        # WebSocket handlers
│   └── utils/          # Backend utilities
└── styles/             # Global CSS styles
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 **License**

MIT License - see LICENSE file for details.

---

**Built with ❤️ for educational excellence and academic integrity.**