const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['sos', 'checkin_reminder', 'scam_alert', 'fraud_update', 'system', 'family_ping'],
      default: 'system',
    },
    channel: {
      type: String,
      enum: ['app', 'whatsapp', 'both'],
      default: 'app',
    },
    read: { type: Boolean, default: false },
    whatsappStatus: {
      type: String,
      enum: ['not_sent', 'sent', 'failed', 'demo_mode'],
      default: 'not_sent',
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
