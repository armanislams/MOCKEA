import User from "../model/user.js";

const estimateBand = (score) => {
  if (score >= 90) return 8.0;
  if (score >= 80) return 7.5;
  if (score >= 70) return 7.0;
  if (score >= 60) return 6.5;
  if (score >= 50) return 6.0;
  return 5.5;
};

const getStudyStreak = (dates = []) => {
  if (!dates.length) return 0;
  const sorted = [...dates]
    .map((date) => new Date(date))
    .sort((a, b) => b - a);

  let streak = 1;
  let lastDate = sorted[0];

  for (let i = 1; i < sorted.length; i += 1) {
    const currentDate = sorted[i];
    const diff = Math.round((lastDate - currentDate) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak += 1;
      lastDate = currentDate;
    } else if (diff > 1) {
      break;
    }
  }

  return streak;
};

const buildWeakAreas = () => [
  { title: "Matching Headings", percentage: 62, attempted: 24 },
  { title: "True/False/Not Given", percentage: 68, attempted: 40 },
  { title: "Summary Completion", percentage: 71, attempted: 18 },
];

export const getAnalyticsSummary = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (req.decoded_email && req.decoded_email !== email) {
      return res.status(403).json({ success: false, message: "Forbidden: email does not match token" });
    }

    const readings = await Reading.find({ email }).sort({ completedAt: -1 });
    const notesCount = await Note.countDocuments({ email });

    const totalAttempts = readings.length;
    const averageScore = totalAttempts
      ? Math.round(readings.reduce((sum, record) => sum + (record.score || 0), 0) / totalAttempts)
      : 0;

    const studies = readings.slice(0, 4).map((record) => ({
      date: record.completedAt,
      type: "Reading",
      score: record.score || 0,
      totalQuestions: record.totalQuestions || 0,
      band: estimateBand(record.score || 0),
      duration: "60 min",
    }));

    return res.status(200).json({
      success: true,
      message: "Analytics summary fetched successfully",
      summary: {
        averageAccuracy: averageScore,
        estimatedBand: estimateBand(averageScore),
        testsCompleted: totalAttempts,
        studyStreak: getStudyStreak(readings.map((record) => record.completedAt)),
        noteCount: notesCount,
        recentAttempts: studies,
        weakAreas: buildWeakAreas(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching analytics summary",
      error: error.message,
    });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTests = await Reading.countDocuments();

    // Calculate today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const usersToday = await User.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const testsToday = await Reading.countDocuments({
      completedAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Recent registered users (last 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt role plan");

    // Per student statistics
    const studentStats = await Reading.aggregate([
      {
        $group: {
          _id: "$email",
          testCount: { $sum: 1 },
          averageScore: { $avg: "$score" },
          lastTest: { $max: "$completedAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "email",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          email: "$_id",
          name: "$userDetails.name",
          testCount: 1,
          averageScore: { $round: ["$averageScore", 1] },
          lastTest: 1,
        },
      },
      { $sort: { testCount: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalTests,
          usersToday,
          testsToday,
        },
        recentUsers,
        studentStats,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching admin analytics",
      error: error.message,
    });
  }
};
