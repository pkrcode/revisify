import QuizAttempt from '../models/QuizAttempt.model.js';

/**
 * @desc    Get user profile and statistics.
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
export const getUserProfileController = async (req, res) => {
  try {
    const { name, email, createdAt } = req.user;

    // Use MongoDB aggregation to calculate stats efficiently
    const stats = await QuizAttempt.aggregate([
      // 1. Match only the attempts by the current user
      { $match: { user: req.user._id } },
      // 2. Group them all into a single result to calculate sums
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          totalScoreSum: { $sum: '$totalScore' },
          totalQuestionsSum: { $sum: { $size: '$answeredQuestions' } },
        },
      },
    ]);
    
    const userStats = {
      totalQuizzesAttempted: 0,
      averageScore: 0,
    };
    
    if (stats.length > 0) {
      userStats.totalQuizzesAttempted = stats[0].totalAttempts;
      // Calculate average percentage score
      if (stats[0].totalQuestionsSum > 0) {
        const avg = (stats[0].totalScoreSum / stats[0].totalQuestionsSum) * 100;
        userStats.averageScore = parseFloat(avg.toFixed(2)); // Round to 2 decimal places
      }
    }

    res.status(200).json({
      name,
      email,
      memberSince: createdAt,
      stats: userStats,
    });

  } catch (error) {
    console.error('Get User Profile Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching user profile.' });
  }
};