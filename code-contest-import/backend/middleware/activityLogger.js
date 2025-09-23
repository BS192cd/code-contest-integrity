const ActivityLog = require('../models/ActivityLog');

// Activity logger middleware
const activityLogger = (action) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log activity after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            await logActivity({
              userId: req.user?._id,
              action: action,
              details: {
                method: req.method,
                path: req.path,
                params: req.params,
                query: req.query,
                body: sanitizeBody(req.body),
                statusCode: res.statusCode,
                responseData: sanitizeResponse(data)
              },
              ipAddress: req.ip,
              userAgent: req.get('User-Agent'),
              timestamp: new Date()
            });
          } catch (error) {
            console.error('Activity logging error:', error);
          }
        });
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Log activity function
const logActivity = async (activityData) => {
  try {
    const activity = new ActivityLog({
      userId: activityData.userId,
      action: activityData.action,
      details: activityData.details,
      ipAddress: activityData.ipAddress,
      userAgent: activityData.userAgent,
      timestamp: activityData.timestamp || new Date()
    });
    
    await activity.save();
    
    // Broadcast activity update for real-time feed
    if (global.leaderboardSocket && activityData.userId) {
      global.leaderboardSocket.io.emit('activity_feed', {
        userId: activityData.userId,
        action: activityData.action,
        timestamp: activity.timestamp,
        details: sanitizeDetailsForBroadcast(activityData.details)
      });
    }
    
    return activity;
  } catch (error) {
    console.error('Activity logging error:', error);
    return null;
  }
};

// Sanitize request body for logging (remove sensitive data)
const sanitizeBody = (body) => {
  if (!body) return {};
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.passwordHash;
  delete sanitized.token;
  delete sanitized.refreshToken;
  
  // Truncate long code submissions
  if (sanitized.code && sanitized.code.length > 500) {
    sanitized.code = sanitized.code.substring(0, 500) + '... [truncated]';
  }
  
  return sanitized;
};

// Sanitize response data for logging
const sanitizeResponse = (data) => {
  if (!data) return {};
  
  const sanitized = { ...data };
  
  // Remove sensitive fields
  delete sanitized.token;
  delete sanitized.refreshToken;
  delete sanitized.passwordHash;
  
  // Only keep success status and basic info
  return {
    success: sanitized.success,
    message: sanitized.message,
    dataType: Array.isArray(sanitized.data) ? 'array' : typeof sanitized.data,
    dataLength: Array.isArray(sanitized.data) ? sanitized.data.length : undefined
  };
};

// Sanitize details for real-time broadcast
const sanitizeDetailsForBroadcast = (details) => {
  if (!details) return {};
  
  return {
    method: details.method,
    path: details.path,
    statusCode: details.statusCode,
    // Add other non-sensitive fields as needed
  };
};

// Specific activity loggers for common actions
const loggers = {
  // Authentication activities
  login: activityLogger('user_login'),
  logout: activityLogger('user_logout'),
  register: activityLogger('user_register'),
  
  // Contest activities
  createContest: activityLogger('contest_created'),
  joinContest: activityLogger('contest_joined'),
  leaveContest: activityLogger('contest_left'),
  
  // Problem activities
  createProblem: activityLogger('problem_created'),
  updateProblem: activityLogger('problem_updated'),
  deleteProblem: activityLogger('problem_deleted'),
  
  // Submission activities
  submitCode: activityLogger('code_submitted'),
  viewSubmission: activityLogger('submission_viewed'),
  
  // Plagiarism activities
  runPlagiarismScan: activityLogger('plagiarism_scan_started'),
  viewPlagiarismResults: activityLogger('plagiarism_results_viewed'),
  
  // Admin activities
  adminAction: activityLogger('admin_action'),
  
  // Generic activity logger
  custom: (action) => activityLogger(action)
};

module.exports = {
  activityLogger,
  logActivity,
  loggers,
  sanitizeBody,
  sanitizeResponse
};