const mongoose = require('mongoose');

const healthCheckInSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['fine', 'need_help', 'not_well'],
      required: true,
    },
    mood: { type: String, trim: true }, // optional free-text or emoji-coded mood
    notes: { type: String, trim: true },
    method: {
      type: String,
      enum: ['app', 'whatsapp', 'voice'],
      default: 'app',
    },
  },
  { timestamps: true }
);

healthCheckInSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('HealthCheckIn', healthCheckInSchema);
