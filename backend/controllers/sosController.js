const asyncHandler = require('express-async-handler');
const EmergencyAlert = require('../models/EmergencyAlert');
const EmergencyContact = require('../models/EmergencyContact');
const User = require('../models/User');
const whatsappService = require('../services/whatsappService');
const { createNotification } = require('../services/notificationService');

// @desc    Trigger an SOS / emergency alert
// @route   POST /api/sos/trigger
// @access  Private (senior)
const triggerSOS = asyncHandler(async (req, res) => {
  const { type = 'sos', triggeredVia = 'button', location, notes } = req.body;

  const senior = await User.findById(req.user._id);
  const contacts = await EmergencyContact.find({ user: senior._id, 'notifyOn.sos': true }).sort({ priority: 1 });

  const alert = await EmergencyAlert.create({
    user: senior._id,
    type,
    triggeredVia,
    location,
    notes,
    notifiedContacts: contacts.map((c) => c._id),
    notifiedPolice: true,
  });

  if (location?.lat && location?.lng) {
    senior.lastKnownLocation = { ...location, updatedAt: new Date() };
    senior.riskLevel = 'high';
    await senior.save();
  }

  const { contactResults, policeResult } = await whatsappService.sendSOSAlert({
    senior,
    contacts,
    location,
    alertType: type,
  });

  await createNotification({
    userId: senior._id,
    title: 'Emergency alert sent',
    message: `Your ${type === 'medical' ? 'medical emergency' : 'SOS'} alert was sent to ${contacts.length} contact(s) and the Cyber Crime Branch.`,
    type: 'sos',
  });

  res.status(201).json({
    success: true,
    alert,
    notified: {
      contacts: contacts.length,
      contactResults,
      police: Boolean(policeResult),
    },
  });
});

// @desc    Mark an alert as resolved / false alarm
// @route   PUT /api/sos/:id/resolve
// @access  Private
const resolveAlert = asyncHandler(async (req, res) => {
  const { status = 'resolved' } = req.body; // 'resolved' or 'false_alarm'
  const alert = await EmergencyAlert.findById(req.params.id);

  if (!alert) {
    res.status(404);
    throw new Error('Alert not found');
  }

  // Only the senior themself, a linked family member, or an admin may resolve it
  const isOwner = alert.user.toString() === req.user._id.toString();
  const isFamilyLinked = req.user.role === 'family' && req.user.linkedSeniors.some((id) => id.toString() === alert.user.toString());
  if (!isOwner && !isFamilyLinked && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to resolve this alert');
  }

  alert.status = status;
  alert.resolvedAt = new Date();
  alert.resolvedBy = req.user._id;
  await alert.save();

  if (alert.type !== 'inactivity') {
    await User.findByIdAndUpdate(alert.user, { riskLevel: 'low' });
  }

  res.json({ success: true, alert });
});

// @desc    Get alert history for the logged-in senior, or for a specified senior if family/admin
// @route   GET /api/sos/history
// @access  Private
const getAlertHistory = asyncHandler(async (req, res) => {
  const targetUserId = req.query.userId || req.user._id;
  const alerts = await EmergencyAlert.find({ user: targetUserId }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, alerts });
});

// @desc    Get all currently active alerts (family/admin dashboards)
// @route   GET /api/sos/active
// @access  Private (family, admin)
const getActiveAlerts = asyncHandler(async (req, res) => {
  let filter = { status: 'active' };

  if (req.user.role === 'family') {
    filter.user = { $in: req.user.linkedSeniors };
  }

  const alerts = await EmergencyAlert.find(filter)
    .populate('user', 'name phone age address lastKnownLocation')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: alerts.length, alerts });
});

module.exports = { triggerSOS, resolveAlert, getAlertHistory, getActiveAlerts };
