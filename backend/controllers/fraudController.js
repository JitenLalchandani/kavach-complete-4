const asyncHandler = require('express-async-handler');
const FraudReport = require('../models/FraudReport');
const User = require('../models/User');
const aiService = require('../services/aiService');
const whatsappService = require('../services/whatsappService');
const { createNotification } = require('../services/notificationService');

// @desc    Submit a new fraud/scam report, with optional evidence files and automatic AI analysis
// @route   POST /api/fraud/report
// @access  Private (senior)
const submitReport = asyncHandler(async (req, res) => {
  const { channel, category, description, contactUsedByFraudster, moneyLost, forwardToPolice } = req.body;

  if (!channel || !description) {
    res.status(400);
    throw new Error('channel and description are required');
  }

  const evidenceFiles = (req.files || []).map((f) => f.filename);

  const aiResult = await aiService.analyzeScamMessage(description);

  const report = await FraudReport.create({
    user: req.user._id,
    channel,
    category,
    description,
    contactUsedByFraudster,
    moneyLost: moneyLost || 0,
    evidenceFiles,
    forwardedToPolice: forwardToPolice === 'true' || forwardToPolice === true,
    status: forwardToPolice ? 'forwarded_to_police' : 'submitted',
    aiAnalysis: {
      riskScore: aiResult.riskScore,
      riskLevel: aiResult.riskLevel,
      redFlags: aiResult.redFlags,
      explanation: aiResult.explanation,
      recommendedAction: aiResult.recommendedAction,
      analyzedAt: new Date(),
    },
  });

  if (report.forwardedToPolice && process.env.CYBER_CRIME_WHATSAPP_NUMBER) {
    await whatsappService.sendWhatsAppMessage(
      process.env.CYBER_CRIME_WHATSAPP_NUMBER,
      `📋 New fraud report forwarded via Kavach\n\nCase: ${report.caseNumber}\nReporter: ${req.user.name} (${req.user.phone})\nChannel: ${channel}\nCategory: ${category || 'other'}\nRisk: ${aiResult.riskLevel?.toUpperCase()}\n\nDescription: ${description.slice(0, 300)}`
    );
  }

  await createNotification({
    userId: req.user._id,
    title: 'Fraud report submitted',
    message: report.caseNumber
      ? `Your report was forwarded to the Cyber Crime Branch. Case number: ${report.caseNumber}`
      : 'Your report has been recorded. You can forward it to the Cyber Crime Branch any time from the report details.',
    type: 'fraud_update',
  });

  res.status(201).json({ success: true, report });
});

// @desc    Get the logged-in user's own fraud reports
// @route   GET /api/fraud/my-reports
// @access  Private (senior)
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await FraudReport.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, reports });
});

// @desc    Get all fraud reports (police/admin view), with optional status filter
// @route   GET /api/fraud/all
// @access  Private (admin)
const getAllReports = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;

  const reports = await FraudReport.find(filter)
    .populate('user', 'name phone age address')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: reports.length, reports });
});

// @desc    Update a fraud report's status / officer notes (police/admin)
// @route   PUT /api/fraud/:id/status
// @access  Private (admin)
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, officerNotes } = req.body;
  const report = await FraudReport.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  if (status) report.status = status;
  if (status === 'forwarded_to_police') report.forwardedToPolice = true;
  if (officerNotes !== undefined) report.officerNotes = officerNotes;
  await report.save();

  const reporter = await User.findById(report.user).select('whatsappNumber phone');

  await createNotification({
    userId: report.user,
    title: 'Fraud report update',
    message: `Your report ${report.caseNumber ? `(Case ${report.caseNumber}) ` : ''}status changed to "${status}".`,
    type: 'fraud_update',
    sendWhatsApp: true,
    whatsappTarget: reporter?.whatsappNumber || reporter?.phone,
  }).catch(() => {}); // best-effort; do not fail the request if WhatsApp lookup fails

  res.json({ success: true, report });
});

module.exports = { submitReport, getMyReports, getAllReports, updateReportStatus };
