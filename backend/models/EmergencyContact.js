const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    relation: { type: String, required: true, trim: true }, // e.g. Son, Daughter, Neighbour, Doctor
    phone: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, trim: true },
    priority: { type: Number, default: 1 }, // 1 = contacted first during SOS
    notifyOn: {
      sos: { type: Boolean, default: true },
      missedCheckIn: { type: Boolean, default: true },
      fraudReport: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

emergencyContactSchema.pre('save', function (next) {
  if (!this.whatsappNumber) this.whatsappNumber = this.phone;
  next();
});

emergencyContactSchema.index({ user: 1, priority: 1 });

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
