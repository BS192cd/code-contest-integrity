# Design Document

## Overview

The CodeContest Pro deployment design focuses on configuring and deploying the existing production-ready full-stack coding contest platform on Replit. The system consists of the current Next.js frontend (preserving all existing components and UI), Express.js backend, MongoDB database, and integrations with Judge0 and JPlag APIs. The deployment strategy emphasizes configuration and environment setup without modifying the existing frontend structure or appearance.

## Architecture

### System Components

```mermaid
graph TB
    subgraph "Replit Environment"
        subgraph "Frontend (Port 5000)"
            FE[Next.js App]
            UI[React Components]
            WS[WebSocket Client]
        end
        
        subgraph "Backend (Port 3001)"
            API[Express API Server]
            AUTH[JWT Authentication]
            SOCKET[Socket.io Server]
        end
        
        subgraph "External Services"
            MONGO[(MongoDB Atlas)]
            JUDGE0[Judge0 API]
            JPLAG[JPlag API]
        end
        
        subgraph "Configuration"
            ENV[Environment Variables]
            SECRETS[Replit Secrets]
        end
    end
    
    FE --> API
    API --> MONGO
    API --> JUDGE0
    API --> JPLAG
    WS <--> SOCKET
    ENV --> API
    SECRETS --> API
```

### Deployment Flow

1. **Environment Setup**: Configure Replit secrets and environment variables
2. **Database Connection**: Establish MongoDB Atlas connection with provided URI
3. **Service Installation**: Install dependencies for both frontend and backend
4. **Parallel Startup**: Launch both services simultaneously using .replit configuration
5. **Verification**: Test all platform features and integrations

## Components and Interfaces

### Environment Configuration Component

**Purpose**: Manage all environment variables and secrets required for platform operation

**Configuration Structure**:
```javascript
const config = {
  // Required secrets
  MONGO_URI: "mongodb+srv://mominsaqibahmed_db_user:0ZSgAE2EoK2TUUa9@cluster0.a7egmzf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  JWT_SECRET: "76d0f78f98babfddf8d7999549655e0068eafd96b6e7633ee5ac3c6c7bc5d5c8",
  
  // Optional API keys
  JPLAG_API_KEY: "3fb6864d20mshcb252355922e5a3p1c2bacjsnf7f0a33f97e1",
  JUDGE0_API_KEY: undefined, // Will use mock mode
  
  // Runtime configuration
  NODE_ENV: "production",
  FRONTEND_PORT: 5000,
  BACKEND_PORT: 3001
}
```

### Database Setup Component

**Purpose**: Initialize MongoDB connection and ensure required collections exist

**Collections Schema**:
- `users`: User authentication and profile data
- `contests`: Contest metadata, timing, and configuration
- `problems`: Problem statements, test cases, and constraints
- `submissions`: Code submissions, results, and scoring data

**Connection Strategy**:
- Primary: MongoDB Atlas with provided connection string
- Fallback: Mock mode for development/testing scenarios
- Validation: Test connection before service startup

### Service Orchestration Component

**Purpose**: Coordinate startup and management of existing frontend and backend services

**Important**: The existing frontend structure, components, and UI design will be preserved exactly as-is. No modifications to the web app appearance or component structure.

**Startup Sequence**:
1. Validate environment configuration
2. Test database connectivity
3. Install frontend dependencies (`npm install`) - preserving existing package.json
4. Install backend dependencies (`cd backend && npm install`) - preserving existing backend structure
5. Start backend service on port 3001 using existing server configuration
6. Start frontend service on port 5000 using existing Next.js setup
7. Verify both services are responding with existing endpoints

### API Integration Component

**Purpose**: Manage external service integrations with proper fallback mechanisms

**Judge0 Integration**:
- Status: Mock mode (no API key provided)
- Fallback: Simulate code execution with realistic responses
- Languages: Python, Java, C++, JavaScript support

**JPlag Integration**:
- Status: Production mode (API key provided)
- Functionality: Real plagiarism detection and similarity analysis
- Fallback: Mock similarity scores if API fails

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  role: String, // 'student' | 'teacher'
  createdAt: Date,
  profile: {
    firstName: String,
    lastName: String,
    institution: String
  }
}
```

### Contest Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  startTime: Date,
  endTime: Date,
  createdBy: ObjectId, // teacher user
  problems: [ObjectId], // references to problems
  participants: [ObjectId], // references to users
  settings: {
    allowLateSubmissions: Boolean,
    showLeaderboard: Boolean,
    plagiarismDetection: Boolean
  }
}
```

### Problem Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  difficulty: String, // 'easy' | 'medium' | 'hard'
  timeLimit: Number, // in seconds
  memoryLimit: Number, // in MB
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: Boolean
  }],
  supportedLanguages: [String]
}
```

### Submission Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  contestId: ObjectId,
  problemId: ObjectId,
  code: String,
  language: String,
  status: String, // 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'error'
  score: Number,
  executionTime: Number,
  memoryUsed: Number,
  submittedAt: Date,
  results: [{
    testCase: Number,
    status: String,
    output: String,
    error: String
  }]
}
```

## Error Handling

### Database Connection Errors
- **Strategy**: Graceful degradation to mock mode
- **Implementation**: Connection timeout with retry logic
- **User Experience**: Clear messaging about service availability

### API Service Failures
- **Judge0 Fallback**: Mock execution engine with realistic responses
- **JPlag Fallback**: Algorithmic similarity detection using code analysis
- **Monitoring**: Log all API failures for debugging

### Runtime Errors
- **Frontend**: Error boundaries with user-friendly messages
- **Backend**: Comprehensive error middleware with proper HTTP status codes
- **Logging**: Winston logger for production error tracking

## Testing Strategy

### Deployment Verification Tests

1. **Environment Configuration Test**
   - Verify all required secrets are accessible
   - Validate database connection string format
   - Test JWT secret generation and validation

2. **Service Startup Test**
   - Confirm backend starts on port 3001
   - Confirm frontend starts on port 5000
   - Verify both services respond to health checks

3. **Database Integration Test**
   - Test MongoDB connection establishment
   - Verify collection creation and access
   - Test CRUD operations on all models

4. **Authentication Flow Test**
   - Test user registration with password hashing
   - Test login with JWT token generation
   - Test protected route access with valid tokens

5. **Contest Functionality Test**
   - Test contest creation by teacher users
   - Test student contest joining and participation
   - Test problem viewing and submission interface

6. **Code Execution Test**
   - Test submission processing in mock mode
   - Verify test case evaluation and scoring
   - Test multiple programming language support

7. **Real-time Features Test**
   - Test WebSocket connection establishment
   - Verify leaderboard updates in real-time
   - Test concurrent user handling

8. **Plagiarism Detection Test**
   - Test JPlag API integration with provided key
   - Verify similarity analysis and reporting
   - Test fallback behavior if API fails

9. **Analytics Dashboard Test**
   - Test user statistics aggregation
   - Test contest performance metrics
   - Test platform usage analytics

### Performance Considerations

- **Database Indexing**: Ensure proper indexes on frequently queried fields
- **Connection Pooling**: Configure MongoDB connection pool for optimal performance
- **Caching Strategy**: Implement Redis-like caching for frequently accessed data
- **Rate Limiting**: Configure API rate limits to prevent abuse
- **WebSocket Optimization**: Efficient event broadcasting for real-time updates

### Security Measures

- **JWT Security**: Secure token signing and validation
- **Password Security**: bcrypt hashing with appropriate salt rounds
- **Input Validation**: Joi schema validation for all API inputs
- **CORS Configuration**: Proper cross-origin request handling
- **Helmet Integration**: Security headers for production deployment
- **File Upload Security**: Secure handling of uploaded files and code submissions

### Monitoring and Logging

- **Application Logs**: Winston logger with appropriate log levels
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Metrics**: Response time and throughput monitoring
- **Database Monitoring**: Connection health and query performance
- **API Usage Tracking**: Monitor external service usage and costs