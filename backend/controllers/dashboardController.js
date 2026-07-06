const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const EmergencyAlert = require('../models/EmergencyAlert');
const HealthCheckIn = require('../models/HealthCheckIn');
const FraudReport = require('../models/FraudReport');

// @desc    Family dashboard: status summary for every senior linked to this family account
// @route   GET /api/dashboard/family
// @access  Private (family)
const getFamilyDashboard = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('linkedSeniors');

  const seniorsData = await Promise.all(
    user.linkedSeniors.map(async (senior) => {
      const [recentAlerts, recentCheckIns, recentReports] = await Promise.all([
        EmergencyAlert.find({ user: senior._id }).sort({ createdAt: -1 }).limit(5),
        HealthCheckIn.find({ user: senior._id }).sort({ createdAt: -1 }).limit(5),
        FraudReport.find({ user: senior._id }).sort({ createdAt: -1 }).limit(5),
      ]);

      return {
        senior: {
          id: senior._id,
          name: senior.name,
          phone: senior.phone,
          age: senior.age,
          riskLevel: senior.riskLevel,
          lastCheckInAt: senior.lastCheckInAt,
          lastKnownLocation: senior.lastKnownLocation,
        },
        recentAlerts,
        recentCheckIns,
        recentReports,
      };
    })
  );

  res.json({ success: true, seniors: seniorsData });
});

// @desc    Police/admin dashboard analytics: counts, trends, risk mapping
// @route   GET /api/dashboard/admin/analytics
// @access  Private (admin)
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [totalSeniors, activeAlerts, totalReports, reportsByCategory, reportsByStatus, highRiskSeniors] =
    await Promise.all([
      User.countDocuments({ role: 'senior' }),
      EmergencyAlert.countDocuments({ status: 'active' }),
      FraudReport.countDocuments(),
      FraudReport.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      FraudReport.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.countDocuments({ role: 'senior', riskLevel: 'high' }),
    ]);

  // Fraud trend over the last 14 days (for the trend chart)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const dailyTrend = await FraudReport.aggregate([
    { $match: { createdAt: { $gte: fourteenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Simple geographic risk mapping based on the free-text address field
  const riskByArea = await User.aggregate([
    { $match: { role: 'senior', riskLevel: { $in: ['medium', 'high'] } } },
    { $group: { _id: '$address', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  res.json({
    success: true,
    analytics: {
      totalSeniors,
      activeAlerts,
      totalReports,
      highRiskSeniors,
      reportsByCategory,
      reportsByStatus,
      dailyTrend,
      riskByArea,
    },
  });
});

// @desc    List all registered seniors with their current risk/status (admin)
// @route   GET /api/dashboard/admin/seniors
// @access  Private (admin)
const getAllSeniors = asyncHandler(async (req, res) => {
  const seniors = await User.find({ role: 'senior' })
    .select('name phone age address riskLevel lastCheckInAt createdAt')
    .sort({ riskLevel: -1, lastCheckInAt: 1 });
  res.json({ success: true, count: seniors.length, seniors });
});

module.exports = { getFamilyDashboard, getAdminAnalytics, getAllSeniors };
