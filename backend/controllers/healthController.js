const asyncHandler = require('express-async-handler');
const HealthCheckIn = require('../models/HealthCheckIn');
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const whatsappService = require('../services/whatsappService');
const { createNotification } = require('../services/notificationService');

// @desc    Submit a daily wellness check-in
// @route   POST /api/health/checkin
// @access  Private (senior)
const submitCheckIn = asyncHandler(async (req, res) => {
  const { status, mood, notes, method = 'app' } = req.body;

  if (!['fine', 'need_help', 'not_well'].includes(status)) {
    res.status(400);
    throw new Error("status must be one of 'fine', 'need_help', or 'not_well'");
  }

  const checkIn = await HealthCheckIn.create({ user: req.user._id, status, mood, notes, method });

  const senior = await User.findById(req.user._id);
  senior.lastCheckInAt = new Date();
  if (status === 'fine') senior.riskLevel = 'low';
  await senior.save();

  // If the senior indicates they need help, treat it like a soft alert to family (not full SOS/police)
  if (status !== 'fine') {
    const contacts = await EmergencyContact.find({ user: senior._id });
    await Promise.all(
      contacts.map((c) =>
        whatsappService.sendWhatsAppMessage(
          c.whatsappNumber || c.phone,
          `⚠️ ${senior.name} checked in via Kavach reporting "${status === 'need_help' ? 'needs help' : 'not feeling well'}".${
            notes ? `\nNote: ${notes}` : ''
          }\n\nPlease reach out to them.`
        )
      )
    );
    await createNotification({
      userId: senior._id,
      title: 'Check-in recorded',
      message: 'Your check-in was recorded and your emergency contacts have been notified so they can reach out.',
      type: 'checkin_reminder',
    });
  }

  res.status(201).json({ success: true, checkIn });
});

// @desc    Get check-in history for a user
// @route   GET /api/health/history
// @access  Private
const getCheckInHistory = asyncHandler(async (req, res) => {
  const targetUserId = req.query.userId || req.user._id;
  const history = await HealthCheckIn.find({ user: targetUserId }).sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, history });
});

// @desc    Get current wellness status summary for the logged-in senior
// @route   GET /api/health/status
// @access  Private
const getStatus = asyncHandler(async (req, res) => {
  const targetUserId = req.query.userId || req.user._id;
  const user = await User.findById(targetUserId).select('lastCheckInAt riskLevel name');
  const lastCheckIn = await HealthCheckIn.findOne({ user: targetUserId }).sort({ createdAt: -1 });

  const hoursSinceCheckIn = user.lastCheckInAt
    ? Math.round((Date.now() - new Date(user.lastCheckInAt).getTime()) / (1000 * 60 * 60))
    : null;

  res.json({
    success: true,
    status: {
      name: user.name,
      lastCheckInAt: user.lastCheckInAt,
      hoursSinceCheckIn,
      riskLevel: user.riskLevel,
      lastCheckInStatus: lastCheckIn?.status || null,
      checkedInToday: hoursSinceCheckIn !== null && hoursSinceCheckIn < 24,
    },
  });
});

module.exports = { submitCheckIn, getCheckInHistory, getStatus };
