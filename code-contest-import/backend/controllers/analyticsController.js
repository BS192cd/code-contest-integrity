const User = require('../models/User');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Report = require('../models/Report');

// Get user analytics (for students to see their own performance)
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    // Check permissions
    if (req.user.role === 'student' && userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get submission statistics over time
    const submissionHistory = await Submission.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          submissions: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          averageScore: { $avg: '$score' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 } // Last 30 days
    ]);

    // Get problem difficulty breakdown
    const difficultyStats = await Submission.aggregate([
      { $match: { userId: user._id, status: 'accepted' } },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem'
        }
      },
      { $unwind: '$problem' },
      {
        $group: {
          _id: '$problem.difficulty',
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    // Get language preferences
    const languageStats = await Submission.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$language',
          submissions: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          averageScore: { $avg: '$score' }
        }
      },
      { $sort: { submissions: -1 } }
    ]);

    // Get contest performance
    const contestPerformance = await Contest.aggregate([
      { $match: { 'participants.user': user._id } },
      { $unwind: '$participants' },
      { $match: { 'participants.user': user._id } },
      {
        $project: {
          title: 1,
          difficulty: 1,
          score: '$participants.score',
          rank: '$participants.rank',
          totalParticipants: { $size: '$participants' },
          endTime: 1
        }
      },
      { $sort: { endTime: -1 } },
      { $limit: 10 } // Last 10 contests
    ]);

    // Get weak areas (categories with lower performance)
    const categoryStats = await Submission.aggregate([
      { $match: { userId: user._id } },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem'
        }
      },
      { $unwind: '$problem' },
      {
        $group: {
          _id: '$problem.category',
          submissions: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          averageScore: { $avg: '$score' },
          successRate: { 
            $avg: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          }
        }
      },
      { $sort: { successRate: 1 } } // Sort by lowest success rate first
    ]);

    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          fullName: user.fullName,
          statistics: user.statistics
        },
        submissionHistory,
        difficultyStats,
        languageStats,
        contestPerformance,
        categoryStats,
        insights: {
          strongestCategory: categoryStats.length > 0 ? categoryStats[categoryStats.length - 1] : null,
          weakestCategory: categoryStats.length > 0 ? categoryStats[0] : null,
          preferredLanguage: languageStats.length > 0 ? languageStats[0] : null,
          recentTrend: submissionHistory.length > 1 ? 
            (submissionHistory[submissionHistory.length - 1].averageScore > 
             submissionHistory[submissionHistory.length - 2].averageScore ? 'improving' : 'declining') : 'stable'
        }
      }
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user analytics'
    });
  }
};

// Get contest analytics (for teachers)
const getContestAnalytics = async (req, res) => {
  try {
    const { contestId } = req.params;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    // Check permissions
    if (req.user.role === 'student') {
      const isParticipant = contest.participants.some(p => 
        p.user.toString() === req.user._id.toString()
      );
      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    // Get submission statistics
    const submissionStats = await Submission.aggregate([
      { $match: { contestId: contest._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get problem-wise statistics
    const problemStats = await Submission.aggregate([
      { $match: { contestId: contest._id } },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem'
        }
      },
      { $unwind: '$problem' },
      {
        $group: {
          _id: {
            problemId: '$problemId',
            title: '$problem.title'
          },
          submissions: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          averageScore: { $avg: '$score' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          problemId: '$_id.problemId',
          title: '$_id.title',
          submissions: 1,
          accepted: 1,
          averageScore: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          successRate: { $divide: ['$accepted', '$submissions'] }
        }
      },
      { $sort: { successRate: 1 } }
    ]);

    // Get participation timeline
    const participationTimeline = await Submission.aggregate([
      { $match: { contestId: contest._id } },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            minute: { $minute: '$createdAt' }
          },
          submissions: { $sum: 1 }
        }
      },
      { $sort: { '_id.hour': 1, '_id.minute': 1 } }
    ]);

    // Get top performers
    const topPerformers = contest.participants
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(participant => ({
        userId: participant.user,
        score: participant.score,
        rank: participant.rank,
        problemsSolved: participant.submissions.length
      }));

    // Populate user details for top performers
    await Contest.populate(topPerformers, {
      path: 'userId',
      select: 'username fullName'
    });

    res.json({
      success: true,
      data: {
        contest: {
          title: contest.title,
          difficulty: contest.difficulty,
          startTime: contest.startTime,
          endTime: contest.endTime,
          status: contest.status,
          statistics: contest.statistics
        },
        submissionStats,
        problemStats,
        participationTimeline,
        topPerformers,
        insights: {
          mostDifficultProblem: problemStats.length > 0 ? problemStats[0] : null,
          easiestProblem: problemStats.length > 0 ? problemStats[problemStats.length - 1] : null,
          peakActivity: participationTimeline.reduce((max, curr) => 
            curr.submissions > max.submissions ? curr : max, 
            { submissions: 0 }
          )
        }
      }
    });

  } catch (error) {
    console.error('Get contest analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contest analytics'
    });
  }
};

// Get platform overview analytics (for teachers/admin)
const getPlatformAnalytics = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to last month
      const now = new Date();
      const periodStart = new Date(now);
      
      if (period === 'day') {
        periodStart.setDate(now.getDate() - 1);
      } else if (period === 'week') {
        periodStart.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        periodStart.setMonth(now.getMonth() - 1);
      } else if (period === 'year') {
        periodStart.setFullYear(now.getFullYear() - 1);
      }
      
      dateFilter = { createdAt: { $gte: periodStart } };
    }

    // Get user growth
    const userGrowth = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get submission trends
    const submissionTrends = await Submission.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          submissions: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get contest activity
    const contestActivity = await Contest.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          contests: { $sum: 1 },
          totalParticipants: { $sum: '$statistics.totalParticipants' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get overall statistics
    const totalUsers = await User.countDocuments();
    const totalContests = await Contest.countDocuments();
    const totalProblems = await Problem.countDocuments({ isActive: true });
    const totalSubmissions = await Submission.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });

    // Get top contributors
    const topContributors = await User.aggregate([
      {
        $match: {
          role: { $in: ['teacher', 'admin'] },
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'contests',
          localField: '_id',
          foreignField: 'createdBy',
          as: 'createdContests'
        }
      },
      {
        $lookup: {
          from: 'problems',
          localField: '_id',
          foreignField: 'createdBy',
          as: 'createdProblems'
        }
      },
      {
        $project: {
          username: 1,
          fullName: 1,
          role: 1,
          contestsCreated: { $size: '$createdContests' },
          problemsCreated: { $size: '$createdProblems' }
        }
      },
      { $sort: { contestsCreated: -1, problemsCreated: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalContests,
          totalProblems,
          totalSubmissions,
          activeUsers,
          period: period
        },
        trends: {
          userGrowth,
          submissionTrends,
          contestActivity
        },
        topContributors,
        insights: {
          growthRate: userGrowth.length > 1 ? 
            ((userGrowth[userGrowth.length - 1].newUsers - userGrowth[0].newUsers) / userGrowth[0].newUsers * 100).toFixed(2) + '%' : '0%',
          avgSubmissionsPerDay: submissionTrends.reduce((sum, day) => sum + day.submissions, 0) / Math.max(submissionTrends.length, 1),
          overallAcceptanceRate: totalSubmissions > 0 ? 
            (submissionTrends.reduce((sum, day) => sum + day.accepted, 0) / totalSubmissions * 100).toFixed(2) + '%' : '0%'
        }
      }
    });

  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform analytics'
    });
  }
};

// Generate analytics report
const generateReport = async (req, res) => {
  try {
    const { type, contestId, userId, dateRange } = req.body;

    let reportData;
    let title;
    
    switch (type) {
      case 'contest_summary':
        if (!contestId) {
          return res.status(400).json({
            success: false,
            error: 'Contest ID required for contest summary report'
          });
        }
        
        const contestAnalytics = await getContestAnalyticsData(contestId);
        reportData = contestAnalytics;
        title = `Contest Summary Report - ${contestAnalytics.contest.title}`;
        break;

      case 'user_activity':
        if (!userId) {
          return res.status(400).json({
            success: false,
            error: 'User ID required for user activity report'
          });
        }
        
        const userAnalytics = await getUserAnalyticsData(userId);
        reportData = userAnalytics;
        title = `User Activity Report - ${userAnalytics.user.username}`;
        break;

      case 'plagiarism':
        if (!contestId) {
          return res.status(400).json({
            success: false,
            error: 'Contest ID required for plagiarism report'
          });
        }
        
        const plagiarismData = await getPlagiarismReportData(contestId);
        reportData = plagiarismData;
        title = `Plagiarism Report - Contest ${contestId}`;
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid report type'
        });
    }

    const report = new Report({
      type,
      title,
      description: `Generated report for ${type}`,
      generatedBy: req.user._id,
      relatedEntities: {
        contest: contestId || null,
        user: userId || null
      },
      data: reportData,
      filters: {
        dateRange: dateRange || null
      }
    });

    await report.save();
    await report.populate('generatedBy', 'username fullName');

    res.json({
      success: true,
      data: report,
      message: 'Report generated successfully'
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
};

// Helper functions (simplified versions of the main analytics functions)
const getContestAnalyticsData = async (contestId) => {
  // Simplified version - in production, implement full analytics
  const contest = await Contest.findById(contestId).populate('participants.user', 'username fullName');
  return { contest, summary: 'Contest analytics data' };
};

const getUserAnalyticsData = async (userId) => {
  const user = await User.findById(userId);
  return { user, summary: 'User analytics data' };
};

const getPlagiarismReportData = async (contestId) => {
  const flaggedSubmissions = await Submission.find({
    contestId,
    'plagiarismCheck.score': { $gte: 70 }
  }).populate('userId', 'username fullName');
  
  return { flaggedSubmissions, summary: 'Plagiarism analysis data' };
};

module.exports = {
  getUserAnalytics,
  getContestAnalytics,
  getPlatformAnalytics,
  generateReport
};