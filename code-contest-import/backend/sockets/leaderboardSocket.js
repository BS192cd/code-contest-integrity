const socketIo = require('socket.io');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');

class LeaderboardSocket {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.WEBSOCKET_CORS_ORIGINS?.split(',') || ["http://localhost:3000", "http://localhost:5000"],
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Join contest leaderboard room
      socket.on('join_contest', async (data) => {
        try {
          const { contestId, userId } = data;
          
          // Validate contest exists and user has access
          const contest = await Contest.findById(contestId);
          if (!contest) {
            socket.emit('error', { message: 'Contest not found' });
            return;
          }

          // Join room
          socket.join(`contest_${contestId}`);
          socket.contestId = contestId;
          socket.userId = userId;

          // Send current leaderboard
          const leaderboard = await this.getContestLeaderboard(contestId);
          socket.emit('leaderboard_update', leaderboard);

          console.log(`👤 User ${userId} joined contest ${contestId} leaderboard`);

        } catch (error) {
          console.error('Join contest error:', error);
          socket.emit('error', { message: 'Failed to join contest' });
        }
      });

      // Leave contest leaderboard room
      socket.on('leave_contest', () => {
        if (socket.contestId) {
          socket.leave(`contest_${socket.contestId}`);
          console.log(`👋 User ${socket.userId} left contest ${socket.contestId} leaderboard`);
          socket.contestId = null;
          socket.userId = null;
        }
      });

      // Join submission feed room
      socket.on('join_submission_feed', (data) => {
        const { contestId } = data;
        socket.join(`submissions_${contestId}`);
        console.log(`📝 Client joined submission feed for contest ${contestId}`);
      });

      // Leave submission feed room
      socket.on('leave_submission_feed', (data) => {
        const { contestId } = data;
        socket.leave(`submissions_${contestId}`);
        console.log(`📝 Client left submission feed for contest ${contestId}`);
      });

      // Join activity feed room
      socket.on('join_activity_feed', (data) => {
        const { userId } = data;
        socket.join(`activity_${userId}`);
        socket.activityUserId = userId;
        console.log(`📊 Client joined activity feed for user ${userId}`);
      });

      // Leave activity feed room
      socket.on('leave_activity_feed', () => {
        if (socket.activityUserId) {
          socket.leave(`activity_${socket.activityUserId}`);
          console.log(`📊 Client left activity feed for user ${socket.activityUserId}`);
          socket.activityUserId = null;
        }
      });

      // Join plagiarism alerts room (for teachers)
      socket.on('join_plagiarism_alerts', (data) => {
        const { userId, role } = data;
        if (role === 'teacher' || role === 'admin') {
          socket.join(`plagiarism_alerts_${userId}`);
          socket.plagiarismUserId = userId;
          console.log(`🚨 Teacher ${userId} joined plagiarism alerts`);
        }
      });

      // Leave plagiarism alerts room
      socket.on('leave_plagiarism_alerts', () => {
        if (socket.plagiarismUserId) {
          socket.leave(`plagiarism_alerts_${socket.plagiarismUserId}`);
          console.log(`🚨 Teacher ${socket.plagiarismUserId} left plagiarism alerts`);
          socket.plagiarismUserId = null;
        }
      });

      // Handle submission status requests
      socket.on('get_submission_status', async (data) => {
        try {
          const { submissionId } = data;
          const Submission = require('../models/Submission');
          
          const submission = await Submission.findById(submissionId)
            .select('status score testResults executionTime memoryUsage')
            .lean();
          
          if (submission) {
            socket.emit('submission_status_update', {
              submissionId,
              status: submission.status,
              score: submission.score,
              testResults: submission.testResults,
              executionTime: submission.executionTime,
              memoryUsage: submission.memoryUsage
            });
          }
        } catch (error) {
          console.error('Get submission status error:', error);
          socket.emit('error', { message: 'Failed to get submission status' });
        }
      });

      // Handle real-time contest updates
      socket.on('subscribe_contest_updates', (data) => {
        const { contestId } = data;
        socket.join(`contest_updates_${contestId}`);
        console.log(`🏆 Client subscribed to contest ${contestId} updates`);
      });

      socket.on('unsubscribe_contest_updates', (data) => {
        const { contestId } = data;
        socket.leave(`contest_updates_${contestId}`);
        console.log(`🏆 Client unsubscribed from contest ${contestId} updates`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        
        // Clean up all rooms
        if (socket.contestId) {
          socket.leave(`contest_${socket.contestId}`);
        }
        if (socket.activityUserId) {
          socket.leave(`activity_${socket.activityUserId}`);
        }
        if (socket.plagiarismUserId) {
          socket.leave(`plagiarism_alerts_${socket.plagiarismUserId}`);
        }
      });
    });
  }

  // Get contest leaderboard data
  async getContestLeaderboard(contestId, limit = 50) {
    try {
      const contest = await Contest.findById(contestId)
        .populate('participants.user', 'username fullName avatar')
        .lean();

      if (!contest) return [];

      // Sort participants by score and rank
      const leaderboard = contest.participants
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          
          // Tiebreaker: earliest last submission time
          const aLastSubmission = Math.max(...(a.submissions.map(s => new Date(s.submittedAt)) || [0]));
          const bLastSubmission = Math.max(...(b.submissions.map(s => new Date(s.submittedAt)) || [0]));
          
          return aLastSubmission - bLastSubmission;
        })
        .slice(0, limit)
        .map((participant, index) => ({
          rank: index + 1,
          userId: participant.user._id,
          username: participant.user.username,
          fullName: participant.user.fullName,
          avatar: participant.user.avatar,
          score: participant.score,
          problemsSolved: participant.submissions.length,
          lastSubmission: participant.submissions.length > 0 ? 
            Math.max(...participant.submissions.map(s => new Date(s.submittedAt))) : null
        }));

      return {
        contestId,
        leaderboard,
        totalParticipants: contest.participants.length,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Get leaderboard error:', error);
      return [];
    }
  }

  // Broadcast leaderboard update to all clients in contest room
  async broadcastLeaderboardUpdate(contestId) {
    try {
      const leaderboard = await this.getContestLeaderboard(contestId);
      this.io.to(`contest_${contestId}`).emit('leaderboard_update', leaderboard);
      
      console.log(`Broadcasted leaderboard update for contest ${contestId}`);
    } catch (error) {
      console.error('Broadcast leaderboard error:', error);
    }
  }

  // Broadcast new submission to submission feed
  async broadcastNewSubmission(submission) {
    try {
      const submissionWithUser = await Submission.findById(submission._id)
        .populate('userId', 'username fullName')
        .populate('problemId', 'title')
        .lean();

      const submissionData = {
        id: submissionWithUser._id,
        username: submissionWithUser.userId.username,
        fullName: submissionWithUser.userId.fullName,
        problemTitle: submissionWithUser.problemId.title,
        language: submissionWithUser.language,
        status: submissionWithUser.status,
        score: submissionWithUser.score,
        submittedAt: submissionWithUser.createdAt
      };

      if (submissionWithUser.contestId) {
        this.io.to(`submissions_${submissionWithUser.contestId}`).emit('new_submission', submissionData);
        
        // Also update leaderboard if status changed
        if (submissionWithUser.status !== 'pending' && submissionWithUser.status !== 'running') {
          await this.broadcastLeaderboardUpdate(submissionWithUser.contestId);
        }
      }

    } catch (error) {
      console.error('Broadcast submission error:', error);
    }
  }

  // Send real-time notifications
  sendNotification(userId, notification) {
    this.io.emit('notification', {
      userId,
      ...notification,
      timestamp: new Date()
    });
  }

  // Broadcast contest status updates
  async broadcastContestUpdate(contest) {
    try {
      const contestData = {
        id: contest._id,
        title: contest.title,
        status: contest.status,
        startTime: contest.startTime,
        endTime: contest.endTime,
        participantCount: contest.participants.length
      };

      this.io.emit('contest_update', contestData);

      // Also send to specific contest room
      this.io.to(`contest_${contest._id}`).emit('contest_status_update', contestData);
      this.io.to(`contest_updates_${contest._id}`).emit('contest_update', contestData);

    } catch (error) {
      console.error('Broadcast contest update error:', error);
    }
  }

  // Broadcast activity updates
  broadcastActivityUpdate(userId, activity) {
    try {
      this.io.to(`activity_${userId}`).emit('activity_update', {
        id: activity._id,
        action: activity.action,
        details: activity.details,
        timestamp: activity.timestamp
      });

      console.log(`📊 Broadcasted activity update for user ${userId}: ${activity.action}`);
    } catch (error) {
      console.error('Broadcast activity update error:', error);
    }
  }

  // Broadcast plagiarism alerts
  broadcastPlagiarismAlert(hostId, alertData) {
    try {
      this.io.to(`plagiarism_alerts_${hostId}`).emit('plagiarism_alert', {
        id: alertData.submissionId,
        contestId: alertData.contestId,
        similarity: alertData.similarity,
        studentUsername: alertData.studentUsername,
        problemTitle: alertData.problemTitle,
        timestamp: new Date(),
        severity: alertData.similarity >= 80 ? 'high' : alertData.similarity >= 60 ? 'medium' : 'low'
      });

      console.log(`🚨 Broadcasted plagiarism alert to host ${hostId}: ${alertData.similarity}% similarity`);
    } catch (error) {
      console.error('Broadcast plagiarism alert error:', error);
    }
  }

  // Broadcast submission status updates
  broadcastSubmissionStatusUpdate(submissionId, statusData) {
    try {
      // Broadcast to all clients interested in this submission
      this.io.emit('submission_status_update', {
        submissionId,
        ...statusData,
        timestamp: new Date()
      });

      console.log(`📝 Broadcasted submission status update: ${submissionId} -> ${statusData.status}`);
    } catch (error) {
      console.error('Broadcast submission status update error:', error);
    }
  }

  // Get connected clients count
  getConnectedClientsCount() {
    return this.io.engine.clientsCount;
  }

  // Get room information
  getRoomInfo(roomName) {
    const room = this.io.sockets.adapter.rooms.get(roomName);
    return {
      name: roomName,
      clientCount: room ? room.size : 0,
      clients: room ? Array.from(room) : []
    };
  }

  // Broadcast system notifications
  broadcastSystemNotification(notification) {
    try {
      this.io.emit('system_notification', {
        id: Date.now(),
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        timestamp: new Date(),
        autoClose: notification.autoClose !== false
      });

      console.log(`📢 Broadcasted system notification: ${notification.title}`);
    } catch (error) {
      console.error('Broadcast system notification error:', error);
    }
  }
}

module.exports = LeaderboardSocket;