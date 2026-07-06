const mongoose = require('mongoose');

const fraudReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channel: {
      type: String,
      enum: ['phone_call', 'sms', 'whatsapp', 'email', 'website', 'in_person', 'other'],
      required: true,
    },
    category: {
      type: String,
      enum: [
        'otp_scam',
        'fake_investment',
        'phishing_link',
        'tech_support_scam',
        'digital_arrest_scam',
        'identity_theft',
        'lottery_prize_scam',
        'romance_scam',
        'other',
      ],
      default: 'other',
    },
    description: { type: String, required: true, trim: true },
    contactUsedByFraudster: { type: String, trim: true }, // phone number / email / link used by scammer
    moneyLost: { type: Number, default: 0 },
    evidenceFiles: [{ type: String }], // stored filenames under /uploads

    aiAnalysis: {
      riskScore: { type: Number, min: 0, max: 100 },
      riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      redFlags: [{ type: String }],
      explanation: { type: String },
      recommendedAction: { type: String },
      analyzedAt: { type: Date },
    },

    status: {
      type: String,
      enum: ['submitted', 'under_review', 'forwarded_to_police', 'resolved', 'dismissed'],
      default: 'submitted',
    },
    forwardedToPolice: { type: Boolean, default: false },
    caseNumber: { type: String, unique: true, sparse: true },
    officerNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

fraudReportSchema.index({ user: 1, createdAt: -1 });
fraudReportSchema.index({ status: 1 });
fraudReportSchema.index({ category: 1 });

// Auto-generate a human-readable case number once forwarded to police
fraudReportSchema.pre('save', function (next) {
  if (this.forwardedToPolice && !this.caseNumber) {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.caseNumber = `CCB-${year}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('FraudReport', fraudReportSchema);
