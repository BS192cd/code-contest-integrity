const express = require('express');
const router = express.Router();

const Contest = require('../models/Contest');
const { optionalAuth } = require('../middleware/auth');

// Get contest leaderboard
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { contestId = 'all', limit = 50, offset = 0 } = req.query;

    if (contestId === 'all') {
      // Global leaderboard across all contests
      const leaderboard = await Contest.aggregate([
        { $unwind: '$participants' },
        {
          $lookup: {
            from: 'users',
            localField: 'participants.user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $group: {
            _id: '$participants.user',
            username: { $first: '$user.username' },
            fullName: { $first: '$user.fullName' },
            totalScore: { $sum: '$participants.score' },
            contestsParticipated: { $sum: 1 },
            averageScore: { $avg: '$participants.score' },
            bestRank: { $min: '$participants.rank' },
            lastActivity: { $max: '$endTime' }
          }
        },
        { $sort: { totalScore: -1, averageScore: -1 } },
        { $skip: parseInt(offset) },
        { $limit: parseInt(limit) }
      ]);

      // Add rankings
      const leaderboardWithRanks = leaderboard.map((entry, index) => ({
        ...entry,
        rank: parseInt(offset) + index + 1,
        userId: entry._id,
        problemsSolved: null, // Would need additional aggregation
        lastSubmission: entry.lastActivity,
        streak: 0, // Would need additional calculation
        badges: [] // Would be fetched from user profile
      }));

      res.json({
        success: true,
        data: {
          leaderboard: leaderboardWithRanks,
          total: leaderboardWithRanks.length,
          hasMore: leaderboardWithRanks.length === parseInt(limit)
        }
      });

    } else {
      // Contest-specific leaderboard
      const contest = await Contest.findById(contestId)
        .populate('participants.user', 'username fullName avatar')
        .lean();

      if (!contest) {
        return res.status(404).json({
          success: false,
          error: 'Contest not found'
        });
      }

      // Sort participants by score and format for response
      const sortedParticipants = contest.participants
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          
          // Tiebreaker: earliest submission time
          const aLastSubmission = Math.max(...(a.submissions.map(s => new Date(s.submittedAt)) || [0]));
          const bLastSubmission = Math.max(...(b.submissions.map(s => new Date(s.submittedAt)) || [0]));
          
          return aLastSubmission - bLastSubmission;
        })
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

      const leaderboard = sortedParticipants.map((participant, index) => ({
        rank: parseInt(offset) + index + 1,
        userId: participant.user._id,
        username: participant.user.username,
        fullName: participant.user.fullName,
        avatar: participant.user.avatar,
        score: participant.score,
        problemsSolved: participant.submissions.length,
        contestsParticipated: 1, // Current contest
        averageScore: participant.score,
        lastSubmission: participant.submissions.length > 0 ? 
          Math.max(...participant.submissions.map(s => new Date(s.submittedAt))) : null,
        streak: 0, // Would need additional calculation
        badges: [] // Would be fetched from user profile
      }));

      res.json({
        success: true,
        data: {
          leaderboard,
          total: contest.participants.length,
          hasMore: parseInt(offset) + leaderboard.length < contest.participants.length
        }
      });
    }

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

module.exports = router;