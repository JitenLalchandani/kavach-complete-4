const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['sos', 'medical', 'inactivity', 'fall_detected'],
      default: 'sos',
    },
    triggeredVia: {
      type: String,
      enum: ['button', 'voice', 'whatsapp', 'system'],
      default: 'button',
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved', 'false_alarm'],
      default: 'active',
    },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    notes: { type: String, trim: true },
    notifiedContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyContact' }],
    notifiedPolice: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

emergencyAlertSchema.index({ user: 1, createdAt: -1 });
emergencyAlertSchema.index({ status: 1 });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
