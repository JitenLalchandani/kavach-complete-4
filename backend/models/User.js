const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    whatsappNumber: { type: String, trim: true }, // defaults to phone if not provided

    role: {
      type: String,
      enum: ['senior', 'family', 'admin'],
      default: 'senior',
    },

    // Senior-specific fields
    age: { type: Number, min: 18, max: 120 },
    address: { type: String, trim: true },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'gu'],
      default: 'en',
    },
    // Unique short code a senior shares with family members so they can link accounts
    linkCode: { type: String, unique: true, sparse: true },

    // Family-specific field: which senior citizens this account can monitor
    linkedSeniors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Welfare tracking
    lastCheckInAt: { type: Date, default: null },
    lastKnownLocation: {
      lat: Number,
      lng: Number,
      address: String,
      updatedAt: Date,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate a unique 6-character link code for seniors so family members can connect
userSchema.pre('save', function (next) {
  if (this.role === 'senior' && !this.linkCode) {
    this.linkCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  }
  if (!this.whatsappNumber) {
    this.whatsappNumber = this.phone;
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
